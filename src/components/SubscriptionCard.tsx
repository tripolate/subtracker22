import React from 'react';
import { Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Subscription } from '../types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isTrialEnding = subscription.status === 'trial' && subscription.trialEndsAt && 
    new Date(subscription.trialEndsAt).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 3;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 relative overflow-hidden">
      {subscription.status === 'trial' && (
        <div className="absolute top-3 right-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Trial
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {subscription.logo ? (
            <img src={subscription.logo} alt={subscription.name} className="w-12 h-12 rounded-lg" />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
            <p className="text-sm text-gray-500">{subscription.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: subscription.currency,
            }).format(subscription.amount)}
          </p>
          <p className="text-sm text-gray-500">{subscription.billingCycle}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Next billing: {format(new Date(subscription.nextBillingDate), 'MMM d, yyyy')}</span>
        </div>
        
        {isTrialEnding && (
          <div className="flex items-center space-x-1 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Trial ending soon</span>
          </div>
        )}
      </div>
    </div>
  );
}