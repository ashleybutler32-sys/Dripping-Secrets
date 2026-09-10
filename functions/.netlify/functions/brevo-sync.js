// ============================================================
// brevo-sync.js — Dripping Secrets v11.2 (Cloudflare Pages Function)
// Syncs customer marketing opt-in/out to Brevo
// Requires: BREVO_API_KEY in Cloudflare Pages environment variables
// Optional: BREVO_LIST_ID (defaults to 2 — adjust to match your Brevo list)
// ============================================================

const BREVO_BASE = 'https://api.brevo.com/v3';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function onRequest(context) {
  const { request, env } = context;

  // ── CORS preflight ──────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: CORS_HEADERS });
  }

  const BREVO_API_KEY = env.BREVO_API_KEY;
  const BREVO_LIST_ID = parseInt(env.BREVO_LIST_ID || '2', 10);

  if (!BREVO_API_KEY) {
    console.error('[brevo-sync] BREVO_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Brevo API key not configured' }), { status: 500, headers: CORS_HEADERS });
  }

  // ── Parse body ──────────────────────────────────────────────
  let body;
  try {
    const bodyText = await request.text();
    body = JSON.parse(bodyText || '{}');
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS_HEADERS });
  }

  const { email, name, action } = body;

  if (!email || !action) {
    return new Response(JSON.stringify({ error: 'Missing required fields: email, action' }), { status: 400, headers: CORS_HEADERS });
  }
  if (!['subscribe', 'unsubscribe'].includes(action)) {
    return new Response(JSON.stringify({ error: 'action must be subscribe or unsubscribe' }), { status: 400, headers: CORS_HEADERS });
  }

  const brevoHeaders = {
    'accept':       'application/json',
    'content-type': 'application/json',
    'api-key':      BREVO_API_KEY
  };

  // ── Parse name into first / last ────────────────────────────
  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';

  try {
    if (action === 'subscribe') {
      // Create or update contact, add to marketing list
      const res = await fetch(`${BREVO_BASE}/contacts`, {
        method: 'POST',
        headers: brevoHeaders,
        body: JSON.stringify({
          email,
          attributes:    { FIRSTNAME: firstName, LASTNAME: lastName },
          listIds:       [BREVO_LIST_ID],
          updateEnabled: true   // updates the contact if it already exists
        })
      });

      // 201 = created, 204 = updated — both are success
      if (!res.ok && res.status !== 204) {
        const errText = await res.text();
        console.error('[brevo-sync] subscribe error:', res.status, errText);
        return new Response(JSON.stringify({ error: 'Failed to subscribe contact', detail: errText }), { status: 500, headers: CORS_HEADERS });
      }

      console.log(`[brevo-sync] Subscribed: ${email}`);

    } else {
      // Unsubscribe: blacklist email so Brevo stops all marketing sends
      const res = await fetch(`${BREVO_BASE}/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: brevoHeaders,
        body: JSON.stringify({ emailBlacklisted: true })
      });

      if (!res.ok && res.status !== 204) {
        const errText = await res.text();
        console.error('[brevo-sync] unsubscribe error:', res.status, errText);
        return new Response(JSON.stringify({ error: 'Failed to unsubscribe contact', detail: errText }), { status: 500, headers: CORS_HEADERS });
      }

      console.log(`[brevo-sync] Unsubscribed: ${email}`);
    }

    return new Response(JSON.stringify({ success: true, action, email }), { status: 200, headers: CORS_HEADERS });

  } catch (e) {
    console.error('[brevo-sync] Unexpected error:', e.message);
    return new Response(JSON.stringify({ error: 'Unexpected server error', detail: e.message }), { status: 500, headers: CORS_HEADERS });
  }
}
