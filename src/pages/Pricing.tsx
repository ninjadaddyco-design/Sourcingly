import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Mail, Loader2, Star } from 'lucide-react';
import { LandingNav } from '@/components/features/landing/LandingNav';
import { FooterSection } from '@/components/features/landing/FooterSection';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    credits: 10,
    color: 'slate',
    description: 'Perfect for exploring the platform and testing your first products.',
    features: [
      '10 product scans/month',
      'Basic supplier matching',
      'Market price estimates',
      'Email support',
      'Product library (up to 10)',
    ],
    missing: ['Competitor analytics', 'SEO generator', 'Custom tags'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 19,
    credits: 100,
    color: 'green',
    description: 'For serious dropshippers ready to scale their product research.',
    features: [
      '100 product scans/month',
      'Advanced supplier matching',
      'Competitor price analytics',
      'SEO description generator',
      'Product library (unlimited)',
      'Custom product tags',
      'CSV bulk export',
      'Priority support',
    ],
    missing: [],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    credits: 500,
    color: 'purple',
    description: 'Maximum power for high-volume stores and agency-level sourcing.',
    features: [
      '500 product scans/month',
      'Premium global supplier network',
      'Real-time price tracking',
      'SEO description generator',
      'Product library (unlimited)',
      'Custom product tags',
      'CSV bulk export',
      'Dedicated AI assistant',
    ],
    missing: [],
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    credits: 2000,
    color: 'amber',
    description: 'Built for agencies and high-growth brands managing multiple stores.',
    features: [
      '2,000 product scans/month',
      'Premium global supplier network',
      'Real-time price tracking',
      'SEO description generator',
      'Product library (unlimited)',
      'Custom product tags',
      'CSV bulk export',
      '24/7 dedicated support',
    ],
    missing: [],
  },
];

