import { supabase } from './supabase';
import type {
  User, ScanResult, CreditTransaction,
  ExperienceLevel, PlanType, ScanStatus, TransactionType, Supplier,
} from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    niche: row.niche || '',
    experience: row.experience as ExperienceLevel,
    monthlyGoal: row.monthly_goal ?? 1000,
    plan: row.plan as PlanType,
    credits: row.credits ?? 10,
    onboardingComplete: row.onboarding_complete ?? false,
    tourComplete: row.tour_complete ?? false,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToScan(row: any): ScanResult {
  return {
    id: row.id,
    imageUrl: row.image_url || '',
    productName: row.product_name || '',
    category: row.category || '',
    suppliers: (row.suppliers as Supplier[]) || [],
    avgCompetitorPrice: Number(row.avg_competitor_price) || 0,
    recommendedPrice: Number(row.recommended_price) || 0,
    marginPercent: row.margin_percent || 0,
    seoDescription: row.seo_description || '',
    status: (row.status as ScanStatus) || 'complete',
    scannedAt: row.scanned_at,
  };
}

/** Get existing profile or create a new one after Supabase auth. */
export async function getOrCreateProfile(
  userId: string,
  email: string,
  defaultName: string,
): Promise<User | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) {
    console.log('[DB] Loaded profile for', userId);
    return dbToUser(existing);
  }

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      name: defaultName,
      niche: '',
      experience: 'beginner',
      monthly_goal: 1000,
      plan: 'starter',
      credits: 10,
      onboarding_complete: false,
      tour_complete: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB] Profile creation failed:', error);
    return null;
  }

  console.log('[DB] Created profile for', userId);
  return dbToUser(created);
}

/** Partially update a profile in the database. */
export async function updateProfileDb(userId: string, updates: Partial<User>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
  if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
  if (updates.monthlyGoal !== undefined) dbUpdates.monthly_goal = updates.monthlyGoal;
  if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
  if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
  if (updates.onboardingComplete !== undefined) dbUpdates.onboarding_complete = updates.onboardingComplete;
  if (updates.tourComplete !== undefined) dbUpdates.tour_complete = updates.tourComplete;

  if (Object.keys(dbUpdates).length === 0) return;

  const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
  if (error) console.error('[DB] Profile update failed:', error);
}

/** Persist a completed scan result. Blob URLs are stored as empty string. */
export async function saveScanToDb(userId: string, scan: ScanResult): Promise<string | null> {
  const { data, error } = await supabase
    .from('scan_results')
    .insert({
      user_id: userId,
      image_url: scan.imageUrl.startsWith('blob:') ? '' : scan.imageUrl,
      product_name: scan.productName,
      category: scan.category,
      suppliers: scan.suppliers,
      avg_competitor_price: scan.avgCompetitorPrice,
      recommended_price: scan.recommendedPrice,
      margin_percent: scan.marginPercent,
      seo_description: scan.seoDescription,
      status: scan.status,
    })
    .select('id')
    .single();

  if (error) { console.error('[DB] Scan save failed:', error); return null; }
  return data.id as string;
}

/** Fetch scans for a user ordered by newest first. */
export async function getScansFromDb(userId: string, limit = 50): Promise<ScanResult[]> {
  const { data, error } = await supabase
    .from('scan_results')
    .select('*')
    .eq('user_id', userId)
    .order('scanned_at', { ascending: false })
    .limit(limit);

  if (error) { console.error('[DB] Scan fetch failed:', error); return []; }
  return (data ?? []).map(dbToScan);
}

/** Log a credit transaction. */
export async function logCreditTransaction(
  userId: string,
  type: TransactionType,
  amount: number,
  description: string,
): Promise<void> {
  const { error } = await supabase
    .from('credit_transactions')
    .insert({ user_id: userId, type, amount, description });
  if (error) console.error('[DB] Transaction log failed:', error);
}

/** Fetch credit transactions. */
export async function getTransactionsFromDb(userId: string): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) { console.error('[DB] Transactions fetch failed:', error); return []; }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    type: row.type as TransactionType,
    amount: row.amount as number,
    description: row.description as string,
    date: row.created_at as string,
  }));
}

/** Get all product tags for a user, grouped by scan_id. */
export async function getTagsFromDb(userId: string): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('product_tags')
    .select('scan_id, tag')
    .eq('user_id', userId);

  if (error) { console.error('[DB] Tags fetch failed:', error); return {}; }

  const grouped: Record<string, string[]> = {};
  for (const row of data ?? []) {
    const sid = row.scan_id as string;
    if (!grouped[sid]) grouped[sid] = [];
    grouped[sid].push(row.tag as string);
  }
  return grouped;
}

/** Add a tag to a scan. Returns true on success or duplicate. */
export async function addTagToDb(userId: string, scanId: string, tag: string): Promise<boolean> {
  const { error } = await supabase
    .from('product_tags')
    .insert({ user_id: userId, scan_id: scanId, tag });

  if (error) {
    if (error.code === '23505') return true; // Unique constraint — already exists
    console.error('[DB] Tag add failed:', error);
    return false;
  }
  return true;
}

/** Remove a specific tag from a scan. */
export async function removeTagFromDb(userId: string, scanId: string, tag: string): Promise<void> {
  const { error } = await supabase
    .from('product_tags')
    .delete()
    .eq('user_id', userId)
    .eq('scan_id', scanId)
    .eq('tag', tag);

  if (error) console.error('[DB] Tag remove failed:', error);
}
