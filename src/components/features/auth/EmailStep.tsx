import { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

interface EmailStepProps {
  mode: 'signin' | 'signup';
  onSend: (email: string) => Promise<void>;
}

export const EmailStep = ({ mode, onSend }: EmailStepProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    await onSend(email);
    setLoading(false);
  };

  return (
    <form onSubmit={handle} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A3C9A8]/50 focus:border-[#A3C9A8] transition-colors text-sm"
            autoFocus
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full flex items-center justify-center gap-2 bg-[#A3C9A8] hover:bg-[#8ab89f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-semibold py-3 rounded-xl transition-all hover:shadow-md text-sm"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{mode === 'signin' ? 'Send Sign-In Code' : 'Send Verification Code'}</span><ArrowRight size={16} /></>}
      </button>
      <p className="text-xs text-center text-slate-500">A 6-digit code will be sent to your email address.</p>
    </form>
  );
};
