// ================================================================
// ADMIN TESTING — DS v9.77
// Creates isolated test data in Firestore.
// All test docs carry isTest:true, excludeFromAnalytics:true,
// excludeFromInventory:true — zero impact on real metrics.
// ================================================================

(function () {
  'use strict';

  function randId(len) {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r = '';
    for (let i = 0; i < (len || 8); i++) r += c[Math.floor(Math.random() * c.length)];
    return r;
  }

  function sampleProducts() {
    const all = window.PRODUCTS || window.DEFAULT_PRODUCTS || [];
    const pool = all.filter(p => p.inStock !== false);
    if (!pool.length) return [{ id: 1, name: 'Test Product', price: 49.99, qty: 1 }];
    const count = Math.floor(Math.random() * 3) + 1;
    const picks = pool.sort(() => Math.random() - .5).slice(0, count);
    return picks.map(p => ({ id: p.id, name: p.name, price: p.price, qty: 1 }));
  }

  async function generateTestOrder() {
    const db = firebase.firestore();
    const orderId = 'DS-TEST-' + randId(8);
    const items = sampleProducts();
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= 50 ? 0 : 7.99;
    const total = +(subtotal + shipping).toFixed(2);
    const fNames = ['Sophia','Mia','Zoe','Aria','Luna','Jade','Sky','Nova','Bri','Camille'];
    const lNames = ['Williams','Davis','Johnson','Brown','Taylor','Moore','Lee','Hall','Young','Allen'];
    const methods = ['cashapp','paypal','apple_pay'];
    const statuses = ['pending','processing','shipped'];
    const fn = fNames[Math.floor(Math.random() * fNames.length)];
    const ln = lNames[Math.floor(Math.random() * lNames.length)];

    const doc = {
      orderId,
      isTest: true,
      testLabel: 'TEST ORDER — Not a real sale',
      customer: {
        firstName: fn, lastName: ln,
        email: `test.${fn.toLowerCase()}@drippingsecrets-test.com`,
        phone: '555-000-' + String(Math.floor(Math.random() * 9000) + 1000)
      },
      shippingAddress: { line1: '123 Test Lane', city: 'Dallas', state: 'TX', zip: '75201', country: 'US' },
      items,
      subtotal: +subtotal.toFixed(2),
      shipping: +shipping.toFixed(2),
      total,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: 'admin_test_panel',
      excludeFromAnalytics: true,
      excludeFromInventory: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('orders').doc(orderId).set(doc);
    return doc;
  }

  async function generateTestCustomer() {
    const db = firebase.firestore();
    const custId = 'TEST-CUST-' + randId(8);
    const fNames = ['Aaliyah','Jasmine','Destiny','Heaven','Tiffany','Crystal','Sierra','Amber'];
    const lNames = ['Jackson','Robinson','Harris','Martin','Thompson','Garcia','Martinez','Anderson'];
    const fn = fNames[Math.floor(Math.random() * fNames.length)];
    const ln = lNames[Math.floor(Math.random() * lNames.length)];

    const doc = {
      uid: custId, isTest: true, testLabel: 'TEST CUSTOMER',
      firstName: fn, lastName: ln,
      email: `test.${fn.toLowerCase()}.${custId.slice(-4)}@drippingsecrets-test.com`,
      phone: '555-100-' + String(Math.floor(Math.random() * 9000) + 1000),
      totalSpent: +(Math.random() * 500).toFixed(2),
      orderCount: Math.floor(Math.random() * 10) + 1,
      excludeFromAnalytics: true,
      source: 'admin_test_panel',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('customers').doc(custId).set(doc);
    return doc;
  }

  async function generateTestReview() {
    const db = firebase.firestore();
    const all = window.PRODUCTS || window.DEFAULT_PRODUCTS || [];
    const pool = all.filter(p => p.inStock !== false);
    const product = pool.length ? pool[Math.floor(Math.random() * pool.length)] : { id: 1, name: 'Test Product' };
    const bodies = [
      'Absolutely love this! The quality exceeded my expectations.',
      'Fast shipping and discreet packaging. Will order again!',
      'A game changer. Highly recommend to anyone curious.',
      'Great product, exactly as described. Five stars!',
      'Beautifully made and worth every penny. Thank you DS!'
    ];
    const names = ['J.M.','T.W.','A.D.','K.L.','S.B.','M.R.'];
    const revId = 'TEST-REV-' + randId(8);

    const doc = {
      reviewId: revId, isTest: true, testLabel: 'TEST REVIEW',
      productId: product.id, productName: product.name,
      rating: Math.floor(Math.random() * 2) + 4,
      body: bodies[Math.floor(Math.random() * bodies.length)],
      displayName: names[Math.floor(Math.random() * names.length)],
      verified: false, excludeFromAnalytics: true,
      source: 'admin_test_panel',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection('reviews').doc(revId).set(doc);
    return doc;
  }

  async function deleteAllTestData() {
    const db = firebase.firestore();
    let deleted = 0;
    for (const col of ['orders', 'customers', 'reviews']) {
      const snap = await db.collection(col).where('isTest', '==', true).get();
      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach(d => { batch.delete(d.ref); deleted++; });
        await batch.commit();
      }
    }
    return deleted;
  }

  async function loadTestSummary() {
    const db = firebase.firestore();
    const [o, c, r] = await Promise.all([
      db.collection('orders').where('isTest', '==', true).get(),
      db.collection('customers').where('isTest', '==', true).get(),
      db.collection('reviews').where('isTest', '==', true).get()
    ]);
    return {
      orders: o.size, customers: c.size, reviews: r.size,
      orderDocs: o.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  }

  function appendLog(el, icon, msg, type) {
    if (!el) return;
    const colors = { success: '#4caf50', error: '#f44336', warning: '#ff9800', info: '#00bcd4' };
    const d = document.createElement('div');
    d.style.cssText = `padding:8px 12px;border-left:3px solid ${colors[type]||'#888'};background:rgba(0,0,0,.2);border-radius:0 6px 6px 0;font-size:.82rem;margin-bottom:6px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px`;
    d.innerHTML = `<span>${icon} ${msg}</span><span style="color:rgba(255,255,255,.3);font-size:.72rem;white-space:nowrap">${new Date().toLocaleTimeString()}</span>`;
    el.insertBefore(d, el.firstChild);
    el.style.display = 'block';
  }

  // ── Public UI Wiring ─────────────────────────────────────────

  window.generateTestOrder = async function () {
    const btn = document.getElementById('btn-gen-order');
    const log = document.getElementById('test-log');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    try {
      const o = await generateTestOrder();
      appendLog(log, '✅', `Order created: <strong>${o.orderId}</strong> · ${o.items.length} item(s) · $${o.total.toFixed(2)} · ${o.status}`, 'success');
      window.refreshTestSummary();
    } catch (e) {
      appendLog(log, '❌', `Failed: ${e.message}`, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Test Order'; }
    }
  };

  window.generateTestCustomer = async function () {
    const btn = document.getElementById('btn-gen-customer');
    const log = document.getElementById('test-log');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    try {
      const c = await generateTestCustomer();
      appendLog(log, '✅', `Customer created: <strong>${c.firstName} ${c.lastName}</strong> · ${c.email}`, 'success');
      window.refreshTestSummary();
    } catch (e) {
      appendLog(log, '❌', `Failed: ${e.message}`, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Test Customer'; }
    }
  };

  window.generateTestReview = async function () {
    const btn = document.getElementById('btn-gen-review');
    const log = document.getElementById('test-log');
    if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }
    try {
      const r = await generateTestReview();
      appendLog(log, '✅', `Review created: <strong>${r.reviewId}</strong> · ${r.productName} · ⭐${r.rating}`, 'success');
      window.refreshTestSummary();
    } catch (e) {
      appendLog(log, '❌', `Failed: ${e.message}`, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Test Review'; }
    }
  };

  window.deleteAllTestData = async function () {
    if (!confirm('Delete ALL test data from Firestore? This cannot be undone.')) return;
    const btn = document.getElementById('btn-del-test');
    const log = document.getElementById('test-log');
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
    try {
      const n = await deleteAllTestData();
      appendLog(log, '🗑️', `Deleted ${n} test document(s) from Firestore.`, 'warning');
      window.refreshTestSummary();
    } catch (e) {
      appendLog(log, '❌', `Delete failed: ${e.message}`, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Delete Test Data'; }
    }
  };

  window.refreshTestSummary = async function () {
    try {
      const s = await loadTestSummary();
      ['orders','customers','reviews'].forEach(k => {
        const el = document.getElementById(`test-stat-${k}`);
        if (el) el.textContent = s[k];
      });
      const tbody = document.getElementById('test-orders-tbody');
      if (tbody) {
        if (s.orderDocs.length) {
          tbody.innerHTML = s.orderDocs.slice(0, 20).map(o => `
            <tr>
              <td style="font-family:monospace;font-size:.78rem;color:var(--gold)">${o.orderId}</td>
              <td>${o.customer?.firstName || '—'} ${o.customer?.lastName || ''}</td>
              <td>$${(o.total || 0).toFixed(2)}</td>
              <td><span class="pill ${o.status}">${o.status || 'pending'}</span></td>
              <td>${o.paymentMethod || '—'}</td>
            </tr>`).join('');
        } else {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px">No test orders yet.</td></tr>';
        }
      }
    } catch (e) {}
  };

  // Auto-load when tab activates
  document.addEventListener('DOMContentLoaded', () => {
    const orig = window.switchTab;
    if (typeof orig === 'function') {
      window.switchTab = function (tab) {
        orig(tab);
        if (tab === 'testing') setTimeout(window.refreshTestSummary, 100);
      };
    }
  });

})();
