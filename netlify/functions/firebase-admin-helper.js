// ─────────────────────────────────────────────────────────────────────────────
//  firebase-admin-helper.js — Dripping Secrets DS-DOS v18.2
//  Shared Firebase Admin SDK initialization for all Netlify functions.
//  Env: FIREBASE_SERVICE_ACCOUNT (full JSON string, set as secret in Netlify)
//
//  Exports:
//    getAdminDb()                      → Firestore instance (or null if unconfigured)
//    updateOrderStatus(orderId, data)  → update orders/{orderId} in Firestore
//    appendRoutingLog(entry)           → write to order_routing_log collection
// ─────────────────────────────────────────────────────────────────────────────

let _adminApp  = null;
let _adminDb   = null;
let _initError = null;

function initAdmin() {
  if (_adminDb)   return _adminDb;
  if (_initError) return null;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    _initError = 'FIREBASE_SERVICE_ACCOUNT env var not set';
    console.warn('[firebase-admin-helper]', _initError);
    return null;
  }

  try {
    const admin         = require('firebase-admin');
    const serviceAccount = JSON.parse(raw);

    // Avoid re-initialization across warm function instances
    if (!admin.apps.length) {
      _adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      _adminApp = admin.apps[0];
    }

    _adminDb = admin.firestore();
    console.log('[firebase-admin-helper] Firestore Admin SDK initialized ✓');
    return _adminDb;
  } catch (e) {
    _initError = e.message;
    console.error('[firebase-admin-helper] Init failed:', e.message);
    return null;
  }
}

// ── Get Firestore admin instance ─────────────────────────────────────────────
function getAdminDb() {
  return initAdmin();
}

// ── Update an order document's status + metadata ─────────────────────────────
async function updateOrderStatus(orderId, data) {
  const db = initAdmin();
  if (!db || !orderId) return false;
  try {
    const admin = require('firebase-admin');
    await db.collection('orders').doc(orderId).set(
      { ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    console.log(`[firebase-admin-helper] Order ${orderId} updated:`, data);
    return true;
  } catch (e) {
    console.error(`[firebase-admin-helper] updateOrderStatus failed for ${orderId}:`, e.message);
    return false;
  }
}

// ── Append an entry to the order_routing_log collection ──────────────────────
async function appendRoutingLog(entry) {
  const db = initAdmin();
  if (!db) return false;
  try {
    const admin = require('firebase-admin');
    await db.collection('order_routing_log').add({
      ...entry,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (e) {
    console.error('[firebase-admin-helper] appendRoutingLog failed:', e.message);
    return false;
  }
}

module.exports = { getAdminDb, updateOrderStatus, appendRoutingLog };
