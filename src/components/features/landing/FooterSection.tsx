import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const FooterSection = () => (
  <footer className="bg-slate-900 text-slate-400 py-12">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img src={logo} alt="Sourcingly" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-white text-base">Sourcingly</span>
          </div>
          <p className="text-sm leading-relaxed">AI-powered product sourcing for Shopify dropshippers worldwide.</p>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Product</p>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Company</p>
          <ul className="space-y-2 text-sm">
            {['About', 'Blog', 'Careers', 'Press'].map((l) => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm mb-3">Support</p>
          <ul className="space-y-2 text-sm">
            {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((l) => (
              <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p>© 2026 Sourcingly, Inc. All rights reserved.</p>
        <p>Built for Shopify dropshippers worldwide</p>
      </div>
    </div>
  </footer>
);
