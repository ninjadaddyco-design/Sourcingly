import type { ChatMessage } from '@/types';

// Keyword-mapped fallback responses
const RESPONSES: Record<string, string> = {
  supplier: 'The Market Intelligence panel ranks global suppliers by price, rating, and shipping speed after each scan. Focus on suppliers with 4.5+ stars and 500+ reviews for reliable quality and fulfillment.',
  price: 'Target a minimum 40% profit margin. The Recommended Price in the scan results already factors in competitor data and optimal markup — never price below 2.5x your supplier cost.',
  margin: 'Target a minimum 40% profit margin. The Recommended Price in the scan results already factors in competitor data and optimal markup — never price below 2.5x your supplier cost.',
  scan: 'The Product Scanner accepts JPEG, PNG, and WEBP images. Upload a clear product photo and AI will identify the item, match global suppliers, and return market pricing data within seconds.',
  credit: 'Each product scan uses 1 credit. Starter gives 10 credits, Growth gives 100, and Pro gives 500 per month. Credits reset on the 1st of each month — upgrade from the Credit Wallet page anytime.',
  shopify: 'Use the auto-generated SEO description from your scan results, set the price to the Recommended Price shown, and source from the top-rated supplier. That completes the full sourcing-to-listing cycle.',
  niche: 'For beginners, Electronics, Home and Garden, or Health and Beauty are strong niches with consistent demand, healthy margins, and reliable global suppliers. Use the scanner to validate each product first.',
  shipping: 'Chinese suppliers typically ship in 7 to 21 days. European suppliers offer 3 to 7 day delivery at higher cost. Balance customer expectations against your margin when choosing.',
  seo: 'SEO descriptions from Sourcingly are optimized for Shopify search and include the primary keyword, key features, and a call to action. Edit them directly in the scan results panel before copying.',
};

let rotationIndex = 0;
const FALLBACKS = [
  'The key to profitable dropshipping is products with strong demand, manageable competition, and margins above 40%. Use the Product Scanner to validate picks with real supplier and pricing data.',
  'To maximize your workflow: scan a product image, review the top supplier match, use the Recommended Price, then copy the SEO description directly to your Shopify listing.',
  'Sourcingly analyzes competitor pricing across major platforms to produce a data-backed recommended retail price, keeping you competitive while protecting your margins.',
  'The most critical metric in dropshipping is margin percentage. Always review the Market Intelligence panel after each scan before committing to a product or supplier.',
];

export async function getMockedAIResponse(userMessage: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 1100));
  const lower = userMessage.toLowerCase();
  for (const [kw, resp] of Object.entries(RESPONSES)) {
    if (lower.includes(kw)) return resp;
  }
  return FALLBACKS[rotationIndex++ % FALLBACKS.length];
}

/** Stream real AI response from the 'chat' Edge Function. */
export async function streamAIResponse(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  let token = supabaseAnonKey;
  try {
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) token = session.access_token;
  } catch {
    // Fall back to anon key
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat error ${response.status}: ${errText}`);
  }

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export type { ChatMessage };
