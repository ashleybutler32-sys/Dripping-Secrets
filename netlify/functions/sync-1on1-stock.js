// ─────────────────────────────────────────────────────────────────────────────
// sync-1on1-stock.js  –  Dripping Secrets · 1on1Wholesale Stock Sync
// Fetches the 1on1Wholesale stock CSV feed and updates Firestore inStock /
// stockLevel for every matched luxury_play product.
//
// Env vars required:
//   ONEONE_STOCK_FEED_URL  – "View stock feed (CSV)" URL from 1on1 portal
//   FIREBASE_SERVICE_ACCOUNT – already set in Netlify
//
// POST /sync-1on1-stock   → trigger sync (from Back Office or schedule)
// GET  /sync-1on1-stock   → returns last sync log entry
// ─────────────────────────────────────────────────────────────────────────────

const { getDb } = require('./firebase-admin-helper');

// sku → [dsProductId, ...] — auto-generated from products.js at build time
const SKU_TO_DS_IDS = require('./1on1-sku-map.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (cols[i] ?? '').trim(); });
    return obj;
  });
}

function splitCsvLine(line) {
  // Simple CSV split — handles quoted fields
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  result.push(cur.trim());
  return result;
}

function parseStock(val = '') {
  const v = val.toLowerCase().trim();
  if (v === 'in stock' || v === 'instock' || v === 'yes' || v === '1') return true;
  if (v === 'out of stock' || v === 'outofstock' || v === 'no' || v === '0') return false;
  const n = parseFloat(v);
  return !isNaN(n) ? n > 0 : true; // default: in stock if ambiguous
}

// ── GET: return last sync result from Firestore ───────────────────────────────

async function getLastSync(db) {
  const snap = await db.collection('sync_log')
    .where('type', '==', '1on1_stock_sync')
    .orderBy('ts', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return { ok: true, message: 'No sync has run yet.' };
  return snap.docs[0].data();
}

// ── POST: run the sync ────────────────────────────────────────────────────────

async function runSync(db) {
  const feedUrl = process.env.ONEONE_STOCK_FEED_URL;
  if (!feedUrl) throw new Error('ONEONE_STOCK_FEED_URL env var not configured in Netlify.');

  // 1. Fetch feed
  const resp = await fetch(feedUrl, {
    headers: { 'User-Agent': 'DrippingSecrets/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) throw new Error(`Feed HTTP ${resp.status}: ${resp.statusText}`);
  const rawText = await resp.text();

  // 2. Parse
  const rows = parseCsv(rawText);
  if (!rows.length) throw new Error('Feed returned no parseable rows.');

  // 3. Detect columns
  const sampleKeys = Object.keys(rows[0]);
  const skuKey    = sampleKeys.find(k => /^(sku|code|product.?code|product.?id|id|ref)$/i.test(k));
  const nameKey   = sampleKeys.find(k => /^(name|title|product.?name)$/i.test(k));
  const stockKey  = sampleKeys.find(k => /^(stock)$/i.test(k)) || 'Stock';
  const levelKey  = sampleKeys.find(k => /^(stocklevel|quantity|qty|level|stock.?level)$/i.test(k)) || 'StockLevel';

  // 4. Build feed lookup: sku code → stockData
  const feedByCode = {};
  for (const row of rows) {
    const stockData = {
      inStock:    parseStock(row[stockKey]),
      stockLevel: parseFloat(row[levelKey]) || 0,
      rawStock:   row[stockKey],
    };

    // Index by SKU/code if column exists
    if (skuKey && row[skuKey]) {
      const code = row[skuKey].trim().toLowerCase();
      feedByCode[code] = stockData;
      // Also try without leading 'n' in case feed strips it
      feedByCode[code.replace(/^n/, '')] = stockData;
    }

    // Also index by name for fallback (stripped, lowercase)
    if (nameKey && row[nameKey]) {
      const norm = row[nameKey].toLowerCase().replace(/[^a-z0-9]/g, '');
      feedByCode[`name:${norm}`] = stockData;
    }
  }

  // 5. Match DS products → update Firestore
  const batch = db.batch();
  let matched = 0, updated = 0, notFound = 0;

  for (const [sku, dsIds] of Object.entries(SKU_TO_DS_IDS)) {
    const skuNorm = sku.toLowerCase();
    const stockData = feedByCode[skuNorm]
      ?? feedByCode[skuNorm.replace(/^n/, '')]
      ?? null;

    if (!stockData) { notFound++; continue; }
    matched++;

    const idList = Array.isArray(dsIds) ? dsIds : [dsIds];
    for (const dsId of idList) {
      const ref = db.collection('products').doc(String(dsId));
      batch.set(ref, {
        sku,
        inStock:    stockData.inStock,
        stockLevel: stockData.stockLevel,
        lastSynced: new Date().toISOString(),
        source:     '1on1wholesale',
      }, { merge: true });
      updated++;
    }
  }

  await batch.commit();

  // 6. Log result
  const logEntry = {
    type:      '1on1_stock_sync',
    ts:        new Date().toISOString(),
    feedRows:  rows.length,
    matched,
    updated,
    notFound,
    skuTotal:  Object.keys(SKU_TO_DS_IDS).length,
  };
  await db.collection('sync_log').add(logEntry);

  return logEntry;
}

// ── Handler ──────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-DS-Admin-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  try {
    const db = getDb();

    if (event.httpMethod === 'GET') {
      const last = await getLastSync(db);
      return { statusCode: 200, headers, body: JSON.stringify(last) };
    }

    if (event.httpMethod === 'POST') {
      const result = await runSync(db);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ...result }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('[sync-1on1-stock]', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
