import { Star, Clock, Package } from 'lucide-react';
import type { Supplier } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SupplierCardProps {
  supplier: Supplier;
  rank: number;
}

export const SupplierCard = ({ supplier, rank }: SupplierCardProps) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#A3C9A8]/40 transition-colors">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A3C9A8]/20 to-[#8B5CF6]/20 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">{supplier.name}</p>
        <span className="text-xs text-slate-500 shrink-0">{supplier.country}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" />{supplier.rating} ({supplier.reviewCount.toLocaleString()})</div>
        <div className="flex items-center gap-1"><Clock size={11} />{supplier.leadTime}</div>
        <div className="flex items-center gap-1"><Package size={11} />MOQ {supplier.moq}</div>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="font-bold text-[#A3C9A8] text-base">{formatCurrency(supplier.price)}</p>
      <p className="text-xs text-slate-500">per unit</p>
    </div>
  </div>
);
