import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PLAN_TIERS } from '@/constants';
import { cn } from '@/lib/utils';

export const PricingSection = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 bg-white/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">Simple Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Plans That Grow With You</h2>
          <p className="text-slate-600">Start free. Upgrade as your store scales.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative p-7 rounded-2xl border transition-all duration-200',
                tier.highlighted
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 shadow-xl shadow-slate-900/20 scale-[1.02]'
                  : 'bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm hover:shadow-md'
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#A3C9A8] text-slate-800 text-xs font-bold rounded-full">Most Popular</div>
              )}
              <p className={cn('text-sm font-semibold mb-1', tier.highlighted ? 'text-slate-400' : 'text-slate-500')}>{tier.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={cn('text-4xl font-bold', tier.highlighted ? 'text-white' : 'text-slate-800')}>${tier.price}</span>
                <span className={cn('text-sm mb-1', tier.highlighted ? 'text-slate-400' : 'text-slate-500')}>/mo</span>
              </div>
              <p className={cn('text-xs mb-6', tier.highlighted ? 'text-slate-400' : 'text-slate-500')}>{tier.monthlyCredits} scans per month</p>
              <ul className="space-y-2.5 mb-7">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={14} className={cn('mt-0.5 shrink-0', tier.highlighted ? 'text-[#A3C9A8]' : 'text-[#A3C9A8]')} />
                    <span className={cn('text-sm', tier.highlighted ? 'text-slate-300' : 'text-slate-600')}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth')}
                className={cn(
                  'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                  tier.highlighted
                    ? 'bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 hover:shadow-md'
                    : 'border border-slate-200 hover:border-[#A3C9A8] text-slate-700 hover:text-[#2d6a4f] hover:bg-[#A3C9A8]/5'
                )}
              >
                {tier.price === 0 ? 'Get Started Free' : `Start ${tier.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
