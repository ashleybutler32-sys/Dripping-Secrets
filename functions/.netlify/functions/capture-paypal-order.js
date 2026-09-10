// ─────────────────────────────────────────────────────────────────────────────
//  capture-paypal-order.js — Dripping Secrets DS-DOS v18.2 (Cloudflare Pages Function)
//  Server-side PayPal order capture + verification (Live)
//  Env: PAYPAL_SECRET, FIREBASE_SERVICE_ACCOUNT
//
//  On successful capture: updates orders/{orderNum} in Firestore with
//  status 'payment_confirmed', transactionId, payerEmail, capturedAt.
// ─────────────────────────────────────────────────────────────────────────────

import { updateOrderStatus } from '../../_firebase-rest.js';

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
    console.error('[capture-paypal-order] PAYPAL_SECRET not set');
    return new Response(JSON.stringify({ error: 'Payment system not configured' }), { status: 500, headers: CORS });
  }

  try {
    const bodyText = await request.text();
    const { paypalOrderId, orderNum } = JSON.parse(bodyText || '{}');
    if (!paypalOrderId) {
      return new Response(JSON.stringify({ error: 'Missing paypalOrderId' }), { status: 400, headers: CORS });
    }

    const token = await getAccessToken(SECRET);

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

      // ── Update Firestore order status (via REST API) ───────────────────────
      if (orderNum && env.FIREBASE_SERVICE_ACCOUNT) {
        const projectId = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT).project_id;
        await updateOrderStatus(env.FIREBASE_SERVICE_ACCOUNT, projectId, orderNum, {
          status:          'payment_confirmed',
          paymentMethod:   'PayPal',
          transactionId,
          payerEmail,
          amount,
          paypalOrderId,
          capturedAt:      new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({
        success:       true,
        transactionId,
        payerEmail,
        amount,
        status:        'COMPLETED'
      }), { status: 200, headers: CORS });
    } else {
      console.error('[capture-paypal-order] Capture failed:', capture.status, capture.details);
      return new Response(JSON.stringify({ success: false, status: capture.status, message: capture.details?.[0]?.description || 'Capture failed' }), { status: 400, headers: CORS });
    }
  } catch (err) {
    console.error('[capture-paypal-order]', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}
