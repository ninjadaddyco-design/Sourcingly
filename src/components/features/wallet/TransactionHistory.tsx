import { Plus, Minus, Gift } from 'lucide-react';
import type { CreditTransaction } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
}

const icons = { addition: Plus, deduction: Minus, bonus: Gift };
const colors = { addition: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', deduction: 'text-red-500 bg-red-50 dark:bg-red-900/20', bonus: 'text-[#8B5CF6] bg-[#8B5CF6]/10' };
const valueColors = { addition: 'text-emerald-600', deduction: 'text-red-500', bonus: 'text-[#8B5CF6]' };
const prefixes = { addition: '+', deduction: '-', bonus: '+' };

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => (
  <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-white">Transaction History</h3>
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {transactions.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className="flex items-center gap-4 px-6 py-3.5">
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', colors[t.type])}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-white text-sm">{t.description}</p>
              <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
            </div>
            <p className={cn('font-bold text-sm shrink-0', valueColors[t.type])}>
              {prefixes[t.type]}{t.amount} credit{t.amount !== 1 ? 's' : ''}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);
