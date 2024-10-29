import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface Props {
  analytics: BillingCycleAnalytics;
}

export function BillingCycleAnalytics({ analytics }: Props) {
  const data = [
    {
      name: 'Monthly',
      subscriptions: analytics.distribution.monthly,
      spending: analytics.spending.monthly
    },
    {
      name: 'Yearly',
      subscriptions: analytics.distribution.yearly,
      spending: analytics.spending.yearly
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Cycle Distribution</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'spending' ? formatCurrency(value) : value,
                name === 'spending' ? 'Monthly Spending' : 'Subscriptions'
              ]}
            />
            <Bar
              yAxisId="left"
              dataKey="subscriptions"
              fill="#3B82F6"
              name="Subscriptions"
            />
            <Bar
              yAxisId="right"
              dataKey="spending"
              fill="#10B981"
              name="Monthly Spending"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}