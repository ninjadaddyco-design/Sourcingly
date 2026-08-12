import { useState } from 'react';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { ImageUploader } from '@/components/features/scanner/ImageUploader';
import { MarketIntelligence } from '@/components/features/scanner/MarketIntelligence';
import { getStoredUser } from '@/lib/auth';
import { saveScanToDb, logCreditTransaction } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';
import type { ScanResult, Supplier } from '@/types';
import { toast } from 'sonner';

// Convert File to base64 string (without the data:... prefix)
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix: "data:image/jpeg;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Fallback mock suppliers when AI returns incomplete data
const FALLBACK_SUPPLIERS: Supplier[] = [
  { name: 'AliExpress', price: 8.99, rating: 4.6, minOrder: 1, shippingDays: 12, location: 'China' },
  { name: 'Alibaba', price: 5.50, rating: 4.3, minOrder: 10, shippingDays: 18, location: 'China' },
  { name: 'TeemDrop', price: 11.20, rating: 4.8, minOrder: 1, shippingDays: 7, location: 'USA' },
];

const Scanner = () => {
  const { credits, spendCredit } = useCredits();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStage, setScanStage] = useState<string>('Analyzing image');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [aiError, setAiError] = useState(false);
  const user = getStoredUser();

  const handleImageSelect = async (file: File) => {
    const ok = spendCredit();
    if (!ok) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setScanning(true);
    setResult(null);
    setAiError(false);

    const stages = [
      'Analyzing image with AI',
      'Identifying product',
      'Matching suppliers',
      'Calculating margins',
    ];
    let stageIdx = 0;
    setScanStage(stages[0]);
    const stageInterval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setScanStage(stages[stageIdx]);
    }, 1800);

    try {
      // Convert image to base64
      const imageBase64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      // Call the analyze-product Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-product', {
        body: { imageBase64, mimeType },
      });

      clearInterval(stageInterval);

      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try { const t = await error.context.text(); msg = t || msg; } catch { /* keep */ }
          try { const parsed = JSON.parse(msg); msg = parsed.error || msg; } catch { /* keep */ }
        }
        console.error('[Scanner] AI analysis error:', msg);
        setAiError(true);
        toast.error('AI analysis failed', { description: 'Using estimated data instead. Try again for real results.' });

        // Use fallback mock data
        const fallbackResult: ScanResult = {
          id: crypto.randomUUID(),
          imageUrl: url,
          productName: 'Unknown Product',
          category: 'Other',
          suppliers: FALLBACK_SUPPLIERS,
          avgCompetitorPrice: 29.99,
          recommendedPrice: 24.99,
          marginPercent: 45,
          seoDescription: 'Upload a clearer product image for AI-generated SEO description.',
          status: 'complete',
          scannedAt: new Date().toISOString(),
        };
        setResult(fallbackResult);
        await persistScan(fallbackResult);
        return;
      }

      const ai = data.result;

      // Map AI response to ScanResult shape
      const newResult: ScanResult = {
        id: crypto.randomUUID(),
        imageUrl: url,
        productName: ai.productName ?? 'Unknown Product',
        category: ai.category ?? 'Other',
        suppliers: Array.isArray(ai.suppliers) && ai.suppliers.length > 0
          ? ai.suppliers.map((s: Record<string, unknown>) => ({
              name: String(s.name ?? 'Supplier'),
              price: Number(s.price ?? 0),
              rating: Number(s.rating ?? 4.0),
              minOrder: Number(s.minOrder ?? 1),
              shippingDays: Number(s.shippingDays ?? 14),
              location: String(s.location ?? 'China'),
            }))
          : FALLBACK_SUPPLIERS,
        avgCompetitorPrice: Number(ai.avgCompetitorPrice ?? 0),
        recommendedPrice: Number(ai.recommendedSellingPrice ?? ai.recommendedPrice ?? 0),
        marginPercent: Number(ai.marginPercent ?? 0),
        seoDescription: String(ai.seoDescription ?? ''),
        status: 'complete',
        scannedAt: new Date().toISOString(),
      };

      setResult(newResult);
      await persistScan(newResult);

    } catch (err) {
      clearInterval(stageInterval);
      console.error('[Scanner] Unexpected error:', err);
      setAiError(true);
      toast.error('Scan failed', { description: 'An unexpected error occurred. Please try again.' });
      setScanning(false);
    }
  };

  const persistScan = async (scan: ScanResult) => {
    // Save to localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('sourcingly_scans') ?? '[]') as ScanResult[];
      localStorage.setItem('sourcingly_scans', JSON.stringify([scan, ...stored].slice(0, 50)));
    } catch {
      console.error('[Scanner] localStorage save failed');
    }

    // Save to Supabase
    if (user) {
      const savedId = await saveScanToDb(user.id, scan).catch(console.error);
      if (savedId) {
        await logCreditTransaction(
          user.id,
          'deduction',
          1,
          `Scan: ${scan.productName}`,
        ).catch(console.error);
        console.log('[Scanner] Scan saved to DB:', savedId);
      }
    }

    setScanning(false);
  };

  const handleReset = () => {
    setImageUrl(null);
    setResult(null);
    setScanning(false);
    setAiError(false);
  };

  return (
    <div className="min-h-screen">
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Product Scanner</h1>
            <p className="text-sm text-slate-500 mt-0.5">Upload a product image to get AI-powered supplier matching and market intelligence.</p>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-[#8B5CF6]/10 rounded-xl">
            <Zap size={14} className="text-[#8B5CF6]" />
            <span className="text-sm font-semibold text-[#8B5CF6]">{credits} credits</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        {!result && !scanning && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-4 bg-[#A3C9A8]/10 border border-[#A3C9A8]/20 rounded-xl flex items-start gap-3">
              <Zap size={16} className="text-[#A3C9A8] mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Each scan uses <span className="font-semibold text-[#A3C9A8]">1 credit</span>. You have{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{credits} credits</span> remaining on your{' '}
                <span className="capitalize font-semibold">{user?.plan}</span> plan.{' '}
                <span className="text-slate-400">AI-powered analysis via Gemini 2.5 Flash.</span>
              </p>
            </div>
            <ImageUploader onImageSelect={handleImageSelect} disabled={credits <= 0} />
          </div>
        )}

        {scanning && imageUrl && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl p-10 flex flex-col items-center gap-5">
              <img src={imageUrl} alt="Scanning" className="w-24 h-24 rounded-2xl object-cover shadow-md" />
              <div className="w-10 h-10 rounded-full border-4 border-[#A3C9A8] border-t-transparent animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-slate-800 dark:text-white">{scanStage}…</p>
                <p className="text-sm text-slate-500 mt-1">Real AI analysis powered by Gemini 2.5 Flash</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {['Gemini 2.5 Flash', 'Global Supplier DB', 'Price Intelligence'].map((t, i) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Loader2 size={11} className="animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {result && imageUrl && (
          <div>
            {aiError && (
              <div className="max-w-4xl mx-auto mb-4 flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <AlertTriangle size={15} className="shrink-0" />
                AI analysis encountered an issue — showing estimated data. Upload a clearer image for accurate results.
              </div>
            )}
            <MarketIntelligence result={result} imageUrl={imageUrl} onReset={handleReset} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
