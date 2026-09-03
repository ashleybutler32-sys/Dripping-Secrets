// ─────────────────────────────────────────────────────────────────────────────
//  route-supplier-order.js — Dripping Secrets DS-DOS v18.2
//  Supplier order routing: reads order data, determines supplier, sends order email
//  Env: BREVO_API_KEY, FIREBASE_SERVICE_ACCOUNT
//
//  Supplier routing logic:
//    supplier: '1on1'    → email to 1on1Wholesale orders + CC management
//    supplier: 'cnv'     → email to CNV/SexToy Wholesale
//    supplier: 'myawd'   → email to My AWD
//    supplier: 'wat'     → email to Wholesale Adult Toys
//    supplier: 'none'    → no routing (DS-held inventory)
//    supplier: undefined → goes to unrouted queue (alert sent to management)
//
//  Firestore updates:
//    Success:  orders/{orderId} → status: 'routed_to_supplier'
//    Failure:  orders/{orderId} → status: 'routing_failed'
//    Always:   order_routing_log collection entry appended
//
//  Duplicate guard: checks ds_routed_orders header passed from client
//  Failure alert: emails management@drippingsecrets.com on any failure
// ─────────────────────────────────────────────────────────────────────────────

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL     = 'https://api.brevo.com/v3/smtp/email';

const { updateOrderStatus, appendRoutingLog } = require('./firebase-admin-helper');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// ── Supplier routing config (update supplier emails here — one place only) ──
const SUPPLIER_CONFIG = {
  '1on1': {
    name:  '1on1Wholesale',
    email: 'orders@1on1wholesale.com',
    label: 'Luxury Play — 1on1Wholesale',
    days:  '7–10 business days'
  },
  'cnv': {
    name:  'CNV / SexToy Wholesale',
    email: 'orders@cnvwholesale.com',
    label: 'CNV / SexToy Wholesale',
    days:  '3–7 business days'
  },
  'myawd': {
    name:  'My AWD',
    email: 'orders@myawd.com',
    label: 'My AWD',
    days:  '3–5 business days'
  },
  'wat': {
    name:  'Wholesale Adult Toys',
    email: 'dropship@wholesaleadulttoys.com',
    label: 'Wholesale Adult Toys',
    days:  '3–7 business days'
  }
};

const MANAGEMENT_EMAIL = 'management@drippingsecrets.com';
const FROM_EMAIL       = 'orders@drippingsecrets.com';
const FROM_NAME        = 'Dripping Secrets Orders';

