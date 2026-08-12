import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Heart, Copy, Search, SlidersHorizontal, CheckCircle, Tag, TrendingUp,
  X, BookOpen, Filter, ArrowUpDown, Download, Check, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanResult } from '@/types';
import { MOCK_RECENT_SCANS } from '@/lib/mockData';
import { getStoredUser } from '@/lib/auth';
import { getScansFromDb, getTagsFromDb, addTagToDb, removeTagFromDb } from '@/lib/database';

// ─── Storage helpers ──────────────────────────────────────────────────────────
const SCANS_KEY = 'sourcingly_scans';
const FAVS_KEY = 'sourcingly_favorites';

const getLocalScans = (): ScanResult[] => {
  try {
    const stored: ScanResult[] = JSON.parse(localStorage.getItem(SCANS_KEY) ?? '[]');
    const storedIds = new Set(stored.map((s) => s.id));
    return [...stored, ...MOCK_RECENT_SCANS.filter((s) => !storedIds.has(s.id))];
  } catch { return MOCK_RECENT_SCANS; }
};

const getFavorites = (): string[] => {
  try { return JSON.parse(localStorage.getItem(FAVS_KEY) ?? '[]'); }
  catch { return []; }
};
const persistFavorites = (f: string[]) => localStorage.setItem(FAVS_KEY, JSON.stringify(f));

// ─── Constants ────────────────────────────────────────────────────────────────
type SortOption = 'newest' | 'oldest' | 'highest_margin' | 'lowest_margin' | 'lowest_supplier_price';

const MARGIN_RANGES = [
  { label: 'All Margins', min: 0, max: 100 },
  { label: 'Under 30%', min: 0, max: 30 },
  { label: '30 – 50%', min: 30, max: 50 },
  { label: '50 – 70%', min: 50, max: 70 },
  { label: 'Over 70%', min: 70, max: 100 },
];

const TAG_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
];

function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

