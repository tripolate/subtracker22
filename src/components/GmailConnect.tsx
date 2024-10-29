import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Loader2, AlertCircle } from 'lucide-react';
import { scanEmails } from '../services/gmail';
import type { Subscription } from '../types/subscription';

interface GmailConnectProps {
  onSubscriptionsFound: (subscriptions: Partial<Subscription>[]) => void;
}

export function GmailConnect({ onSubscriptionsFound }: GmailConnectProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsScanning(true);
        setError(null);
        const subscriptions = await scanEmails(response.access_token);
        
        if (subscriptions.length === 0) {
          setError('No subscription emails found in the last 6 months.');
          return;
        }
        
        onSubscriptionsFound(subscriptions);
      } catch (error: any) {
        console.error('Failed to scan emails:', error);
        setError(error.message || 'Failed to scan emails. Please try again.');
      } finally {
        setIsScanning(false);
      }
    },
    onError: (error) => {
      console.error('Gmail login failed:', error);
      setError('Failed to connect to Gmail. Please try again.');
      setIsScanning(false);
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    flow: 'implicit'
  });

  return (
    <div className="relative">
      <button
        onClick={() => {
          setError(null);
          login();
        }}
        disabled={isScanning}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning Emails...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Import Subscriptions
          </>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 w-64 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}