const COMPARISON_ROWS = [
  { label: 'Monthly Scans', values: ['10', '100', '500', '2,000'] },
  { label: 'AI Product Analysis', values: [true, true, true, true] },
  { label: 'Supplier Matching', values: ['Basic', 'Advanced', 'Premium', 'Premium+'] },
  { label: 'Competitor Pricing', values: [false, true, true, true] },
  { label: 'SEO Generator', values: [false, true, true, true] },
  { label: 'Product Library', values: ['10 items', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { label: 'Custom Tags', values: [false, true, true, true] },
  { label: 'CSV Export', values: [false, true, true, true] },
  { label: 'AI Chat Assistant', values: [false, true, true, true] },
  { label: 'Real-time Tracking', values: [false, false, true, true] },
  { label: 'Support Level', values: ['Email', 'Priority', 'Dedicated AI', '24/7 Dedicated'] },
];

const colorMap: Record<string, { button: string; highlight: string; badge: string; border: string }> = {
  slate: {
    button: 'bg-slate-800 hover:bg-slate-700 text-white',
    highlight: 'text-slate-800',
    badge: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
  },
  green: {
    button: 'bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800',
    highlight: 'text-[#2d6a4f]',
    badge: 'bg-[#A3C9A8]/20 text-[#2d6a4f]',
    border: 'border-[#A3C9A8]/50',
  },
  purple: {
    button: 'bg-[#8B5CF6] hover:bg-[#7c3aed] text-white',
    highlight: 'text-[#8B5CF6]',
    badge: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    border: 'border-[#8B5CF6]',
  },
  amber: {
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    highlight: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    border: 'border-amber-300',
  },
};

interface WaitlistModalProps {
  plan: (typeof PLANS)[0];
  onClose: () => void;
}

const WaitlistModal = ({ plan, onClose }: WaitlistModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const colors = colorMap[plan.color];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { toast.error('Enter a valid email.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    toast.success('You are on the waitlist!', { description: `We will email ${email} when ${plan.name} launches.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-8" onClick={(e) => e.stopPropagation()}>
        {!done ? (
          <>
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5', colors.badge)}>
              <Zap size={11} /> {plan.name} Plan — ${plan.price}/mo
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Join the waitlist</h2>
            <p className="text-sm text-slate-500 mb-6">
              Paid plans are coming soon. Join and get <span className="font-semibold text-slate-700">early-bird pricing + 50 bonus credits</span> at launch.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40 text-sm"
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading || !email} className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50', colors.button)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Mail size={15} /> Notify Me at Launch</>}
              </button>
            </form>
            <button onClick={onClose} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1">Maybe later</button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#A3C9A8]/20 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#A3C9A8]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">You are on the list</h2>
            <p className="text-sm text-slate-500 mb-6">We will email <span className="font-semibold text-slate-700">{email}</span> when {plan.name} is available.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable plan card — used in both mobile scroll and desktop grid
const PlanCard = ({
  plan,
  onCta,
  compact = false,
}: {
  plan: (typeof PLANS)[0];
  onCta: () => void;
  compact?: boolean;
}) => {
  const colors = colorMap[plan.color];
  const isPro = plan.id === 'pro';

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border transition-all h-full',
        compact ? 'p-5' : 'p-6',
        isPro
          ? 'border-[#8B5CF6] bg-white shadow-xl shadow-[#8B5CF6]/10'
          : 'border-slate-200 bg-white shadow-sm hover:shadow-md',
        !compact && isPro ? 'scale-105' : '',
      )}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
          ★ Most Popular
        </div>
      )}

      <p className={cn('font-bold text-slate-800 mb-1', compact ? 'text-sm mt-1' : 'text-base')}>{plan.name}</p>
      <div className="flex items-end gap-1 mb-1">
        <span className={cn('font-extrabold', colors.highlight, compact ? 'text-3xl' : 'text-4xl')}>${plan.price}</span>
        {plan.price > 0 && <span className="text-slate-400 text-sm mb-1">/mo</span>}
      </div>
      <p className="text-xs text-slate-500 mb-1">{plan.credits.toLocaleString()} scan credits/month</p>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{plan.description}</p>

      <ul className="space-y-2.5 mb-5 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
            <Check size={12} className={cn('mt-0.5 shrink-0', colors.highlight)} />
            {f}
          </li>
        ))}
        {!compact && plan.missing.map((f, i) => (
          <li key={`m${i}`} className="flex items-start gap-2 text-xs text-slate-300">
            <X size={12} className="mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={cn('w-full rounded-xl font-semibold text-sm transition-all hover:shadow-md', compact ? 'py-2' : 'py-2.5', colors.button)}
      >
        {plan.price === 0 ? 'Start Free' : 'Join Waitlist'}
      </button>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const [waitlistPlan, setWaitlistPlan] = useState<(typeof PLANS)[0] | null>(null);

  const handleCta = (plan: (typeof PLANS)[0]) => {
    if (plan.price === 0) navigate('/auth');
    else setWaitlistPlan(plan);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-14 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-full text-xs font-semibold text-[#8B5CF6] mb-5">
          <Zap size={11} /> Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
          Pricing built for<br />
          <span className="text-[#8B5CF6]">dropshipping scale</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-4">
          Start free, upgrade when you grow. No contracts, no hidden fees. Use gift cards to add credits at any time.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-400">
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" className="text-amber-400" />)}
          <span className="ml-1">Trusted by 2,000+ Shopify dropshippers</span>
        </div>
      </section>

      {/* Plan Cards — Mobile: horizontal scroll / Desktop: 4-column grid */}
      <section className="pb-16">

        {/* ── Mobile horizontal scroll ── */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {PLANS.map((plan) => (
            <div key={plan.id} className="snap-start shrink-0 w-[272px] flex flex-col">
              <PlanCard plan={plan} onCta={() => handleCta(plan)} compact />
            </div>
          ))}
          {/* Trailing spacer so last card doesn't press edge */}
          <div className="shrink-0 w-4" />
        </div>
        <p className="md:hidden text-center text-xs text-slate-400 mt-0.5 mb-2">
          Swipe left to see all plans
        </p>

        {/* ── Desktop 4-column grid ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-5 max-w-6xl mx-auto px-6">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onCta={() => handleCta(plan)} />
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 px-4">
          All paid plans coming soon · Use gift cards to add credits now · No credit card required for Starter
        </p>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Full Feature Comparison</h2>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-5 border-b border-slate-100">
            <div className="p-4 text-sm font-semibold text-slate-500">Feature</div>
            {PLANS.map((p) => (
              <div key={p.id} className={cn('p-4 text-center text-sm font-bold', p.id === 'pro' ? 'bg-[#8B5CF6]/5 text-[#8B5CF6]' : 'text-slate-700')}>
                {p.name}
                {p.id === 'pro' && <div className="text-[10px] font-normal text-[#8B5CF6]/70 mt-0.5">Recommended</div>}
              </div>
            ))}
          </div>
          {COMPARISON_ROWS.map((row, ri) => (
            <div key={row.label} className={cn('grid grid-cols-5 border-b border-slate-50', ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
              <div className="p-4 text-sm text-slate-600 font-medium">{row.label}</div>
              {row.values.map((val, vi) => (
                <div key={vi} className={cn('p-4 text-center', PLANS[vi].id === 'pro' ? 'bg-[#8B5CF6]/[0.03]' : '')}>
                  {typeof val === 'boolean' ? (
                    val ? <Check size={16} className="text-[#A3C9A8] mx-auto" /> : <X size={16} className="text-slate-200 mx-auto" />
                  ) : (
                    <span className="text-xs font-medium text-slate-600">{val}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="grid grid-cols-5 bg-slate-50/50 p-4 gap-3">
            <div />
            {PLANS.map((plan) => (
              <div key={plan.id} className="text-center">
                <button
                  onClick={() => handleCta(plan)}
                  className={cn('px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:shadow-md w-full', colorMap[plan.color].button)}
                >
                  {plan.price === 0 ? 'Start Free' : 'Join Waitlist'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile comparison: simple card list */}
        <div className="md:hidden space-y-3">
          {COMPARISON_ROWS.map((row) => (
            <div key={row.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">{row.label}</p>
              <div className="grid grid-cols-4 gap-2">
                {PLANS.map((plan, vi) => (
                  <div key={plan.id} className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">{plan.name}</p>
                    {typeof row.values[vi] === 'boolean' ? (
                      row.values[vi]
                        ? <Check size={13} className="text-[#A3C9A8] mx-auto" />
                        : <X size={13} className="text-slate-200 mx-auto" />
                    ) : (
                      <span className="text-[10px] font-medium text-slate-600">{row.values[vi]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ strip */}
      <section className="bg-white border-t border-slate-100 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Have questions?</h2>
          <p className="text-sm text-slate-500 mb-5">
            Use gift cards to add credits to your Starter account right now while paid plans are in development.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => navigate('/auth')} className="px-5 py-2.5 rounded-xl bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold text-sm transition-all hover:shadow-md">
              Get Started Free
            </button>
            <button onClick={() => navigate('/wallet')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">
              Redeem Gift Card
            </button>
          </div>
        </div>
      </section>

      <FooterSection />

      {waitlistPlan && <WaitlistModal plan={waitlistPlan} onClose={() => setWaitlistPlan(null)} />}
    </div>
  );
};

export default Pricing;
