import { useState, useRef } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface OTPStepProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export const OTPStep = ({ email, onVerify, onResend }: OTPStepProps) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);

  const focusFirst = () => setTimeout(() => refs.current[0]?.focus(), 50);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    setError('');
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== '')) {
      setTimeout(() => submitOTP(next.join('')), 80);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'Enter' && digits.every((d) => d !== '')) {
      submitOTP(digits.join(''));
    }
  };

  // Handle paste: grab first 6 digits from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''].map((_, i) => pasted[i] ?? '');
    setDigits(next);
    setError('');
    const lastFilled = Math.min(pasted.length, 5);
    refs.current[lastFilled]?.focus();
    if (pasted.length === 6) {
      setTimeout(() => submitOTP(pasted), 80);
    }
  };

  const submitOTP = async (otp: string) => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await onVerify(otp);
      // If onVerify throws or shows a toast error, reset digits so user can retry
    } catch {
      // error handled via toast in parent
    } finally {
      setLoading(false);
      // Reset digits so user can re-enter if auth fails
      setDigits(['', '', '', '', '', '']);
      focusFirst();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    await onResend();
    setDigits(['', '', '', '', '', '']);
    focusFirst();
    setResending(false);
  };

  const allFilled = digits.every((d) => d !== '');

  return (
    <div className="space-y-5">
      {/* Digit inputs */}
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            className="w-12 h-12 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-[#A3C9A8] focus:ring-2 focus:ring-[#A3C9A8]/30 transition-colors caret-transparent"
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-xs text-red-500">{error}</p>
      )}

      <button
        onClick={() => submitOTP(digits.join(''))}
        disabled={!allFilled || loading}
        className="w-full flex items-center justify-center gap-2 bg-[#A3C9A8] hover:bg-[#8ab89f] disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-semibold py-3 rounded-xl transition-all hover:shadow-md text-sm"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Code'}
      </button>

      <div className="text-center space-y-2">
        <p className="text-xs text-slate-400">
          Did not get the code?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-[#2d6a4f] font-semibold hover:underline disabled:opacity-50 transition-colors"
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        </p>
        <p className="text-xs text-slate-400">
          You can also paste the code directly into the boxes.
        </p>
      </div>
    </div>
  );
};
