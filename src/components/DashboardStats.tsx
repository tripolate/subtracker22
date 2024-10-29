import React from 'react';
import { DollarSign, Calendar, AlertCircle } from 'lucide-react';
import type { Subscription } from '../types/subscription';

interface DashboardStatsProps {
  subscriptions: Subscription[];
}

export function DashboardStats({ subscriptions }: DashboardStatsProps) {
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    if (sub.status === 'cancelled') return acc;
    return acc + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12);
  }, 0);

  const activeTrials = subscriptions.filter(sub => sub.status === 'trial').length;
  const upcomingRenewals = subscriptions.filter(sub => {
    const daysUntilRenewal = Math.ceil(
      (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRenewal <= 7 && sub.status !== 'cancelled';
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Monthly Spending</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalMonthly.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Trials</p>
            <p className="text-2xl font-bold text-gray-900">{activeTrials}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Upcoming Renewals</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingRenewals}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}