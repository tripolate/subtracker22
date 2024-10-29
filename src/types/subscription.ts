export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  category: string;
  status: 'active' | 'trial' | 'cancelled';
  trialEndsAt?: Date;
  logo?: string;
}