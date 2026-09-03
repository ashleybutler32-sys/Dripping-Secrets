// ─────────────────────────────────────────────────────────────────────────────
//  capture-paypal-order.js — Dripping Secrets DS-DOS v18.2
//  Server-side PayPal order capture + verification (Live)
//  Env: PAYPAL_SECRET, FIREBASE_SERVICE_ACCOUNT
//
//  On successful capture: updates orders/{orderNum} in Firestore with
//  status 'payment_confirmed', transactionId, payerEmail, capturedAt.
// ─────────────────────────────────────────────────────────────────────────────

const PAYPAL_BASE = 'https://api-m.paypal.com';
const CLIENT_ID   = 'AdhzOkxWfdTe_nlYIALptqsPUbrv8_foAK7M6hXm3obHkTJRfOWLgCKSZJqkmbP9HNdMYVB1H1rprvp3';
const SECRET      = process.env.PAYPAL_SECRET;

const { updateOrderStatus } = require('./firebase-admin-helper');

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
    console.error('[capture-paypal-order] PAYPAL_SECRET not set');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Payment system not configured' }) };
  }

  try {
    const { paypalOrderId, orderNum } = JSON.parse(event.body || '{}');
    if (!paypalOrderId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing paypalOrderId' }) };
    }

    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const capture = await res.json();

    if (capture.status === 'COMPLETED') {
      const captureDetail = capture.purchase_units?.[0]?.payments?.captures?.[0] || {};
      const transactionId = captureDetail.id || capture.id;
      const payerEmail    = capture.payer?.email_address || '';
      const amount        = captureDetail.amount?.value || '';

      // ── Update Firestore order status ───────────────────────────────────────
      if (orderNum) {
        await updateOrderStatus(orderNum, {
          status:          'payment_confirmed',
          paymentMethod:   'PayPal',
          transactionId,
          payerEmail,
          amount,
          paypalOrderId,
          capturedAt:      new Date().toISOString()
        });
      }

      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          success:       true,
          transactionId,
          payerEmail,
          amount,
          status:        'COMPLETED'
        })
      };
    } else {
      console.error('[capture-paypal-order] Capture failed:', capture.status, capture.details);
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ success: false, status: capture.status, message: capture.details?.[0]?.description || 'Capture failed' })
      };
    }
  } catch (err) {
    console.error('[capture-paypal-order]', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
