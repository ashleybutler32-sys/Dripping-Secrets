/* ============================================================
   analytics.js — Dripping Secrets Back Office Analytics
   BK-16 | v16.4 | Executive Intelligence Dashboard
   ============================================================ */

(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────── */
  let _charts   = {};
  let _period   = 30;   // default 30-day window
  let _loaded   = false;

  /* ── Colour palette ───────────────────────────────────────── */
  const C = {
    plum   : '#4B1F5F',
    gold   : '#D4AF37',
    pink   : '#B76E79',
    teal   : '#5BBFBF',
    green  : '#4CAF50',
    purple : '#7B5EA7',
    muted  : 'rgba(255,255,255,.35)',
    border : 'rgba(255,255,255,.08)',
  };

  /* ── Helpers ──────────────────────────────────────────────── */
  function fmt(n)   { return Number(n||0).toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:0}); }
  function fmtN(n)  { return Number(n||0).toLocaleString('en-US'); }
  function $id(id)  { return document.getElementById(id); }
  function safe(v,f){ try{ return f(v); }catch(_){ return 0; } }

  function daysBefore(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0,0,0,0);
    return d;
  }

  function destroyChart(key) {
    if (_charts[key]) { try { _charts[key].destroy(); } catch(_){} _charts[key] = null; }
  }

  function buildChart(id, type, data, opts) {
    destroyChart(id);
    const el = $id(id);
    if (!el) return;
    _charts[id] = new Chart(el, { type, data, options: Object.assign({ responsive:true, maintainAspectRatio:false }, opts||{}) });
  }

  /* ── Period selector ──────────────────────────────────────── */
  function setPeriod(n, btn) {
    _period = n;
    document.querySelectorAll('.an-period-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    runAnalytics();
  }
  window.anSetPeriod = setPeriod;

  /* ── Main loader ──────────────────────────────────────────── */
  async function loadAnalytics() {
    if (!window.firebase || !window.firebase.firestore) {
      showAnalyticsError('Firebase not ready. Please refresh.');
      return;
    }

    // Show skeleton
    showAnalyticsSkeleton();

    try {
      await runAnalytics();
      _loaded = true;
    } catch (err) {
      console.error('[Analytics]', err);
      showAnalyticsError('Could not load analytics data. Check your connection.');
    }
  }
  window.loadAnalytics = loadAnalytics;

  async function runAnalytics() {
    const db     = firebase.firestore();
    const cutoff = daysBefore(_period);

    /* ── Fetch all collections in parallel ───────────────────── */
    const [ordersSnap, customersSnap, partiesSnap, productsSnap, notifSnap] = await Promise.all([
      db.collection('orders').orderBy('createdAt','desc').limit(500).get().catch(()=>({docs:[]})),
      db.collection('customers').get().catch(()=>({docs:[]})),
      db.collection('events').get().catch(()=>({docs:[]})),
      db.collection('products').get().catch(()=>({docs:[]})),
      db.collection('notifications').orderBy('createdAt','desc').limit(20).get().catch(()=>({docs:[]})),
    ]);

    const orders    = ordersSnap.docs.map(d => ({id:d.id,...d.data()}));
    const customers = customersSnap.docs.map(d => ({id:d.id,...d.data()}));
    const parties   = partiesSnap.docs.map(d => ({id:d.id,...d.data()}));
    const products  = productsSnap.docs.map(d => ({id:d.id,...d.data()}));

    /* ── Filter to period ────────────────────────────────────── */
    const periodOrders = orders.filter(o => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      return ts && ts >= cutoff;
    });

    /* ── KPI calculations ────────────────────────────────────── */
    const totalRev  = periodOrders.reduce((s,o) => s + safe(o, x => parseFloat(x.total||x.amount||0)), 0);
    const totalOrd  = periodOrders.length;
    const aov       = totalOrd ? totalRev / totalOrd : 0;
    const pending   = periodOrders.filter(o => (o.status||'').toLowerCase() === 'pending').length;
    const fulfilled = periodOrders.filter(o => ['fulfilled','delivered','shipped','complete','completed'].includes((o.status||'').toLowerCase())).length;

    // Revenue by time buckets
    const todayCutoff = daysBefore(1);
    const weekCutoff  = daysBefore(7);
    const revToday = orders.filter(o => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      return ts && ts >= todayCutoff;
    }).reduce((s,o) => s + safe(o, x => parseFloat(x.total||x.amount||0)), 0);
    const revWeek = orders.filter(o => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      return ts && ts >= weekCutoff;
    }).reduce((s,o) => s + safe(o, x => parseFloat(x.total||x.amount||0)), 0);
    const revMonth = orders.filter(o => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      return ts && ts >= daysBefore(30);
    }).reduce((s,o) => s + safe(o, x => parseFloat(x.total||x.amount||0)), 0);

    // New customers in period
    const newCusts = customers.filter(c => {
      const ts = c.createdAt?.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
      return ts && ts >= cutoff;
    }).length;

    // Top products by order count
    const productMap = {};
    periodOrders.forEach(o => {
      const items = o.items || o.products || o.cart || [];
      (Array.isArray(items) ? items : []).forEach(it => {
        const name = it.name || it.title || it.productName || 'Unknown';
        productMap[name] = (productMap[name]||0) + (it.quantity||1);
      });
    });
    const topProducts = Object.entries(productMap).sort((a,b)=>b[1]-a[1]).slice(0,6);

    // Orders by status
    const statusMap = {};
    periodOrders.forEach(o => {
      const s = (o.status||'Unknown').charAt(0).toUpperCase() + (o.status||'Unknown').slice(1);
      statusMap[s] = (statusMap[s]||0)+1;
    });

    // Supplier breakdown (admin-only view)
    const supplierMap = {};
    periodOrders.forEach(o => {
      const sup = o.supplier || o.source || 'Direct';
      supplierMap[sup] = (supplierMap[sup]||0) + safe(o, x => parseFloat(x.total||x.amount||0));
    });

    // Daily revenue for chart (last _period days)
    const dayRevMap = {};
    for (let i = _period-1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
      const key = d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      dayRevMap[key] = 0;
    }
    periodOrders.forEach(o => {
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      if (!ts) return;
      const key = ts.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      if (dayRevMap[key] !== undefined) dayRevMap[key] += safe(o, x => parseFloat(x.total||x.amount||0));
    });

    // Party/event revenue
    const eventRev = parties.reduce((s,p) => s + safe(p, x => parseFloat(x.depositAmount||x.total||0)), 0);
    const eventCnt = parties.length;

    /* ── Render KPIs ─────────────────────────────────────────── */
    renderKPIs({ totalRev, totalOrd, aov, pending, fulfilled, newCusts, eventRev, eventCnt, revToday, revWeek, revMonth, totalCusts: customers.length });

    /* ── Render Charts ───────────────────────────────────────── */
    renderRevenueChart(dayRevMap);
    renderStatusChart(statusMap);
    renderTopProductsChart(topProducts);
    renderSupplierChart(supplierMap);

    /* ── Render Recent Orders Table ──────────────────────────── */
    renderRecentOrders(orders.slice(0,10));

    /* ── Render Customer Metrics ─────────────────────────────── */
    renderCustomerMetrics(customers, orders);

    /* ── Render Notifications Feed ───────────────────────────── */
    renderNotifFeed(notifSnap.docs);
  }

  /* ── KPI Cards ────────────────────────────────────────────── */
  function renderKPIs(k) {
    const el = $id('an-kpi-row');
    if (!el) return;
    el.innerHTML = `
      <div class="an-kpi-card an-pink">
        <div class="an-kpi-label">Revenue (${_period}d)</div>
        <div class="an-kpi-val">${fmt(k.totalRev)}</div>
        <div class="an-kpi-sub">${fmtN(k.totalOrd)} orders · Avg ${fmt(k.aov)}</div>
      </div>
      <div class="an-kpi-card an-teal">
        <div class="an-kpi-label">Today</div>
        <div class="an-kpi-val">${fmt(k.revToday)}</div>
        <div class="an-kpi-sub">7-day: ${fmt(k.revWeek)}</div>
      </div>
      <div class="an-kpi-card an-gold">
        <div class="an-kpi-label">This Month</div>
        <div class="an-kpi-val">${fmt(k.revMonth)}</div>
        <div class="an-kpi-sub">Pending orders: ${k.pending}</div>
      </div>
      <div class="an-kpi-card an-purple">
        <div class="an-kpi-label">Customers</div>
        <div class="an-kpi-val">${fmtN(k.totalCusts)}</div>
        <div class="an-kpi-sub">+${k.newCusts} new this period</div>
      </div>
      <div class="an-kpi-card an-green">
        <div class="an-kpi-label">Events Booked</div>
        <div class="an-kpi-val">${fmtN(k.eventCnt)}</div>
        <div class="an-kpi-sub">Deposit total: ${fmt(k.eventRev)}</div>
      </div>
      <div class="an-kpi-card" style="border-color:rgba(183,110,121,.3)">
        <div class="an-kpi-label">Fulfillment Rate</div>
        <div class="an-kpi-val">${k.totalOrd ? Math.round(k.fulfilled/k.totalOrd*100) : 0}%</div>
        <div class="an-kpi-sub">${k.fulfilled} fulfilled · ${k.pending} pending</div>
      </div>`;

    // Revenue summary row (existing elements)
    if($id('revToday'))  $id('revToday').textContent  = fmt(k.revToday);
    if($id('revWeek'))   $id('revWeek').textContent   = fmt(k.revWeek);
    if($id('revMonth'))  $id('revMonth').textContent  = fmt(k.revMonth);
  }

  /* ── Charts ───────────────────────────────────────────────── */
  function renderRevenueChart(dayRevMap) {
    const labels = Object.keys(dayRevMap);
    const data   = Object.values(dayRevMap);
    buildChart('revenueChart', 'bar', {
      labels,
      datasets:[{ label:'Revenue', data, backgroundColor: labels.map((_,i)=> `rgba(212,175,55,${0.5+0.5*(data[i]/Math.max(...data,1))})`), borderColor: C.gold, borderWidth:1, borderRadius:5 }]
    }, {
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => fmt(ctx.raw) } } },
      scales:{ x:{ ticks:{ color:C.muted, font:{size:9} }, grid:{ color:C.border } }, y:{ ticks:{ color:C.muted, callback: v=>fmt(v) }, grid:{ color:C.border } } }
    });
  }

  function renderStatusChart(statusMap) {
    const labels = Object.keys(statusMap);
    const data   = Object.values(statusMap);
    const colors = [C.gold, C.pink, C.teal, C.green, C.purple, '#F59E0B', '#6B7280'];
    buildChart('statusChart', 'doughnut', {
      labels,
      datasets:[{ data, backgroundColor: colors.slice(0, labels.length), borderColor:'#1a0a24', borderWidth:2 }]
    }, {
      plugins:{ legend:{ position:'bottom', labels:{ color:C.muted, boxWidth:12, font:{size:10} } } },
      cutout:'65%'
    });
  }

  function renderTopProductsChart(topProducts) {
    if (!topProducts.length) {
      buildChart('topProductsChart','bar',{ labels:['No data'], datasets:[{ data:[0], backgroundColor:C.purple }] },{});
      return;
    }
    buildChart('topProductsChart','bar',{
      labels: topProducts.map(([n])=> n.length>22 ? n.slice(0,22)+'…' : n),
      datasets:[{ label:'Units Sold', data: topProducts.map(([,v])=>v), backgroundColor: C.pink, borderColor:'rgba(183,110,121,.4)', borderWidth:1, borderRadius:4 }]
    },{
      indexAxis:'y',
      plugins:{ legend:{ display:false } },
      scales:{ x:{ ticks:{ color:C.muted }, grid:{ color:C.border } }, y:{ ticks:{ color:C.muted, font:{size:10} }, grid:{ color:C.border } } }
    });
  }

  function renderSupplierChart(supplierMap) {
    const labels = Object.keys(supplierMap);
    const data   = Object.values(supplierMap);
    const colors = [C.teal, C.purple, C.gold, C.pink, C.green];
    buildChart('supplierChart','doughnut',{
      labels,
      datasets:[{ data, backgroundColor: colors.slice(0,labels.length), borderColor:'#1a0a24', borderWidth:2 }]
    },{
      plugins:{ legend:{ position:'bottom', labels:{ color:C.muted, boxWidth:12, font:{size:10} } }, tooltip:{ callbacks:{ label: ctx => `${ctx.label}: ${fmt(ctx.raw)}` } } },
      cutout:'60%'
    });
  }

  /* ── Recent Orders Table ──────────────────────────────────── */
  function renderRecentOrders(orders) {
    const el = $id('an-recent-tbody');
    if (!el) return;
    if (!orders.length) {
      el.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted)">No orders yet.</td></tr>`;
      return;
    }
    el.innerHTML = orders.map(o => {
      const ts  = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      const d   = ts ? ts.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—';
      const st  = o.status || 'unknown';
      const cls = st === 'pending' ? 'badge-wait' : st.startsWith('ful')||st==='delivered' ? 'badge-ready' : 'badge-soon';
      return `<tr style="border-bottom:1px solid rgba(255,255,255,.05)">
        <td style="padding:10px 8px;font-size:.82rem;color:var(--muted)">${d}</td>
        <td style="padding:10px 8px;font-size:.82rem">${o.customerName||o.name||'Guest'}</td>
        <td style="padding:10px 8px;font-size:.82rem">${o.customerEmail||o.email||'—'}</td>
        <td style="padding:10px 8px;font-size:.82rem;color:var(--gold)">${fmt(o.total||o.amount||0)}</td>
        <td style="padding:10px 8px"><span class="do-badge ${cls}" style="font-size:.72rem;padding:2px 8px;border-radius:99px">${st}</span></td>
        <td style="padding:10px 8px;font-size:.82rem;color:var(--muted)">${o.paymentMethod||'—'}</td>
      </tr>`;
    }).join('');
  }

  /* ── Customer Metrics ─────────────────────────────────────── */
  function renderCustomerMetrics(customers, orders) {
    const el = $id('an-customer-metrics');
    if (!el) return;

    // Repeat customers
    const custOrderMap = {};
    orders.forEach(o => {
      const e = o.customerEmail || o.email;
      if (e) custOrderMap[e] = (custOrderMap[e]||0) + 1;
    });
    const repeatCount  = Object.values(custOrderMap).filter(n => n > 1).length;
    const uniqueBuyers = Object.keys(custOrderMap).length;
    const retentionPct = uniqueBuyers ? Math.round(repeatCount/uniqueBuyers*100) : 0;

    // Top spenders
    const spendMap = {};
    orders.forEach(o => {
      const e = o.customerEmail || o.email;
      if (e) spendMap[e] = (spendMap[e]||0) + parseFloat(o.total||o.amount||0);
    });
    const topSpenders = Object.entries(spendMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">
        <div class="an-mini-card"><div class="an-mini-label">Total Customers</div><div class="an-mini-val">${fmtN(customers.length)}</div></div>
        <div class="an-mini-card"><div class="an-mini-label">Repeat Buyers</div><div class="an-mini-val">${fmtN(repeatCount)}</div></div>
        <div class="an-mini-card"><div class="an-mini-label">Retention Rate</div><div class="an-mini-val">${retentionPct}%</div></div>
      </div>
      <h4 style="margin:0 0 10px;font-size:.85rem;color:var(--gold)">Top Spenders</h4>
      ${topSpenders.length ? topSpenders.map(([e,v],i)=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <span style="font-size:.82rem;color:var(--muted)">${i+1}. ${e}</span>
          <span style="font-size:.85rem;font-weight:700;color:var(--gold)">${fmt(v)}</span>
        </div>`).join('') : `<div style="color:var(--muted);font-size:.82rem;padding:10px 0">No purchase data yet.</div>`}`;
  }

  /* ── Notifications Feed ───────────────────────────────────── */
  function renderNotifFeed(docs) {
    const el = $id('an-notif-feed');
    if (!el) return;
    if (!docs.length) {
      el.innerHTML = `<div style="color:var(--muted);font-size:.82rem;padding:16px 0">No recent activity.</div>`;
      return;
    }
    el.innerHTML = docs.map(d => {
      const n  = d.data();
      const ts = n.createdAt?.toDate ? n.createdAt.toDate() : (n.createdAt ? new Date(n.createdAt) : new Date());
      const ago = timeAgo(ts);
      const icon = { order:'🛍️', booking:'🎉', support:'🎗️', payment:'💰', system:'⚙️', stock:'📦' }[n.type] || '🔔';
      return `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
        <span style="font-size:1.1rem">${icon}</span>
        <div>
          <div style="font-size:.84rem;font-weight:600">${n.message||'Notification'}</div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">${ago}</div>
        </div>
      </div>`;
    }).join('');
  }

  function timeAgo(date) {
    const sec = Math.round((Date.now() - date)/1000);
    if (sec < 60)   return 'just now';
    if (sec < 3600) return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400)return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  }

  /* ── Export CSV ───────────────────────────────────────────── */
  async function exportAnalyticsCSV() {
    if (!window.firebase) return;
    const db   = firebase.firestore();
    const snap = await db.collection('orders').orderBy('createdAt','desc').limit(1000).get();
    const rows = [['Date','Customer','Email','Total','Status','Payment','Items']];
    snap.docs.forEach(d => {
      const o  = d.data();
      const ts = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      const dateStr = ts ? ts.toLocaleDateString() : '';
      const items = (o.items||o.products||o.cart||[]).map(i=>i.name||i.title||'').filter(Boolean).join('; ');
      rows.push([dateStr, o.customerName||o.name||'Guest', o.customerEmail||o.email||'', o.total||o.amount||0, o.status||'', o.paymentMethod||'', items]);
    });
    const csv  = rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href:url, download:`DS-Analytics-${new Date().toISOString().slice(0,10)}.csv` });
    a.click(); URL.revokeObjectURL(url);
  }
  window.exportAnalyticsCSV = exportAnalyticsCSV;

  /* ── Skeleton / Error ─────────────────────────────────────── */
  function showAnalyticsSkeleton() {
    const kpi = $id('an-kpi-row');
    if (kpi) kpi.innerHTML = [1,2,3,4,5,6].map(()=>`<div class="an-kpi-card an-skeleton">&nbsp;</div>`).join('');
  }

  function showAnalyticsError(msg) {
    const kpi = $id('an-kpi-row');
    if (kpi) kpi.innerHTML = `<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--pink)">${msg}</div>`;
  }

})();
