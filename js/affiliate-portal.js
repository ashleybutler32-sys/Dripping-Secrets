// ================================================================
// AFFILIATE PORTAL 2.0 — DS v9.81
// Dashboard · Referral Links · Profile · Tracking · Commissions
// Firestore: affiliates   |   10% commission rate   |   No payment automation
// ================================================================

(function () {
  'use strict';

  const BASE  = 'https://drippingsecrets.com';
  const RATE  = 0.10;

  // ── Referral Click Tracking ───────────────────────────────────

  function trackClick() {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (!ref) return;
    sessionStorage.setItem('ds_ref', ref);
    localStorage.setItem('ds_ref_src', ref);
    localStorage.setItem('ds_ref_ts', Date.now().toString());
    try {
      const today = new Date().toISOString().split('T')[0];
      firebase.firestore().collection('affiliates').doc(ref)
        .collection('clicks').doc(today)
        .set({ count: firebase.firestore.FieldValue.increment(1), last: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (_) {}
  }

  function attributeSale(orderId, total, email) {
    const ref = sessionStorage.getItem('ds_ref') || localStorage.getItem('ds_ref_src');
    if (!ref) return;
    sessionStorage.removeItem('ds_ref');
    try {
      const d = firebase.firestore();
      const commission = +(total * RATE).toFixed(2);
      d.collection('affiliates').doc(ref).collection('sales').doc(orderId).set({
        orderId, orderTotal: +total, commission, customerEmail: email || 'anon',
        status: 'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      d.collection('affiliates').doc(ref).set({
        totalSales:       firebase.firestore.FieldValue.increment(1),
        totalRevenue:     firebase.firestore.FieldValue.increment(+total),
        totalCommission:  firebase.firestore.FieldValue.increment(commission),
        pendingCommission:firebase.firestore.FieldValue.increment(commission)
      }, { merge: true });
    } catch (_) {}
  }

  // ── Affiliate Doc Helpers ─────────────────────────────────────

  function slug(email) { return (email || '').split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase(); }

  async function getOrCreate(user) {
    const d   = firebase.firestore();
    const un  = slug(user.email);
    const ref = d.collection('affiliates').doc(un);
    const s   = await ref.get();
    if (s.exists) return { username: un, ...s.data() };
    const doc = {
      username: un, uid: user.uid, email: user.email || '',
      displayName: user.displayName || '', status: 'pending',
      totalClicks: 0, totalReferrals: 0, totalSales: 0,
      totalRevenue: 0, totalCommission: 0, pendingCommission: 0, paidCommission: 0,
      commissionRate: RATE, bio: '', socialHandle: '',
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(doc);
    return { username: un, ...doc, isNew: true };
  }

  async function loadData(un) {
    const d  = firebase.firestore();
    const s  = await d.collection('affiliates').doc(un).get();
    if (!s.exists) return null;
    const data = s.data();
    const sales = await d.collection('affiliates').doc(un).collection('sales')
      .orderBy('createdAt', 'desc').limit(20).get();
    data.recentSales = sales.docs.map(d => ({ id: d.id, ...d.data() }));
    return data;
  }

  // ── Render ────────────────────────────────────────────────────

  async function renderPortal(container, user) {
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.45)">Loading your affiliate portal…</div>`;
    try {
      const aff = await getOrCreate(user);
      if (aff.isNew || aff.status === 'pending') {
        container.innerHTML = pendingHTML(aff); return;
      }
      if (aff.status === 'suspended') {
        container.innerHTML = suspendedHTML(); return;
      }
      const data = await loadData(aff.username);
      const link = `${BASE}/?ref=${aff.username}`;
      container.innerHTML = dashHTML(data || aff, link);

      window._affCopyLink = () => {
        navigator.clipboard.writeText(link).then(() => {
          const b = document.getElementById('aff-copy-btn');
          if (b) { b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy Link', 2000); }
        }).catch(() => prompt('Your referral link:', link));
      };

      window._affSaveProfile = async () => {
        const bio    = document.getElementById('aff-bio')?.value?.trim() || '';
        const handle = document.getElementById('aff-handle')?.value?.trim() || '';
        await firebase.firestore().collection('affiliates').doc(aff.username).update({ bio, socialHandle: handle });
        const msg = document.getElementById('aff-profile-saved');
        if (msg) { msg.style.display = 'block'; setTimeout(() => msg.style.display = 'none', 2500); }
      };
    } catch (_) {
      container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,.4)">Could not load portal. Please refresh.</div>`;
    }
  }

  function pendingHTML(aff) {
    return `<div style="text-align:center;padding:48px 24px;max-width:500px;margin:0 auto">
      <div style="font-size:2.4rem;margin-bottom:14px">⏳</div>
      <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.7rem;color:#fff;margin:0 0 10px">Application Received</h2>
      <p style="color:rgba(255,255,255,.6);font-size:.88rem;margin:0 0 20px;line-height:1.6">
        Your application is under review. We'll notify you within 24–48 hours — welcome to the DS family!
      </p>
      <div style="background:rgba(183,110,121,.08);border:1px solid rgba(183,110,121,.25);border-radius:12px;padding:18px;font-size:.83rem;color:rgba(255,255,255,.55)">
        <div><strong style="color:#B76E79">Username:</strong> @${aff.username}</div>
        <div style="margin-top:6px"><strong style="color:#B76E79">Commission:</strong> 10% on all referred sales</div>
      </div>
    </div>`;
  }

  function suspendedHTML() {
    return `<div style="text-align:center;padding:60px">
      <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
      <p style="color:rgba(255,255,255,.55);font-size:.9rem">Your affiliate account is currently suspended. Please contact us for more information.</p>
    </div>`;
  }

  function dashHTML(stats, link) {
    const sales = stats.recentSales || [];
    const stat  = (label, val, color) => `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px">
        <div style="font-size:.7rem;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">${label}</div>
        <div style="font-size:1.55rem;font-weight:700;color:${color};line-height:1">${val}</div>
      </div>`;
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px">
        ${stat('Clicks',         (stats.totalClicks||0).toLocaleString(),        '#60a5fa')}
        ${stat('Referrals',      (stats.totalReferrals||0).toLocaleString(),      '#a78bfa')}
        ${stat('Sales',          (stats.totalSales||0).toLocaleString(),          '#4ade80')}
        ${stat('Total Earned',   '$'+(stats.totalCommission||0).toFixed(2),      '#ffd700')}
        ${stat('Pending Payout', '$'+(stats.pendingCommission||0).toFixed(2),    '#f87171')}
      </div>

      <div style="background:rgba(75,31,95,.18);border:1px solid rgba(183,110,121,.28);border-radius:14px;padding:18px;margin-bottom:24px">
        <div style="font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Your Referral Link</div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <code style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:8px;
            padding:9px 13px;font-size:.8rem;color:#B76E79;word-break:break-all">${link}</code>
          <button id="aff-copy-btn" onclick="window._affCopyLink()" style="background:linear-gradient(135deg,#B76E79,#4B1F5F);
            border:none;border-radius:8px;color:#fff;padding:10px 16px;font-size:.8rem;font-weight:600;
            cursor:pointer;white-space:nowrap;font-family:inherit">Copy Link</button>
        </div>
        <p style="margin:8px 0 0;font-size:.72rem;color:rgba(255,255,255,.3)">Share this link to earn 10% commission on every sale you refer.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px">
          <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.1rem;color:#fff;margin:0 0 14px">Your Profile</h3>
          <label style="font-size:.75rem;color:rgba(255,255,255,.45);display:block;margin-bottom:4px">Bio</label>
          <textarea id="aff-bio" style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
            color:#fff;border-radius:8px;padding:9px 12px;font-size:.82rem;outline:none;font-family:inherit;resize:vertical;min-height:70px">${stats.bio||''}</textarea>
          <label style="font-size:.75rem;color:rgba(255,255,255,.45);display:block;margin:10px 0 4px">Social Handle</label>
          <input id="aff-handle" type="text" value="${stats.socialHandle||''}" placeholder="@yourhandle"
            style="width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;
            border-radius:8px;padding:9px 12px;font-size:.82rem;outline:none;font-family:inherit" />
          <button onclick="window._affSaveProfile()" style="margin-top:12px;background:rgba(183,110,121,.2);
            border:1px solid rgba(183,110,121,.35);color:#B76E79;border-radius:8px;padding:8px 16px;
            font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit">Save Profile</button>
          <div id="aff-profile-saved" style="display:none;color:#4ade80;font-size:.75rem;margin-top:6px">Saved!</div>
        </div>
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px">
          <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.1rem;color:#fff;margin:0 0 14px">Commission Summary</h3>
          ${[['Commission Rate','10%'],['Total Revenue Driven','$'+(stats.totalRevenue||0).toFixed(2)],['Total Earned','$'+(stats.totalCommission||0).toFixed(2)],['Pending Payout','$'+(stats.pendingCommission||0).toFixed(2)],['Paid Out','$'+(stats.paidCommission||0).toFixed(2)]].map(([l,v]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
              <span style="font-size:.8rem;color:rgba(255,255,255,.5)">${l}</span>
              <span style="font-size:.82rem;font-weight:600;color:#fff">${v}</span>
            </div>`).join('')}
          <p style="font-size:.7rem;color:rgba(255,255,255,.25);margin:10px 0 0">Payouts processed manually. No automated transfers.</p>
        </div>
      </div>

      <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.1rem;color:#fff;margin:0 0 12px">Recent Sales</h3>
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;overflow:hidden">
        ${sales.length
          ? sales.map(s => `<div style="display:flex;align-items:center;justify-content:space-between;
              padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.04);flex-wrap:wrap;gap:8px">
              <div>
                <div style="font-size:.8rem;color:rgba(255,255,255,.8)">Order #${s.id}</div>
                <div style="font-size:.7rem;color:rgba(255,255,255,.3)">${s.createdAt?.toDate?.().toLocaleDateString()||'—'}</div>
              </div>
              <div style="display:flex;gap:14px;align-items:center">
                <span style="font-size:.78rem;color:rgba(255,255,255,.45)">$${(s.orderTotal||0).toFixed(2)}</span>
                <span style="font-size:.84rem;font-weight:700;color:#4ade80">+$${(s.commission||0).toFixed(2)}</span>
                <span style="font-size:.7rem;padding:2px 8px;border-radius:20px;
                  background:${s.status==='paid'?'rgba(74,222,128,.12)':'rgba(251,191,36,.12)'};
                  color:${s.status==='paid'?'#4ade80':'#fbbf24'}">${s.status}</span>
              </div>
            </div>`).join('')
          : `<div style="text-align:center;padding:36px;color:rgba(255,255,255,.28);font-size:.83rem">No sales yet. Share your link to start earning!</div>`}
      </div>`;
  }

  // ── Public API ───────────────────────────────────────────────

  window.DS_AFF = { trackClick, attributeSale, renderPortal, getOrCreate, loadData };

  document.addEventListener('DOMContentLoaded', trackClick);

  document.addEventListener('dimi:success', () => {
    try {
      const oid   = sessionStorage.getItem('ds_last_order_id');
      const total = parseFloat(sessionStorage.getItem('ds_last_order_total') || '0');
      const email = firebase.auth().currentUser?.email || '';
      if (oid) attributeSale(oid, total, email);
    } catch (_) {}
  });

})();
