import { useState } from 'react';
import { Copy, TrendingUp, Tag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ScanResult } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { SupplierCard } from './SupplierCard';

interface MarketIntelligenceProps {
  result: ScanResult;
  imageUrl: string;
  onReset: () => void;
}

export const MarketIntelligence = ({ result, imageUrl, onReset }: MarketIntelligenceProps) => {
  const [seoText, setSeoText] = useState(result.seoDescription);
  const [copied, setCopied] = useState(false);

  const copyDesc = () => {
    navigator.clipboard.writeText(seoText);
    setCopied(true);
    toast.success('Description copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt="Scanned product" className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{result.productName}</h2>
            <span className="inline-block px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium rounded-lg">{result.category}</span>
          </div>
        </div>
        <button onClick={onReset} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl transition-colors">
          Scan Another
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Avg. Competitor Price', value: formatCurrency(result.avgCompetitorPrice), icon: Tag, color: 'text-slate-600' },
          { label: 'Recommended Price', value: formatCurrency(result.recommendedPrice), icon: TrendingUp, color: 'text-[#A3C9A8]', highlight: true },
          { label: 'Est. Profit Margin', value: `${result.marginPercent}%`, icon: CheckCircle, color: 'text-[#8B5CF6]' },
        ].map(({ label, value, icon: Icon, color, highlight }) => (
          <div key={label} className={`p-5 rounded-2xl border ${highlight ? 'border-[#A3C9A8]/30 bg-[#A3C9A8]/5' : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${highlight ? 'text-[#2d6a4f] dark:text-[#A3C9A8]' : 'text-slate-800 dark:text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Matched Suppliers ({result.suppliers.length})</h3>
        <div className="space-y-2">
          {result.suppliers.map((s, i) => <SupplierCard key={s.id} supplier={s} rank={i + 1} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">SEO Product Description</h3>
          <button onClick={copyDesc} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
            <Copy size={12} /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <textarea
          value={seoText}
          onChange={(e) => setSeoText(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40 resize-none"
        />
      </div>
    </div>
  );
};
