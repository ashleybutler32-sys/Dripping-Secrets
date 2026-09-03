// ================================================================
// COMMAND CENTER — DS v9.82
// Read-only business intelligence for admin.
// Revenue · Orders · Products · Customers · Affiliates · Dimi
// ================================================================

(function () {
  'use strict';

  function d(n) { return '$' + (parseFloat(n) || 0).toFixed(2); }
  function n(v) { return (parseInt(v) || 0).toLocaleString(); }

  function periodStart(p) {
    const now = new Date();
    if (p === 'today') { const x = new Date(); x.setHours(0,0,0,0); return x; }
    if (p === 'week')  { const x = new Date(); x.setDate(x.getDate() - x.getDay()); x.setHours(0,0,0,0); return x; }
    if (p === 'month') { return new Date(now.getFullYear(), now.getMonth(), 1); }
    if (p === 'year')  { return new Date(now.getFullYear(), 0, 1); }
    return new Date(0);
  }

  async function fetchRevenue() {
    const snap = await firebase.firestore().collection('orders').get();
    const periods = { today: 0, week: 0, month: 0, year: 0 };
    const starts  = { today: periodStart('today'), week: periodStart('week'), month: periodStart('month'), year: periodStart('year') };
    snap.docs.forEach(doc => {
      const data  = doc.data();
      if (data.isTest || data.excludeFromAnalytics) return;
      const total = parseFloat(data.total || 0);
      const ts    = data.createdAt?.toDate?.() || new Date(0);
      if (ts >= starts.today) periods.today += total;
      if (ts >= starts.week)  periods.week  += total;
      if (ts >= starts.month) periods.month += total;
      if (ts >= starts.year)  periods.year  += total;
    });
    return periods;
  }

  async function fetchOrders() {
    const snap = await firebase.firestore().collection('orders').get();
    const counts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.isTest) return;
      const s = data.status || 'pending';
      if (s in counts) counts[s]++;
    });
    return counts;
  }

  async function fetchProducts() {
    const snap = await firebase.firestore().collection('orders').get();
    const map  = {};
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.isTest) return;
      (data.items || []).forEach(item => {
        if (!map[item.id]) map[item.id] = { id: item.id, name: item.name || 'Unknown', sold: 0, revenue: 0 };
        map[item.id].sold    += item.qty || 1;
        map[item.id].revenue += (item.price || 0) * (item.qty || 1);
      });
    });
    const list = Object.values(map).sort((a, b) => b.sold - a.sold);
    return { top: list.slice(0, 5), bottom: list.slice(-5).reverse() };
  }

  async function fetchCustomers() {
    const db   = firebase.firestore();
    const week = periodStart('week');
    try {
      const [custSnap, rewardsSnap] = await Promise.all([
        db.collection('customers').get(),
        db.collection('rewards').get()
      ]);
      let newW = 0, returning = 0;
      custSnap.docs.forEach(doc => {
        const data = doc.data();
        if (data.isTest) return;
        const ts = data.createdAt?.toDate?.() || new Date(0);
        if (ts >= week) newW++;
        if ((data.orderCount || 0) > 1) returning++;
      });
      const real = custSnap.docs.filter(d => !d.data().isTest).length;
      return { total: real, new: newW, returning, loyalty: rewardsSnap.size };
    } catch (_) {
      return { total: 0, new: 0, returning: 0, loyalty: 0 };
    }
  }

  async function fetchAffiliates() {
    const db = firebase.firestore();
    try {
      const [activeSnap, allSnap] = await Promise.all([
        db.collection('affiliates').where('status','==','approved').orderBy('totalRevenue','desc').limit(5).get(),
        db.collection('affiliates').where('status','==','approved').get()
      ]);
      return { top: activeSnap.docs.map(d => ({ username: d.id, ...d.data() })), total: allSnap.size };
    } catch (_) { return { top: [], total: 0 }; }
  }

  async function fetchDimi() {
    const db = firebase.firestore();
    try {
      const snap = await db.collection('dimi_conversations').limit(500).get();
      const qMap = {};
      snap.docs.forEach(doc => {
        (doc.data().messages || []).forEach(m => {
          if (m.role === 'user' && m.content) {
            const k = m.content.toLowerCase().trim().split(/\s+/).slice(0, 5).join(' ');
            qMap[k] = (qMap[k] || 0) + 1;
          }
        });
      });
      const topQ = Object.entries(qMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([q, c]) => ({ q, c }));
      return { conversations: snap.size, topQ };
    } catch (_) { return { conversations: 0, topQ: [] }; }
  }

  function statCard(label, value, color) {
    return `<div class="cc-stat-card"><div class="cc-stat-label">${label}</div><div class="cc-stat-value" style="color:${color||'#f0f0f0'}">${value}</div></div>`;
  }

  function row(label, cols) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;
      background:rgba(255,255,255,.025);border-radius:8px;margin-bottom:6px;flex-wrap:wrap;gap:8px">
      ${cols.map(c => `<span style="font-size:.82rem;color:${c.color||'rgba(255,255,255,.7)'}">${c.v}</span>`).join('')}
    </div>`;
  }

  async function render(container) {
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.4)">
      <div style="font-size:1.6rem;margin-bottom:10px">⚡</div>Loading Command Center…</div>`;
    try {
      const [rev, ord, prods, cust, aff, dimi] = await Promise.all([
        fetchRevenue(), fetchOrders(), fetchProducts(), fetchCustomers(), fetchAffiliates(), fetchDimi()
      ]);

      container.innerHTML = `
        <div class="cc-section">
          <div class="cc-section-title">Revenue</div>
          <div class="cc-stat-grid">
            ${statCard('Today',      d(rev.today), '#4ade80')}
            ${statCard('This Week',  d(rev.week),  '#60a5fa')}
            ${statCard('This Month', d(rev.month), '#B76E79')}
            ${statCard('This Year',  d(rev.year),  '#ffd700')}
          </div>
        </div>

        <div class="cc-section">
          <div class="cc-section-title">Orders</div>
          <div class="cc-stat-grid">
            ${Object.entries(ord).map(([s, c]) => statCard(s.charAt(0).toUpperCase()+s.slice(1), n(c))).join('')}
          </div>
        </div>

        <div class="cc-section">
          <div class="cc-section-title">Products</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
            <div>
              <div style="font-size:.72rem;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Top Sellers</div>
              ${prods.top.length
                ? prods.top.map((p, i) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,.025);border-radius:8px;margin-bottom:5px">
                    <div style="display:flex;gap:8px;align-items:center"><span style="color:#ffd700;font-weight:700;font-size:.76rem;min-width:16px">#${i+1}</span><span style="font-size:.8rem;color:rgba(255,255,255,.8)">${p.name}</span></div>
                    <span style="font-size:.8rem;font-weight:600;color:#4ade80">${n(p.sold)} sold</span></div>`).join('')
                : `<div style="color:rgba(255,255,255,.3);font-size:.8rem;padding:12px">No sales data yet.</div>`}
            </div>
            <div>
              <div style="font-size:.72rem;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Lowest Sellers</div>
              ${prods.bottom.length
                ? prods.bottom.map(p => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,.025);border-radius:8px;margin-bottom:5px">
                    <span style="font-size:.8rem;color:rgba(255,255,255,.6)">${p.name}</span>
                    <span style="font-size:.78rem;color:rgba(255,255,255,.35)">${n(p.sold)} sold</span></div>`).join('')
                : `<div style="color:rgba(255,255,255,.3);font-size:.8rem;padding:12px">No sales data yet.</div>`}
            </div>
          </div>
        </div>

        <div class="cc-section">
          <div class="cc-section-title">Customers</div>
          <div class="cc-stat-grid">
            ${statCard('Total',          n(cust.total),    '#f0f0f0')}
            ${statCard('New This Week',  n(cust.new),      '#4ade80')}
            ${statCard('Returning',      n(cust.returning),'#60a5fa')}
            ${statCard('Loyalty Members',n(cust.loyalty),  '#ffd700')}
          </div>
        </div>

        <div class="cc-section">
          <div class="cc-section-title">Affiliates <span style="font-size:.76rem;color:rgba(255,255,255,.3);font-weight:400">${n(aff.total)} active</span></div>
          <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden">
            ${aff.top.length
              ? aff.top.map((a, i) => `<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.04);flex-wrap:wrap;gap:8px">
                  <div style="display:flex;gap:8px"><span style="color:#ffd700;font-weight:700;font-size:.76rem;min-width:16px">#${i+1}</span><span style="font-size:.82rem;color:rgba(255,255,255,.8)">@${a.username}</span></div>
                  <div style="display:flex;gap:16px"><span style="font-size:.78rem;color:rgba(255,255,255,.45)">${n(a.totalSales)} sales</span><span style="font-size:.84rem;font-weight:600;color:#4ade80">${d(a.totalRevenue)}</span></div>
                </div>`).join('')
              : `<div style="text-align:center;padding:28px;color:rgba(255,255,255,.28);font-size:.82rem">No approved affiliates yet.</div>`}
          </div>
        </div>

        <div class="cc-section">
          <div class="cc-section-title">Dimi Intelligence</div>
          <div class="cc-stat-grid" style="margin-bottom:${dimi.topQ.length?'16px':'0'}">
            ${statCard('Conversations', n(dimi.conversations), '#c49adb')}
          </div>
          ${dimi.topQ.length ? `
            <div style="font-size:.72rem;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Top Questions</div>
            ${dimi.topQ.map(q => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,.025);border-radius:8px;margin-bottom:5px">
              <span style="font-size:.8rem;color:rgba(255,255,255,.7)">"${q.q}…"</span>
              <span style="font-size:.76rem;color:rgba(255,255,255,.35)">${n(q.c)}×</span></div>`).join('')}
          ` : ''}
        </div>

        <div style="text-align:right;margin-top:12px;font-size:.7rem;color:rgba(255,255,255,.2)">
          Read-only analytics · Refreshed ${new Date().toLocaleTimeString()}
          <button onclick="window.reloadCommandCenter()" style="margin-left:10px;background:none;border:1px solid rgba(255,255,255,.1);
            color:rgba(255,255,255,.35);border-radius:6px;padding:3px 10px;font-size:.7rem;cursor:pointer;font-family:inherit">↺ Refresh</button>
        </div>`;
    } catch (e) {
      container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.4)">
        <div style="font-size:1.6rem;margin-bottom:10px">⚠️</div>Could not load analytics. Check connection and retry.</div>`;
    }
  }

  window.DS_COMMAND = { render };
  window.reloadCommandCenter = () => {
    const el = document.getElementById('cc-content');
    if (el) render(el);
  };

})();
