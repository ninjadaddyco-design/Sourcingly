import { useState, useCallback, useEffect, useRef } from 'react';
import { getStoredUser, deductCredit, updateUser } from '@/lib/auth';
import { updateProfileDb } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useCredits() {
  const [credits, setCredits] = useState(() => getStoredUser()?.credits ?? 0);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Supabase Realtime: keep credits in sync across tabs and after gift card redemptions
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;

    const channel = supabase
      .channel(`credits-realtime-${stored.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${stored.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const newCredits = row.credits as number;
          // Sync to localStorage
          updateUser({ credits: newCredits });
          setCredits(newCredits);
        },
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  const spendCredit = useCallback((): boolean => {
    const updated = deductCredit();
    if (!updated) {
      toast.error('No credits remaining', { description: 'Redeem a gift card or upgrade your plan.' });
      return false;
    }
    setCredits(updated.credits);
    // Sync credit balance to Supabase in background
    updateProfileDb(updated.id, { credits: updated.credits }).catch(console.error);
    return true;
  }, []);

  const refreshCredits = useCallback(() => {
    setCredits(getStoredUser()?.credits ?? 0);
  }, []);

  return { credits, spendCredit, refreshCredits };
}
