import type { Supplier, ScanResult, CreditTransaction } from '@/types';

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Yiwu Global Trade Co.', country: 'China', countryCode: 'CN', price: 4.50, rating: 4.7, reviewCount: 1283, leadTime: '7–14 days', moq: 50 },
  { id: 's2', name: 'Pacific Source Hub', country: 'China', countryCode: 'CN', price: 5.20, rating: 4.5, reviewCount: 892, leadTime: '10–18 days', moq: 30 },
  { id: 's3', name: 'EuroFast Wholesale', country: 'Germany', countryCode: 'DE', price: 8.90, rating: 4.8, reviewCount: 441, leadTime: '3–7 days', moq: 10 },
];

export const MOCK_SCAN_RESULT: Omit<ScanResult, 'id' | 'imageUrl' | 'scannedAt'> = {
  productName: 'Portable Wireless Charging Pad',
  category: 'Electronics & Gadgets',
  suppliers: MOCK_SUPPLIERS,
  avgCompetitorPrice: 24.99,
  recommendedPrice: 34.99,
  marginPercent: 62,
  seoDescription: 'Fast-charge any device with this ultra-slim portable wireless charger. Compatible with all Qi-enabled smartphones, earbuds, and smartwatches. Featuring 10W fast-charge technology and a compact, travel-ready design, this wireless charging pad delivers reliable power at home, in the office, or on the road. Free shipping on orders over $35.',
  status: 'complete',
};

export const MOCK_TRANSACTIONS: CreditTransaction[] = [
  { id: 't1', type: 'addition', amount: 10, description: 'Monthly plan credits (Starter)', date: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 't2', type: 'deduction', amount: 1, description: 'Product scan – Bluetooth Speaker', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 't3', type: 'deduction', amount: 1, description: 'Product scan – Phone Case Set', date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 't4', type: 'bonus', amount: 2, description: 'Referral bonus credited', date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 't5', type: 'deduction', amount: 1, description: 'Product scan – Wireless Charger', date: new Date(Date.now() - 86400000).toISOString() },
];

export const MOCK_RECENT_SCANS: ScanResult[] = [
  {
    id: 'scan1',
    imageUrl: 'https://images.unsplash.com/photo-1608751819407-8c8672b05a82?w=200&h=200&fit=crop&q=80',
    productName: 'Bluetooth Portable Speaker',
    category: 'Electronics',
    suppliers: MOCK_SUPPLIERS.slice(0, 2),
    avgCompetitorPrice: 39.99,
    recommendedPrice: 54.99,
    marginPercent: 71,
    seoDescription: 'Premium portable Bluetooth speaker with 360-degree surround sound...',
    status: 'complete',
    scannedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'scan2',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&h=200&fit=crop&q=80',
    productName: 'Protective Phone Case Set',
    category: 'Accessories',
    suppliers: MOCK_SUPPLIERS.slice(0, 1),
    avgCompetitorPrice: 14.99,
    recommendedPrice: 22.99,
    marginPercent: 54,
    seoDescription: 'Heavy-duty protective phone case with military-grade drop protection...',
    status: 'complete',
    scannedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'scan3',
    imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&h=200&fit=crop&q=80',
    productName: 'Aromatherapy Diffuser',
    category: 'Home & Garden',
    suppliers: MOCK_SUPPLIERS.slice(1, 3),
    avgCompetitorPrice: 28.99,
    recommendedPrice: 42.99,
    marginPercent: 67,
    seoDescription: 'Ultrasonic aromatherapy essential oil diffuser with 7-color LED...',
    status: 'complete',
    scannedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