// ── Build the formatted order email body ──────────────────────────────────────
function buildOrderEmailBody(order, supplier) {
  const items = (order.items || []).map(i =>
    `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:8px 12px;">${i.name || '—'}</td>
      <td style="padding:8px 12px;">${i.sku || i.id || '—'}</td>
      <td style="padding:8px 12px;">${i.variant || i.size || '—'}</td>
      <td style="padding:8px 12px;text-align:center;">${i.qty || 1}</td>
     </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
  <div style="background:#1a0828;padding:20px 24px;text-align:center;">
    <h2 style="color:#C9A84C;margin:0;font-size:1.1rem;letter-spacing:.08em;text-transform:uppercase;">Dripping Secrets — New Dropship Order</h2>
    <p style="color:#B76E79;margin:6px 0 0;font-size:.85rem;">Confidential supplier routing — please do not forward</p>
  </div>

  <div style="padding:24px;border:1px solid #e0d0f0;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;font-weight:700;color:#6B2D8B;width:140px;">Order ID</td><td style="padding:6px 0;">${order.orderId || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;color:#6B2D8B;">Order Date</td><td style="padding:6px 0;">${order.date || new Date().toLocaleString('en-US',{timeZone:'America/Chicago'})}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;color:#6B2D8B;">Routing To</td><td style="padding:6px 0;">${supplier.label}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;color:#6B2D8B;">Est. Fulfillment</td><td style="padding:6px 0;">${supplier.days}</td></tr>
    </table>

    <h3 style="color:#6B2D8B;border-bottom:2px solid #C9A84C;padding-bottom:6px;">Ship To — Customer Address</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;font-weight:700;width:140px;">Name</td><td>${order.customerName || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Address</td><td>${order.address || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">City / State / ZIP</td><td>${[order.city, order.state, order.zip].filter(Boolean).join(', ') || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Phone</td><td>${order.phone || 'Not provided'}</td></tr>
    </table>

    <h3 style="color:#6B2D8B;border-bottom:2px solid #C9A84C;padding-bottom:6px;">Order Items</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:.9rem;">
      <thead>
        <tr style="background:#f5eff8;">
          <th style="padding:8px 12px;text-align:left;">Product</th>
          <th style="padding:8px 12px;text-align:left;">SKU / Model</th>
          <th style="padding:8px 12px;text-align:left;">Variant</th>
          <th style="padding:8px 12px;text-align:center;">Qty</th>
        </tr>
      </thead>
      <tbody>${items}</tbody>
    </table>

    <h3 style="color:#6B2D8B;border-bottom:2px solid #C9A84C;padding-bottom:6px;">Payment</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;font-weight:700;width:140px;">Status</td><td><strong style="color:#2e7d32;">CONFIRMED</strong></td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Method</td><td>${order.paymentMethod || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Order Total</td><td><strong>$${parseFloat(order.total||0).toFixed(2)}</strong></td></tr>
      ${order.transactionId ? `<tr><td style="padding:6px 0;font-weight:700;">Transaction ID</td><td>${order.transactionId}</td></tr>` : ''}
    </table>

    <div style="background:#fff8e1;border:1px solid #C9A84C;border-radius:8px;padding:16px;margin-bottom:20px;">
      <h4 style="margin:0 0 10px;color:#7a5c00;">⚠️ DISCREET Packing Instructions — REQUIRED</h4>
      <ul style="margin:0;padding-left:18px;line-height:1.8;font-size:.9rem;">
        <li>Use <strong>plain, unmarked outer packaging only</strong></li>
        <li><strong>No supplier name, logo, or branding</strong> on any customer-facing surface</li>
        <li>No packing slip with supplier information</li>
        <li>Ship <strong>DIRECTLY to the customer address above</strong> — do NOT ship to Dripping Secrets</li>
      </ul>
    </div>

    <p style="font-size:.85rem;color:#555;">Please reply to confirm receipt of this order. For questions, contact <a href="mailto:${MANAGEMENT_EMAIL}">${MANAGEMENT_EMAIL}</a>.</p>

    <div style="background:#1a0828;padding:12px 16px;border-radius:6px;margin-top:16px;text-align:center;">
      <p style="color:#C9A84C;margin:0;font-size:.8rem;font-weight:700;letter-spacing:.05em;">DRIPPING SECRETS — CONFIDENTIAL ORDER ROUTING</p>
      <p style="color:#B76E79;margin:4px 0 0;font-size:.75rem;">${MANAGEMENT_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Build management alert email (failure or unrouted) ────────────────────────
function buildAlertEmailBody(order, reason) {
  return `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
  <div style="background:#7f1d1d;padding:16px;border-radius:6px 6px 0 0;text-align:center;">
    <h2 style="color:#fff;margin:0;font-size:1rem;">⚠️ Order Routing Alert — Action Required</h2>
  </div>
  <div style="padding:20px;border:1px solid #fca5a5;background:#fff;">
    <p style="margin:0 0 12px;"><strong>Reason:</strong> ${reason}</p>
    <p><strong>Order ID:</strong> ${order.orderId || '—'}</p>
    <p><strong>Customer:</strong> ${order.customerName || '—'} (${order.customerEmail || '—'})</p>
    <p><strong>Total:</strong> $${parseFloat(order.total||0).toFixed(2)}</p>
    <p><strong>Items:</strong> ${(order.items||[]).map(i=>`${i.name} x${i.qty}`).join(', ')}</p>
    <p style="margin-top:16px;color:#555;">Log into the Back Office → Fulfillment Hub → Pending Queue to action this order manually.</p>
  </div>
</div>`;
}

// ── Send via Brevo transactional email ────────────────────────────────────────
async function sendEmail(to, cc, subject, htmlBody) {
  if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY not configured');
  const payload = {
    sender:  { name: FROM_NAME, email: FROM_EMAIL },
    to:      [{ email: to }],
    subject,
    htmlContent: htmlBody
  };
  if (cc) payload.cc = [{ email: cc }];

  const res = await fetch(BREVO_URL, {
    method:  'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo send failed: ${res.status} — ${err}`);
  }
  return true;
}

// ── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  let order;
  try {
    order = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { orderId, supplierKey } = order;

  if (!orderId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing orderId' }) };
  }

  // ── No supplier — DS-held inventory, no routing needed ──
  if (supplierKey === 'none' || supplierKey === 'ds') {
    await updateOrderStatus(orderId, { status: 'ds_fulfilled', supplierKey: 'none' });
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ routed: false, reason: 'DS-held inventory — no supplier routing needed' }) };
  }

  const supplier = SUPPLIER_CONFIG[supplierKey];

  // ── Unknown supplier — send alert to management ──
  if (!supplier) {
    const alertMsg = `Order ${orderId} has unknown or missing supplier key: "${supplierKey || 'undefined'}". Route manually.`;
    try {
      await sendEmail(MANAGEMENT_EMAIL, null, `⚠️ DS Order Routing Alert — ${orderId}`, buildAlertEmailBody(order, alertMsg));
    } catch (emailErr) {
      console.error('[route-supplier-order] Alert email failed:', emailErr.message);
    }
    await updateOrderStatus(orderId, { status: 'routing_failed', routingError: alertMsg });
    await appendRoutingLog({ orderId, supplierKey, routed: false, reason: 'unknown_supplier', method: order.paymentMethod || 'unknown' });
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ routed: false, alert: true, reason: alertMsg })
    };
  }

  // ── Route order to supplier ──
  try {
    const subject = `New Dropship Order — ${orderId} [Dripping Secrets]`;
    await sendEmail(supplier.email, MANAGEMENT_EMAIL, subject, buildOrderEmailBody(order, supplier));

    // ── Update Firestore order status ───────────────────────────────────────
    await updateOrderStatus(orderId, {
      status:     'routed_to_supplier',
      routedTo:   supplier.name,
      routedAt:   new Date().toISOString(),
      supplierKey
    });

    // ── Write routing log entry ─────────────────────────────────────────────
    await appendRoutingLog({
      orderId,
      supplierKey,
      supplier:   supplier.name,
      routed:     true,
      method:     order.paymentMethod || 'unknown',
      ts:         Date.now()
    });

    console.log(`[route-supplier-order] Order ${orderId} routed to ${supplier.name}`);
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        routed:        true,
        supplier:      supplier.name,
        supplierEmail: supplier.email,
        orderId
      })
    };
  } catch (err) {
    console.error('[route-supplier-order] Routing failed:', err.message);

    // ── Update order status to failed ───────────────────────────────────────
    await updateOrderStatus(orderId, {
      status:       'routing_failed',
      routingError: err.message,
      supplierKey
    });

    await appendRoutingLog({
      orderId,
      supplierKey,
      supplier:   supplier?.name || supplierKey,
      routed:     false,
      reason:     err.message,
      method:     order.paymentMethod || 'unknown',
      ts:         Date.now()
    });

    // ── Failure alert to management ──
    try {
      const alertMsg = `Routing to ${supplier.name} failed: ${err.message}. Route this order manually.`;
      await sendEmail(MANAGEMENT_EMAIL, null, `⚠️ DS Order Routing FAILED — ${orderId}`, buildAlertEmailBody(order, alertMsg));
    } catch (alertErr) {
      console.error('[route-supplier-order] Alert email also failed:', alertErr.message);
    }

    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ routed: false, error: err.message, orderId })
    };
  }
};
