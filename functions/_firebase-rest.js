// ─────────────────────────────────────────────────────────────────────────────
//  _firebase-rest.js — Dripping Secrets — Cloudflare Pages Functions
//  Firestore REST API helper (replaces firebase-admin SDK, which is not
//  compatible with the Cloudflare Workers runtime).
//  Uses a Google service-account JWT (RS256, signed via Web Crypto) to obtain
//  an OAuth2 access token, then talks to the Firestore REST API directly.
//
//  Usage (from a Pages Function):
//    import { updateOrderStatus, appendRoutingLog } from '../../_firebase-rest.js';
//    const projectId = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT).project_id;
//    await updateOrderStatus(env.FIREBASE_SERVICE_ACCOUNT, projectId, orderId, { status: 'x' });
// ─────────────────────────────────────────────────────────────────────────────

async function getFirestoreToken(serviceAccountJson) {
  const sa = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore'
  };
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const toSign = `${encode(header)}.${encode(claim)}`;

  // Import private key
  const pemBody = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(toSign));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${toSign}.${sigB64}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  return data.access_token;
}

export async function updateOrderStatus(serviceAccountJson, projectId, orderId, data) {
  if (!serviceAccountJson || !orderId) return false;
  try {
    const token = await getFirestoreToken(serviceAccountJson);
    const fields = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === 'string') fields[k] = { stringValue: v };
      else if (typeof v === 'number') fields[k] = { doubleValue: v };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    }
    fields.updatedAt = { timestampValue: new Date().toISOString() };
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=${Object.keys(fields).join('&updateMask.fieldPaths=')}`;
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return true;
  } catch (e) {
    console.error('updateOrderStatus failed:', e.message);
    return false;
  }
}

export async function appendRoutingLog(serviceAccountJson, projectId, entry) {
  if (!serviceAccountJson) return false;
  try {
    const token = await getFirestoreToken(serviceAccountJson);
    const fields = {};
    for (const [k, v] of Object.entries(entry)) {
      if (typeof v === 'string') fields[k] = { stringValue: v };
      else if (typeof v === 'number') fields[k] = { doubleValue: v };
    }
    fields.createdAt = { timestampValue: new Date().toISOString() };
    await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/order_routing_log`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    return true;
  } catch (e) {
    console.error('appendRoutingLog failed:', e.message);
    return false;
  }
}
