import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailStep } from '@/components/features/auth/EmailStep';
import { OTPStep } from '@/components/features/auth/OTPStep';
import { setStoredUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getOrCreateProfile } from '@/lib/database';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

type Step = 'email' | 'otp';
type Mode = 'signin' | 'signup';

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendOTP = async (emailVal: string) => {
    if (sending) return;
    setSending(true);
    try {
      // Always allow user creation — Supabase deduplicates by email automatically.
      // shouldCreateUser: true means existing users still get a new OTP, no duplicates created.
      const { error } = await supabase.auth.signInWithOtp({
        email: emailVal,
        options: { shouldCreateUser: true },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('rate') || msg.includes('limit')) {
          toast.error('Too many requests', { description: 'Please wait a minute before requesting another code.' });
        } else if (msg.includes('fetch') || msg.includes('network')) {
          toast.error('Network error', { description: 'Check your internet connection and try again.' });
        } else {
          toast.error('Failed to send code', { description: error.message });
        }
        return;
      }

      setEmail(emailVal);
      setIsNewUser(mode === 'signup');
      setStep('otp');
      toast.success('Code sent!', {
        description: `Check your inbox for the 6-digit code we sent to ${emailVal}.`,
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    // Try 'email' type first (standard OTP), then 'signup' as fallback
    let userData = null;
    let lastError = '';

    for (const tokenType of ['email', 'signup'] as const) {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: tokenType,
      });
      if (!error && data.user) {
        userData = data.user;
        break;
      }
      lastError = error?.message ?? 'Verification failed';
    }

    if (!userData) {
      const msg = lastError.toLowerCase();
      toast.error('Incorrect code', {
        description: msg.includes('expired')
          ? 'That code has expired. Click Resend to get a fresh one.'
          : 'The code is wrong or expired. Enter the 6-digit number from your email.',
      });
      return;
    }

    const rawName = (userData.email ?? email).split('@')[0].replace(/[._-]/g, ' ');
    const defaultName = rawName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const profile = await getOrCreateProfile(userData.id, userData.email ?? email, defaultName);
    if (!profile) {
      toast.error('Account error', { description: 'Could not load your profile. Please try again.' });
      return;
    }

    setStoredUser(profile);
    toast.success(isNewUser ? 'Account created! Welcome to Sourcingly.' : 'Signed in successfully.');
    navigate('/dashboard');
  };

  const handleResend = async () => {
    await handleSendOTP(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F6] via-[#e8f5e9]/30 to-[#ede9fe]/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <img src={logo} alt="Sourcingly" className="w-8 h-8 rounded-xl object-contain" />
            <span className="font-bold text-slate-800 text-lg">Sourcingly</span>
          </div>

          {step === 'email' && (
            <>
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                {(['signup', 'signin'] as Mode[]).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      mode === m ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}>
                    {m === 'signup' ? 'Create Account' : 'Sign In'}
                  </button>
                ))}
              </div>
              <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800 mb-1">
                  {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-sm text-slate-500">
                  {mode === 'signup'
                    ? 'Enter your email — we will send a 6-digit code to verify.'
                    : 'Enter your email to receive a 6-digit sign-in code.'}
                </p>
              </div>
              <EmailStep mode={mode} onSend={handleSendOTP} />
            </>
          )}

          {step === 'otp' && (
            <>
              <button onClick={() => setStep('email')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-5 transition-colors">
                <ArrowLeft size={13} /> Change email
              </button>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800 mb-1">Enter your code</h1>
                <p className="text-sm text-slate-500">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-slate-700">{email}</span>.
                  Enter the number from your email below.
                </p>
              </div>

              <OTPStep email={email} onVerify={handleVerifyOTP} onResend={handleResend} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
