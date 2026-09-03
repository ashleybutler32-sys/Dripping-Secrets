/* ============================================================
   DRIPPING SECRETS — Vendor Marketplace JS  (v9.87)
   Firestore collection: vendors
   ============================================================ */

'use strict';

const DSVendors = (() => {
  /* ── State ─────────────────────────────────────────────── */
  let db = null;
  let currentUser = null;
  let allVendors = [];
  let activeFilter = 'all';
  let profileTarget = null;

  /* ── Init ──────────────────────────────────────────────── */
  async function init() {
    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(u => { currentUser = u; });
    await loadVendors();
    renderDirectory(allVendors);
    bindFilters();
  }

  /* ── Firestore ─────────────────────────────────────────── */
  async function loadVendors() {
    try {
      const snap = await db.collection('vendors')
        .where('status', '==', 'approved')
        .orderBy('featured', 'desc')
        .limit(50)
        .get();
      allVendors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      allVendors = getSampleVendors();
    }
  }

  function getSampleVendors() {
    return [
      { id: 'vd1', name: 'Luxe Wellness Co.', category: 'wellness', avatar: '🌸', featured: true,
        description: 'Premium aromatherapy, bath rituals, and body care products designed to elevate your self-care practice.', rating: 4.9, products: 24, badge: 'Featured',
        specialties: ['Bath & Body', 'Aromatherapy', 'Crystals'] },
      { id: 'vd2', name: 'Silk & Satin Studio', category: 'apparel', avatar: '✨',
        description: 'Luxury intimate apparel crafted from sustainable fabrics. Every piece designed to make you feel as beautiful as you are.', rating: 4.8, products: 18,
        specialties: ['Lingerie', 'Loungewear', 'Bridal'] },
      { id: 'vd3', name: 'The Couples Collective', category: 'couples', avatar: '💑',
        description: 'Curated experiences and products exclusively for couples looking to deepen connection and explore together.', rating: 4.9, products: 31, badge: 'Top Seller',
        specialties: ['Connection Kits', 'Date Night', 'Games'] },
      { id: 'vd4', name: 'Sacred Feminine Studio', category: 'wellness', avatar: '🪷',
        description: 'Holistic wellness products rooted in ancient feminine wisdom — yoni care, herbal blends, and ritual tools.', rating: 4.7, products: 15,
        specialties: ['Yoni Care', 'Herbals', 'Ritual Tools'] },
      { id: 'vd5', name: 'Midnight Noir Designs', category: 'accessories', avatar: '🖤',
        description: 'Handcrafted adult accessories and intimate keepsakes. Every product is one-of-a-kind and made with intention.', rating: 4.8, products: 22,
        specialties: ['Handcrafted', 'Custom', 'Keepsakes'] },
      { id: 'vd6', name: 'Bliss & Botanicals', category: 'wellness', avatar: '🌿',
        description: 'Clean, botanical-based intimate wellness products. 100% body-safe, vegan, and cruelty-free formulations.', rating: 5.0, products: 12, badge: 'New',
        specialties: ['Clean Beauty', 'Vegan', 'Botanicals'] },
    ];
  }

  /* ── Render ────────────────────────────────────────────── */
  function renderDirectory(vendors) {
    const grid = document.getElementById('vd-grid');
    if (!grid) return;
    if (!vendors || !vendors.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:rgba(255,255,255,.4)"><p>No vendors found.</p></div>'; return;
    }
    grid.innerHTML = vendors.map(v => buildCard(v)).join('');
  }

  function buildCard(v) {
    return `
    <div class="vd-card">
      <div class="vd-card-banner">
        ${v.badge ? `<span class="vd-card-badge">${v.badge}</span>` : ''}
        <div class="vd-card-avatar">${v.avatar || '🏪'}</div>
      </div>
      <div class="vd-card-body">
        <h3 class="vd-card-name">${v.name}</h3>
        <div class="vd-card-category">${v.category || ''}</div>
        <p class="vd-card-desc">${v.description || ''}</p>
        <div class="vd-card-stats">
          <span class="vd-card-stat"><strong>${v.rating || '5.0'}★</strong> Rating</span>
          <span class="vd-card-stat"><strong>${v.products || 0}</strong> Products</span>
        </div>
      </div>
      <div class="vd-card-footer">
        <button class="vd-view-btn" onclick="DSVendors.openProfile('${v.id}')">View Storefront</button>
      </div>
    </div>`;
  }

  /* ── Filter ────────────────────────────────────────────── */
  function bindFilters() {
    const search = document.getElementById('vd-search-input');
    if (search) {
      let timer;
      search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const q = search.value.toLowerCase().trim();
          const base = filterVendors();
          if (!q) { renderDirectory(base); return; }
          renderDirectory(base.filter(v => v.name.toLowerCase().includes(q) || (v.description||'').toLowerCase().includes(q) || v.category.includes(q)));
        }, 250);
      });
    }
    document.querySelectorAll('.vd-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat || 'all';
        document.querySelectorAll('.vd-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDirectory(filterVendors());
      });
    });
  }

  function filterVendors() {
    if (activeFilter === 'all') return allVendors;
    return allVendors.filter(v => v.category === activeFilter);
  }

  /* ── Profile Modal ─────────────────────────────────────── */
  function openProfile(id) {
    profileTarget = allVendors.find(v => v.id === id);
    if (!profileTarget) return;
    const overlay = document.getElementById('vd-modal');
    const v = profileTarget;
    document.getElementById('vd-modal-avatar').textContent  = v.avatar || '🏪';
    document.getElementById('vd-modal-name').textContent    = v.name;
    document.getElementById('vd-modal-cat').textContent     = v.category || '';
    document.getElementById('vd-modal-desc').textContent    = v.description || '';
    document.getElementById('vd-modal-specialties').innerHTML = (v.specialties||[]).map(s=>`<span style="background:rgba(200,155,60,.15);color:#C89B3C;padding:4px 12px;border-radius:50px;font-size:.8rem;display:inline-block;margin:3px">${s}</span>`).join('');
    overlay.classList.add('open');
  }

  function closeProfile() {
    const overlay = document.getElementById('vd-modal');
    if (overlay) overlay.classList.remove('open');
    profileTarget = null;
  }

  /* ── Application ───────────────────────────────────────── */
  async function submitApplication() {
    const name     = document.getElementById('vd-app-name')?.value.trim();
    const email    = document.getElementById('vd-app-email')?.value.trim();
    const brand    = document.getElementById('vd-app-brand')?.value.trim();
    const category = document.getElementById('vd-app-category')?.value;
    const website  = document.getElementById('vd-app-website')?.value.trim();
    const desc     = document.getElementById('vd-app-desc')?.value.trim();
    if (!name || !email || !brand || !desc) { alert('Please fill out all required fields.'); return; }
    const btn = document.getElementById('vd-app-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }
    try {
      if (db) {
        await db.collection('vendor_applications').add({
          name, email, brand, category, website: website||'', description: desc,
          userId: currentUser?.uid || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });
      }
      showToast('Application submitted! We\'ll review and be in touch within 48 hours.');
      ['vd-app-name','vd-app-email','vd-app-brand','vd-app-website','vd-app-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } catch (err) {
      showToast('Application received — thank you!');
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Application'; }
  }

  /* ── Toast ─────────────────────────────────────────────── */
  function showToast(msg) {
    let t = document.getElementById('vd-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'vd-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:#1e0d2e;border:1px solid rgba(200,155,60,.4);color:#fff;padding:14px 24px;border-radius:50px;z-index:99999;transition:transform .3s;font-size:.95rem;white-space:nowrap;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(60px)'; }, 3500);
  }

  /* ── Admin ─────────────────────────────────────────────── */
  async function adminLoadApplications() {
    if (!db) return;
    const container = document.getElementById('admin-vendor-applications');
    if (!container) return;
    container.innerHTML = '<p style="color:rgba(255,255,255,.5)">Loading...</p>';
    try {
      const snap = await db.collection('vendor_applications').orderBy('createdAt','desc').limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No applications yet.</p>'; return; }
      container.innerHTML = items.map(a => `
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <strong style="color:#fff">${a.brand}</strong>
            <div style="color:rgba(255,255,255,.5);font-size:.82rem;margin-top:4px">${a.name} · ${a.email} · ${a.category||''} · Status: <span style="color:${a.status==='approved'?'#4CAF50':a.status==='rejected'?'#ff4757':'#ff9800'}">${a.status}</span></div>
          </div>
          <div style="display:flex;gap:8px">
            ${a.status==='pending' ? `
              <button onclick="DSVendors.adminDecision('${a.id}','approved')" style="background:rgba(76,175,80,.15);color:#4CAF50;border:1px solid rgba(76,175,80,.3);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">Approve</button>
              <button onclick="DSVendors.adminDecision('${a.id}','rejected')" style="background:rgba(255,71,87,.1);color:#ff4757;border:1px solid rgba(255,71,87,.2);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">Decline</button>
            ` : ''}
          </div>
        </div>`).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:rgba(255,100,100,.7)">Error loading applications.</p>`;
    }
  }

  async function adminDecision(appId, decision) {
    if (!db) return;
    await db.collection('vendor_applications').doc(appId).update({ status: decision, reviewedAt: firebase.firestore.FieldValue.serverTimestamp() });
    if (decision === 'approved') {
      const app = await db.collection('vendor_applications').doc(appId).get();
      const data = app.data();
      await db.collection('vendors').add({ name: data.brand, email: data.email, category: data.category, description: data.description, status: 'approved', featured: false, rating: 5.0, products: 0, applicationId: appId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    adminLoadApplications();
  }

  async function adminLoadVendors() {
    if (!db) return;
    const container = document.getElementById('admin-vendor-list');
    if (!container) return;
    container.innerHTML = '<p style="color:rgba(255,255,255,.5)">Loading...</p>';
    try {
      const snap = await db.collection('vendors').orderBy('createdAt','desc').limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No approved vendors yet.</p>'; return; }
      container.innerHTML = items.map(v => `
        <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <strong style="color:#fff">${v.avatar||'🏪'} ${v.name}</strong>
            <div style="color:rgba(255,255,255,.5);font-size:.82rem;margin-top:4px">${v.category||''} · ${v.products||0} products · ${v.featured?'Featured':'Not featured'}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="DSVendors.adminToggleFeatured('${v.id}',${v.featured})" style="background:rgba(200,155,60,.15);color:#C89B3C;border:1px solid rgba(200,155,60,.3);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">${v.featured?'Unfeature':'Feature'}</button>
            <button onclick="DSVendors.adminSuspend('${v.id}')" style="background:rgba(255,71,87,.1);color:#ff4757;border:1px solid rgba(255,71,87,.2);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">Suspend</button>
          </div>
        </div>`).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:rgba(255,100,100,.7)">Error loading vendors.</p>`;
    }
  }

  async function adminToggleFeatured(id, current) {
    if (!db) return;
    await db.collection('vendors').doc(id).update({ featured: !current });
    adminLoadVendors();
  }

  async function adminSuspend(id) {
    if (!db || !confirm('Suspend this vendor?')) return;
    await db.collection('vendors').doc(id).update({ status: 'suspended' });
    adminLoadVendors();
  }

  /* ── Public API ────────────────────────────────────────── */
  return {
    init, openProfile, closeProfile, submitApplication,
    adminLoadApplications, adminDecision, adminLoadVendors, adminToggleFeatured, adminSuspend
  };
})();

document.addEventListener('DOMContentLoaded', DSVendors.init);
