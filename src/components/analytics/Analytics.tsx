import React from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { AnalyticsPanel } from './AnalyticsPanel';

const Analytics: React.FC = () => {
  const { subscriptions, loading, error } = useSubscriptions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return <AnalyticsPanel subscriptions={subscriptions} />;
};

export default Analytics;