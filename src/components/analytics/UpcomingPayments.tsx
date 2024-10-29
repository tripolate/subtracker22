import React from 'react';
import { Calendar } from 'lucide-react';

interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysUntilDue: number;
}

interface Props {
  payments: UpcomingPayment[];
}

export function UpcomingPayments({ payments }: Props) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{payment.name}</p>
                <p className="text-sm text-gray-500">
                  Due in {payment.daysUntilDue} days
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">
              {formatCurrency(payment.amount, payment.currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}