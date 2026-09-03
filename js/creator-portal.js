/* ═══════════════════════════════════════════════════════════════
   DRIPPING SECRETS — CREATOR PORTAL  js/creator-portal.js
   v9.84 — Sprint H
   Public application · Auth-gated dashboard · Content tracker ·
   Earnings overview · Payout requests · Admin management panel
   Firestore:
     creators            — creator profiles
     creators/{id}/content  — content submissions
     creators/{id}/payouts  — payout records
   Commission: 12% on attributed conversions
   ═══════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────── */
  const COMMISSION_RATE = 0.12;
  const NICHES = ['Lifestyle', 'Beauty & Wellness', 'Relationships', 'Adult Content', 'Fashion', 'Couples', 'Fitness', 'Other'];
  const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Pinterest', 'Twitter / X', 'Facebook', 'Snapchat', 'Blog', 'Other'];

  const TIERS = [
    { id: 'seedling',    label: 'Seedling',    minImpressions: 0,     badge: '🌱', cssClass: 'tier-seedling',    commission: '12%' },
    { id: 'blooming',    label: 'Blooming',    minImpressions: 1000,  badge: '🌸', cssClass: 'tier-blooming',    commission: '12%' },
    { id: 'flourishing', label: 'Flourishing', minImpressions: 10000, badge: '🌺', cssClass: 'tier-flourishing', commission: '14%' },
    { id: 'elite',       label: 'Elite',       minImpressions: 50000, badge: '💎', cssClass: 'tier-elite',       commission: '16%' },
  ];

  function getTier(impressions) {
    let tier = TIERS[0];
    for (const t of TIERS) {
      if ((impressions || 0) >= t.minImpressions) tier = t;
    }
    return tier;
  }

  /* ── Utilities ─────────────────────────────────────────────── */
  function db()  { return firebase.firestore(); }
  function fv()  { return firebase.firestore.FieldValue; }
  function fmt(n){ return (n || 0).toLocaleString(); }
  function money(n){ return '$' + ((n || 0)).toFixed(2); }

  function creatorId(user) {
    return (user.email || user.uid || '').split('@')[0]
      .replace(/[^a-z0-9_-]/gi, '').toLowerCase()
      .slice(0, 30) || user.uid.slice(0, 20);
  }

  /* ══════════════════════════════════════════════════════════════
     PUBLIC APPLICATION (creators.html)
     ══════════════════════════════════════════════════════════════ */

  function initPublicApply() {
    const form = document.getElementById('creator-apply-form');
    if (!form) return;

    // Populate niche & platform selects
    const nicheEl = document.getElementById('ca-niche');
    const platformEl = document.getElementById('ca-platform');
    if (nicheEl) {
      NICHES.forEach(n => {
        const o = document.createElement('option');
        o.value = n; o.textContent = n;
        nicheEl.appendChild(o);
      });
    }
    if (platformEl) {
      PLATFORMS.forEach(p => {
        const o = document.createElement('option');
        o.value = p; o.textContent = p;
        platformEl.appendChild(o);
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = form.querySelector('.apply-submit-btn');
      const msg = document.getElementById('apply-msg');
      const setMsg = (txt, cls) => {
        if (msg) { msg.textContent = txt; msg.className = 'form-msg ' + (cls || ''); }
      };

      // Gather fields
      const firstName  = (document.getElementById('ca-firstname') || {}).value || '';
      const lastName   = (document.getElementById('ca-lastname')  || {}).value || '';
      const email      = (document.getElementById('ca-email')     || {}).value || '';
      const handle     = (document.getElementById('ca-handle')    || {}).value || '';
      const niche      = (document.getElementById('ca-niche')     || {}).value || '';
      const platform   = (document.getElementById('ca-platform')  || {}).value || '';
      const followers  = (document.getElementById('ca-followers') || {}).value || '';
      const profileUrl = (document.getElementById('ca-profile')   || {}).value || '';
      const bio        = (document.getElementById('ca-bio')       || {}).value || '';

      if (!firstName || !email || !handle || !niche || !platform) {
        setMsg('Please fill in all required fields.', 'error');
        return;
      }

      const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();

      btn.disabled = true;
      btn.textContent = 'Submitting…';
      setMsg('', '');

      try {
        // Check for duplicate handle
        const existing = await db().collection('creators').where('handle', '==', cleanHandle).get();
        if (!existing.empty) {
          setMsg('That handle is already registered. Log in to your account.', 'error');
          btn.disabled = false; btn.textContent = 'Submit Application';
          return;
        }

        const docId = cleanHandle + '_' + Date.now().toString(36);
        await db().collection('creators').doc(docId).set({
          docId,
          firstName, lastName,
          displayName: (firstName + ' ' + lastName).trim(),
          email: email.toLowerCase().trim(),
          handle: cleanHandle,
          niche, primaryPlatform: platform,
          followersRange: followers,
          profileUrl,
          bio,
          status: 'pending',
          tier: 'seedling',
          totalContent: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
          referralCode: cleanHandle,
          appliedAt: fv().serverTimestamp(),
          createdAt: fv().serverTimestamp(),
        });

        setMsg('Application received! We review within 2–3 business days. Check your account dashboard for updates.', 'success');
        form.reset();
        btn.textContent = 'Application Submitted ✓';

      } catch (err) {
        console.error('Creator apply error:', err);
        setMsg('Something went wrong. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     REFERRAL TRACKING  (all pages)
     ══════════════════════════════════════════════════════════════ */

  function trackCreatorClick() {
    const ref = new URLSearchParams(window.location.search).get('cr');
    if (!ref) return;
    sessionStorage.setItem('ds_creator_ref', ref);
    localStorage.setItem('ds_creator_ref_src', ref);
    localStorage.setItem('ds_creator_ref_ts', Date.now().toString());
    try {
      const today = new Date().toISOString().split('T')[0];
      db().collection('creators').where('referralCode', '==', ref).limit(1).get().then(snap => {
        if (snap.empty) return;
        const docRef = snap.docs[0].ref;
        docRef.collection('content').where('platform', '==', '__clicks__').limit(1).get().catch(() => {});
        docRef.update({ totalClicks: fv().increment(1) }).catch(() => {});
        docRef.collection('clickLog').doc(today)
          .set({ count: fv().increment(1), last: fv().serverTimestamp() }, { merge: true })
          .catch(() => {});
      });
    } catch (_) {}
  }

  function attributeCreatorSale(orderId, total, email) {
    const ref = sessionStorage.getItem('ds_creator_ref') || localStorage.getItem('ds_creator_ref_src');
    if (!ref) return;
    sessionStorage.removeItem('ds_creator_ref');
    try {
      db().collection('creators').where('referralCode', '==', ref).limit(1).get().then(snap => {
        if (snap.empty) return;
        const docRef = snap.docs[0].ref;
        const commission = +((total || 0) * COMMISSION_RATE).toFixed(2);
        docRef.collection('content').add({
          type: '__sale__',
          orderId, orderTotal: +total, commission,
          customerEmail: email || 'anon',
          status: 'conversion',
          createdAt: fv().serverTimestamp(),
        }).catch(() => {});
        docRef.update({
          totalConversions: fv().increment(1),
          totalEarnings:    fv().increment(commission),
          pendingEarnings:  fv().increment(commission),
        }).catch(() => {});
      });
    } catch (_) {}
  }

  /* ══════════════════════════════════════════════════════════════
     ACCOUNT PORTAL — CREATOR TAB (account.html)
     ══════════════════════════════════════════════════════════════ */

  async function initCreatorPortalTab(user) {
    const container = document.getElementById('creator-portal-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,.4)">Loading creator profile…</div>';

    try {
      // Find creator doc by email
      const snap = await db().collection('creators').where('email', '==', (user.email || '').toLowerCase()).limit(1).get();

      if (snap.empty) {
        // Not applied yet
        container.innerHTML = `
          <div class="creator-apply-card">
            <h3>Become a DS Creator</h3>
            <p>Partner with Dripping Secrets, share content you love, and earn 12–16% commission on every sale you inspire. Apply in minutes.</p>
            <a href="/creators.html">Apply to the Creator Program</a>
          </div>`;
        return;
      }

      const docSnap = snap.docs[0];
      const data    = docSnap.data();
      const status  = data.status || 'pending';

      if (status === 'pending') {
        container.innerHTML = `
          <div class="creator-portal-wrap">
            <div class="cp-status-banner pending">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>Your application is <strong>under review</strong>. We'll update you within 2–3 business days.</span>
            </div>
            <div class="creator-apply-card" style="padding:30px 0 0">
              <p style="font-size:.85rem;color:rgba(255,255,255,.45);margin:0">Applied as <strong style="color:#B76E79">@${data.handle}</strong> in ${data.niche || 'your niche'}.</p>
            </div>
          </div>`;
        return;
      }

      if (status === 'rejected') {
        container.innerHTML = `
          <div class="creator-portal-wrap">
            <div class="cp-status-banner rejected">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>Your application was not approved at this time. <a href="/contact.html" style="color:#B76E79">Contact us</a> if you have questions.</span>
            </div>
          </div>`;
        return;
      }

      if (status === 'suspended') {
        container.innerHTML = `
          <div class="creator-portal-wrap">
            <div class="cp-status-banner suspended">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>Your creator account is <strong>suspended</strong>. <a href="/contact.html" style="color:#B76E79">Contact support</a>.</span>
            </div>
          </div>`;
        return;
      }

      // Active creator
      const tier = getTier(data.totalImpressions || 0);
      const ref  = data.referralCode || data.handle;
      const link = `https://drippingsecrets.com/shop.html?cr=${ref}`;

      // Fetch recent content
      let contentItems = [];
      try {
        const cSnap = await docSnap.ref.collection('content')
          .where('type', '!=', '__sale__').orderBy('createdAt', 'desc').limit(10).get();
        contentItems = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}

      // Fetch payouts
      let payouts = [];
      try {
        const pSnap = await docSnap.ref.collection('payouts').orderBy('requestedAt', 'desc').limit(6).get();
        payouts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (_) {}

      const pendingEarnings = data.pendingEarnings || 0;

      container.innerHTML = `
        <div class="creator-portal-wrap">
          <div class="cp-status-banner active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/></svg>
            <span>Creator account active &nbsp;|&nbsp;
              <span class="creator-tier ${tier.cssClass}">${tier.badge} ${tier.label}</span>
            </span>
          </div>

          <div class="cp-stats-grid">
            <div class="cp-stat"><div class="cp-stat-val">${fmt(data.totalContent)}</div><div class="cp-stat-lbl">Posts</div></div>
            <div class="cp-stat"><div class="cp-stat-val">${fmt(data.totalImpressions)}</div><div class="cp-stat-lbl">Impressions</div></div>
            <div class="cp-stat"><div class="cp-stat-val">${fmt(data.totalClicks)}</div><div class="cp-stat-lbl">Clicks</div></div>
            <div class="cp-stat"><div class="cp-stat-val">${fmt(data.totalConversions)}</div><div class="cp-stat-lbl">Conversions</div></div>
            <div class="cp-stat"><div class="cp-stat-val">${money(data.totalEarnings)}</div><div class="cp-stat-lbl">Total Earned</div></div>
            <div class="cp-stat"><div class="cp-stat-val" style="color:#ffa500">${money(pendingEarnings)}</div><div class="cp-stat-lbl">Pending</div></div>
          </div>

          <div class="cp-section-title">Your Referral Link</div>
          <div class="cp-link-box">
            <input type="text" id="cp-ref-link" value="${link}" readonly onclick="this.select()"/>
            <button class="cp-copy-btn" onclick="window.cpCopyLink()">Copy</button>
          </div>

          <div class="cp-section-title">Submit Content</div>
          <div class="content-submit-form" id="cp-submit-form">
            <h4>Add a post or video you created featuring Dripping Secrets</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Platform <span class="req">*</span></label>
                <select id="cp-platform">
                  ${PLATFORMS.map(p => `<option>${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Content Type</label>
                <select id="cp-content-type">
                  <option>Post</option><option>Reel / Short</option><option>Story</option>
                  <option>Video</option><option>Review</option><option>Blog</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Content Title / Caption <span class="req">*</span></label>
              <input type="text" id="cp-content-title" placeholder="Brief description of your content"/>
            </div>
            <div class="form-group">
              <label>Content URL <span class="req">*</span></label>
              <input type="url" id="cp-content-url" placeholder="https://instagram.com/p/…"/>
            </div>
            <div class="form-group">
              <label>Estimated Impressions</label>
              <input type="number" id="cp-impressions" placeholder="e.g. 5000" min="0"/>
            </div>
            <button class="apply-submit-btn" onclick="window.cpSubmitContent('${docSnap.id}')" style="margin-top:0">Submit Content</button>
            <div class="form-msg" id="cp-content-msg"></div>
          </div>

          <div class="cp-section-title">My Content</div>
          <div class="content-list" id="cp-content-list">
            ${contentItems.length === 0
              ? '<p style="color:rgba(255,255,255,.35);font-size:.85rem;text-align:center;padding:16px 0">No content submitted yet. Add your first post above.</p>'
              : contentItems.map(ci => `
                  <div class="content-item">
                    <span class="ci-platform">${ci.platform || ''}</span>
                    <span class="ci-title">${_esc(ci.title || ci.url || '')}</span>
                    <span class="ci-stats">${fmt(ci.impressions || 0)} impr · ${fmt(ci.clicks || 0)} clicks</span>
                    <span class="ci-status-badge ${ci.status || 'reviewing'}">${ci.status || 'reviewing'}</span>
                  </div>`).join('')
            }
          </div>

          <div class="cp-section-title">Earnings & Payouts</div>
          ${pendingEarnings >= 25
            ? `<button class="apply-submit-btn" onclick="window.cpRequestPayout('${docSnap.id}', ${pendingEarnings})" style="margin-bottom:16px;width:auto;padding:10px 28px;font-size:.88rem">Request Payout (${money(pendingEarnings)})</button>
               <div class="form-msg" id="cp-payout-msg"></div>`
            : `<p style="font-size:.82rem;color:rgba(255,255,255,.35);margin-bottom:16px">Minimum $25 pending balance to request a payout. Current: ${money(pendingEarnings)}</p>`
          }
          <div class="earnings-table-wrap">
            <table class="earnings-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody id="cp-payouts-tbody">
                ${payouts.length === 0
                  ? '<tr><td colspan="3" style="text-align:center;color:rgba(255,255,255,.3);padding:18px">No payout history yet</td></tr>'
                  : payouts.map(p => `
                      <tr>
                        <td>${_formatDate(p.requestedAt)}</td>
                        <td class="amt">${money(p.amount)}</td>
                        <td><span class="payout-badge ${p.status || 'pending'}">${p.status || 'pending'}</span></td>
                      </tr>`).join('')
                }
              </tbody>
            </table>
          </div>
        </div>`;

      // Expose handlers
      global.cpCopyLink = function () {
        const el = document.getElementById('cp-ref-link');
        if (!el) return;
        el.select();
        try { document.execCommand('copy'); } catch (_) {}
        const btn = document.querySelector('.cp-copy-btn');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
      };

      global.cpSubmitContent = async function (creatorDocId) {
        const platform = (document.getElementById('cp-platform')      || {}).value || '';
        const type     = (document.getElementById('cp-content-type')  || {}).value || 'Post';
        const title    = (document.getElementById('cp-content-title') || {}).value || '';
        const url      = (document.getElementById('cp-content-url')   || {}).value || '';
        const imprRaw  = (document.getElementById('cp-impressions')   || {}).value || '0';
        const msgEl    = document.getElementById('cp-content-msg');
        const setMsg   = (t, c) => { if (msgEl) { msgEl.textContent = t; msgEl.className = 'form-msg ' + (c || ''); }};

        if (!platform || !title || !url) { setMsg('Please fill in platform, title, and URL.', 'error'); return; }

        try {
          const impr = parseInt(imprRaw, 10) || 0;
          await db().collection('creators').doc(creatorDocId).collection('content').add({
            platform, type, title, url, impressions: impr,
            clicks: 0, conversions: 0, earnings: 0,
            status: 'reviewing',
            submittedAt: fv().serverTimestamp(),
            createdAt: fv().serverTimestamp(),
          });
          await db().collection('creators').doc(creatorDocId).update({
            totalContent:     fv().increment(1),
            totalImpressions: fv().increment(impr),
          });
          setMsg('Content submitted for review!', 'success');
          document.getElementById('cp-content-title').value = '';
          document.getElementById('cp-content-url').value   = '';
          document.getElementById('cp-impressions').value   = '';
        } catch (err) {
          console.error(err);
          setMsg('Submission failed. Please try again.', 'error');
        }
      };

      global.cpRequestPayout = async function (creatorDocId, amount) {
        const msgEl = document.getElementById('cp-payout-msg');
        const setMsg = (t, c) => { if (msgEl) { msgEl.textContent = t; msgEl.className = 'form-msg ' + (c || ''); }};
        if (amount < 25) { setMsg('Minimum payout is $25.', 'error'); return; }
        try {
          await db().collection('creators').doc(creatorDocId).collection('payouts').add({
            amount: +amount.toFixed(2),
            status: 'pending',
            method: 'TBD',
            requestedAt: fv().serverTimestamp(),
          });
          await db().collection('creators').doc(creatorDocId).update({
            pendingEarnings: 0,
          });
          setMsg('Payout request submitted! Ashley will process it within 3–5 business days.', 'success');
        } catch (err) {
          console.error(err);
          setMsg('Request failed. Please try again.', 'error');
        }
      };

    } catch (err) {
      console.error('Creator portal load error:', err);
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#e87070">Failed to load creator profile. Please refresh.</div>';
    }
  }

  /* ══════════════════════════════════════════════════════════════
     ADMIN PANEL (admin.html)
     ══════════════════════════════════════════════════════════════ */

  let _adminCreatorFilter = 'all';

  async function loadAdminCreators(filter) {
    _adminCreatorFilter = filter || _adminCreatorFilter;
    const container = document.getElementById('creators-admin-list');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,.35)">Loading…</div>';

    try {
      let q = db().collection('creators').orderBy('appliedAt', 'desc');
      const snap = await q.get();

      // Client-side filter (Firestore index-free)
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (_adminCreatorFilter !== 'all') {
        docs = docs.filter(d => d.status === _adminCreatorFilter);
      }

      // Update counts in filter buttons
      const counts = { all: docs.length };
      ['pending','active','suspended','rejected'].forEach(s => {
        counts[s] = snap.docs.filter(d => d.data().status === s).length;
      });
      ['all','pending','active','suspended','rejected'].forEach(s => {
        const btn = document.getElementById(`cfilter-${s}`);
        if (btn) btn.textContent = s.charAt(0).toUpperCase() + s.slice(1) + ` (${counts[s] !== undefined ? counts[s] : 0})`;
      });
      const allBtn = document.getElementById('cfilter-all');
      if (allBtn) allBtn.textContent = `All (${snap.docs.length})`;

      if (docs.length === 0) {
        container.innerHTML = '<div class="creator-admin-empty">No creators found for this filter.</div>';
        return;
      }

      container.innerHTML = docs.map(c => {
        const tier    = getTier(c.totalImpressions || 0);
        const initial = (c.displayName || c.handle || '?')[0].toUpperCase();
        const actionBtns = buildActionBtns(c);
        return `
          <div class="creator-admin-card" id="cac-${c.id}">
            <div class="cac-avatar">${initial}</div>
            <div class="cac-info">
              <div class="cac-name">${_esc(c.displayName || c.handle || 'Unknown')}
                <span class="creator-tier ${tier.cssClass}" style="margin-left:8px;font-size:.68rem">${tier.badge} ${tier.label}</span>
              </div>
              <div class="cac-email">${_esc(c.email || '')}</div>
              <div class="cac-niche">@${_esc(c.handle || '')} · ${_esc(c.niche || '')} · ${_esc(c.primaryPlatform || '')}</div>
            </div>
            <div class="cac-stats">
              <div class="cac-stat"><div class="cac-sv">${fmt(c.totalContent)}</div><div class="cac-sl">Posts</div></div>
              <div class="cac-stat"><div class="cac-sv">${fmt(c.totalImpressions)}</div><div class="cac-sl">Impr.</div></div>
              <div class="cac-stat"><div class="cac-sv">${fmt(c.totalConversions)}</div><div class="cac-sl">Conv.</div></div>
              <div class="cac-stat"><div class="cac-sv">${money(c.totalEarnings)}</div><div class="cac-sl">Earned</div></div>
              <div class="cac-stat"><div class="cac-sv" style="color:#ffa500">${money(c.pendingEarnings)}</div><div class="cac-sl">Pending</div></div>
            </div>
            <div class="cac-actions">${actionBtns}</div>
          </div>`;
      }).join('');

    } catch (err) {
      console.error('Admin creator load error:', err);
      container.innerHTML = '<div class="creator-admin-empty">Error loading creators. Refresh to retry.</div>';
    }
  }

  function buildActionBtns(c) {
    const btns = [];
    if (c.status === 'pending') {
      btns.push(`<button class="cac-btn approve"  onclick="adminCreatorAction('${c.id}','approve')">Approve</button>`);
      btns.push(`<button class="cac-btn reject"   onclick="adminCreatorAction('${c.id}','reject')">Decline</button>`);
    } else if (c.status === 'active') {
      btns.push(`<button class="cac-btn suspend"  onclick="adminCreatorAction('${c.id}','suspend')">Suspend</button>`);
      btns.push(`<button class="cac-btn view-content" onclick="adminViewCreatorContent('${c.id}')">Content</button>`);
    } else if (c.status === 'suspended' || c.status === 'rejected') {
      btns.push(`<button class="cac-btn reinstate" onclick="adminCreatorAction('${c.id}','reinstate')">Reinstate</button>`);
    }
    return btns.join('');
  }

  global.adminCreatorAction = async function (docId, action) {
    const statusMap = { approve: 'active', reject: 'rejected', suspend: 'suspended', reinstate: 'active' };
    const newStatus = statusMap[action];
    if (!newStatus) return;
    try {
      await db().collection('creators').doc(docId).update({
        status: newStatus,
        [`${action}At`]: fv().serverTimestamp(),
      });
      loadAdminCreators();
    } catch (err) {
      console.error('Creator action error:', err);
      alert('Action failed. Please try again.');
    }
  };

  global.adminViewCreatorContent = async function (docId) {
    const modal = document.getElementById('creator-content-modal');
    const body  = document.getElementById('creator-content-modal-body');
    if (!modal || !body) return;

    body.innerHTML = '<div style="color:rgba(255,255,255,.4);text-align:center;padding:30px">Loading…</div>';
    modal.style.display = 'flex';

    try {
      const snap = await db().collection('creators').doc(docId)
        .collection('content').orderBy('submittedAt', 'desc').limit(20).get();
      if (snap.empty) {
        body.innerHTML = '<p style="color:rgba(255,255,255,.35);text-align:center">No content submissions yet.</p>';
        return;
      }
      body.innerHTML = snap.docs.map(d => {
        const c = d.data();
        return `<div class="content-item" style="margin-bottom:10px">
          <span class="ci-platform">${c.platform || ''}</span>
          <span class="ci-title" style="flex:1">
            ${c.url ? `<a href="${_esc(c.url)}" target="_blank" rel="noopener" style="color:#B76E79;text-decoration:none">${_esc(c.title || c.url)}</a>` : _esc(c.title || '')}
          </span>
          <span class="ci-stats">${fmt(c.impressions||0)} impr · ${fmt(c.clicks||0)} clicks</span>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="ci-status-badge ${c.status||'reviewing'}">${c.status||'reviewing'}</span>
            ${c.status !== 'live' ? `<button style="font-size:.72rem;padding:3px 10px;border-radius:8px;background:rgba(134,197,121,.14);border:1px solid rgba(134,197,121,.4);color:#86c579;cursor:pointer" onclick="adminApproveContent('${docId}','${d.id}')">Approve</button>` : ''}
            ${c.status !== 'rejected' ? `<button style="font-size:.72rem;padding:3px 10px;border-radius:8px;background:rgba(232,112,112,.12);border:1px solid rgba(232,112,112,.35);color:#e87070;cursor:pointer" onclick="adminRejectContent('${docId}','${d.id}')">Reject</button>` : ''}
          </div>
        </div>`;
      }).join('');
    } catch (err) {
      body.innerHTML = '<p style="color:#e87070;text-align:center">Error loading content.</p>';
    }
  };

  global.adminApproveContent = async function (creatorDocId, contentDocId) {
    try {
      await db().collection('creators').doc(creatorDocId).collection('content').doc(contentDocId).update({ status: 'live' });
      global.adminViewCreatorContent(creatorDocId);
    } catch (e) { alert('Failed to approve.'); }
  };

  global.adminRejectContent = async function (creatorDocId, contentDocId) {
    try {
      await db().collection('creators').doc(creatorDocId).collection('content').doc(contentDocId).update({ status: 'rejected' });
      global.adminViewCreatorContent(creatorDocId);
    } catch (e) { alert('Failed to reject.'); }
  };

  global.closeCreatorContentModal = function () {
    const m = document.getElementById('creator-content-modal');
    if (m) m.style.display = 'none';
  };

  global.loadAdminCreators = function (filter) { loadAdminCreators(filter); };

  /* ── Helpers ─────────────────────────────────────────────── */
  function _esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _formatDate(ts) {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) { return '—'; }
  }

  /* ── Entrypoint ──────────────────────────────────────────── */
  function init() {
    trackCreatorClick();

    if (document.getElementById('creator-apply-form')) {
      initPublicApply();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Public API ──────────────────────────────────────────── */
  global.DSCreator = {
    initPortalTab:      initCreatorPortalTab,
    loadAdminCreators,
    trackCreatorClick,
    attributeCreatorSale,
    getTier,
  };

}(window));
