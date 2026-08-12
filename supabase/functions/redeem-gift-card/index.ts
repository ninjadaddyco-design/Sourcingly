import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user via JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // User client — respects RLS
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const code = (body.code as string | undefined)?.trim().toUpperCase();
    if (!code) {
      return new Response(JSON.stringify({ error: 'Gift card code is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role client — bypasses RLS for safe mutations
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Look up the gift card
    const { data: card, error: cardError } = await admin
      .from('gift_cards')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (cardError) {
      console.error('[redeem-gift-card] Lookup error:', cardError);
      return new Response(JSON.stringify({ error: 'Failed to look up gift card.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!card) {
      return new Response(JSON.stringify({ error: 'Invalid gift card code. Please check and try again.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (card.is_redeemed) {
      return new Response(JSON.stringify({ error: 'This gift card has already been redeemed.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creditsToAdd: number = card.credits;

    // Fetch current credits
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Failed to load your profile.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newCredits = (profile.credits as number) + creditsToAdd;

    // Mark card as redeemed
    const { error: redeemError } = await admin
      .from('gift_cards')
      .update({ is_redeemed: true, redeemed_by: user.id, redeemed_at: new Date().toISOString() })
      .eq('id', card.id);

    if (redeemError) {
      console.error('[redeem-gift-card] Redeem update error:', redeemError);
      return new Response(JSON.stringify({ error: 'Failed to redeem gift card.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user credits
    const { error: creditError } = await admin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', user.id);

    if (creditError) {
      console.error('[redeem-gift-card] Credit update error:', creditError);
      return new Response(JSON.stringify({ error: 'Credits could not be applied. Contact support.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the credit transaction
    await admin.from('credit_transactions').insert({
      user_id: user.id,
      type: 'bonus',
      amount: creditsToAdd,
      description: card.description || `Gift card redeemed: ${code}`,
    });

    console.log(`[redeem-gift-card] User ${user.id} redeemed ${code} for ${creditsToAdd} credits`);

    return new Response(
      JSON.stringify({ success: true, creditsAdded: creditsToAdd, newBalance: newCredits }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[redeem-gift-card] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
