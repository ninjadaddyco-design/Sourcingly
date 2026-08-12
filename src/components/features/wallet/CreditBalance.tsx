import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import type { User } from '@/types';
import { PLAN_CREDITS } from '@/constants';
import { cn } from '@/lib/utils';

interface CreditBalanceProps {
  user: User;
}

export const CreditBalance = ({ user }: CreditBalanceProps) => {
  const navigate = useNavigate();
  const max = PLAN_CREDITS[user.plan] || 10;
  const pct = Math.round((user.credits / max) * 100);
  const statusColor = pct > 50 ? 'text-emerald-500' : pct > 20 ? 'text-amber-500' : 'text-red-500';
  const barColor = pct > 50 ? 'bg-[#A3C9A8]' : pct > 20 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-400 text-sm mb-1">Credits Remaining</p>
          <div className="flex items-end gap-2">
            <span className={cn('text-5xl font-bold', statusColor)}>{user.credits}</span>
            <span className="text-slate-400 text-sm mb-1">/ {max}</span>
          </div>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A3C9A8]/20 to-[#8B5CF6]/20 border border-white/10 flex items-center justify-center">
          <Zap size={28} className="text-[#A3C9A8]" />
        </div>
      </div>
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Usage this month</span>
          <span>{max - user.credits} used · {pct}% remaining</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Current Plan</p>
          <p className="font-semibold capitalize">{user.plan}</p>
        </div>
        {user.plan !== 'pro' && (
          <button onClick={() => navigate('/wallet')} className="flex items-center gap-1.5 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold px-4 py-2 rounded-xl text-sm transition-all hover:shadow-md">
            <Zap size={14} /> Upgrade Plan
          </button>
        )}
      </div>
    </div>
  );
};
