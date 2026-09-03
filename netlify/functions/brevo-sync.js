// ============================================================
// brevo-sync.js — Dripping Secrets v11.2
// Netlify serverless function: syncs customer marketing opt-in/out to Brevo
// Requires: BREVO_API_KEY in Netlify environment variables
// Optional: BREVO_LIST_ID (defaults to 2 — adjust to match your Brevo list)
// ============================================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '2', 10);
const BREVO_BASE    = 'https://api.brevo.com/v3';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  // ── CORS preflight ──────────────────────────────────────────
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!BREVO_API_KEY) {
    console.error('[brevo-sync] BREVO_API_KEY is not set');
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Brevo API key not configured' }) };
  }

  // ── Parse body ──────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { email, name, action } = body;

  if (!email || !action) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Missing required fields: email, action' }) };
  }
  if (!['subscribe', 'unsubscribe'].includes(action)) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'action must be subscribe or unsubscribe' }) };
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
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to subscribe contact', detail: errText }) };
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
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to unsubscribe contact', detail: errText }) };
      }

      console.log(`[brevo-sync] Unsubscribed: ${email}`);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, action, email })
    };

  } catch (e) {
    console.error('[brevo-sync] Unexpected error:', e.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unexpected server error', detail: e.message })
    };
  }
};
