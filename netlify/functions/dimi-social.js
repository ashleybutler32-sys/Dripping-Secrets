// ─────────────────────────────────────────────────────────────────────────────
//  DIMI DAILY SOCIAL DROP — 10 AM CT
//  Netlify Scheduled Function — fires every day at 10 AM Central Time
//  Generates social captions + emails Ashley via EmailJS REST API
//
//  Scheduled via netlify.toml:
//    [functions."dimi-social"]
//      schedule = "0 15 * * *"   ← 10 AM CT = 15:00 UTC (CDT)
//
//  Env vars required:
//    OPENAI_API_KEY        — for AI-generated captions
//    EMAILJS_SERVICE_ID    — service_kkp11nt
//    EMAILJS_TEMPLATE_ID   — template_nbiinbo
//    EMAILJS_PUBLIC_KEY    — KpF8LPtlgYmBZIRUW
//    (fallback: hardcoded values below if env vars not set)
// ─────────────────────────────────────────────────────────────────────────────

const EMAILJS_SERVICE  = process.env.EMAILJS_SERVICE_ID  || 'service_kkp11nt';
const EMAILJS_TEMPLATE = process.env.EMAILJS_TEMPLATE_ID || 'template_nbiinbo';
const EMAILJS_KEY      = process.env.EMAILJS_PUBLIC_KEY  || 'KpF8LPtlgYmBZIRUW';
const TO_EMAIL         = 'ashleybutler322@gmail.com';

// ── Theme rotation (cycles by day of week) ────────────────────────────────────
const THEMES = ['rose_feature', 'product_spotlight', 'flash_sale', 'lifestyle', 'bundle_push', 'party_promo', 'community'];
const THEME_LABELS = {
  rose_feature:     'Roses 🌹 (our bestseller)',
  product_spotlight:'Featured Product',
  flash_sale:       'Flash Sale Urgency',
  lifestyle:        'Brand Lifestyle & Vibe',
  bundle_push:      'Bundles & Boxes',
  party_promo:      'Secrets Parties',
  community:        'Community & Connection'
};

// ── Featured product by theme ─────────────────────────────────────────────────
const FEATURED = {
  rose_feature:     { name: 'The Rose Suction Vibrator', price: 39.99, sale: 27.99,  category: 'roses' },
  product_spotlight:{ name: 'The Machine',               price: 175,   sale: 122.50, category: 'machines' },
  flash_sale:       { name: 'Rose Gold Couples Kit',     price: 89.99, sale: 62.99,  category: 'couples' },
  lifestyle:        { name: 'Dripping Secrets Collection', price: null, sale: null,  category: 'general' },
  bundle_push:      { name: 'Rose Garden Bundle',        price: 79.99, sale: 55.99,  category: 'bundles' },
  party_promo:      { name: 'Secrets Party Experience',  price: 150,   sale: null,   category: 'party' },
  community:        { name: 'Secret Keeper Favorites',   price: null,  sale: null,   category: 'general' }
};

function isFlashSaleActive() {
  return new Date() < new Date('2026-06-20T23:59:00-05:00');
}

