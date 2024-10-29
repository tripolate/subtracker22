import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Subscription } from '../types/subscription';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('/api/subscriptions');
      setSubscriptions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    try {
      const response = await axios.post('/api/subscriptions', subscription);
      setSubscriptions(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to add subscription');
      throw err;
    }
  };

  const updateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    try {
      const response = await axios.put(`/api/subscriptions/${id}`, subscription);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? response.data : sub)
      );
      return response.data;
    } catch (err) {
      setError('Failed to update subscription');
      throw err;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      await axios.delete(`/api/subscriptions/${id}`);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      setError('Failed to delete subscription');
      throw err;
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions
  };
}