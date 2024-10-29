import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, addMonths, startOfMonth } from 'date-fns';
import type { Subscription } from '../../types/subscription';

interface AnalyticsPanelProps {
  subscriptions: Subscription[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsPanel({ subscriptions }: AnalyticsPanelProps) {
  const categoryData = useMemo(() => {
    const categories = subscriptions.reduce((acc, sub) => {
      if (sub.status === 'cancelled') return acc;
      acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [subscriptions]);

  const monthlySpendingData = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = startOfMonth(addMonths(now, -5 + i));
      return {
        date,
        total: subscriptions.reduce((acc, sub) => {
          if (sub.status === 'cancelled') return acc;
          const amount = sub.billingCycle === 'monthly' ? 
            sub.amount : 
            sub.amount / 12;
          return acc + amount;
        }, 0)
      };
    });

    return months.map(({ date, total }) => ({
      month: format(date, 'MMM yyyy'),
      amount: total
    }));
  }, [subscriptions]);

  const billingCycleData = useMemo(() => {
    const cycles = subscriptions.reduce((acc, sub) => {
      if (sub.status === 'cancelled') return acc;
      acc[sub.billingCycle] = (acc[sub.billingCycle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cycles).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [subscriptions]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Spending Trend */}
        <div className="h-80">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySpendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="h-80">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Billing Cycle Distribution */}
        <div className="h-80 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-600 mb-4">Billing Cycle Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={billingCycleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884D8">
                {billingCycleData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}