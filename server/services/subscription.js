import { PrismaClient } from '@prisma/client';
import { addDays, isBefore, isAfter } from 'date-fns';

const prisma = new PrismaClient();

export async function getAllSubscriptions(userId) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createSubscription(userId, data) {
  return prisma.subscription.create({
    data: {
      ...data,
      userId
    }
  });
}

export async function bulkCreateSubscriptions(userId, subscriptions) {
  const existingSubscriptions = await prisma.subscription.findMany({
    where: { userId },
    select: { name: true }
  });

  const existingNames = new Set(existingSubscriptions.map(sub => sub.name));
  const newSubscriptions = subscriptions.filter(sub => !existingNames.has(sub.name));

  if (newSubscriptions.length === 0) {
    return [];
  }

  return prisma.subscription.createMany({
    data: newSubscriptions.map(sub => ({
      ...sub,
      userId
    }))
  });
}

export async function updateSubscription(id, userId, data) {
  return prisma.subscription.updateMany({
    where: {
      id,
      userId // Ensure user owns the subscription
    },
    data
  });
}

export async function deleteSubscription(id, userId) {
  const result = await prisma.subscription.deleteMany({
    where: {
      id,
      userId // Ensure user owns the subscription
    }
  });
  return result.count > 0;
}

export async function getUpcomingRenewals(userId, daysThreshold = 7) {
  const thresholdDate = addDays(new Date(), daysThreshold);
  
  return prisma.subscription.findMany({
    where: {
      userId,
      status: { not: 'cancelled' },
      nextBillingDate: {
        lte: thresholdDate,
        gt: new Date(),
      },
    },
    orderBy: {
      nextBillingDate: 'asc',
    },
  });
}

export async function getEndingTrials(userId, daysThreshold = 3) {
  const thresholdDate = addDays(new Date(), daysThreshold);
  
  return prisma.subscription.findMany({
    where: {
      userId,
      status: 'trial',
      trialEndsAt: {
        lte: thresholdDate,
        gt: new Date(),
      },
    },
    orderBy: {
      trialEndsAt: 'asc',
    },
  });
}

export async function getSubscriptionStats(userId) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { not: 'cancelled' },
    },
  });

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    const amount = sub.billingCycle === 'monthly' ? 
      sub.amount : 
      sub.amount / 12;
    return acc + amount;
  }, 0);

  const yearlyTotal = subscriptions.reduce((acc, sub) => {
    const amount = sub.billingCycle === 'yearly' ? 
      sub.amount : 
      sub.amount * 12;
    return acc + amount;
  }, 0);

  const categorySummary = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
    return acc;
  }, {});

  const billingCycleSummary = subscriptions.reduce((acc, sub) => {
    acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + 1;
    return acc;
  }, {});

  const spendingTrend = await getSpendingTrend(userId);

  return {
    monthlyTotal,
    yearlyTotal,
    totalSubscriptions: subscriptions.length,
    activeTrials: subscriptions.filter(sub => sub.status === 'trial').length,
    categorySummary,
    billingCycleSummary,
    spendingTrend
  };
}

async function getSpendingTrend(userId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      OR: [
        { status: 'active' },
        {
          status: 'cancelled',
          updatedAt: {
            gte: sixMonthsAgo
          }
        }
      ]
    }
  });

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toISOString().slice(0, 7),
      total: 0
    };
  }).reverse();

  subscriptions.forEach(sub => {
    months.forEach(month => {
      const [year, monthNum] = month.month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      
      if (sub.status === 'active' || isAfter(date, sub.updatedAt)) {
        month.total += sub.billingCycle === 'monthly' ? 
          sub.amount : 
          sub.amount / 12;
      }
    });
  });

  return months;
}

export async function updateSubscriptionStatus() {
  const now = new Date();
  
  // Update trials that have ended
  await prisma.subscription.updateMany({
    where: {
      status: 'trial',
      trialEndsAt: {
        lt: now,
      },
    },
    data: {
      status: 'active',
    },
  });

  // Update next billing date for subscriptions that have passed their billing date
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: 'active',
      nextBillingDate: {
        lt: now,
      },
    },
  });

  for (const sub of subscriptions) {
    const newBillingDate = new Date(sub.nextBillingDate);
    while (isBefore(newBillingDate, now)) {
      if (sub.billingCycle === 'monthly') {
        newBillingDate.setMonth(newBillingDate.getMonth() + 1);
      } else {
        newBillingDate.setFullYear(newBillingDate.getFullYear() + 1);
      }
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { nextBillingDate: newBillingDate },
    });
  }
}