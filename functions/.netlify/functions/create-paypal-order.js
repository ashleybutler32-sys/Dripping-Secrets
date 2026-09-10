// ─────────────────────────────────────────────────────────────────────────────
//  create-paypal-order.js — Dripping Secrets v18.1 (Cloudflare Pages Function)
//  Server-side PayPal order creation (Live)
//  Env: PAYPAL_SECRET
// ─────────────────────────────────────────────────────────────────────────────

const PAYPAL_BASE = 'https://api-m.paypal.com';
const CLIENT_ID   = 'AdhzOkxWfdTe_nlYIALptqsPUbrv8_foAK7M6hXm3obHkTJRfOWLgCKSZJqkmbP9HNdMYVB1H1rprvp3';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

async function getAccessToken(secret) {
  const creds = btoa(`${CLIENT_ID}:${secret}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    'grant_type=client_credentials'
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get PayPal access token');
  return data.access_token;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response('', { status: 200, headers: CORS });
  if (request.method !== 'POST')    return new Response('Method Not Allowed', { status: 405, headers: CORS });

  const SECRET = env.PAYPAL_SECRET;
  if (!SECRET) {
    console.error('[create-paypal-order] PAYPAL_SECRET not set');
    return new Response(JSON.stringify({ error: 'Payment system not configured' }), { status: 500, headers: CORS });
  }

  try {
    const bodyText = await request.text();
    const { amount, orderNum } = JSON.parse(bodyText || '{}');
    if (!amount || !orderNum) {
      return new Response(JSON.stringify({ error: 'Missing amount or orderNum' }), { status: 400, headers: CORS });
    }

    const token = await getAccessToken(SECRET);

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderNum,
          description:  `Dripping Secrets Order ${orderNum}`,
          amount: { currency_code: 'USD', value: parseFloat(amount).toFixed(2) }
        }]
      })
    });

    const order = await res.json();
    if (!order.id) throw new Error(order.message || 'PayPal order creation failed');

    return new Response(JSON.stringify({ id: order.id }), { status: 200, headers: CORS });
  } catch (err) {
    console.error('[create-paypal-order]', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}
