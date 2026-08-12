import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

export const LandingNav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Sourcingly" className="w-8 h-8 rounded-xl object-contain" />
          <span className="font-bold text-slate-800 text-lg">Sourcingly</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
          <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors">
            Sign In
          </button>
          <button onClick={() => navigate('/auth')} className="text-sm font-semibold bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 px-5 py-2 rounded-xl transition-all hover:shadow-md">
            Get Started Free
          </button>
        </div>

        <button className="md:hidden p-2 rounded-lg text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-slate-600 py-2">Features</a>
          <Link to="/pricing" className="block text-sm font-medium text-slate-600 py-2">Pricing</Link>
          <a href="#how-it-works" className="block text-sm font-medium text-slate-600 py-2">How It Works</a>
          <button onClick={() => navigate('/auth')} className="w-full text-sm font-semibold bg-[#A3C9A8] text-slate-800 px-5 py-2.5 rounded-xl mt-2">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
};
