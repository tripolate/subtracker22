import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email.js';
import { addDays, isBefore } from 'date-fns';

const prisma = new PrismaClient();

export function setupCronJobs() {
  // Check for upcoming renewals and trial endings daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      // Get all active subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: {
          OR: [
            { status: 'active' },
            { status: 'trial' }
          ]
        },
        include: {
          user: {
            include: {
              settings: true
            }
          }
        }
      });

      for (const subscription of subscriptions) {
        const { user, nextBillingDate, trialEndsAt } = subscription;
        const { settings } = user;

        if (!settings?.emailNotifications) continue;

        const now = new Date();
        const renewalDate = new Date(nextBillingDate);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Check for upcoming renewals
        if (daysUntilRenewal === settings.renewalReminders) {
          await sendEmail({
            to: user.email,
            subject: `Upcoming Renewal: ${subscription.name}`,
            text: `Your subscription to ${subscription.name} will renew in ${daysUntilRenewal} days. The amount of ${subscription.amount} ${subscription.currency} will be charged on ${nextBillingDate}.`
          });
        }

        // Check for trial endings
        if (subscription.status === 'trial' && trialEndsAt) {
          const trialEnd = new Date(trialEndsAt);
          const daysUntilTrialEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilTrialEnd === settings.trialReminders) {
            await sendEmail({
              to: user.email,
              subject: `Trial Ending Soon: ${subscription.name}`,
              text: `Your trial for ${subscription.name} will end in ${daysUntilTrialEnd} days. To avoid charges, make sure to cancel before ${trialEndsAt}.`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
}