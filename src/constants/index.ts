import type { PlanTier } from '@/types';

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    monthlyCredits: 10,
    highlighted: false,
    features: [
      '10 product scans per month',
      'Basic supplier matching',
      'Market price data',
      'Email support',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 29,
    monthlyCredits: 100,
    highlighted: true,
    features: [
      '100 product scans per month',
      'Advanced supplier matching',
      'Competitor price analytics',
      'SEO description generator',
      'AI chat assistant',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    monthlyCredits: 500,
    highlighted: false,
    features: [
      '500 product scans per month',
      'Premium global supplier network',
      'Real-time price tracking',
      'Bulk scan and CSV export',
      'Custom niche filters',
      'Dedicated AI assistant',
      '24/7 priority support',
    ],
  },
];

export const NICHES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Pet Supplies',
  'Kitchen & Dining',
  'Office Supplies',
  'Automotive',
  'Baby & Kids',
  'Jewelry & Accessories',
  'Books & Media',
  'Other',
];

export const MONTHLY_GOALS = [
  { value: '1000', label: 'Under $1,000 / month' },
  { value: '5000', label: '$1,000 – $5,000 / month' },
  { value: '10000', label: '$5,000 – $10,000 / month' },
  { value: '25000', label: '$10,000 – $25,000 / month' },
  { value: '50000', label: 'Over $25,000 / month' },
];

export const PLAN_CREDITS: Record<string, number> = {
  starter: 10,
  growth: 100,
  pro: 500,
};
