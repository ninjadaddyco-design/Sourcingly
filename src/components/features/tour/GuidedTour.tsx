import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  targetId: string | null;
  position: 'right' | 'top-left' | 'center';
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to Sourcingly',
    description: 'Setup complete. Let us take a quick tour of the key features to get you sourcing winning products right away.',
    targetId: null,
    position: 'center',
  },
  {
    title: 'Product Scanner',
    description: 'Upload any product photo to instantly discover verified global suppliers, see competitor pricing, and get your ideal profit margin.',
    targetId: 'nav-scanner',
    position: 'right',
  },
  {
    title: 'Credit Wallet',
    description: 'Every product scan uses one credit. Track your monthly usage, view your full transaction history, and upgrade your plan here.',
    targetId: 'nav-wallet',
    position: 'right',
  },
  {
    title: 'AI Assistant',
    description: 'Your personal dropshipping guide is always available here. Ask anything — products, suppliers, pricing strategies, or platform help.',
    targetId: 'ai-chat-btn',
    position: 'top-left',
  },
  {
    title: 'Product Library',
    description: 'Every scan you run is saved here automatically. Filter by category, margin, and mark favorites for fast access later.',
    targetId: 'nav-library',
    position: 'right',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
}

interface GuidedTourProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const GuidedTour = ({ isVisible, onComplete, onSkip }: GuidedTourProps) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isCenter = current.position === 'center' || !current.targetId;

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      return;
    }
    setRect(null);
    if (!current.targetId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(current.targetId!);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height, right: r.right });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [step, isVisible, current.targetId]);

  if (!isVisible) return null;

  const handleNext = () => { if (isLast) onComplete(); else setStep((s) => s + 1); };
  const handlePrev = () => setStep((s) => s - 1);

  const getTooltipStyle = (): React.CSSProperties => {
    if (isCenter || !rect) return {};
    const pad = 20;
    if (current.position === 'right') {
      return {
        position: 'fixed',
        top: Math.max(16, rect.top + rect.height / 2 - 110),
        left: rect.left + rect.width + pad,
        zIndex: 10002,
      };
    }
    if (current.position === 'top-left') {
      return {
        position: 'fixed',
        bottom: window.innerHeight - rect.top + pad,
        right: Math.max(16, window.innerWidth - rect.right),
        zIndex: 10002,
      };
    }
    return {};
  };

  const tooltipContent = (
    <>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 bg-[#A3C9A8]' : i < step ? 'w-2.5 bg-[#A3C9A8]/50' : 'w-2.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400">Step {step + 1} of {STEPS.length}</p>
        </div>
        <button
          onClick={onSkip}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">{current.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{current.description}</p>

      <div className="flex items-center justify-between">
        {!isFirst ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        ) : (
          <button onClick={onSkip} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Skip tour
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold rounded-xl text-sm transition-all"
        >
          {isLast ? 'Done' : 'Next'}
          {!isLast && <ArrowRight size={14} />}
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0" style={{ zIndex: 10000, pointerEvents: 'all' }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Spotlight cutout via box-shadow */}
      {rect && !isCenter && (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.70)',
            borderRadius: 14,
            border: '2px solid rgba(163,201,168,0.75)',
            pointerEvents: 'none',
            zIndex: 10001,
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Tooltip */}
      {isCenter ? (
        <div className="absolute inset-0 flex items-center justify-center p-4" style={{ zIndex: 10002 }}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            {tooltipContent}
          </div>
        </div>
      ) : (
        <div
          className="w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800"
          style={getTooltipStyle()}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
