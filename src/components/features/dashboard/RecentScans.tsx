import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ScanResult } from '@/types';
import { formatRelativeDate, formatCurrency } from '@/lib/utils';

interface RecentScansProps {
  scans: ScanResult[];
}

export const RecentScans = ({ scans }: RecentScansProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white">Recent Scans</h3>
        <button onClick={() => navigate('/scanner')} className="flex items-center gap-1 text-xs font-medium text-[#A3C9A8] hover:text-[#6fa08a] transition-colors">
          New Scan <ArrowRight size={13} />
        </button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {scans.map((scan) => (
          <div key={scan.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <img src={scan.imageUrl} alt={scan.productName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{scan.productName}</p>
              <p className="text-xs text-slate-500">{scan.category} · {formatRelativeDate(scan.scannedAt)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-sm text-[#A3C9A8]">{formatCurrency(scan.recommendedPrice)}</p>
              <p className="text-xs text-emerald-600">{scan.marginPercent}% margin</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
