/* ═══════════════════════════════════════════════════════════════
   DRIPPING SECRETS MEMBERSHIP PROGRAM  —  js/memberships.js
   Dripping Secrets v9.83 — Sprint G
   Four membership tiers: Free | Insider | VIP | Elite
   Customer-facing: account.html Membership tab
   Admin-facing:    admin.html Membership panel
   Firestore collection: memberships
   ═══════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ── Tier definitions ── */
  const TIERS = {
    free: {
      id: 'free',
      label: 'Free',
      badge: '🌙',
      color: '#a084c4',
      accentColor: '#7c3aed',
      price: 0,
      features: [
        'Customer account access',
        'Full order history',
        'Dripping Rewards points earn',
        'Wishlist & saved items',
      ],
      upgradeMessage: 'Unlock exclusive discounts with Insider.'
    },
    insider: {
      id: 'insider',
      label: 'Insider',
      badge: '💜',
      color: '#B76E79',
      accentColor: '#B76E79',
      price: 0,
      features: [
        'Everything in Free',
        'Exclusive member discounts',
        'Early sale access (24 hrs before public)',
        'Insider-only product previews',
        'Priority customer support',
      ],
      upgradeMessage: 'Unlock monthly coupons and VIP drops with VIP.'
    },
    vip: {
      id: 'vip',
      label: 'VIP',
      badge: '✨',
      color: '#e2c4ff',
      accentColor: '#9b5fc0',
      price: 0,
      features: [
        'Everything in Insider',
        'Monthly exclusive coupon code',
        'Priority support queue',
        'VIP-only product drops',
        'Double Dripping Rewards on select items',
        'Birthday surprise offer',
      ],
      upgradeMessage: 'Reach Elite for the highest discounts and Dimi concierge.'
    },
    elite: {
      id: 'elite',
      label: 'Elite',
      badge: '👑',
      color: '#FFD700',
      accentColor: '#c8a800',
      price: 0,
      features: [
        'Everything in VIP',
        'Highest-tier exclusive discounts',
        'Event perks & early party access',
        'Special Dimi concierge experience',
        'Triple Dripping Rewards on all purchases',
        'White-glove gifting assistance',
        'Elite community access',
      ],
      upgradeMessage: null
    }
  };

  const TIER_ORDER = ['free', 'insider', 'vip', 'elite'];

  /* ── Firestore helpers (mirrors pattern used by rewards.js) ── */
  function getDb() {
    return (typeof firebase !== 'undefined' && firebase.apps.length)
      ? firebase.firestore()
      : null;
  }

  async function getMembership(uid) {
    const db = getDb();
    if (!db || !uid) return null;
    try {
      const doc = await db.collection('memberships').doc(uid).get();
      if (doc.exists) return doc.data();
      // New user — create Free membership record
      const record = {
        uid,
        tier: 'free',
        joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        notes: '',
        adminOverride: false
      };
      await db.collection('memberships').doc(uid).set(record);
      return record;
    } catch (e) {
      console.warn('[DS Memberships] Firestore read error:', e);
      return null;
    }
  }

  async function setMembership(uid, tier, notes, adminOverride) {
    const db = getDb();
    if (!db || !uid) return false;
    try {
      await db.collection('memberships').doc(uid).set({
        uid,
        tier,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        notes: notes || '',
        adminOverride: !!adminOverride
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('[DS Memberships] Firestore write error:', e);
      return false;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     CUSTOMER ACCOUNT TAB
     Rendered inside account.html's membership tab container.
     ══════════════════════════════════════════════════════════════ */
  async function renderAccountTab(container, user) {
    container.innerHTML = '<div class="mem-loading">Loading your membership...</div>';

    const record = await getMembership(user.uid);
    const currentTier = (record && record.tier) ? record.tier : 'free';
    const tierData = TIERS[currentTier] || TIERS.free;
    const tierIdx = TIER_ORDER.indexOf(currentTier);

    /* Build tier progress bar */
    const progressPct = ((tierIdx + 1) / TIER_ORDER.length) * 100;

    container.innerHTML = `
      <div class="mem-account-wrap">

        <!-- Current tier card -->
        <div class="mem-current-card" style="--tier-color:${tierData.accentColor}">
          <div class="mem-current-header">
            <span class="mem-badge">${tierData.badge}</span>
            <div>
              <div class="mem-tier-label">Your Membership</div>
              <div class="mem-tier-name" style="color:${tierData.color}">${tierData.label}</div>
            </div>
          </div>
          <div class="mem-progress-bar" role="progressbar" aria-valuenow="${tierIdx+1}" aria-valuemin="1" aria-valuemax="${TIER_ORDER.length}" aria-label="Membership tier progress">
            <div class="mem-progress-fill" style="width:${progressPct}%;background:${tierData.accentColor}"></div>
          </div>
          <div class="mem-progress-labels">
            ${TIER_ORDER.map((t,i) => `<span class="mem-progress-step${i <= tierIdx ? ' active' : ''}" style="${i <= tierIdx ? 'color:'+TIERS[t].color : ''}">${TIERS[t].badge} ${TIERS[t].label}</span>`).join('')}
          </div>
        </div>

        <!-- Features -->
        <div class="mem-features-block">
          <h3>Your ${tierData.label} Benefits</h3>
          <ul class="mem-features-list">
            ${tierData.features.map(f => `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B76E79" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> ${f}</li>`).join('')}
          </ul>
          ${tierData.upgradeMessage ? `<p class="mem-upgrade-hint">${tierData.upgradeMessage}</p>` : '<p class="mem-elite-msg">You have reached the highest tier. Thank you for being Elite. 👑</p>'}
        </div>

        <!-- All tiers comparison -->
        <div class="mem-all-tiers">
          <h3>Membership Tiers</h3>
          <div class="mem-tiers-grid">
            ${TIER_ORDER.map(tid => {
              const t = TIERS[tid];
              const isActive = tid === currentTier;
              return `<div class="mem-tier-card${isActive ? ' active' : ''}" style="--tc:${t.accentColor}">
                <div class="mem-tc-header">
                  <span class="mem-tc-badge">${t.badge}</span>
                  <span class="mem-tc-name" style="color:${t.color}">${t.label}</span>
                  ${isActive ? '<span class="mem-tc-current">Current</span>' : ''}
                </div>
                <ul class="mem-tc-features">
                  ${t.features.slice(0,4).map(f => `<li>${f}</li>`).join('')}
                  ${t.features.length > 4 ? `<li>+ ${t.features.length - 4} more...</li>` : ''}
                </ul>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Contact to upgrade -->
        <div class="mem-upgrade-cta">
          <p>Want to upgrade your membership? <a href="/contact.html">Contact us</a> or reach out via chat and our team will take care of you.</p>
        </div>

      </div>`;
  }

  /* ══════════════════════════════════════════════════════════════
     ADMIN PANEL
     Rendered inside admin.html's memberships panel container.
     ══════════════════════════════════════════════════════════════ */
  async function renderAdminPanel(container) {
    container.innerHTML = '<div style="padding:20px;color:#c4b5d8">Loading membership records...</div>';

    const db = getDb();
    if (!db) {
      container.innerHTML = '<div style="padding:20px;color:#f87171">Firestore unavailable.</div>';
      return;
    }

    let members = [];
    try {
      const snap = await db.collection('memberships').orderBy('updatedAt', 'desc').limit(100).get();
      snap.forEach(doc => members.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      container.innerHTML = `<div style="padding:20px;color:#f87171">Error loading memberships: ${e.message}</div>`;
      return;
    }

    /* Tier counts */
    const counts = {};
    TIER_ORDER.forEach(t => counts[t] = 0);
    members.forEach(m => { if (counts[m.tier] !== undefined) counts[m.tier]++; });

    container.innerHTML = `
      <div style="padding:20px">
        <h2 style="color:#e2c4ff;margin:0 0 20px">Membership Management</h2>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:28px">
          ${TIER_ORDER.map(t => `
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:1.5rem">${TIERS[t].badge}</div>
              <div style="font-size:1.4rem;font-weight:700;color:${TIERS[t].color}">${counts[t]}</div>
              <div style="font-size:0.82rem;color:#a084c4">${TIERS[t].label}</div>
            </div>`).join('')}
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:1.5rem">👥</div>
            <div style="font-size:1.4rem;font-weight:700;color:#e2c4ff">${members.length}</div>
            <div style="font-size:0.82rem;color:#a084c4">Total Members</div>
          </div>
        </div>

        <!-- Search + Filter -->
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
          <input id="mem-search" type="search" placeholder="Search by email or UID..." style="flex:1;min-width:200px;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#e2c4ff;font-size:0.9rem" />
          <select id="mem-filter-tier" style="padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#e2c4ff;font-size:0.9rem">
            <option value="">All Tiers</option>
            ${TIER_ORDER.map(t => `<option value="${t}">${TIERS[t].badge} ${TIERS[t].label}</option>`).join('')}
          </select>
        </div>

        <!-- Members table -->
        <div style="overflow-x:auto">
          <table id="mem-table" style="width:100%;border-collapse:collapse;font-size:0.88rem">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                <th style="text-align:left;padding:10px 12px;color:#a084c4;font-weight:600">UID</th>
                <th style="text-align:left;padding:10px 12px;color:#a084c4;font-weight:600">Tier</th>
                <th style="text-align:left;padding:10px 12px;color:#a084c4;font-weight:600">Updated</th>
                <th style="text-align:left;padding:10px 12px;color:#a084c4;font-weight:600">Notes</th>
                <th style="text-align:left;padding:10px 12px;color:#a084c4;font-weight:600">Actions</th>
              </tr>
            </thead>
            <tbody id="mem-tbody">
              ${members.map(m => buildMemberRow(m)).join('')}
            </tbody>
          </table>
        </div>
        ${members.length === 0 ? '<p style="color:#a084c4;padding:20px 0">No membership records yet.</p>' : ''}
      </div>`;

    /* Search + filter */
    const searchEl = container.querySelector('#mem-search');
    const filterEl = container.querySelector('#mem-filter-tier');
    const tbody = container.querySelector('#mem-tbody');

    function applyFilter() {
      const q = (searchEl.value || '').toLowerCase();
      const tier = filterEl.value;
      tbody.querySelectorAll('tr[data-uid]').forEach(row => {
        const uid = (row.dataset.uid || '').toLowerCase();
        const rt = row.dataset.tier;
        const show = (!q || uid.includes(q)) && (!tier || rt === tier);
        row.style.display = show ? '' : 'none';
      });
    }
    if (searchEl) searchEl.addEventListener('input', applyFilter);
    if (filterEl) filterEl.addEventListener('change', applyFilter);

    /* Delegate upgrade/downgrade actions */
    tbody.addEventListener('click', async function(e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const uid = btn.dataset.uid;
      const action = btn.dataset.action;
      const currentT = btn.dataset.current;
      const idx = TIER_ORDER.indexOf(currentT);

      let newTier = currentT;
      if (action === 'upgrade' && idx < TIER_ORDER.length - 1) newTier = TIER_ORDER[idx + 1];
      if (action === 'downgrade' && idx > 0) newTier = TIER_ORDER[idx - 1];
      if (newTier === currentT) return;

      btn.disabled = true;
      btn.textContent = '...';
      const ok = await setMembership(uid, newTier, '', true);
      if (ok) {
        const row = tbody.querySelector(`tr[data-uid="${uid}"]`);
        if (row) {
          row.dataset.tier = newTier;
          row.querySelector('.mem-tier-pill').textContent = TIERS[newTier].badge + ' ' + TIERS[newTier].label;
          row.querySelector('.mem-tier-pill').style.background = TIERS[newTier].accentColor + '33';
          row.querySelector('.mem-tier-pill').style.color = TIERS[newTier].color;
          // Rebuild action buttons
          const actionsCell = row.querySelector('.mem-actions-cell');
          if (actionsCell) actionsCell.innerHTML = buildActionBtns(uid, newTier);
        }
      } else {
        btn.disabled = false;
        btn.textContent = action === 'upgrade' ? '↑' : '↓';
      }
    });
  }

  function buildMemberRow(m) {
    const t = TIERS[m.tier] || TIERS.free;
    const updated = m.updatedAt ? (m.updatedAt.toDate ? m.updatedAt.toDate().toLocaleDateString() : new Date(m.updatedAt.seconds*1000).toLocaleDateString()) : '—';
    return `<tr data-uid="${m.uid}" data-tier="${m.tier}" style="border-bottom:1px solid rgba(255,255,255,0.06)">
      <td style="padding:10px 12px;color:#c4b5d8;font-family:monospace;font-size:0.78rem;max-width:160px;overflow:hidden;text-overflow:ellipsis">${m.uid}</td>
      <td style="padding:10px 12px"><span class="mem-tier-pill" style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.8rem;font-weight:700;background:${t.accentColor}33;color:${t.color}">${t.badge} ${t.label}</span></td>
      <td style="padding:10px 12px;color:#a084c4">${updated}</td>
      <td style="padding:10px 12px;color:#a084c4;max-width:180px;overflow:hidden;text-overflow:ellipsis">${m.notes || '—'}</td>
      <td class="mem-actions-cell" style="padding:10px 12px">${buildActionBtns(m.uid, m.tier)}</td>
    </tr>`;
  }

  function buildActionBtns(uid, tier) {
    const idx = TIER_ORDER.indexOf(tier);
    const canUp = idx < TIER_ORDER.length - 1;
    const canDown = idx > 0;
    return `
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${canUp ? `<button data-action="upgrade" data-uid="${uid}" data-current="${tier}" style="padding:5px 10px;background:rgba(183,110,121,0.2);color:#B76E79;border:1px solid rgba(183,110,121,0.3);border-radius:6px;font-size:0.78rem;cursor:pointer">↑ Upgrade</button>` : ''}
        ${canDown ? `<button data-action="downgrade" data-uid="${uid}" data-current="${tier}" style="padding:5px 10px;background:rgba(255,255,255,0.05);color:#a084c4;border:1px solid rgba(255,255,255,0.1);border-radius:6px;font-size:0.78rem;cursor:pointer">↓ Downgrade</button>` : ''}
      </div>`;
  }

  /* ── Public API ── */
  global.DS_MEMBERSHIPS = {
    TIERS,
    TIER_ORDER,
    getMembership,
    setMembership,
    renderAccountTab,
    renderAdminPanel,
    getTierData: (tierId) => TIERS[tierId] || TIERS.free
  };

})(window);
