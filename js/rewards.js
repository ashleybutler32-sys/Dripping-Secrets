// ================================================================
// DRIPPING REWARDS — DS v9.80
// Points · VIP Tiers · Rewards Catalog · Firestore: rewards
// 1 point per $1 spent — Tiers: Secret → Elite → Royal → Legend
// ================================================================

(function () {
  'use strict';

  const TIERS = [
    { name: 'Secret',  pts: 0,    color: '#9e9e9e', icon: '🤫', perks: ['Early access to new arrivals','Birthday reward'] },
    { name: 'Elite',   pts: 250,  color: '#B76E79', icon: '💅', perks: ['5% reward credit','Birthday reward','Exclusive sale access'] },
    { name: 'Royal',   pts: 750,  color: '#ffd700', icon: '👑', perks: ['10% reward credit','Free standard shipping','Birthday surprise','VIP early access'] },
    { name: 'Legend',  pts: 2000, color: '#a78bfa', icon: '💎', perks: ['15% reward credit','Free shipping always','Quarterly surprise box','Dedicated concierge'] }
  ];

  const CATALOG = [
    { id: 'r_ship',   name: 'Free Shipping',  cost: 100, desc: 'Free standard shipping on your next order.' },
    { id: 'r_d5',     name: '5% Off Coupon',  cost: 150, desc: '5% off your next order.' },
    { id: 'r_d10',    name: '10% Off Coupon', cost: 275, desc: '10% off your next order.' },
    { id: 'r_d15',    name: '15% Off Coupon', cost: 400, desc: '15% off your next order.' },
    { id: 'r_bday',   name: 'Birthday Reward',cost: 0,   desc: 'A special surprise during your birthday month.' },
    { id: 'r_acc',    name: 'Free Accessory', cost: 500, desc: 'A free accessory added to your next order.' }
  ];

  function db() { return typeof firebase !== 'undefined' ? firebase.firestore() : null; }

  function getTier(pts) {
    let t = TIERS[0];
    TIERS.forEach(x => { if (pts >= x.pts) t = x; });
    return t;
  }
  function getNextTier(pts) {
    for (const t of TIERS) { if (t.pts > pts) return t; }
    return null;
  }

  // ── Firestore ────────────────────────────────────────────────

  async function getDoc(uid) {
    const d = db();
    if (!d || !uid) return null;
    const s = await d.collection('rewards').doc(uid).get();
    return s.exists ? { ...s.data() } : null;
  }

  async function ensureDoc(uid, info) {
    let doc = await getDoc(uid);
    if (doc) return doc;
    doc = {
      uid, firstName: info?.firstName || '', lastName: info?.lastName || '',
      email: info?.email || '', points: 0, lifetimePoints: 0,
      tier: 'Secret', history: [], redeemedRewards: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db().collection('rewards').doc(uid).set(doc);
    return doc;
  }

  async function awardPoints(uid, amount, reason, orderId) {
    const d = db();
    if (!d || !uid || !amount) return;
    const s = await d.collection('rewards').doc(uid).get();
    if (!s.exists) return;
    const data = s.data();
    const newPts  = (data.points || 0) + amount;
    const newLife = (data.lifetimePoints || 0) + amount;
    const tier    = getTier(newLife).name;
    const entry   = { type: 'earned', points: amount, reason: reason || 'Purchase', orderId: orderId || null, date: new Date().toISOString() };
    await d.collection('rewards').doc(uid).update({
      points: newPts, lifetimePoints: newLife, tier,
      history: firebase.firestore.FieldValue.arrayUnion(entry)
    });
    return { points: newPts, lifetimePoints: newLife, tier };
  }

  async function adjustPoints(uid, delta, reason) {
    return awardPoints(uid, delta, reason || 'Admin adjustment');
  }

  async function redeemReward(uid, rewardId) {
    const d = db();
    if (!d || !uid) return { ok: false, err: 'Not signed in' };
    const reward = CATALOG.find(r => r.id === rewardId);
    if (!reward) return { ok: false, err: 'Reward not found' };
    const s = await d.collection('rewards').doc(uid).get();
    if (!s.exists) return { ok: false, err: 'No rewards account' };
    const data = s.data();
    if ((data.points || 0) < reward.cost) return { ok: false, err: `Need ${reward.cost} pts, have ${data.points}` };
    const newPts = (data.points || 0) - reward.cost;
    const entry  = { type: 'redeemed', rewardId, rewardName: reward.name, pointsSpent: reward.cost, date: new Date().toISOString(), status: 'pending' };
    await d.collection('rewards').doc(uid).update({
      points: newPts,
      redeemedRewards: firebase.firestore.FieldValue.arrayUnion(entry),
      history: firebase.firestore.FieldValue.arrayUnion(entry)
    });
    return { ok: true, points: newPts, reward };
  }

  // ── Customer Dashboard ────────────────────────────────────────

  async function renderDashboard(container, uid, info) {
    if (!container) return;
    container.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,.45)">Loading your rewards…</div>`;
    try {
      const doc  = await ensureDoc(uid, info);
      const tier = getTier(doc.lifetimePoints || 0);
      const next = getNextTier(doc.lifetimePoints || 0);
      const prog = next ? Math.min(100, ((doc.lifetimePoints || 0) / next.pts) * 100) : 100;

      container.innerHTML = `
        <div style="background:linear-gradient(135deg,rgba(75,31,95,.4),rgba(183,110,121,.15));
          border:1px solid rgba(183,110,121,.3);border-radius:16px;padding:24px;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <div style="font-size:2.4rem">${tier.icon}</div>
            <div>
              <div style="font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em">Current Tier</div>
              <div style="font-size:1.5rem;font-weight:700;color:${tier.color};font-family:'Cormorant Garamond',Georgia,serif">${tier.name}</div>
            </div>
            <div style="margin-left:auto;text-align:right">
              <div style="font-size:2.2rem;font-weight:800;color:#B76E79;line-height:1">${(doc.points||0).toLocaleString()}</div>
              <div style="font-size:.72rem;color:rgba(255,255,255,.4)">Available Points</div>
            </div>
          </div>
          ${next ? `
            <div style="margin-top:14px">
              <div style="display:flex;justify-content:space-between;font-size:.72rem;color:rgba(255,255,255,.38);margin-bottom:5px">
                <span>${tier.name}</span><span>${next.pts - (doc.lifetimePoints||0)} pts to ${next.name} ${next.icon}</span>
              </div>
              <div style="background:rgba(255,255,255,.08);border-radius:20px;height:6px;overflow:hidden">
                <div style="height:100%;width:${prog}%;background:linear-gradient(90deg,#B76E79,#4B1F5F);border-radius:20px"></div>
              </div>
            </div>` : `<div style="margin-top:10px;font-size:.8rem;color:#a78bfa">💎 Legend status — you're at the top. Thank you for being amazing!</div>`}
        </div>

        <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.2rem;color:#fff;margin:0 0 14px">Rewards Catalog</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:28px">
          ${CATALOG.filter(r => r.cost > 0).map(r => `
            <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:16px">
              <div style="font-weight:600;color:#fff;margin-bottom:4px;font-size:.88rem">${r.name}</div>
              <div style="font-size:.76rem;color:rgba(255,255,255,.45);margin-bottom:12px">${r.desc}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="color:#B76E79;font-weight:700;font-size:.84rem">${r.cost} pts</span>
                <button onclick="window._rwdRedeem('${r.id}')" ${(doc.points||0) < r.cost ? 'disabled' : ''}
                  style="background:linear-gradient(135deg,#B76E79,#4B1F5F);border:none;border-radius:8px;
                  color:#fff;padding:6px 12px;font-size:.76rem;font-weight:600;cursor:pointer;
                  opacity:${(doc.points||0) >= r.cost ? '1' : '.4'};font-family:inherit">
                  ${(doc.points||0) >= r.cost ? 'Redeem' : 'Not Yet'}
                </button>
              </div>
            </div>`).join('')}
        </div>

        <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.2rem;color:#fff;margin:0 0 14px">Points History</h3>
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden">
          ${(doc.history||[]).length
            ? [...(doc.history||[])].reverse().slice(0,12).map(h => `
              <div style="display:flex;align-items:center;justify-content:space-between;
                padding:11px 16px;border-bottom:1px solid rgba(255,255,255,.04)">
                <div>
                  <div style="font-size:.82rem;color:rgba(255,255,255,.8)">${h.reason||h.rewardName||'—'}</div>
                  <div style="font-size:.7rem;color:rgba(255,255,255,.3)">${new Date(h.date).toLocaleDateString()}</div>
                </div>
                <div style="font-weight:700;font-size:.88rem;color:${h.type==='earned'?'#4ade80':'#f87171'}">
                  ${h.type==='earned'?'+':'−'}${h.points||h.pointsSpent||0}
                </div>
              </div>`).join('')
            : `<div style="text-align:center;padding:32px;color:rgba(255,255,255,.28);font-size:.83rem">Make your first purchase to start earning points!</div>`}
        </div>`;

      window._rwdRedeem = async (id) => {
        const res = await redeemReward(uid, id);
        if (res.ok) { alert(`Redeemed! Your new balance: ${res.points} points.`); renderDashboard(container, uid, info); }
        else alert(res.err || 'Could not redeem reward.');
      };
    } catch (_) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:rgba(255,255,255,.4)">Could not load rewards. Please try again.</div>`;
    }
  }

  // ── Hook: award points on order complete ─────────────────────

  document.addEventListener('dimi:success', async () => {
    try {
      const user  = firebase.auth().currentUser;
      if (!user) return;
      const total = parseFloat(sessionStorage.getItem('ds_last_order_total') || '0');
      if (total <= 0) return;
      const pts = Math.floor(total);
      const oid = sessionStorage.getItem('ds_last_order_id') || '';
      await awardPoints(user.uid, pts, `Order #${oid}`, oid);
    } catch (_) {}
  });

  // ── Public API ───────────────────────────────────────────────

  window.DS_REWARDS = { TIERS, CATALOG, getTier, getNextTier, ensureDoc, awardPoints, adjustPoints, redeemReward, renderDashboard };

})();
