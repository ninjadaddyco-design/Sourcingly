import { Star } from 'lucide-react';

const BRANDS = [
  { name: 'Shopify', domain: 'shopify.com', color: '#95BF47', weight: 'font-semibold' },
  { name: 'amazon', domain: 'amazon.com', color: '#FF9900', weight: 'font-normal' },
  { name: 'eBay', domain: 'ebay.com', color: '#E53238', weight: 'font-bold' },
  { name: 'Google', domain: 'google.com', color: '#4285F4', weight: 'font-medium' },
  { name: 'AliExpress', domain: 'aliexpress.com', color: '#FF4747', weight: 'font-medium' },
  { name: 'DSers', domain: 'dsers.com', color: '#9B59B6', weight: 'font-semibold' },
  { name: 'Dropship', domain: 'dropship.io', color: '#2563EB', weight: 'font-semibold' },
  { name: 'TeemDrop', domain: 'teemdrop.com', color: '#6366F1', weight: 'font-bold' },
];

const StarCluster = () => (
  <div className="flex items-center gap-0.5 shrink-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
    ))}
  </div>
);

export const MarqueeSection = () => {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section className="py-10 bg-white border-y border-slate-100 overflow-hidden">
      <div className="text-center mb-6">
        <div className="flex justify-center gap-1 mb-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Trusted by dropshippers sourcing across
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex items-center gap-10"
          style={{ animation: 'marquee 32s linear infinite', width: 'max-content' }}
        >
          {doubled.map((brand, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0 select-none">
              <StarCluster />
              <img
                src={`https://logo.clearbit.com/${brand.domain}`}
                alt={brand.name}
                className="w-5 h-5 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span
                className={`text-base tracking-tight ${brand.weight}`}
                style={{ color: brand.color }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </section>
  );
};
