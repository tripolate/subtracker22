import type { Subscription } from '../types/subscription';

interface SubscriptionPattern {
  matches: (from: string, subject: string, body: string) => boolean;
  extract: (from: string, subject: string, body: string) => Partial<Subscription>;
}

// Common subscription services patterns
export const SUBSCRIPTION_PATTERNS: SubscriptionPattern[] = [
  // Streaming Services
  {
    matches: (from) => from.toLowerCase().includes('netflix.com'),
    extract: (_, subject) => ({
      name: 'Netflix',
      category: 'Entertainment',
      billingCycle: subject.toLowerCase().includes('annual') ? 'yearly' : 'monthly',
      amount: subject.toLowerCase().includes('premium') ? 19.99 : 15.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('spotify.com'),
    extract: (_, subject) => ({
      name: 'Spotify',
      category: 'Entertainment',
      billingCycle: subject.toLowerCase().includes('annual') ? 'yearly' : 'monthly',
      amount: subject.toLowerCase().includes('family') ? 15.99 : 9.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('hulu.com'),
    extract: () => ({
      name: 'Hulu',
      category: 'Entertainment',
      billingCycle: 'monthly',
      amount: 7.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1672640034106-2981c8213e63?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('disneyplus.com'),
    extract: () => ({
      name: 'Disney+',
      category: 'Entertainment',
      billingCycle: 'monthly',
      amount: 7.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1640499900704-b00dd6a1103a?w=64&h=64&fit=crop&auto=format'
    })
  },

  // Productivity Tools
  {
    matches: (from) => from.toLowerCase().includes('adobe.com'),
    extract: (_, subject) => ({
      name: 'Adobe Creative Cloud',
      category: 'Productivity',
      billingCycle: subject.toLowerCase().includes('annual') ? 'yearly' : 'monthly',
      amount: 52.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('microsoft.com') && /office|365/i.test(from),
    extract: () => ({
      name: 'Microsoft 365',
      category: 'Productivity',
      billingCycle: 'monthly',
      amount: 6.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('notion.so'),
    extract: () => ({
      name: 'Notion',
      category: 'Productivity',
      billingCycle: 'monthly',
      amount: 8,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1659269661337-7ee76a7645b5?w=64&h=64&fit=crop&auto=format'
    })
  },

  // Development Tools
  {
    matches: (from) => from.toLowerCase().includes('github.com'),
    extract: (_, subject) => ({
      name: 'GitHub',
      category: 'Development',
      billingCycle: 'monthly',
      amount: subject.toLowerCase().includes('pro') ? 7.99 : 4.99,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=64&h=64&fit=crop&auto=format'
    })
  },
  {
    matches: (from) => from.toLowerCase().includes('jetbrains.com'),
    extract: () => ({
      name: 'JetBrains All Products',
      category: 'Development',
      billingCycle: 'yearly',
      amount: 249,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1679033367483-a46e0de2e5aa?w=64&h=64&fit=crop&auto=format'
    })
  },

  // Cloud Services
  {
    matches: (from) => /aws.*amazon\.com/i.test(from),
    extract: (_, subject, body) => {
      const amount = extractAmount(body) || 0;
      return {
        name: 'AWS',
        category: 'Development',
        billingCycle: 'monthly',
        amount,
        currency: 'USD',
        logo: 'https://images.unsplash.com/photo-1649733484875-2e837f5b749b?w=64&h=64&fit=crop&auto=format'
      };
    }
  },
  {
    matches: (from) => from.toLowerCase().includes('digitalocean.com'),
    extract: (_, subject, body) => ({
      name: 'DigitalOcean',
      category: 'Development',
      billingCycle: 'monthly',
      amount: extractAmount(body) || 5,
      currency: 'USD',
      logo: 'https://images.unsplash.com/photo-1649733485121-0dd8f4e3a4d2?w=64&h=64&fit=crop&auto=format'
    })
  },

  // Generic Pattern with improved parsing
  {
    matches: (from, subject, body) => {
      const keywords = [
        'subscription',
        'recurring payment',
        'monthly plan',
        'yearly plan',
        'billing confirmation',
        'payment received',
        'invoice',
        'receipt'
      ];
      const text = `${subject} ${body}`.toLowerCase();
      return keywords.some(keyword => text.includes(keyword));
    },
    extract: (from, subject, body) => {
      const combinedText = `${subject} ${body}`.toLowerCase();
      
      // Extract amount with improved regex
      const amount = extractAmount(combinedText);
      
      // Determine billing cycle with more context
      const cycleKeywords = {
        yearly: ['annual', 'yearly', 'year plan', '12 month', '12-month'],
        monthly: ['monthly', 'month plan', 'per month', '/month', 'mo.']
      };
      
      const billingCycle = cycleKeywords.yearly.some(k => combinedText.includes(k)) ? 'yearly' : 'monthly';
      
      // Try to determine category based on keywords
      const categoryMap = {
        Entertainment: ['streaming', 'music', 'video', 'game', 'tv'],
        Productivity: ['office', 'document', 'storage', 'cloud'],
        Development: ['hosting', 'domain', 'server', 'api'],
        Health: ['fitness', 'health', 'workout', 'gym']
      };
      
      const category = Object.entries(categoryMap).find(
        ([category, keywords]) => keywords.some(k => combinedText.includes(k))
      )?.[0] || 'Other';

      // Clean up service name
      const name = cleanServiceName(from);

      return {
        name,
        category,
        billingCycle,
        amount: amount || 0,
        currency: 'USD',
        status: 'active'
      };
    }
  }
];

// Helper function to extract amount from text
function extractAmount(text: string): number | null {
  const patterns = [
    /USD\s*(\d+(?:\.\d{2})?)/i,
    /\$\s*(\d+(?:\.\d{2})?)/,
    /(\d+(?:\.\d{2})?)\s*USD/i,
    /(\d+(?:\.\d{2})?)\s*dollars/i,
    /amount:\s*\$?\s*(\d+(?:\.\d{2})?)/i,
    /total:\s*\$?\s*(\d+(?:\.\d{2})?)/i,
    /payment\s+of\s+\$?\s*(\d+(?:\.\d{2})?)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && !isNaN(parseFloat(match[1]))) {
      return parseFloat(match[1]);
    }
  }

  return null;
}

// Helper function to extract date from text
export function extractDate(text: string): Date | null {
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?,\s+\d{4}/i,
    /next\s+billing\s+date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

// Helper function to clean up service name from email address
function cleanServiceName(from: string): string {
  // Extract domain from email
  const domainMatch = from.match(/@([^>]+)>/);
  if (!domainMatch) return 'Unknown Service';

  const domain = domainMatch[1].toLowerCase();
  
  // Remove common TLDs and split by dots
  const parts = domain
    .replace(/\.(com|org|net|io|co|inc|ltd)$/g, '')
    .split('.');
  
  // Get the most meaningful part (usually the service name)
  const serviceName = parts[parts.length - 1];
  
  // Capitalize and clean up
  return serviceName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}