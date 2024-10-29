import React from 'react';
import { Bell, X } from 'lucide-react';
import type { Subscription } from '../types/subscription';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}

export function NotificationsPanel({ isOpen, onClose, subscriptions }: NotificationsPanelProps) {
  const upcomingRenewals = subscriptions
    .filter(sub => {
      const daysUntilRenewal = Math.ceil(
        (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilRenewal <= 7 && sub.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

  const trialEndings = subscriptions
    .filter(sub => 
      sub.status === 'trial' && 
      sub.trialEndsAt && 
      new Date(sub.trialEndsAt).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 3
    )
    .sort((a, b) => (a.trialEndsAt && b.trialEndsAt) ? 
      new Date(a.trialEndsAt).getTime() - new Date(b.trialEndsAt).getTime() : 0
    );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg z-50">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {upcomingRenewals.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Upcoming Renewals</h3>
              {upcomingRenewals.map(sub => (
                <div key={sub.id} className="bg-blue-50 rounded-lg p-3 mb-2">
                  <p className="font-medium text-blue-900">{sub.name}</p>
                  <p className="text-sm text-blue-700">
                    Renews on {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-700">
                    Amount: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: sub.currency,
                    }).format(sub.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {trialEndings.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Trial Periods Ending</h3>
              {trialEndings.map(sub => (
                <div key={sub.id} className="bg-amber-50 rounded-lg p-3 mb-2">
                  <p className="font-medium text-amber-900">{sub.name}</p>
                  <p className="text-sm text-amber-700">
                    Trial ends on {sub.trialEndsAt?.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {upcomingRenewals.length === 0 && trialEndings.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}