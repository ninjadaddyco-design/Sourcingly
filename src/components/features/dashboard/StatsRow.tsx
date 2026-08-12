import { ScanSearch, Wallet, Package, TrendingUp } from 'lucide-react';
import type { User } from '@/types';
import { MOCK_RECENT_SCANS } from '@/lib/mockData';
import { PLAN_CREDITS } from '@/constants';

interface StatsRowProps {
  user: User;
}

export const StatsRow = ({ user }: StatsRowProps) => {
  const totalScans = MOCK_RECENT_SCANS.length;
  const avgMargin = Math.round(MOCK_RECENT_SCANS.reduce((sum, s) => sum + s.marginPercent, 0) / MOCK_RECENT_SCANS.length);
  const planMax = PLAN_CREDITS[user.plan] || 10;
  const usedCredits = planMax - user.credits;

  const stats = [
    { icon: ScanSearch, label: 'Scans This Month', value: String(totalScans), sub: `${usedCredits} used`, color: 'text-[#A3C9A8]', bg: 'bg-[#A3C9A8]/10' },
    { icon: Wallet, label: 'Credits Remaining', value: String(user.credits), sub: `of ${planMax} total`, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
    { icon: Package, label: 'Products Saved', value: String(totalScans + 2), sub: 'in your library', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: TrendingUp, label: 'Average Margin', value: `${avgMargin}%`, sub: 'across all scans', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ icon: Icon, label, value, sub, color, bg }) => (
        <div key={label} className="p-5 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{value}</p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
};
