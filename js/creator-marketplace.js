/* ============================================================
   DRIPPING SECRETS — Creator Marketplace JS  (v9.93)
   Firestore collection: creator_marketplace
   ============================================================ */
'use strict';

const DSCreatorMarketplace = (() => {
  let db = null;
  let currentUser = null;
  let currentTab = 'discover';

  /* ── Init ─────────────────────────────────────────────────── */
  async function init() {
    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async u => {
      currentUser = u;
      await loadFeaturedCreators();
      await loadRankings();
      if (u) checkCreatorStatus();
    });
  }

  /* ── Tab Switch ───────────────────────────────────────────── */
  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.cm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.cm-panel').forEach(p => p.style.display = 'none');
    const panel = document.getElementById(`panel-${tab}`);
    if (panel) panel.style.display = 'block';
  }

  /* ── Featured Creators ───────────────────────────────────── */
  async function loadFeaturedCreators() {
    const grid = document.getElementById('cm-creators-grid');
    if (!grid) return;
    if (!db) { renderDemoCreators(); return; }
    try {
      const snap = await db.collection('creator_marketplace')
        .where('status', '==', 'approved')
        .where('featured', '==', true)
        .orderBy('totalSales', 'desc').limit(8).get();
      if (snap.empty) { renderDemoCreators(); return; }
      grid.innerHTML = snap.docs.map((d, i) => buildCreatorCard({ id: d.id, ...d.data() }, i)).join('');
    } catch (_) { renderDemoCreators(); }
  }

  function renderDemoCreators() {
    const grid = document.getElementById('cm-creators-grid');
    if (!grid) return;
    const demos = [
      { id:'demo1', name:'@ConfidenceQueen', bio:'Wellness, self-care, and living boldly.', totalSales:142, followers:8200, commission:14, featured:true },
      { id:'demo2', name:'@CouplesVibes',    bio:'Helping couples connect and explore.',    totalSales:98,  followers:5100, commission:12, featured:true },
      { id:'demo3', name:'@LuxeByLayla',     bio:'Premium finds for the discerning woman.', totalSales:211, followers:14000,commission:16, featured:true },
      { id:'demo4', name:'@WellnessWithSam', bio:'Body-positive, shame-free wellness.', totalSales:77, followers:3800, commission:12, featured:false }
    ];
    grid.innerHTML = demos.map((c, i) => buildCreatorCard(c, i)).join('');
  }

  function buildCreatorCard(creator, rank) {
    const initials = (creator.name || 'DS').replace('@','').slice(0,2).toUpperCase();
    const topLabel = rank === 0 ? 'Top Creator' : rank < 3 ? '#' + (rank+1) : null;
    return `<div class="cm-card${creator.featured?' featured':''}">
      <div class="cm-card-cover" style="background:linear-gradient(135deg,hsl(${(rank*67)%360},60%,25%),hsl(${(rank*67+40)%360},70%,35%))">
        ${topLabel ? `<span class="cm-card-rank">${topLabel}</span>` : ''}
      </div>
      <div class="cm-card-body">
        <div class="cm-card-avatar">${creator.avatarUrl ? `<img src="${creator.avatarUrl}" alt="${creator.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : initials}</div>
        <div class="cm-card-name">${escHtml(creator.name || 'Creator')}</div>
        <p class="cm-card-bio">${escHtml(creator.bio || '')}</p>
        <div class="cm-card-stats">
          <div class="cm-card-stat"><span class="n">${fmtNum(creator.totalSales||0)}</span><span class="l">Sales</span></div>
          <div class="cm-card-stat"><span class="n">${fmtNum(creator.followers||0)}</span><span class="l">Followers</span></div>
          <div class="cm-card-stat"><span class="n">${creator.commission||12}%</span><span class="l">Commission</span></div>
        </div>
        <a href="#" onclick="DSCreatorMarketplace.viewStorefront('${creator.id}');return false;" class="cm-card-cta">View Storefront</a>
      </div>
    </div>`;
  }

  /* ── Rankings ─────────────────────────────────────────────── */
  async function loadRankings() {
    const wrap = document.getElementById('cm-rankings-wrap');
    if (!wrap) return;
    if (!db) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.4)">Rankings update weekly.</p>'; return; }
    try {
      const snap = await db.collection('creator_marketplace')
        .where('status','==','approved')
        .orderBy('totalSales','desc').limit(10).get();
      if (snap.empty) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.4)">No rankings yet — be the first to apply!</p>'; return; }
      wrap.innerHTML = snap.docs.map((d, i) => {
        const c = d.data();
        return `<div class="cm-rank-row">
          <div class="cm-rank-num ${i<3?'top':''}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
          <div class="cm-rank-name">${escHtml(c.name||'Creator')}</div>
          <div class="cm-rank-sales">${fmtNum(c.totalSales||0)} sales</div>
        </div>`;
      }).join('');
    } catch (_) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.4)">Rankings unavailable.</p>'; }
  }

  /* ── Storefront View ──────────────────────────────────────── */
  async function viewStorefront(creatorId) {
    const wrap = document.getElementById('cm-storefront-wrap');
    if (!wrap) { switchTab('storefront'); return; }
    switchTab('storefront');
    wrap.innerHTML = '<p style="color:rgba(255,255,255,.4)">Loading storefront…</p>';
    if (!db) { wrap.innerHTML = `<div class="cm-storefront-hero"><div class="cm-storefront-avatar">DS</div><div class="cm-storefront-info"><div class="cm-storefront-name">Creator Storefront</div><div class="cm-storefront-bio">Featured collections and curated picks.</div></div></div>`; return; }
    try {
      const doc = await db.collection('creator_marketplace').doc(creatorId).get();
      if (!doc.exists) { wrap.innerHTML = '<p style="color:rgba(255,100,100,.6)">Storefront not found.</p>'; return; }
      const c = doc.data();
      const initials = (c.name||'DS').replace('@','').slice(0,2).toUpperCase();
      wrap.innerHTML = `
        <div class="cm-storefront-hero">
          <div class="cm-storefront-avatar">${initials}</div>
          <div class="cm-storefront-info">
            <div class="cm-storefront-name">${escHtml(c.name||'')}</div>
            <div class="cm-storefront-bio">${escHtml(c.bio||'')}</div>
            <div style="display:flex;gap:20px;flex-wrap:wrap">
              <span style="color:rgba(255,255,255,.5);font-size:.85rem">${fmtNum(c.totalSales||0)} sales</span>
              <span style="color:rgba(255,255,255,.5);font-size:.85rem">${c.commission||12}% commission</span>
            </div>
          </div>
        </div>
        <div id="cm-storefront-collections"><p style="color:rgba(255,255,255,.4)">This creator&rsquo;s collections will appear here.</p></div>`;
    } catch (_) { wrap.innerHTML = '<p style="color:rgba(255,100,100,.6)">Error loading storefront.</p>'; }
  }

  /* ── Application ──────────────────────────────────────────── */
  async function submitApplication(e) {
    e.preventDefault();
    if (!currentUser) { alert('Please sign in first.'); window.location.href = '/account.html'; return; }
    const name = document.getElementById('cm-app-name')?.value.trim();
    const bio  = document.getElementById('cm-app-bio')?.value.trim();
    const link = document.getElementById('cm-app-link')?.value.trim();
    const niche = document.getElementById('cm-app-niche')?.value;
    const why  = document.getElementById('cm-app-why')?.value.trim();
    if (!name || !bio || !niche) { alert('Please fill in all required fields.'); return; }
    const btn = document.getElementById('cm-app-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
    try {
      if (db) {
        await db.collection('creator_marketplace').add({
          userId: currentUser.uid,
          email: currentUser.email,
          name, bio, link, niche, why,
          status: 'pending',
          featured: false,
          totalSales: 0, totalEarnings: 0,
          commission: 12,
          followers: 0,
          appliedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      const form = document.getElementById('cm-apply-form');
      if (form) form.innerHTML = `<div style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:14px">🎉</div><h3 style="color:#fff;margin:0 0 8px">Application Submitted!</h3><p style="color:rgba(255,255,255,.5)">We review all applications within 3-5 business days. You'll hear from us at ${escHtml(currentUser.email||'')}.</p></div>`;
    } catch (_) {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit Application'; }
      alert('Submission error. Please try again.');
    }
  }

  /* ── Creator Dashboard ────────────────────────────────────── */
  async function loadCreatorDashboard() {
    if (!currentUser || !db) return;
    const wrap = document.getElementById('cm-dashboard-wrap');
    if (!wrap) return;
    try {
      const snap = await db.collection('creator_marketplace').where('userId','==',currentUser.uid).limit(1).get();
      if (snap.empty) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.5)">You haven\'t applied yet. <a href="#" onclick="DSCreatorMarketplace.switchTab(\'apply\');return false;" style="color:#E91E8C">Apply now →</a></p>'; return; }
      const c = snap.docs[0].data();
      if (c.status === 'pending') { wrap.innerHTML = '<div style="text-align:center;padding:32px"><div style="font-size:2.5rem;margin-bottom:12px">⏳</div><h3 style="color:#fff;margin:0 0 8px">Application Under Review</h3><p style="color:rgba(255,255,255,.5)">We\'ll notify you within 3-5 business days.</p></div>'; return; }
      wrap.innerHTML = `
        <div class="cm-dash-grid">
          <div class="cm-dash-card"><div class="cm-dash-num">$${(c.totalEarnings||0).toFixed(2)}</div><div class="cm-dash-lbl">Total Earnings</div></div>
          <div class="cm-dash-card"><div class="cm-dash-num">${fmtNum(c.totalSales||0)}</div><div class="cm-dash-lbl">Total Sales</div></div>
          <div class="cm-dash-card"><div class="cm-dash-num">${c.commission||12}%</div><div class="cm-dash-lbl">Commission Rate</div></div>
          <div class="cm-dash-card"><div class="cm-dash-num">${fmtNum(c.followers||0)}</div><div class="cm-dash-lbl">Followers</div></div>
        </div>
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:18px">
          <h4 style="color:#fff;margin:0 0 8px">Referral Link</h4>
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 14px;color:rgba(255,255,255,.7);font-size:.85rem;font-family:monospace;word-break:break-all">
            https://drippingsecrets.com/?ref=${escHtml(c.userId||snap.docs[0].id)}
          </div>
          <button onclick="navigator.clipboard.writeText('https://drippingsecrets.com/?ref=${c.userId||snap.docs[0].id}')" style="background:rgba(233,30,140,.12);border:1px solid rgba(233,30,140,.3);color:#E91E8C;padding:8px 16px;border-radius:50px;cursor:pointer;font-size:.82rem;font-weight:600;margin-top:10px">Copy Link</button>
        </div>`;
    } catch (_) { wrap.innerHTML = '<p style="color:rgba(255,100,100,.6)">Error loading dashboard.</p>'; }
  }

  async function checkCreatorStatus() {
    if (!currentUser || !db) return;
    const snap = await db.collection('creator_marketplace').where('userId','==',currentUser.uid).limit(1).get();
    if (!snap.empty && snap.docs[0].data().status === 'approved') {
      const tab = document.querySelector('.cm-tab[data-tab="dashboard"]');
      if (tab) tab.style.display = 'block';
    }
  }

  /* ── Admin ────────────────────────────────────────────────── */
  async function adminLoadApplications() {
    if (!db) return;
    const wrap = document.getElementById('admin-cm-wrap');
    if (!wrap) return;
    try {
      const snap = await db.collection('creator_marketplace').orderBy('appliedAt','desc').limit(100).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pending  = items.filter(c => c.status === 'pending').length;
      const approved = items.filter(c => c.status === 'approved').length;
      const statsHtml = `<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
        <div style="background:rgba(255,152,0,.1);border:1px solid rgba(255,152,0,.2);border-radius:10px;padding:12px 18px;text-align:center"><div style="color:#ff9800;font-size:1.6rem;font-weight:800">${pending}</div><div style="color:rgba(255,255,255,.5);font-size:.78rem">Pending</div></div>
        <div style="background:rgba(76,175,80,.1);border:1px solid rgba(76,175,80,.2);border-radius:10px;padding:12px 18px;text-align:center"><div style="color:#4CAF50;font-size:1.6rem;font-weight:800">${approved}</div><div style="color:rgba(255,255,255,.5);font-size:.78rem">Approved</div></div>
      </div>`;
      if (!items.length) { wrap.innerHTML = statsHtml + '<p style="color:rgba(255,255,255,.4)">No applications yet.</p>'; return; }
      wrap.innerHTML = statsHtml + `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:rgba(255,255,255,.4);font-size:.78rem;border-bottom:1px solid rgba(255,255,255,.08)">
          <th style="padding:8px;text-align:left">Name</th><th style="padding:8px;text-align:left">Niche</th>
          <th style="padding:8px;text-align:left">Status</th><th style="padding:8px;text-align:left">Actions</th>
        </tr></thead>
        <tbody>${items.map(c=>`<tr style="border-bottom:1px solid rgba(255,255,255,.04);font-size:.83rem">
          <td style="padding:8px;color:#fff">${escHtml(c.name||'—')}</td>
          <td style="padding:8px;color:rgba(255,255,255,.6)">${escHtml(c.niche||'—')}</td>
          <td style="padding:8px;color:${c.status==='approved'?'#4CAF50':c.status==='rejected'?'#ff4757':'#ff9800'}">${c.status}</td>
          <td style="padding:8px;display:flex;gap:6px">
            ${c.status==='pending'?`<button onclick="DSCreatorMarketplace.adminApprove('${c.id}')" style="background:rgba(76,175,80,.15);color:#4CAF50;border:1px solid rgba(76,175,80,.3);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">Approve</button>
            <button onclick="DSCreatorMarketplace.adminReject('${c.id}')" style="background:rgba(255,71,87,.1);color:#ff4757;border:1px solid rgba(255,71,87,.2);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">Reject</button>`:'—'}
            ${c.status==='approved'?`<button onclick="DSCreatorMarketplace.adminToggleFeatured('${c.id}','${!c.featured}')" style="background:rgba(200,155,60,.1);color:#C89B3C;border:1px solid rgba(200,155,60,.2);padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">${c.featured?'Unfeature':'Feature'}</button>`:''}
          </td>
        </tr>`).join('')}</tbody>
      </table>`;
    } catch (_) { wrap.innerHTML = '<p style="color:rgba(255,100,100,.6)">Error loading applications.</p>'; }
  }

  async function adminApprove(id) {
    if (!db) return;
    await db.collection('creator_marketplace').doc(id).update({ status: 'approved', approvedAt: firebase.firestore.FieldValue.serverTimestamp() });
    adminLoadApplications();
  }
  async function adminReject(id) {
    if (!db) return;
    await db.collection('creator_marketplace').doc(id).update({ status: 'rejected' });
    adminLoadApplications();
  }
  async function adminToggleFeatured(id, val) {
    if (!db) return;
    await db.collection('creator_marketplace').doc(id).update({ featured: val === 'true' });
    adminLoadApplications();
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtNum(n) { return n>=1000?(n/1000).toFixed(1)+'k':String(n); }

  return {
    init, switchTab, loadFeaturedCreators, loadRankings,
    viewStorefront, submitApplication, loadCreatorDashboard,
    adminLoadApplications, adminApprove, adminReject, adminToggleFeatured
  };
})();

document.addEventListener('DOMContentLoaded', DSCreatorMarketplace.init);