function escapeCSV(v: string) {
  return `"${v.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Library = () => {
  const [allScans, setAllScans] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(getFavorites);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [marginRangeIdx, setMarginRangeIdx] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [addingTagId, setAddingTagId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Load from Supabase, fall back to localStorage
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const user = getStoredUser();
      if (user) {
        try {
          const [dbScans, dbTags] = await Promise.all([
            getScansFromDb(user.id),
            getTagsFromDb(user.id),
          ]);
          setTags(dbTags);
          if (dbScans.length > 0) {
            setAllScans(dbScans);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log('[Library] DB load failed, using localStorage:', err);
        }
      }
      setAllScans(getLocalScans());
      setIsLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => ['All Categories', ...Array.from(new Set(allScans.map((s) => s.category)))],
    [allScans],
  );

  const filteredAndSorted = useMemo(() => {
    const range = MARGIN_RANGES[marginRangeIdx];
    const filtered = allScans.filter((s) => {
      const q = search.toLowerCase();
      return (
        (!search || s.productName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) &&
        (!categoryFilter || categoryFilter === 'All Categories' || s.category === categoryFilter) &&
        s.marginPercent >= range.min && s.marginPercent <= range.max &&
        (!showFavOnly || favorites.includes(s.id))
      );
    });
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        case 'oldest': return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
        case 'highest_margin': return b.marginPercent - a.marginPercent;
        case 'lowest_margin': return a.marginPercent - b.marginPercent;
        case 'lowest_supplier_price': return (a.suppliers[0]?.price ?? 999) - (b.suppliers[0]?.price ?? 999);
        default: return 0;
      }
    });
  }, [allScans, search, categoryFilter, marginRangeIdx, showFavOnly, favorites, sortBy]);

  // ─── Favorites ──────────────────────────────────────────────────────────────
  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(updated);
    persistFavorites(updated);
  };

  // ─── SEO Copy ───────────────────────────────────────────────────────────────
  const copySEO = (scan: ScanResult) => {
    navigator.clipboard.writeText(scan.seoDescription);
    setCopiedId(scan.id);
    toast.success('SEO description copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Tags ───────────────────────────────────────────────────────────────────
  const handleAddTag = async (scanId: string, tag: string) => {
    const trimmed = tag.trim().toLowerCase().slice(0, 20);
    if (!trimmed) return;
    const existing = tags[scanId] ?? [];
    if (existing.includes(trimmed)) { setAddingTagId(null); setTagInput(''); return; }

    setTags((prev) => ({ ...prev, [scanId]: [...(prev[scanId] ?? []), trimmed] }));
    setAddingTagId(null);
    setTagInput('');

    const user = getStoredUser();
    if (user) addTagToDb(user.id, scanId, trimmed).catch(console.error);
  };

  const handleRemoveTag = async (scanId: string, tag: string) => {
    setTags((prev) => ({ ...prev, [scanId]: (prev[scanId] ?? []).filter((t) => t !== tag) }));
    const user = getStoredUser();
    if (user) removeTagFromDb(user.id, scanId, tag).catch(console.error);
  };

  // ─── Bulk ───────────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredAndSorted.map((s) => s.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const bulkCopySEO = () => {
    const selected = filteredAndSorted.filter((s) => selectedIds.has(s.id));
    const text = selected.map((s) => `=== ${s.productName} ===\n${s.seoDescription}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success(`Copied SEO descriptions for ${selected.length} product${selected.length !== 1 ? 's' : ''}`);
  };

  const exportCSV = () => {
    const selected = filteredAndSorted.filter((s) => selectedIds.has(s.id));
    if (selected.length === 0) { toast.error('Select at least one product to export'); return; }
    const headers = ['Product Name', 'Category', 'Margin %', 'Recommended Price ($)', 'Top Supplier', 'Supplier Price ($)', 'Tags', 'SEO Description', 'Scanned At'];
    const rows = selected.map((s) => {
      const top = s.suppliers[0];
      const productTags = (tags[s.id] ?? []).join('; ');
      return [
        escapeCSV(s.productName),
        escapeCSV(s.category),
        s.marginPercent,
        s.recommendedPrice.toFixed(2),
        escapeCSV(top?.name ?? ''),
        top?.price?.toFixed(2) ?? '',
        escapeCSV(productTags),
        escapeCSV(s.seoDescription),
        escapeCSV(new Date(s.scannedAt).toLocaleDateString()),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sourcingly-products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selected.length} product${selected.length !== 1 ? 's' : ''} as CSV`);
  };

  const hasFilters = !!search || (!!categoryFilter && categoryFilter !== 'All Categories') || marginRangeIdx > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-[#A3C9A8] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading your product library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Product Library</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {allScans.length} saved · {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setBulkMode((b) => !b); clearSelection(); }}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                bulkMode
                  ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#8B5CF6]/50')}>
              <Layers size={15} />
              {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
            </button>
            <button onClick={() => setShowFavOnly((f) => !f)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                showFavOnly
                  ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-300 hover:text-red-500')}>
              <Heart size={15} className={showFavOnly ? 'fill-current' : ''} />
              {showFavOnly ? 'Showing Favorites' : 'Favorites Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {bulkMode && (
        <div className="px-8 py-3 bg-[#8B5CF6]/5 border-b border-[#8B5CF6]/10 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-[#8B5CF6]">{selectedIds.size} selected</span>
          <button onClick={selectAll} className="text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 underline">
            Select all ({filteredAndSorted.length})
          </button>
          <button onClick={clearSelection} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={bulkCopySEO} disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 disabled:opacity-40 transition-colors">
              <Copy size={12} /> Copy SEO Descriptions
            </button>
            <button onClick={exportCSV} disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#A3C9A8] text-slate-800 hover:bg-[#8ab89f] disabled:opacity-40 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 px-4 py-3 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 flex-1 min-w-36">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none" />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={13} /></button>
            )}
          </div>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Tag size={13} className="text-slate-400" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <select value={marginRangeIdx} onChange={(e) => setMarginRangeIdx(Number(e.target.value))}
              className="text-sm text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer">
              {MARGIN_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
          </div>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_margin">Highest Margin</option>
              <option value="lowest_margin">Lowest Margin</option>
              <option value="lowest_supplier_price">Lowest Supplier Price</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setCategoryFilter(''); setMarginRangeIdx(0); }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors ml-auto">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} className="text-slate-400" />
          <span className="text-sm text-slate-500">{filteredAndSorted.length} product{filteredAndSorted.length !== 1 ? 's' : ''} found</span>
        </div>

        {filteredAndSorted.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSorted.map((scan) => {
              const isFav = favorites.includes(scan.id);
              const isSelected = selectedIds.has(scan.id);
              const scanTags = tags[scan.id] ?? [];

              return (
                <div key={scan.id}
                  onClick={() => bulkMode && toggleSelect(scan.id)}
                  className={cn(
                    'group bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm transition-all duration-200',
                    bulkMode ? 'cursor-pointer' : 'hover:shadow-md',
                    isSelected
                      ? 'border-[#8B5CF6]/50 ring-2 ring-[#8B5CF6]/20'
                      : 'border-white/60 dark:border-slate-700/50',
                  )}>
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={scan.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'}
                      alt={scan.productName}
                      className={cn('w-full h-full object-cover transition-transform duration-300', !bulkMode && 'group-hover:scale-105')}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
                    />
                    {/* Bulk checkbox */}
                    {bulkMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className={cn('w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
                          isSelected ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'bg-white/90 border-slate-300')}>
                          {isSelected && <Check size={13} className="text-white" />}
                        </div>
                      </div>
                    )}
                    {/* Favorite */}
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(scan.id); }}
                      className={cn('absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all',
                        isFav ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-red-500')}>
                      <Heart size={14} className={isFav ? 'fill-current' : ''} />
                    </button>
                    {/* Category badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-[#8B5CF6] text-xs font-semibold rounded-lg">
                        {scan.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-2 line-clamp-2 leading-snug">
                      {scan.productName}
                    </h3>

                    {/* Tags */}
                    <div className="mb-2 flex flex-wrap gap-1 min-h-[20px]">
                      {scanTags.map((tag) => (
                        <span key={tag} className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', getTagColor(tag))}>
                          {tag}
                          <button onClick={(e) => { e.stopPropagation(); handleRemoveTag(scan.id, tag); }}
                            className="hover:opacity-60 transition-opacity ml-0.5">
                            <X size={9} />
                          </button>
                        </span>
                      ))}
                      {addingTagId === scan.id ? (
                        <input
                          ref={tagInputRef}
                          autoFocus
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) handleAddTag(scan.id, tagInput);
                            if (e.key === 'Escape') { setAddingTagId(null); setTagInput(''); }
                          }}
                          onBlur={() => { if (tagInput.trim()) handleAddTag(scan.id, tagInput); else { setAddingTagId(null); setTagInput(''); } }}
                          placeholder="tag name..."
                          maxLength={20}
                          className="text-xs w-20 px-2 py-0.5 rounded-full border border-[#A3C9A8] focus:outline-none bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setAddingTagId(scan.id); setTagInput(''); }}
                          className="text-xs text-slate-400 hover:text-[#8B5CF6] px-1.5 py-0.5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 hover:border-[#8B5CF6] transition-colors">
                          + Tag
                        </button>
                      )}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2.5 bg-[#A3C9A8]/10 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <TrendingUp size={10} className="text-[#A3C9A8]" />
                          <p className="text-xs text-slate-500">Margin</p>
                        </div>
                        <p className="font-bold text-[#2d6a4f] dark:text-[#A3C9A8] text-sm">{scan.marginPercent}%</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                        <p className="text-xs text-slate-500 mb-0.5">Sell at</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{formatCurrency(scan.recommendedPrice)}</p>
                      </div>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); copySEO(scan); }}
                      className={cn('w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all',
                        copiedId === scan.id
                          ? 'bg-[#A3C9A8] border-[#A3C9A8] text-slate-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#A3C9A8]/50')}>
                      {copiedId === scan.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copiedId === scan.id ? 'Copied' : 'Copy SEO Description'}
                    </button>

                    <p className="text-xs text-slate-400 mt-2">{formatDate(scan.scannedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {showFavOnly ? 'No favorites yet' : allScans.length === 0 ? 'No products scanned yet' : 'No results match your filters'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {showFavOnly
                ? 'Tap the heart icon on any product to add it to your favorites.'
                : allScans.length === 0
                  ? 'Head to the Product Scanner to scan your first product and build your library.'
                  : 'Try adjusting your search terms or clearing the active filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
