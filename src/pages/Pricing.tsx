import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, ArrowLeft, Mail, Loader2, Star } from 'lucide-react';
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
    badge: null,
    color: 'slate',
    description: 'Perfect for exploring the platform and testing your first products.',
    features: [
      '10 product scans/month',
      'Basic supplier matching',
      'Market price estimates',
      'Email support',
      'Product library (up to 10)',
      null,
      null,
      null,
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 19,
    credits: 100,
    badge: null,
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
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    credits: 500,
    badge: 'Most Popular',
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
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    credits: 2000,
    badge: null,
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
  { label: 'Real-time Price Tracking', values: [false, false, true, true] },
  { label: 'Support Level', values: ['Email', 'Priority', 'Dedicated AI', '24/7 Dedicated'] },
];

const colorMap: Record<string, { badge: string; button: string; ring: string; highlight: string }> = {
  slate: {
    badge: 'bg-slate-100 text-slate-600',
    button: 'bg-slate-800 hover:bg-slate-700 text-white',
    ring: 'ring-slate-300',
    highlight: 'text-slate-800',
  },
  green: {
    badge: 'bg-[#A3C9A8]/20 text-[#2d6a4f]',
    button: 'bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800',
    ring: 'ring-[#A3C9A8]',
    highlight: 'text-[#2d6a4f]',
  },
  purple: {
    badge: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    button: 'bg-[#8B5CF6] hover:bg-[#7c3aed] text-white',
    ring: 'ring-[#8B5CF6]',
    highlight: 'text-[#8B5CF6]',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    ring: 'ring-amber-400',
    highlight: 'text-amber-600',
  },
};

interface WaitlistModalProps {
  plan: typeof PLANS[0];
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
    // Simulate waitlist signup
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    toast.success('You are on the waitlist!', { description: `We will email ${email} when ${plan.name} launches.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5', colors.badge)}>
              <Zap size={11} /> {plan.name} Plan — ${plan.price}/mo
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Join the waitlist</h2>
            <p className="text-sm text-slate-500 mb-6">
              Paid plans are coming soon. Join the waitlist and get <span className="font-semibold text-slate-700 dark:text-slate-300">early-bird pricing + 50 bonus credits</span> when we launch.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/40 text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className={cn('w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed', colors.button)}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <><Mail size={15} /> Notify Me at Launch</>}
              </button>
            </form>
            <button onClick={onClose} className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors py-1">
              Maybe later
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-[#A3C9A8]/20 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#A3C9A8]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">You are on the list</h2>
            <p className="text-sm text-slate-500 mb-6">We will email <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> as soon as {plan.name} is available.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  const [waitlistPlan, setWaitlistPlan] = useState<typeof PLANS[0] | null>(null);

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

      {/* Plan Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const colors = colorMap[plan.color];
            const isPro = plan.id === 'pro';
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 transition-all',
                  isPro
                    ? 'border-[#8B5CF6] bg-white shadow-xl shadow-[#8B5CF6]/10 scale-105'
                    : 'border-slate-200 bg-white shadow-sm hover:shadow-md',
                )}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#8B5CF6] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md">
                    ★ Most Popular
                  </div>
                )}
                {plan.badge && !isPro && (
                  <div className={cn('inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 self-start', colors.badge)}>
                    {plan.badge}
                  </div>
                )}

                <p className="font-bold text-slate-800 text-base mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={cn('text-4xl font-extrabold', colors.highlight)}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && <span className="text-slate-400 text-sm mb-1">/mo</span>}
                </div>
                <p className="text-xs text-slate-500 mb-1">{plan.credits.toLocaleString()} scan credits/month</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{plan.description}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f, i) =>
                    f ? (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check size={13} className={cn('mt-0.5 shrink-0', colors.highlight)} />
                        {f}
                      </li>
                    ) : (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <X size={13} className="mt-0.5 shrink-0" />
                        <span>Not included</span>
                      </li>
                    )
                  )}
                </ul>

                {plan.price === 0 ? (
                  <button
                    onClick={() => navigate('/auth')}
                    className={cn('w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md', colors.button)}
                  >
                    Start Free
                  </button>
                ) : (
                  <button
                    onClick={() => setWaitlistPlan(plan)}
                    className={cn('w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-md', colors.button)}
                  >
                    Join Waitlist
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          All paid plans coming soon · Use gift cards to add credits now · No credit card required for Starter
        </p>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Full Feature Comparison</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 border-b border-slate-100">
            <div className="p-4 text-sm font-semibold text-slate-500">Feature</div>
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'p-4 text-center text-sm font-bold',
                  p.id === 'pro' ? 'bg-[#8B5CF6]/5 text-[#8B5CF6]' : 'text-slate-700',
                )}
              >
                {p.name}
                {p.id === 'pro' && <div className="text-[10px] font-normal text-[#8B5CF6]/70 mt-0.5">Recommended</div>}
              </div>
            ))}
          </div>

          {COMPARISON_ROWS.map((row, ri) => (
            <div
              key={row.label}
              className={cn(
                'grid grid-cols-5 border-b border-slate-50',
                ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
              )}
            >
              <div className="p-4 text-sm text-slate-600 font-medium">{row.label}</div>
              {row.values.map((val, vi) => (
                <div
                  key={vi}
                  className={cn(
                    'p-4 text-center',
                    PLANS[vi].id === 'pro' ? 'bg-[#8B5CF6]/3' : '',
                  )}
                >
                  {typeof val === 'boolean' ? (
                    val
                      ? <Check size={16} className="text-[#A3C9A8] mx-auto" />
                      : <X size={16} className="text-slate-200 mx-auto" />
                  ) : (
                    <span className="text-xs font-medium text-slate-600">{val}</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-5 bg-slate-50/50 p-4 gap-3">
            <div />
            {PLANS.map((plan) => {
              const colors = colorMap[plan.color];
              return (
                <div key={plan.id} className="text-center">
                  <button
                    onClick={() => plan.price === 0 ? navigate('/auth') : setWaitlistPlan(plan)}
                    className={cn('px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:shadow-md w-full', colors.button)}
                  >
                    {plan.price === 0 ? 'Start Free' : 'Join Waitlist'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="bg-white border-t border-slate-100 py-14 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Have questions?</h2>
          <p className="text-sm text-slate-500 mb-5">
            You can use gift cards to add credits to your Starter account right now while paid plans are in development.
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
