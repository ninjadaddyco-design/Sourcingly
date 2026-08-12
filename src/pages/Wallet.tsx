import { useState, useEffect, useRef } from 'react';
import { Check, Gift, Loader2, X } from 'lucide-react';
import { getStoredUser, updateUser, setStoredUser } from '@/lib/auth';
import { getTransactionsFromDb } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { PLAN_TIERS } from '@/constants';
import { CreditBalance } from '@/components/features/wallet/CreditBalance';
import { TransactionHistory } from '@/components/features/wallet/TransactionHistory';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FunctionsHttpError } from '@supabase/supabase-js';
import type { User, CreditTransaction } from '@/types';

const Wallet = () => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [giftCode, setGiftCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [showGiftInput, setShowGiftInput] = useState(false);
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load real transaction history from Supabase
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;
    getTransactionsFromDb(stored.id)
      .then((data) => setTransactions(data))
      .finally(() => setTxLoading(false));
  }, []);

  // Realtime subscription: credit balance updates instantly
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) return;

    const channel = supabase
      .channel('wallet-profile-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${stored.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const newCredits = row.credits as number;
          const updatedUser = updateUser({ credits: newCredits });
          if (updatedUser) setUser(updatedUser);
          // Also reload transactions to pick up the new entry
          getTransactionsFromDb(stored.id).then(setTransactions);
        },
      )
      .subscribe();

    realtimeRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, []);

  const handleRedeemGiftCard = async () => {
    if (!giftCode.trim()) return;
    setRedeeming(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const { data, error } = await supabase.functions.invoke('redeem-gift-card', {
        body: { code: giftCode.trim() },
      });

      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try { msg = await error.context.text(); } catch { /* keep original */ }
        }
        // Parse JSON error body if applicable
        try { const parsed = JSON.parse(msg); msg = parsed.error || msg; } catch { /* keep as-is */ }
        toast.error('Redemption failed', { description: msg });
        return;
      }

      const newBalance: number = data.newBalance;
      const creditsAdded: number = data.creditsAdded;

      // Update localStorage + local state immediately
      const updatedUser = updateUser({ credits: newBalance });
      if (updatedUser) {
        setStoredUser(updatedUser);
        setUser(updatedUser);
      }

      // Reload transactions
      const stored = getStoredUser();
      if (stored) getTransactionsFromDb(stored.id).then(setTransactions);

      toast.success(`Gift card redeemed!`, { description: `+${creditsAdded} credits added to your wallet.` });
      setGiftCode('');
      setShowGiftInput(false);
    } finally {
      setRedeeming(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Credit Wallet</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your scan credits and redeem gift cards.</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Credit Balance + Gift Card */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="w-full max-w-sm">
            <CreditBalance user={user} />
          </div>

          {/* Gift Card Redemption */}
          <div className="flex-1 bg-gradient-to-br from-[#8B5CF6]/10 to-[#A3C9A8]/10 border border-[#8B5CF6]/25 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center">
                <Gift size={20} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">Redeem Gift Card</p>
                <p className="text-xs text-slate-500">Enter a code to add credits instantly</p>
              </div>
            </div>

            {showGiftInput ? (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeemGiftCard()}
                    placeholder="e.g. WELCOME50"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6] text-sm font-mono tracking-widest uppercase"
                    autoFocus
                  />
                  <button
                    onClick={() => { setShowGiftInput(false); setGiftCode(''); }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <button
                  onClick={handleRedeemGiftCard}
                  disabled={!giftCode.trim() || redeeming}
                  className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all hover:shadow-md text-sm"
                >
                  {redeeming ? <Loader2 size={15} className="animate-spin" /> : <Gift size={15} />}
                  {redeeming ? 'Redeeming…' : 'Apply Gift Card'}
                </button>
                <p className="text-xs text-slate-400 text-center">Codes are case-insensitive. Each code can only be used once.</p>
              </div>
            ) : (
              <button
                onClick={() => setShowGiftInput(true)}
                className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-[#8B5CF6]/40 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 text-sm font-semibold transition-all"
              >
                + Enter Gift Card Code
              </button>
            )}
          </div>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PLAN_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  'p-6 rounded-2xl border transition-all',
                  tier.highlighted
                    ? 'border-[#A3C9A8] bg-[#A3C9A8]/5 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40',
                  user.plan === tier.id ? 'ring-2 ring-[#A3C9A8]' : '',
                )}
              >
                {user.plan === tier.id && (
                  <div className="inline-block px-2 py-0.5 bg-[#A3C9A8] text-slate-800 text-xs font-bold rounded-full mb-3">
                    Current Plan
                  </div>
                )}
                <p className="font-semibold text-slate-800 dark:text-white mb-1">{tier.name}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                  ${tier.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </p>
                <p className="text-xs text-slate-500 mb-4 mt-1">{tier.monthlyCredits} scans per month</p>
                <ul className="space-y-2 mb-5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <Check size={12} className="text-[#A3C9A8] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={user.plan === tier.id}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                    user.plan === tier.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 hover:shadow-md',
                  )}
                >
                  {user.plan === tier.id ? 'Active Plan' : tier.price === 0 ? 'Downgrade' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Paid plans coming soon. Use gift cards to add credits now.</p>
        </div>

        {/* Transaction History */}
        {txLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading transactions…
          </div>
        ) : transactions.length > 0 ? (
          <TransactionHistory transactions={transactions} />
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            No transactions yet. Scan a product or redeem a gift card to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
