import { SUBSCRIPTION_PATTERNS } from '../utils/subscriptionPatterns';
import type { Subscription } from '../types/subscription';

interface EmailMessage {
  id: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: { data?: string };
    parts?: Array<{ body: { data?: string } }>;
  };
  snippet: string;
}

export async function scanEmails(accessToken: string): Promise<Partial<Subscription>[]> {
  try {
    // Search for subscription-related emails from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const query = `after:${sixMonthsAgo.getTime() / 1000} subject:(subscription OR receipt OR invoice OR payment OR billing)`;
    
    const searchResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    if (!searchResponse.ok) {
      throw new Error('Failed to search emails');
    }

    const searchData = await searchResponse.json();
    const messageIds = searchData.messages || [];
    const subscriptions: Partial<Subscription>[] = [];
    const processedServices = new Set();

    // Process each email (limit to 50 most recent)
    for (const { id } of messageIds.slice(0, 50)) {
      const messageResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      if (!messageResponse.ok) {
        console.error(`Failed to fetch message ${id}`);
        continue;
      }

      const message: EmailMessage = await messageResponse.json();
      const from = message.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const subject = message.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
      const body = decodeEmailBody(message);

      // Try to extract subscription information
      for (const pattern of SUBSCRIPTION_PATTERNS) {
        if (pattern.matches(from, subject, body)) {
          const subscription = pattern.extract(from, subject, body);
          if (subscription?.name && !processedServices.has(subscription.name)) {
            processedServices.add(subscription.name);
            
            // Set default next billing date if not found
            if (!subscription.nextBillingDate) {
              const nextBillingDate = new Date();
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              subscription.nextBillingDate = nextBillingDate;
            }

            subscriptions.push(subscription);
          }
          break;
        }
      }
    }

    return subscriptions;
  } catch (error) {
    console.error('Error scanning emails:', error);
    throw error;
  }
}

function decodeEmailBody(message: EmailMessage): string {
  // Try to get body content from different possible locations
  let bodyData = '';

  if (message.payload.body?.data) {
    bodyData = message.payload.body.data;
  } else if (message.payload.parts) {
    // Look for text/plain or text/html parts
    const textPart = message.payload.parts.find(
      part => part.body?.data && 
      (part.body.data.includes('text/plain') || part.body.data.includes('text/html'))
    );
    if (textPart?.body?.data) {
      bodyData = textPart.body.data;
    }
  }

  // If no body found, use snippet
  if (!bodyData && message.snippet) {
    return message.snippet;
  }

  // Decode base64url encoded content
  try {
    return atob(bodyData.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return message.snippet || '';
  }
}