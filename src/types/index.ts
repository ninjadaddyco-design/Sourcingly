export type Theme = 'light' | 'dark';
export type PlanType = 'starter' | 'growth' | 'pro';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ScanStatus = 'processing' | 'complete' | 'failed';
export type TransactionType = 'deduction' | 'addition' | 'bonus';

export interface User {
  id: string;
  email: string;
  name: string;
  niche: string;
  experience: ExperienceLevel;
  monthlyGoal: number;
  plan: PlanType;
  credits: number;
  onboardingComplete: boolean;
  tourComplete: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  price: number;
  rating: number;
  reviewCount: number;
  leadTime: string;
  moq: number;
}

export interface ScanResult {
  id: string;
  imageUrl: string;
  productName: string;
  category: string;
  suppliers: Supplier[];
  avgCompetitorPrice: number;
  recommendedPrice: number;
  marginPercent: number;
  seoDescription: string;
  status: ScanStatus;
  scannedAt: string;
}

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export interface PlanTier {
  id: PlanType;
  name: string;
  price: number;
  monthlyCredits: number;
  features: string[];
  highlighted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface OnboardingState {
  step: 1 | 2 | 3;
  experience: ExperienceLevel | '';
  niche: string;
  monthlyGoal: string;
}
