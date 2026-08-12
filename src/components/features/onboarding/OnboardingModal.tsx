import { useState } from 'react';
import { User, Tag, Target, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NICHES, MONTHLY_GOALS } from '@/constants';
import type { OnboardingState, ExperienceLevel } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { experience: ExperienceLevel; niche: string; monthlyGoal: string }) => void;
}

const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner', desc: 'Just getting started' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Growing my store' },
  { value: 'advanced', label: 'Advanced', desc: 'Scaling my business' },
];

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const [state, setState] = useState<OnboardingState>({ step: 1, experience: '', niche: '', monthlyGoal: '' });

  if (!isOpen) return null;

  const next = () => setState((s) => ({ ...s, step: (s.step < 3 ? s.step + 1 : s.step) as 1 | 2 | 3 }));
  const prev = () => setState((s) => ({ ...s, step: (s.step > 1 ? s.step - 1 : s.step) as 1 | 2 | 3 }));

  const finish = () => {
    if (state.experience && state.niche && state.monthlyGoal) {
      onComplete({ experience: state.experience as ExperienceLevel, niche: state.niche, monthlyGoal: state.monthlyGoal });
    }
  };

  const stepValid = (state.step === 1 && state.experience) || (state.step === 2 && state.niche) || (state.step === 3 && state.monthlyGoal);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn('flex-1 h-1.5 rounded-full transition-all', s <= state.step ? 'bg-[#A3C9A8]' : 'bg-slate-200 dark:bg-slate-700')} />
          ))}
        </div>

        {state.step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-1"><User size={18} className="text-[#A3C9A8]" /><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Step 1 of 3</span></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">What is your experience level?</h2>
            <p className="text-sm text-slate-500 mb-6">This helps us personalize your Sourcingly experience.</p>
            <div className="space-y-3">
              {EXPERIENCE.map(({ value, label, desc }) => (
                <button key={value} onClick={() => setState((s) => ({ ...s, experience: value as ExperienceLevel }))}
                  className={cn('w-full p-4 rounded-xl border-2 text-left transition-all', state.experience === value ? 'border-[#A3C9A8] bg-[#A3C9A8]/10' : 'border-slate-200 dark:border-slate-700 hover:border-[#A3C9A8]/50')}>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Tag size={18} className="text-[#A3C9A8]" /><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Step 2 of 3</span></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">What is your primary niche?</h2>
            <p className="text-sm text-slate-500 mb-5">Select the product category you focus on.</p>
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
              {NICHES.map((n) => (
                <button key={n} onClick={() => setState((s) => ({ ...s, niche: n }))}
                  className={cn('px-3 py-1.5 rounded-xl text-sm font-medium border transition-all', state.niche === n ? 'bg-[#A3C9A8] border-[#A3C9A8] text-slate-800' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#A3C9A8]/50')}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-1"><Target size={18} className="text-[#A3C9A8]" /><span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Step 3 of 3</span></div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">What is your monthly revenue goal?</h2>
            <p className="text-sm text-slate-500 mb-5">This helps us show the right insights for your business stage.</p>
            <div className="space-y-2.5">
              {MONTHLY_GOALS.map(({ value, label }) => (
                <button key={value} onClick={() => setState((s) => ({ ...s, monthlyGoal: value }))}
                  className={cn('w-full p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all', state.monthlyGoal === value ? 'border-[#A3C9A8] bg-[#A3C9A8]/10 text-[#2d6a4f]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#A3C9A8]/50')}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-7">
          {state.step > 1 ? (
            <button onClick={prev} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl transition-colors">Back</button>
          ) : <div />}
          {state.step < 3 ? (
            <button onClick={next} disabled={!stepValid} className="flex items-center gap-2 px-6 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-semibold rounded-xl text-sm transition-all">
              Continue
            </button>
          ) : (
            <button onClick={finish} disabled={!stepValid} className="flex items-center gap-2 px-6 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 font-semibold rounded-xl text-sm transition-all">
              <CheckCircle size={16} /> Finish Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
