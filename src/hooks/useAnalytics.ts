import { useState, useEffect } from 'react';
import api from '../config/api';

interface SpendingAnalytics {
  monthlyTrend: Array<{ month: string; total: number }>;
  currentMonthSpending: number;
  previousMonthSpending: number;
  spendingChange: number;
  projectedAnnualSpending: number;
}

interface CategoryAnalytics {
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: string;
  }>;
  topCategory: {
    category: string;
    amount: number;
    percentage: string;
  };
}

interface BillingCycleAnalytics {
  distribution: {
    monthly: number;
    yearly: number;
  };
  spending: {
    monthly: number;
    yearly: number;
  };
}

interface SubscriptionGrowth {
  month: string;
  count: number;
}

interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysUntilDue: number;
}

export function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spendingAnalytics, setSpendingAnalytics] = useState<SpendingAnalytics | null>(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics | null>(null);
  const [billingCycleAnalytics, setBillingCycleAnalytics] = useState<BillingCycleAnalytics | null>(null);
  const [subscriptionGrowth, setSubscriptionGrowth] = useState<SubscriptionGrowth[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          spendingRes,
          categoryRes,
          billingCycleRes,
          growthRes,
          paymentsRes
        ] = await Promise.all([
          api.get('/analytics/spending'),
          api.get('/analytics/categories'),
          api.get('/analytics/billing-cycles'),
          api.get('/analytics/growth'),
          api.get('/analytics/upcoming-payments')
        ]);

        setSpendingAnalytics(spendingRes.data);
        setCategoryAnalytics(categoryRes.data);
        setBillingCycleAnalytics(billingCycleRes.data);
        setSubscriptionGrowth(growthRes.data);
        setUpcomingPayments(paymentsRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return {
    loading,
    error,
    spendingAnalytics,
    categoryAnalytics,
    billingCycleAnalytics,
    subscriptionGrowth,
    upcomingPayments
  };
}