function getDaysLeft() {
  const diff = new Date('2026-06-20T23:59:00-05:00') - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Generate captions (AI if available, fallback to templates) ────────────────
async function generateCaptions(theme, featured) {
  const flashActive = isFlashSaleActive();
  const daysLeft    = getDaysLeft();

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const saleNote = flashActive ? `FLASH SALE is LIVE — ${daysLeft} days left, 30% off sitewide products. Feature this urgency.` : 'No active flash sale.';
      const prompt = `You are Dimi — sassy gay best friend digital concierge for Dripping Secrets, a premium adult boutique for women. Generate today's social media captions.

Today's theme: ${THEME_LABELS[theme]}
Featured product: ${featured.name}${featured.price ? ` — normally $${featured.price}` : ''}${featured.sale ? `, on sale for $${featured.sale}` : ''}
Sale status: ${saleNote}

Generate one caption per platform. Be on-brand — luxury, confident, judgment-free, fun. NO crude language. NO supplier names. NO "coming soon."

Format exactly like this:
TWITTER/X (max 280 chars):
[caption]

INSTAGRAM (rich, 10-15 hashtags):
[caption]

TIKTOK (hook first line, 3-5 hashtags):
[caption]

FACEBOOK (conversational, link-friendly):
[caption]

MY TIP FOR TODAY:
[one line strategy tip]`;

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 600
        })
      });
      const data = await resp.json();
      if (data.choices?.[0]?.message?.content) {
        return { captions: data.choices[0].message.content, aiGenerated: true };
      }
    } catch (err) {
      console.warn('[dimi-social] OpenAI error, using fallback:', err.message);
    }
  }

  // ── Fallback captions ─────────────────────────────────────────────────────
  const flashTag = flashActive ? ` ${daysLeft > 1 ? `${daysLeft} days` : 'last day'}! Use code at checkout. drippingsecrets.com 🔥` : '';
  const captions = `TWITTER/X (max 280 chars):
She deserves the best — and so do you. ${featured.name} is exactly what you've been missing.${flashActive ? ` 30% off — ${daysLeft}d left.` : ''} drippingsecrets.com 💜

INSTAGRAM (rich, 10-15 hashtags):
There's a reason she keeps coming back. ✨

${featured.name} — curated specifically for her. Because when she's happy, everybody wins.${flashActive ? `\n\n🔥 FLASH SALE: 30% off sitewide — ${daysLeft} day${daysLeft === 1 ? '' : 's'} left. Shop now at the link in bio.` : ''}

#DrippingSecrets #AdultBoutique #WomensPleasure #CuratedForHer #SecretKeeper #AdultToys #SelfCare #CouplesGoals #RomanceGoals #ShopNow${flashActive ? ' #FlashSale #SaleAlert' : ' #NewCollection #LuxuryAdult'}

TIKTOK (hook first line, 3-5 hashtags):
POV: you finally found the boutique that actually gets it 👀
${featured.name} just landed and it's already a favorite.${flashActive ? ` Flash sale — ${daysLeft}d left ⏰` : ''} Link in bio 💜
#DrippingSecrets #AdultBoutique #TreatYourself${flashActive ? ' #FlashSale' : ' #NewArrivals'}

FACEBOOK (conversational, link-friendly):
Hey loves! 💜 Today we're featuring ${featured.name} — one of our absolute faves.

${featured.sale ? `Regularly $${featured.price}, you can grab it right now for just $${featured.sale}${flashActive ? ` (flash sale ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!)` : ''}.` : 'Head to the shop to see it in action.'}

Curated by a Secret Keeper to help you keep her. 🌹
👉 drippingsecrets.com

MY TIP FOR TODAY:
Post during peak hours — 12 PM and 8 PM CT get the most engagement for our niche.`;

  return { captions, aiGenerated: false };
}

// ── Send email via EmailJS REST ───────────────────────────────────────────────
async function sendEmail(subject, content, theme, featured, aiGenerated) {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' });

  const emailBody = `DIMI'S DAILY SOCIAL DROP
${dateStr}
${'─'.repeat(50)}

Good morning, Boss Lady! Here's your social content for today.

Theme: ${THEME_LABELS[theme]}
Featured: ${featured.name}
${aiGenerated ? '✨ AI-generated by Dimi' : '📝 Template-based (set OPENAI_API_KEY in Netlify for AI captions)'}
${'─'.repeat(50)}

${content}

${'─'.repeat(50)}
Ready to post? Log into each platform and drop these captions with a product image from your gallery.

💜 Yours in secrets,
Dimi
Dripping Secrets Back Office
drippingsecrets.com/admin.html`;

  const payload = {
    service_id:  EMAILJS_SERVICE,
    template_id: EMAILJS_TEMPLATE,
    user_id:     EMAILJS_KEY,
    template_params: {
      to_email:       TO_EMAIL,
      to_name:        'Ashley',
      order_number:   `SOCIAL-DROP-${new Date().toISOString().slice(0,10)}`,
      order_items:    emailBody,
      order_total:    `Theme: ${THEME_LABELS[theme]}`,
      payment_method: 'Daily Social Drop by Dimi',
      shipping_addr:  'Twitter/X · Instagram · TikTok · Facebook',
      from_name:      'Dimi @ Dripping Secrets',
      reply_to:       'Assistant.Manager@DrippingSecrets.com'
    }
  };

  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`EmailJS error ${resp.status}: ${txt}`);
  }
  return true;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  console.log('[dimi-social] Firing daily social drop…');

  const now    = new Date();
  const dow    = now.getDay(); // 0=Sun … 6=Sat
  // Flash sale finale overrides theme in last 2 days
  const daysLeft = getDaysLeft();
  const theme  = (isFlashSaleActive() && daysLeft <= 2) ? 'flash_sale' : THEMES[dow % THEMES.length];
  const featured = FEATURED[theme];

  const { captions, aiGenerated } = await generateCaptions(theme, featured);
  const subject = `✨ Dimi's Daily Social Drop — ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'America/Chicago' })}`;

  try {
    await sendEmail(subject, captions, theme, featured, aiGenerated);
    console.log('[dimi-social] Email sent to', TO_EMAIL);
    return { statusCode: 200, body: JSON.stringify({ success: true, theme, aiGenerated }) };
  } catch (err) {
    console.error('[dimi-social] Email error:', err.message);
    return { statusCode: 200, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
