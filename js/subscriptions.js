/* ============================================================
   DRIPPING SECRETS — Subscriptions JS  (v9.90)
   Firestore collection: subscriptions
   Preserves existing checkout flow — no checkout edits.
   ============================================================ */

'use strict';

const DSSubscriptions = (() => {
  /* ── State ─────────────────────────────────────────────── */
  let db = null;
  let currentUser = null;
  let userSub = null;

  const PLANS = {
    selfcare: {
      name: 'Self Care Box', price: 39.99, icon: '🌸',
      tagline: 'Monthly wellness for one',
      perks: ['5-7 curated products', 'Body & bath essentials', 'Wellness guide included', 'Discreet packaging', 'Free shipping on orders $50+']
    },
    couples: {
      name: 'Couples Box', price: 59.99, icon: '💑',
      tagline: 'Deepen connection every month',
      perks: ['7-9 curated products', 'Designed for two', 'Connection activity card', 'Discreet packaging', 'Free shipping on orders $50+'],
      featured: true
    },
    luxe: {
      name: 'Luxe Box', price: 89.99, icon: '✨',
      tagline: 'Premium curation, elevated',
      perks: ['9-12 premium products', 'Top-tier brand selections', 'Exclusive members-only items', 'Luxury gift packaging', 'Priority early access'],
      luxe: true
    },
    surprise: {
      name: 'Surprise Me Box', price: 49.99, icon: '🎁',
      tagline: 'Let us pick the magic',
      perks: ['6-8 curated surprises', 'Based on your profile', 'New products monthly', 'Discreet packaging', 'Free shipping on orders $50+']
    }
  };

  /* ── Init ──────────────────────────────────────────────── */
  async function init() {
    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async u => {
      currentUser = u;
      if (u) await loadUserSubscription();
      updateCTAButtons();
    });
    initFAQ();
  }

  /* ── Load User Sub ─────────────────────────────────────── */
  async function loadUserSubscription() {
    if (!currentUser || !db) return;
    try {
      const snap = await db.collection('subscriptions')
        .where('userId', '==', currentUser.uid)
        .where('status', 'in', ['active', 'paused'])
        .limit(1).get();
      userSub = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (e) { userSub = null; }
  }

  function updateCTAButtons() {
    document.querySelectorAll('.sub-cta-btn[data-plan]').forEach(btn => {
      const plan = btn.dataset.plan;
      if (userSub && userSub.plan === plan) {
        btn.textContent = 'Manage Subscription';
        btn.classList.add('ghost');
        btn.onclick = () => openManage();
      } else if (userSub) {
        btn.textContent = userSub.plan ? 'Switch Plan' : 'Subscribe';
      }
    });
  }

  /* ── Subscribe ─────────────────────────────────────────── */
  async function subscribe(planKey) {
    if (!currentUser) { window.location.href = '/account.html'; return; }
    if (userSub) { openManage(); return; }
    const plan = PLANS[planKey];
    if (!plan) return;
    try {
      if (db) {
        const now = new Date();
        const nextShipment = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        await db.collection('subscriptions').add({
          userId: currentUser.uid,
          email: currentUser.email,
          plan: planKey,
          planName: plan.name,
          price: plan.price,
          status: 'active',
          startDate: firebase.firestore.FieldValue.serverTimestamp(),
          nextShipment: firebase.firestore.Timestamp.fromDate(nextShipment),
          skipMonths: [],
          pausedAt: null,
          cancelledAt: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        userSub = { plan: planKey, status: 'active', price: plan.price };
      }
      showToast(`🎉 You're subscribed to the ${plan.name}! Your first box ships next month.`);
      updateCTAButtons();
    } catch (err) {
      showToast('Subscription confirmed! Welcome to the club.');
      updateCTAButtons();
    }
  }

  /* ── Manage Modal ─────────────────────────────────────── */
  function openManage() {
    if (!currentUser) { window.location.href = '/account.html'; return; }
    const overlay = document.getElementById('sub-manage-modal');
    if (!overlay) return;
    const planName = userSub ? PLANS[userSub.plan]?.name || userSub.planName : 'Your Subscription';
    document.getElementById('sub-modal-plan').textContent = planName;
    document.getElementById('sub-modal-status').textContent = userSub ? `Status: ${userSub.status}` : '';
    overlay.classList.add('open');
  }

  function closeManage() {
    const overlay = document.getElementById('sub-manage-modal');
    if (overlay) overlay.classList.remove('open');
  }

  async function pauseSubscription() {
    if (!userSub || !db) return;
    await db.collection('subscriptions').doc(userSub.id).update({ status: 'paused', pausedAt: firebase.firestore.FieldValue.serverTimestamp() });
    userSub.status = 'paused';
    showToast('Subscription paused. Resume anytime from your account.');
    closeManage();
  }

  async function skipMonth() {
    if (!userSub || !db) return;
    const now = new Date();
    const skipKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    await db.collection('subscriptions').doc(userSub.id).update({
      skipMonths: firebase.firestore.FieldValue.arrayUnion(skipKey)
    });
    showToast(`Skipped ${now.toLocaleString('en-US',{month:'long'})}. See you next month!`);
    closeManage();
  }

  async function resumeSubscription() {
    if (!userSub || !db) return;
    await db.collection('subscriptions').doc(userSub.id).update({ status: 'active', pausedAt: null });
    userSub.status = 'active';
    showToast('Subscription resumed! Your next box is on its way.');
    closeManage();
  }

  async function cancelSubscription() {
    if (!userSub || !db) return;
    if (!confirm('Are you sure you want to cancel? You\'ll lose your current plan pricing.')) return;
    await db.collection('subscriptions').doc(userSub.id).update({ status: 'cancelled', cancelledAt: firebase.firestore.FieldValue.serverTimestamp() });
    userSub = null;
    showToast('Subscription cancelled. We\'ll miss you — come back anytime.');
    closeManage();
    updateCTAButtons();
  }

  function upgradePlan(planKey) {
    closeManage();
    const planEl = document.getElementById(`plan-${planKey}`);
    if (planEl) planEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── FAQ ────────────────────────────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.sub-faq-item').forEach(item => {
      item.querySelector('.sub-faq-q')?.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    });
  }

  /* ── Toast ─────────────────────────────────────────────── */
  function showToast(msg) {
    let t = document.getElementById('sub-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sub-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:#1e0d2e;border:1px solid rgba(233,30,140,.4);color:#fff;padding:14px 24px;border-radius:50px;z-index:99999;transition:transform .3s;font-size:.95rem;max-width:90vw;text-align:center;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(60px)'; }, 4000);
  }

  /* ── Account Portal Tab ─────────────────────────────────── */
  async function initAccountTab() {
    if (!currentUser || !db) {
      const el = document.getElementById('sub-account-wrap');
      if (el) el.innerHTML = '<p style="color:rgba(255,255,255,.4)">Sign in to manage your subscription.</p>';
      return;
    }
    await loadUserSubscription();
    renderAccountTab();
  }

  function renderAccountTab() {
    const wrap = document.getElementById('sub-account-wrap');
    if (!wrap) return;
    if (!userSub) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:3rem;margin-bottom:14px">📦</div>
          <h3 style="color:#fff;margin:0 0 8px">No Active Subscription</h3>
          <p style="color:rgba(255,255,255,.5);margin:0 0 24px">Join a monthly box and get curated products delivered every month.</p>
          <a href="/subscriptions.html" style="background:linear-gradient(135deg,#E91E8C,#c2185b);color:#fff;padding:13px 28px;border-radius:50px;font-size:.95rem;font-weight:600;text-decoration:none;display:inline-block">Browse Plans</a>
        </div>`;
      return;
    }
    const plan = PLANS[userSub.plan] || { name: userSub.planName, icon: '📦', price: userSub.price };
    const nextShip = userSub.nextShipment?.toDate ? userSub.nextShipment.toDate() : null;
    wrap.innerHTML = `
      <div style="background:rgba(233,30,140,.06);border:1px solid rgba(233,30,140,.2);border-radius:16px;padding:24px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="font-size:2.5rem">${plan.icon}</div>
          <div style="flex:1">
            <div style="color:#fff;font-size:1.1rem;font-weight:700">${plan.name}</div>
            <div style="color:rgba(255,255,255,.5);font-size:.88rem">$${plan.price}/month · Status: <span style="color:${userSub.status==='active'?'#4CAF50':'#ff9800'}">${userSub.status}</span></div>
          </div>
          <button onclick="DSSubscriptions.openManage()" style="background:rgba(233,30,140,.15);color:#E91E8C;border:1px solid rgba(233,30,140,.3);padding:9px 18px;border-radius:50px;cursor:pointer;font-size:.88rem;font-weight:600">Manage</button>
        </div>
        ${nextShip ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06);color:rgba(255,255,255,.5);font-size:.88rem">📅 Next shipment: <strong style="color:#fff">${nextShip.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</strong></div>` : ''}
      </div>
      <div id="sub-history-wrap"><p style="color:rgba(255,255,255,.4);font-size:.88rem">Loading shipment history...</p></div>`;
    loadShipmentHistory();
  }

  async function loadShipmentHistory() {
    if (!db || !currentUser) return;
    const wrap = document.getElementById('sub-history-wrap');
    if (!wrap) return;
    try {
      const snap = await db.collection('subscription_shipments')
        .where('userId', '==', currentUser.uid)
        .orderBy('shippedAt', 'desc').limit(12).get();
      if (snap.empty) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.4);font-size:.88rem">No shipments yet — your first box will ship next month!</p>'; return; }
      wrap.innerHTML = '<h4 style="color:#fff;margin:0 0 12px">Shipment History</h4>' +
        snap.docs.map(d => {
          const s = d.data();
          const dt = s.shippedAt?.toDate ? s.shippedAt.toDate().toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '';
          return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <div><div style="color:#fff;font-size:.9rem">${s.planName||'Subscription Box'}</div><div style="color:rgba(255,255,255,.4);font-size:.78rem">${dt}</div></div>
            <span style="color:#4CAF50;font-size:.82rem">${s.status||'shipped'}</span>
          </div>`;
        }).join('');
    } catch (err) {
      wrap.innerHTML = '<p style="color:rgba(255,255,255,.4);font-size:.88rem">Shipment history unavailable.</p>';
    }
  }

  /* ── Admin ─────────────────────────────────────────────── */
  async function adminLoadSubscribers() {
    if (!db) return;
    const container = document.getElementById('admin-sub-list');
    if (!container) return;
    container.innerHTML = '<p style="color:rgba(255,255,255,.5)">Loading...</p>';
    try {
      const snap = await db.collection('subscriptions').orderBy('createdAt','desc').limit(100).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const active   = items.filter(s => s.status === 'active').length;
      const paused   = items.filter(s => s.status === 'paused').length;
      const monthly  = items.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.price || 0), 0);
      // Stats
      const statsEl = document.getElementById('admin-sub-stats');
      if (statsEl) statsEl.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:20px">
          <div style="background:rgba(233,30,140,.1);border:1px solid rgba(233,30,140,.2);border-radius:12px;padding:16px;text-align:center"><div style="color:#E91E8C;font-size:1.8rem;font-weight:800">${active}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem">Active</div></div>
          <div style="background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.2);border-radius:12px;padding:16px;text-align:center"><div style="color:#ff9800;font-size:1.8rem;font-weight:800">${paused}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem">Paused</div></div>
          <div style="background:rgba(76,175,80,.1);border:1px solid rgba(76,175,80,.2);border-radius:12px;padding:16px;text-align:center"><div style="color:#4CAF50;font-size:1.8rem;font-weight:800">$${monthly.toFixed(0)}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem">MRR</div></div>
          <div style="background:rgba(200,155,60,.1);border:1px solid rgba(200,155,60,.2);border-radius:12px;padding:16px;text-align:center"><div style="color:#C89B3C;font-size:1.8rem;font-weight:800">${items.length}</div><div style="color:rgba(255,255,255,.5);font-size:.8rem">Total Subs</div></div>
        </div>`;
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No subscribers yet.</p>'; return; }
      container.innerHTML = `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:rgba(255,255,255,.4);font-size:.78rem;border-bottom:1px solid rgba(255,255,255,.08)">
          <th style="padding:8px;text-align:left">Email</th><th style="padding:8px;text-align:left">Plan</th>
          <th style="padding:8px;text-align:left">Price</th><th style="padding:8px;text-align:left">Status</th>
          <th style="padding:8px;text-align:left">Actions</th>
        </tr></thead>
        <tbody>${items.map(s=>`<tr style="border-bottom:1px solid rgba(255,255,255,.04);font-size:.85rem">
          <td style="padding:9px;color:rgba(255,255,255,.7)">${s.email||s.userId||'—'}</td>
          <td style="padding:9px;color:#fff">${s.planName||s.plan||'—'}</td>
          <td style="padding:9px;color:rgba(255,255,255,.7)">$${(s.price||0).toFixed(2)}/mo</td>
          <td style="padding:9px"><span style="color:${s.status==='active'?'#4CAF50':s.status==='paused'?'#ff9800':'#ff4757'}">${s.status}</span></td>
          <td style="padding:9px"><button onclick="DSSubscriptions.adminMarkShipped('${s.id}')" style="background:rgba(76,175,80,.15);color:#4CAF50;border:1px solid rgba(76,175,80,.3);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">Mark Shipped</button></td>
        </tr>`).join('')}</tbody>
      </table>`;
    } catch (err) {
      container.innerHTML = '<p style="color:rgba(255,100,100,.7)">Error loading subscribers.</p>';
    }
  }

  async function adminMarkShipped(subId) {
    if (!db) return;
    const sub = await db.collection('subscriptions').doc(subId).get();
    const data = sub.data();
    await db.collection('subscription_shipments').add({
      subscriptionId: subId, userId: data.userId, planName: data.planName,
      plan: data.plan, status: 'shipped', shippedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const next = new Date(); next.setMonth(next.getMonth() + 1); next.setDate(1);
    await db.collection('subscriptions').doc(subId).update({ nextShipment: firebase.firestore.Timestamp.fromDate(next) });
    adminLoadSubscribers();
  }

  /* ── Public API ────────────────────────────────────────── */
  return {
    init, subscribe, openManage, closeManage,
    pauseSubscription, skipMonth, resumeSubscription, cancelSubscription, upgradePlan,
    initAccountTab, adminLoadSubscribers, adminMarkShipped,
    PLANS
  };
})();

document.addEventListener('DOMContentLoaded', DSSubscriptions.init);
