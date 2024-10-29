import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SubscriptionGrowth {
  month: string;
  count: number;
}

interface Props {
  data: SubscriptionGrowth[];
}

export function SubscriptionGrowth({ data }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Growth</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              fill="#93C5FD"
              name="Active Subscriptions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}