import { PrismaClient } from '@prisma/client';
import { addDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const prisma = new PrismaClient();

export async function getSpendingAnalytics(userId) {
  const sixMonthsAgo = subMonths(new Date(), 6);
  
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

  // Calculate monthly spending trend
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthlyTotal = subscriptions.reduce((total, sub) => {
      if (sub.status === 'cancelled' && new Date(sub.updatedAt) < monthStart) {
        return total;
      }
      
      const amount = sub.billingCycle === 'monthly' ? 
        sub.amount : 
        sub.amount / 12;
      
      return total + amount;
    }, 0);

    return {
      month: format(date, 'MMM yyyy'),
      total: monthlyTotal
    };
  }).reverse();

  // Calculate current spending metrics
  const currentMonthSpending = monthlyTrend[monthlyTrend.length - 1].total;
  const previousMonthSpending = monthlyTrend[monthlyTrend.length - 2].total;
  const spendingChange = ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100;

  return {
    monthlyTrend,
    currentMonthSpending,
    previousMonthSpending,
    spendingChange,
    projectedAnnualSpending: currentMonthSpending * 12
  };
}

export async function getCategoryAnalytics(userId) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { not: 'cancelled' }
    }
  });

  // Calculate spending by category
  const categorySpending = subscriptions.reduce((acc, sub) => {
    const monthlyAmount = sub.billingCycle === 'monthly' ? 
      sub.amount : 
      sub.amount / 12;
    
    acc[sub.category] = (acc[sub.category] || 0) + monthlyAmount;
    return acc;
  }, {});

  // Calculate percentage distribution
  const total = Object.values(categorySpending).reduce((a, b) => Number(a) + Number(b), 0);
  const categoryDistribution = Object.entries(categorySpending).map(([category, amount]) => ({
    category,
    amount: Number(amount),
    percentage: ((Number(amount) / total) * 100).toFixed(1)
  }));

  return {
    categoryDistribution,
    topCategory: categoryDistribution.sort((a, b) => b.amount - a.amount)[0]
  };
}

export async function getBillingCycleAnalytics(userId) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { not: 'cancelled' }
    }
  });

  const cycleCount = subscriptions.reduce((acc, sub) => {
    acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + 1;
    return acc;
  }, {});

  const cycleSpending = subscriptions.reduce((acc, sub) => {
    const monthlyAmount = sub.billingCycle === 'monthly' ? 
      sub.amount : 
      sub.amount / 12;
    acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + monthlyAmount;
    return acc;
  }, {});

  return {
    distribution: {
      monthly: cycleCount.monthly || 0,
      yearly: cycleCount.yearly || 0
    },
    spending: {
      monthly: cycleSpending.monthly || 0,
      yearly: cycleSpending.yearly || 0
    }
  };
}

export async function getSubscriptionGrowth(userId) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  const monthlyGrowth = subscriptions.reduce((acc, sub) => {
    const monthYear = format(new Date(sub.createdAt), 'MMM yyyy');
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(monthlyGrowth).map(([month, count]) => ({
    month,
    count
  }));
}

export async function getUpcomingPayments(userId, days = 30) {
  const futureDate = addDays(new Date(), days);
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { not: 'cancelled' },
      nextBillingDate: {
        lte: futureDate,
        gt: new Date()
      }
    },
    orderBy: {
      nextBillingDate: 'asc'
    }
  });

  return subscriptions.map(sub => ({
    id: sub.id,
    name: sub.name,
    amount: sub.amount,
    currency: sub.currency,
    dueDate: sub.nextBillingDate,
    daysUntilDue: Math.ceil(
      (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    )
  }));
}