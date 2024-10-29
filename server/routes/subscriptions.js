import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';
import { 
  getUpcomingRenewals, 
  getEndingTrials, 
  getSubscriptionStats,
  updateSubscriptionStatus,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  bulkCreateSubscriptions,
  getAllSubscriptions
} from '../services/subscription.js';

const router = express.Router();

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  billingCycle: z.enum(['monthly', 'yearly']),
  nextBillingDate: z.string().datetime(),
  category: z.string().min(1),
  status: z.enum(['active', 'trial', 'cancelled']),
  trialEndsAt: z.string().datetime().optional(),
  logo: z.string().url().optional()
});

// Get all subscriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await getAllSubscriptions(req.user.id);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Create new subscription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = subscriptionSchema.parse(req.body);
    const subscription = await createSubscription(req.user.id, validatedData);
    res.status(201).json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Bulk create subscriptions (for Gmail import)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const subscriptions = z.array(subscriptionSchema).parse(req.body);
    const createdSubscriptions = await bulkCreateSubscriptions(req.user.id, subscriptions);
    res.status(201).json(createdSubscriptions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to import subscriptions' });
  }
});

// Update subscription
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const validatedData = subscriptionSchema.partial().parse(req.body);
    const subscription = await updateSubscription(req.params.id, req.user.id, validatedData);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Delete subscription
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const success = await deleteSubscription(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// Get upcoming renewals
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const renewals = await getUpcomingRenewals(req.user.id, days);
    res.json(renewals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming renewals' });
  }
});

// Get ending trials
router.get('/trials', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const trials = await getEndingTrials(req.user.id, days);
    res.json(trials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ending trials' });
  }
});

// Get subscription statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await getSubscriptionStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription statistics' });
  }
});

// Force update subscription statuses
router.post('/update-status', authenticateToken, async (req, res) => {
  try {
    await updateSubscriptionStatus();
    res.json({ message: 'Subscription statuses updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription statuses' });
  }
});

export default router;