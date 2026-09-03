// ─────────────────────────────────────────────────────────────────────────────
//  DIMI REAL-TIME ALERT FUNCTION
//  Netlify Serverless Function — replaces Tasklet webhook
//  Receives alert events from the website and sends SMS via Twilio
//
//  Env vars required (set in Netlify → Site Settings → Environment Variables):
//    TWILIO_ACCOUNT_SID   — from twilio.com console
//    TWILIO_AUTH_TOKEN    — from twilio.com console
//    TWILIO_FROM_NUMBER   — your Twilio phone number e.g. +12145551234
// ─────────────────────────────────────────────────────────────────────────────

const ASHLEY_NUMBERS = ['+14692009118', '+14693001412'];

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── Twilio SMS helper ─────────────────────────────────────────────────────────
async function sendSMS(to, body, sid, token, from) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || `Twilio error ${resp.status}`);
  return data;
}

async function broadcast(message, sid, token, from) {
  const results = await Promise.allSettled(
    ASHLEY_NUMBERS.map(num => sendSMS(num, message, sid, token, from))
  );
  return results;
}

// ── Alert message builders ─────────────────────────────────────────────────────
function buildMessage(type, data) {
  const ts = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true });
  switch (type) {
    case 'new_order':
      return `🛍️ NEW ORDER — ${ts}\nOrder #${data.orderId || 'N/A'}\nCustomer: ${data.customerName || 'Guest'}\nTotal: $${parseFloat(data.total || 0).toFixed(2)}\nPayment: ${data.paymentMethod || 'N/A'}\nCheck Back Office → Orders`;

    case 'low_stock':
      return `⚠️ LOW STOCK ALERT — ${ts}\n"${data.productName}" is down to ${data.qty} unit${data.qty === 1 ? '' : 's'} left.\nID: ${data.productId}\nUpdate qty in Back Office → Products`;

    case 'sold_out':
      return `🚫 SOLD OUT — ${ts}\n"${data.productName}" (ID ${data.productId}) just hit 0.\nIt's now hidden from the shop. Restock or mark discontinued in Back Office.`;

    case 'party_booking':
      return `🎉 SECRETS PARTY BOOKED — ${ts}\nBoss, we love to see it! Host: ${data.hostName || 'N/A'}\nDate: ${data.partyDate || 'TBD'}\nGuests: ${data.guestCount || 'N/A'}\nPackage: ${data.packageName || 'N/A'}\nCheck Back Office → Secrets Parties`;

    case 'payment_received':
      return `💰 PAYMENT RECEIVED — ${ts}\nOrder #${data.orderId || 'N/A'}\n$${parseFloat(data.amount || 0).toFixed(2)} via ${data.method || 'N/A'}\nTxn: ${data.transactionId || 'N/A'}\nStatus: Pending Verification`;

    case 'wishlist':
      return `💜 WISHLIST ACTIVITY — ${ts}\n"${data.productName}" added to wishlist by ${data.customerName || 'a customer'}.`;

    case 'product_request':
      return `📋 PRODUCT REQUEST — ${ts}\nCustomer: ${data.customerName || 'Guest'}\nRequested: "${data.productName || 'N/A'}"\nCheck Back Office → Product Requests`;

    default:
      return `🔔 DRIPPING SECRETS ALERT — ${ts}\n${data.message || JSON.stringify(data)}`;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  // If Twilio isn't configured yet — log but don't crash
  if (!sid || !token || !from) {
    console.warn('[dimi-alert] Twilio not configured — alert received but not sent:', event.body);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ success: false, reason: 'Twilio not configured — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER to Netlify env vars.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Normalize payload — handles both formats:
  //   New format:  { type, data: { customerName, ... } }
  //   cart.js fmt: { event_type, customer_name, product_name, qty_remaining, ... }
  let type = payload.type || payload.event_type;
  let data = payload.data || {};

  if (!payload.data && payload.event_type) {
    const { event_type, ...rest } = payload;
    data = {
      orderId:       rest.order_id       || rest.orderId,
      customerName:  rest.customer_name  || rest.customerName,
      total:         rest.total,
      amount:        rest.amount         || rest.total,
      paymentMethod: rest.payment_method || rest.paymentMethod,
      transactionId: rest.transaction_id || rest.transactionId,
      productName:   rest.product_name   || rest.productName,
      productId:     rest.product_id     || rest.productId,
      qty:           rest.qty_remaining  || rest.qty,
      hostName:      rest.host_name      || rest.hostName,
      partyDate:     rest.party_date     || rest.partyDate,
      guestCount:    rest.guest_count    || rest.guestCount,
      packageName:   rest.package_name   || rest.packageName,
      message:       rest.message,
      ...rest
    };
  }

  // Alias: cart.js sends 'out_of_stock', we handle as 'sold_out'
  if (type === 'out_of_stock') type = 'sold_out';

  if (!type) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing type' }) };

  const message = buildMessage(type, data);

  try {
    const results = await broadcast(message, sid, token, from);
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length === ASHLEY_NUMBERS.length) {
      throw new Error('All SMS sends failed');
    }
    console.log(`[dimi-alert] Sent "${type}" alert to ${ASHLEY_NUMBERS.length - failures.length}/${ASHLEY_NUMBERS.length} numbers`);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true, type, sent: ASHLEY_NUMBERS.length - failures.length }) };
  } catch (err) {
    console.error('[dimi-alert] Error:', err.message);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
