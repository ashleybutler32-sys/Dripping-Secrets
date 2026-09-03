// dimi-captions.js — Real-time AI caption generator for Dripping Secrets Social Studio
// Calls GPT-4o-mini with platform-specific prompts, returns fresh JSON captions every time.

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: 'no_key' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch {}

  const theme    = body.theme    || 'lifestyle';
  const products = body.products || [];          // [{name, price}]
  const flash    = body.flash    !== false;       // flash sale active?
  const day      = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const productSnippet = products.length
    ? products.slice(0,5).map(p => `• ${p.name} ($${p.price})`).join('\n')
    : '• Rose vibrators\n• Luxury bundles\n• Lingerie sets';

  const saleNote = flash ? 'Flash Sale is LIVE — 30% off sitewide (expires 6/20/2026).' : '';

  const systemPrompt = `You are Dimi — sassy gay best friend, luxury concierge, and social media brain for Dripping Secrets (DrippingSecrets.com), a Black-women-owned premium adult pleasure boutique in Dallas, TX. 
Brand voice: confident, flirty, empowering, judgment-free, a little cheeky, never crude.
Tagline: "Curated by a Secret Keeper to help you keep her."
Secondary: "Same box twice? Not how we move."
DO NOT mention supplier names. DO NOT say "coming soon." NO crude language. Keep it luxury + fun.`;

  const userPrompt = `Today is ${day}. Theme: ${theme}. ${saleNote}

Featured products right now:
${productSnippet}

Generate fresh, UNIQUE captions — NOT the same phrases we always use. Mix up the energy. Sometimes aspirational, sometimes playful, sometimes informative, sometimes community-driven. Never start with "Drop everything."

Return ONLY valid JSON in this exact shape:
{
  "twitter": "...",
  "ig_feed": "...",
  "ig_reel": "...",
  "ig_story": "...",
  "fb_post": "...",
  "tiktok_hook": "...",
  "tiktok_caption": "..."
}

Rules:
- twitter: max 280 chars, punchy, end with DrippingSecrets.com, 1–2 emoji max
- ig_feed: 3–5 lines, 10–15 hashtags, expressive, 3–4 relevant emoji
- ig_reel: 1–2 punchy lines max, 5–8 hashtags, lowercase vibe
- ig_story: 1 short line + 1 hashtag + site
- fb_post: 3–5 sentences, warm and community-forward, 2–3 hashtags, end with DrippingSecrets.com
- tiktok_hook: first 2 seconds only — one bold punchy sentence that stops the scroll
- tiktok_caption: 1 line + 4–6 hashtags`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 1.1,
        max_tokens: 700,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await resp.json();
    const raw  = data.choices?.[0]?.message?.content || '';

    // Strip markdown code fences if present
    const jsonStr = raw.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
    const captions = JSON.parse(jsonStr);

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, captions }) };
  } catch (err) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
