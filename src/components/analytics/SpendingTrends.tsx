import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SpendingAnalytics {
  monthlyTrend: Array<{ month: string; total: number }>;
  currentMonthSpending: number;
  previousMonthSpending: number;
  spendingChange: number;
  projectedAnnualSpending: number;
}

interface Props {
  analytics: SpendingAnalytics;
}

export function SpendingTrends({ analytics }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Current Month</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.currentMonthSpending)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Monthly Change</p>
          <div className="flex items-center gap-1">
            {analytics.spendingChange > 0 ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
            <p className={`text-lg font-semibold ${
              analytics.spendingChange > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {Math.abs(analytics.spendingChange).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analytics.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Spending']}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}