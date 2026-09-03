// ─────────────────────────────────────────────────────────────────────────────
//  create-paypal-order.js — Dripping Secrets v18.1
//  Server-side PayPal order creation (Live)
//  Env: PAYPAL_SECRET
// ─────────────────────────────────────────────────────────────────────────────

const PAYPAL_BASE  = 'https://api-m.paypal.com';
const CLIENT_ID    = 'AdhzOkxWfdTe_nlYIALptqsPUbrv8_foAK7M6hXm3obHkTJRfOWLgCKSZJqkmbP9HNdMYVB1H1rprvp3';
const SECRET       = process.env.PAYPAL_SECRET;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

async function getAccessToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');
  const res   = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    'grant_type=client_credentials'
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get PayPal access token');
  return data.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  if (!SECRET) {
    console.error('[create-paypal-order] PAYPAL_SECRET not set');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Payment system not configured' }) };
  }

  try {
    const { amount, orderNum } = JSON.parse(event.body || '{}');
    if (!amount || !orderNum) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing amount or orderNum' }) };
    }

    const token = await getAccessToken();

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

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ id: order.id }) };
  } catch (err) {
    console.error('[create-paypal-order]', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
