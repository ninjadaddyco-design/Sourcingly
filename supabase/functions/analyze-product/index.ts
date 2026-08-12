import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      return new Response(JSON.stringify({ error: 'AI service not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const imageBase64: string | undefined = body.imageBase64;
    const mimeType: string = body.mimeType ?? 'image/jpeg';

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert dropshipping product analyst. Analyze the uploaded product image and return a precise JSON object only — no markdown, no explanation, just raw JSON.

Required JSON shape:
{
  "productName": "string — specific product name (brand + model if visible, otherwise descriptive)",
  "category": "string — one of: Electronics, Fashion, Home & Garden, Beauty, Sports, Toys, Pet Supplies, Kitchen, Office, Automotive, Baby & Kids, Jewelry, Books, Other",
  "estimatedRetailPrice": number — USD retail price a customer would pay,
  "estimatedSupplierPrice": number — USD typical AliExpress/Alibaba wholesale price,
  "recommendedSellingPrice": number — USD optimal Shopify listing price for ~40-60% margin,
  "marginPercent": number — integer margin percentage at recommendedSellingPrice,
  "avgCompetitorPrice": number — USD average competitor price on Amazon/eBay,
  "seoDescription": "string — 2-sentence SEO-optimized product description for Shopify listing",
  "suppliers": [
    {
      "name": "string — supplier platform name (e.g. AliExpress, Alibaba, TeemDrop, DSers)",
      "price": number — USD price,
      "rating": number — float 3.5 to 5.0,
      "minOrder": number — minimum order quantity,
      "shippingDays": number — typical shipping days to USA,
      "location": "string — supplier country"
    }
  ]
}

Rules:
- suppliers array must have 3-5 entries with realistic varied prices
- All prices in USD as numbers, no currency symbols
- marginPercent = round((recommendedSellingPrice - estimatedSupplierPrice) / recommendedSellingPrice * 100)
- seoDescription must mention key features and target buyer
- Be specific and realistic — do NOT use placeholder values`;

    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this product image and return ONLY the JSON object with no other text.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('[analyze-product] AI API error:', errText);
      return new Response(JSON.stringify({ error: `AI service error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```(?:json)?\n?/g, '').replace(/```$/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('[analyze-product] JSON parse failed. Raw:', raw);
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON. Please try again.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, result: parsed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[analyze-product] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
