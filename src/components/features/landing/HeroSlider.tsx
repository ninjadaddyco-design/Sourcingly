import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import hero1 from '@/assets/hero-1.jpg';
import hero2 from '@/assets/hero-2.jpg';
import hero3 from '@/assets/hero-3.jpg';

const SLIDES = [
  {
    image: hero1,
    tag: 'AI-Powered Scanning',
    title: 'Scan Any Product. Source Globally.',
    subtitle: 'Upload a product photo and instantly discover the best global suppliers, competitive pricing, and maximum-margin data in seconds.',
    cta: 'Start Scanning Free',
  },
  {
    image: hero2,
    tag: 'Supplier Matching',
    title: 'Connect With Verified Global Suppliers.',
    subtitle: 'Our AI matches your product scan with the most reliable, highest-rated suppliers from our worldwide network — ranked by price, quality, and speed.',
    cta: 'View Supplier Network',
  },
  {
    image: hero3,
    tag: 'Seamless Integration',
    title: 'Built for Shopify Dropshippers.',
    subtitle: 'Sourcingly fits natively into your Shopify workflow. Scan, source, price, and list winning products — all from one intelligent platform.',
    cta: 'Connect Your Store',
  },
];

export const HeroSlider = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[88vh] min-h-[620px] overflow-hidden">
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={cn('absolute inset-0 transition-opacity duration-1000', i === current ? 'opacity-100' : 'opacity-0')}
          style={{ backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <span className="inline-block px-3 py-1 bg-[#A3C9A8]/30 backdrop-blur-sm border border-[#A3C9A8]/50 text-[#c8e6c9] text-xs font-semibold rounded-full mb-5 tracking-wide uppercase">
          {slide.tag}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">{slide.title}</h1>
        <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl leading-relaxed">{slide.subtitle}</p>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/auth')} className="flex items-center gap-2 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold px-7 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-[#A3C9A8]/30 text-sm">
            {slide.cta}
            <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-white/80 hover:text-white px-4 py-3 rounded-xl border border-white/25 hover:border-white/50 backdrop-blur-sm transition-all">
            Sign In
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={cn('rounded-full transition-all duration-300', i === current ? 'w-6 h-2 bg-[#A3C9A8]' : 'w-2 h-2 bg-white/40 hover:bg-white/70')} />
        ))}
      </div>

      <button onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => setCurrent((c) => (c + 1) % SLIDES.length)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
        <ChevronRight size={20} />
      </button>
    </section>
  );
};
