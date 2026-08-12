import { LandingNav } from '@/components/features/landing/LandingNav';
import { HeroSlider } from '@/components/features/landing/HeroSlider';
import { FeaturesSection } from '@/components/features/landing/FeaturesSection';
import { PricingSection } from '@/components/features/landing/PricingSection';
import { FooterSection } from '@/components/features/landing/FooterSection';
import { MarqueeSection } from '@/components/features/landing/MarqueeSection';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, Zap, ArrowRight } from 'lucide-react';

const HOW_IT_WORKS = [
  { step: '01', icon: ScanSearch, title: 'Scan a Product', desc: 'Upload any product photo from your phone, a competitor site, or an inspiration image.' },
  { step: '02', icon: Zap, title: 'Get Market Intelligence', desc: 'AI instantly returns matched suppliers, competitor pricing, and your recommended retail price.' },
  { step: '03', icon: ArrowRight, title: 'List and Profit', desc: 'Copy the SEO description, set your price, and add the product to your Shopify store.' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <LandingNav />
      <HeroSlider />
      <MarqueeSection />

      <FeaturesSection />

      <section id="how-it-works" className="py-24 bg-[#F9F9F6]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Source a Winning Product in 3 Steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A3C9A8]/20 to-[#8B5CF6]/20 border border-[#A3C9A8]/30 flex items-center justify-center">
                    <Icon size={24} className="text-[#A3C9A8]" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#8B5CF6] rounded-full text-white text-xs font-bold flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Sourcing Smarter Today</h2>
          <p className="text-slate-400 mb-8">Join thousands of Shopify dropshippers using Sourcingly to find winning products faster.</p>
          <button onClick={() => navigate('/auth')} className="flex items-center gap-2 mx-auto bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-[#A3C9A8]/20 text-sm">
            Get Started Free <ArrowRight size={16} />
          </button>
          <p className="text-xs text-slate-500 mt-3">No credit card required. 10 free scans included.</p>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Index;
