import type { User, PlanType, ExperienceLevel } from '@/types';
import { PLAN_CREDITS } from '@/constants';

const AUTH_KEY = 'sourcingly_user';
const OTP_KEY = 'sourcingly_otp';

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(OTP_KEY);
};

export const generateOTP = (): string => String(Math.floor(1000 + Math.random() * 9000));

export const storeOTP = (email: string, otp: string): void => {
  localStorage.setItem(OTP_KEY, JSON.stringify({ email, otp, expires: Date.now() + 600000 }));
};

export const verifyOTP = (email: string, otp: string): boolean => {
  try {
    const raw = localStorage.getItem(OTP_KEY);
    if (!raw) return false;
    const { email: e, otp: o, expires } = JSON.parse(raw);
    return Date.now() < expires && e === email && o === otp;
  } catch {
    return false;
  }
};

export const createUser = (email: string): User => {
  const raw = email.split('@')[0].replace(/[._-]/g, ' ');
  const name = raw.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    id: crypto.randomUUID(),
    email,
    name,
    niche: '',
    experience: 'beginner' as ExperienceLevel,
    monthlyGoal: 1000,
    plan: 'starter' as PlanType,
    credits: PLAN_CREDITS.starter,
    onboardingComplete: false,
    tourComplete: false,
    createdAt: new Date().toISOString(),
  };
};

export const updateUser = (updates: Partial<User>): User | null => {
  const user = getStoredUser();
  if (!user) return null;
  const updated = { ...user, ...updates };
  setStoredUser(updated);
  return updated;
};

export const deductCredit = (): User | null => {
  const user = getStoredUser();
  if (!user || user.credits <= 0) return null;
  return updateUser({ credits: user.credits - 1 });
};
