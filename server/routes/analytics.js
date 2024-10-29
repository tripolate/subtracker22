import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getSpendingAnalytics,
  getCategoryAnalytics,
  getBillingCycleAnalytics,
  getSubscriptionGrowth,
  getUpcomingPayments
} from '../services/analytics.js';

const router = express.Router();

// Get spending analytics (monthly trend, total spend, etc.)
router.get('/spending', authenticateToken, async (req, res) => {
  try {
    const analytics = await getSpendingAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending analytics' });
  }
});

// Get category distribution and trends
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const analytics = await getCategoryAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category analytics' });
  }
});

// Get billing cycle distribution
router.get('/billing-cycles', authenticateToken, async (req, res) => {
  try {
    const analytics = await getBillingCycleAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing cycle analytics' });
  }
});

// Get subscription growth over time
router.get('/growth', authenticateToken, async (req, res) => {
  try {
    const analytics = await getSubscriptionGrowth(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription growth data' });
  }
});

// Get upcoming payments for the next 30 days
router.get('/upcoming-payments', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const payments = await getUpcomingPayments(req.user.id, days);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming payments' });
  }
});

export default router;