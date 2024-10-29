import React from 'react';
import { AnalyticsPanel } from './analytics/AnalyticsPanel';
import { useSubscriptions } from '../hooks/useSubscriptions';

const Analytics: React.FC = () => {
  const { subscriptions } = useSubscriptions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
      <AnalyticsPanel subscriptions={subscriptions} />
    </div>
  );
};

export default Analytics;