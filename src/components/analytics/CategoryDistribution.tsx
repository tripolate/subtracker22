import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

interface Props {
  analytics: CategoryAnalytics;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function CategoryDistribution({ analytics }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Top Category</p>
        <p className="text-lg font-semibold text-gray-900">
          {analytics.topCategory.category}
          <span className="ml-2 text-sm text-gray-500">
            ({analytics.topCategory.percentage}%)
          </span>
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analytics.categoryDistribution}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ category, percentage }) => `${category} (${percentage}%)`}
            >
              {analytics.categoryDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Spending']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}