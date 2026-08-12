import { corsHeaders } from '../_shared/cors.ts';

const SYSTEM_PROMPT = `You are Sourcingly AI, an expert dropshipping assistant embedded in the Sourcingly platform. You help dropshippers find winning products, vet global suppliers, and grow their Shopify stores.

Your expertise covers:
- Product sourcing and supplier vetting (target 4.5+ star suppliers with 500+ reviews)
- Competitive market analysis and pricing strategy (target 40%+ profit margins)
- Shopify store setup and SEO product listing best practices
- Identifying trending niches: Electronics, Home and Garden, Health and Beauty
- Platform navigation: Product Scanner, Credit Wallet, Product Library, AI Support, Settings

Keep responses concise (2-4 sentences), direct, and actionable. Reference Sourcingly platform features when relevant. Use professional language. Never use emojis.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[Chat] OnSpace AI error:', errText);
      return new Response(JSON.stringify({ error: `OnSpace AI: ${errText}` }), {
        status: aiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(aiRes.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[Chat] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
