import React, { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import { DashboardStats } from './DashboardStats';
import { SubscriptionCard } from './SubscriptionCard';
import { AddSubscriptionModal } from './AddSubscriptionModal';
import { NotificationsPanel } from './NotificationsPanel';
import { SearchAndFilter } from './SearchAndFilter';
import { GmailConnect } from './GmailConnect';
import { useSubscriptions } from '../hooks/useSubscriptions';
import type { Subscription } from '../types/subscription';

export default function Dashboard() {
  const { subscriptions } = useSubscriptions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');

  const handleSubscriptionsFound = (newSubscriptions: Partial<Subscription>[]) => {
    // This will be implemented when we add backend integration
    console.log('Found subscriptions:', newSubscriptions);
  };

  const filteredAndSortedSubscriptions = React.useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || sub.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'amount-asc':
            return a.amount - b.amount;
          case 'amount-desc':
            return b.amount - a.amount;
          case 'date-asc':
            return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
          case 'date-desc':
            return new Date(b.nextBillingDate).getTime() - new Date(a.nextBillingDate).getTime();
          default:
            return 0;
        }
      });
  }, [subscriptions, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <GmailConnect onSubscriptionsFound={handleSubscriptionsFound} />
          <button
            onClick={() => setIsNotificationsPanelOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <DashboardStats subscriptions={subscriptions} />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Subscriptions</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedSubscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
          />
        ))}
      </div>

      {filteredAndSortedSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscriptions found matching your criteria.</p>
        </div>
      )}

      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={() => {}}
      />

      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
        subscriptions={subscriptions}
      />
    </div>
  );
}