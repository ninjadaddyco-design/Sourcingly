import { ScanSearch, Globe, TrendingUp, FileText, Zap, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: ScanSearch, title: 'AI Product Scanner', desc: 'Upload any product image and instantly receive supplier matches, market pricing, and margin analysis.', color: 'text-[#A3C9A8]', bg: 'bg-[#A3C9A8]/10' },
  { icon: Globe, title: 'Global Supplier Matching', desc: 'Automatically matched to 10,000+ verified suppliers across China, Europe, and North America.', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
  { icon: TrendingUp, title: 'Market Price Intelligence', desc: 'Real-time competitor pricing data with AI-calculated recommended retail prices for maximum margin.', color: 'text-[#A3C9A8]', bg: 'bg-[#A3C9A8]/10' },
  { icon: FileText, title: 'SEO Description Generator', desc: 'Auto-generate Shopify-optimized product descriptions packed with search-ranking keywords.', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
  { icon: Zap, title: 'Instant Scan Results', desc: 'From image upload to full market intelligence — results returned in under 3 seconds.', color: 'text-[#A3C9A8]', bg: 'bg-[#A3C9A8]/10' },
  { icon: ShieldCheck, title: 'Verified Supplier Network', desc: 'Every supplier is vetted for quality, communication speed, and shipping reliability before listing.', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
];

export const FeaturesSection = () => (
  <section id="features" className="py-24 bg-[#F9F9F6]">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 bg-[#A3C9A8]/15 text-[#2d6a4f] text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">Platform Features</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Everything You Need to Source Smarter</h2>
        <p className="text-slate-600 max-w-xl mx-auto">Sourcingly gives Shopify dropshippers a complete AI-powered toolkit to find, source, and price winning products.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="p-6 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
