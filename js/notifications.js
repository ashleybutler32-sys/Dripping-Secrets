/* ============================================================
   notifications.js — Dripping Secrets Back Office Notifications
   BK-15 | v16.4 | Real-Time In-App Notification Center
   ============================================================ */

(function () {
  'use strict';

  /* ── State ────────────────────────────────────────────────── */
  let _listener   = null;
  let _open       = false;
  let _unread     = 0;
  let _allNotifs  = [];

  const ICONS = {
    order   : '🛍️',
    booking : '🎉',
    support : '🎗️',
    payment : '💰',
    system  : '⚙️',
    stock   : '📦',
    default : '🔔',
  };

  /* ── Bootstrap ────────────────────────────────────────────── */
  function init() {
    injectBell();
    injectDrawer();
    startListener();
  }

  /* ── Bell button ──────────────────────────────────────────── */
  function injectBell() {
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight || document.getElementById('notif-bell-btn')) return;

    const btn = document.createElement('button');
    btn.id        = 'notif-bell-btn';
    btn.className = 'badge-btn';
    btn.title     = 'Notifications';
    btn.setAttribute('aria-label', 'Open notifications');
    btn.onclick   = toggleDrawer;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
      <span class="badge" id="notif-badge" style="display:none">0</span>`;

    // Insert before the View Site link
    const viewSite = topbarRight.querySelector('a[href="index.html"]');
    topbarRight.insertBefore(btn, viewSite || topbarRight.firstChild);
  }

  /* ── Drawer ───────────────────────────────────────────────── */
  function injectDrawer() {
    if (document.getElementById('notif-drawer')) return;
    const drawer = document.createElement('div');
    drawer.id = 'notif-drawer';
    drawer.setAttribute('aria-live', 'polite');
    drawer.style.cssText = `
      position:fixed;top:0;right:-380px;width:360px;height:100vh;
      background:#1a0a24;border-left:1px solid rgba(212,175,55,.2);
      z-index:9999;transition:right .3s cubic-bezier(.4,0,.2,1);
      display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,.5);`;
    drawer.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(75,31,95,.4)">
        <h3 style="margin:0;font-size:1rem;color:var(--gold,#D4AF37);font-family:var(--font-serif,serif)">Notifications</h3>
        <div style="display:flex;gap:8px;align-items:center">
          <button onclick="window.dsNotif.markAllRead()" style="background:none;border:none;color:var(--muted);font-size:.75rem;cursor:pointer;text-decoration:underline;padding:0">Mark all read</button>
          <button onclick="window.dsNotif.closeDrawer()" aria-label="Close notifications"
            style="background:rgba(255,255,255,.07);border:none;color:var(--text,#fff);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">✕</button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div style="display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,.08);padding:0 18px">
        <button class="notif-tab-btn active" onclick="window.dsNotif.filterTab('all',this)" style="padding:10px 14px;background:none;border:none;border-bottom:2px solid var(--gold,#D4AF37);color:var(--gold,#D4AF37);font-size:.8rem;cursor:pointer;font-weight:600">All</button>
        <button class="notif-tab-btn" onclick="window.dsNotif.filterTab('unread',this)" style="padding:10px 14px;background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);font-size:.8rem;cursor:pointer">Unread</button>
        <button class="notif-tab-btn" onclick="window.dsNotif.filterTab('order',this)" style="padding:10px 14px;background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);font-size:.8rem;cursor:pointer">Orders</button>
        <button class="notif-tab-btn" onclick="window.dsNotif.filterTab('system',this)" style="padding:10px 14px;background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);font-size:.8rem;cursor:pointer">System</button>
      </div>

      <!-- List -->
      <div id="notif-list" style="flex:1;overflow-y:auto;padding:0 0 80px"></div>

      <!-- Footer -->
      <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);background:#1a0a24;display:flex;gap:8px">
        <button onclick="window.dsNotif.clearAll()" style="flex:1;padding:9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:var(--muted);border-radius:7px;cursor:pointer;font-size:.8rem">Clear All</button>
        <button onclick="window.dsNotif.createTest()" style="flex:1;padding:9px;background:rgba(75,31,95,.5);border:1px solid rgba(212,175,55,.3);color:var(--gold,#D4AF37);border-radius:7px;cursor:pointer;font-size:.8rem">+ Test Notif</button>
      </div>`;

    document.body.appendChild(drawer);

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'notif-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998;display:none;backdrop-filter:blur(2px)';
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);
  }

  /* ── Firestore listener ───────────────────────────────────── */
  function startListener() {
    if (!window.firebase) { setTimeout(startListener, 1000); return; }
    try {
      const db = firebase.firestore();
      _listener = db.collection('notifications')
        .orderBy('createdAt','desc')
        .limit(50)
        .onSnapshot(snap => {
          _allNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          renderList('all');
          updateBadge();
        }, err => console.warn('[Notifications] listener:', err));
    } catch(e) { console.warn('[Notifications] init:', e); }
  }

  /* ── Badge ────────────────────────────────────────────────── */
  function updateBadge() {
    _unread = _allNotifs.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (_unread > 0) {
      badge.style.display = 'inline-block';
      badge.textContent   = _unread > 99 ? '99+' : _unread;
    } else {
      badge.style.display = 'none';
    }
  }

  /* ── Render list ──────────────────────────────────────────── */
  let _currentFilter = 'all';

  function renderList(filter) {
    _currentFilter = filter || _currentFilter;
    const el = document.getElementById('notif-list');
    if (!el) return;

    let items = _allNotifs;
    if (_currentFilter === 'unread') items = items.filter(n => !n.read);
    else if (_currentFilter !== 'all') items = items.filter(n => n.type === _currentFilter);

    if (!items.length) {
      el.innerHTML = `<div style="text-align:center;padding:48px 24px;color:var(--muted)">
        <div style="font-size:2rem;margin-bottom:10px">🔔</div>
        <div style="font-size:.85rem">No notifications here.</div>
      </div>`;
      return;
    }

    el.innerHTML = items.map(n => {
      const ts  = n.createdAt?.toDate ? n.createdAt.toDate() : (n.createdAt ? new Date(n.createdAt) : new Date());
      const ago = timeAgo(ts);
      const icon = ICONS[n.type] || ICONS.default;
      const readStyle = n.read ? 'opacity:.6' : '';
      const dotStyle  = n.read ? 'display:none' : 'display:inline-block;width:7px;height:7px;border-radius:50%;background:#B76E79;margin-left:auto;flex-shrink:0';
      return `
        <div class="notif-item" data-id="${n.id}" onclick="window.dsNotif.markRead('${n.id}')"
          style="display:flex;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .15s;${readStyle}"
          onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background=''">
          <span style="font-size:1.2rem;line-height:1">${icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:.84rem;font-weight:${n.read?400:600};line-height:1.3;margin-bottom:3px">${n.message||'Notification'}</div>
            ${n.detail ? `<div style="font-size:.76rem;color:var(--muted);line-height:1.3;margin-bottom:4px">${n.detail}</div>` : ''}
            <div style="font-size:.72rem;color:rgba(255,255,255,.3)">${ago}</div>
          </div>
          <span style="${dotStyle}"></span>
        </div>`;
    }).join('');
  }

  /* ── Drawer toggle ────────────────────────────────────────── */
  function toggleDrawer() {
    _open ? closeDrawer() : openDrawer();
  }

  function openDrawer() {
    const d = document.getElementById('notif-drawer');
    const o = document.getElementById('notif-overlay');
    if (d) d.style.right = '0';
    if (o) o.style.display = 'block';
    _open = true;
    renderList(_currentFilter);
  }

  function closeDrawer() {
    const d = document.getElementById('notif-drawer');
    const o = document.getElementById('notif-overlay');
    if (d) d.style.right = '-380px';
    if (o) o.style.display = 'none';
    _open = false;
  }

  function filterTab(filter, btn) {
    document.querySelectorAll('.notif-tab-btn').forEach(b => {
      b.style.borderBottomColor = 'transparent';
      b.style.color = 'var(--muted)';
      b.classList.remove('active');
    });
    btn.style.borderBottomColor = 'var(--gold,#D4AF37)';
    btn.style.color = 'var(--gold,#D4AF37)';
    btn.classList.add('active');
    renderList(filter);
  }

  /* ── Mark read ────────────────────────────────────────────── */
  function markRead(id) {
    if (!window.firebase) return;
    firebase.firestore().collection('notifications').doc(id).update({ read: true }).catch(()=>{});
  }

  function markAllRead() {
    if (!window.firebase) return;
    const db = firebase.firestore();
    const batch = db.batch();
    _allNotifs.filter(n => !n.read).forEach(n => {
      batch.update(db.collection('notifications').doc(n.id), { read: true });
    });
    batch.commit().catch(()=>{});
  }

  function clearAll() {
    if (!confirm('Clear all notifications? This cannot be undone.')) return;
    if (!window.firebase) return;
    const db = firebase.firestore();
    const batch = db.batch();
    _allNotifs.forEach(n => batch.delete(db.collection('notifications').doc(n.id)));
    batch.commit().catch(()=>{});
  }

  /* ── Create notification (public API) ─────────────────────── */
  function createNotification(type, message, detail, meta) {
    if (!window.firebase) return Promise.resolve();
    return firebase.firestore().collection('notifications').add({
      type    : type || 'system',
      message : message || '',
      detail  : detail  || '',
      meta    : meta    || {},
      read    : false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  /* ── Test notification ────────────────────────────────────── */
  function createTest() {
    const types  = ['order','booking','support','payment','system','stock'];
    const msgs   = ['New order received — $89.00','Event booking confirmed','Support ticket opened','Payment processed via CashApp','System updated successfully','Low stock: product threshold reached'];
    const i      = Math.floor(Math.random() * types.length);
    createNotification(types[i], msgs[i], 'This is a test notification from the system.');
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  function timeAgo(date) {
    const sec = Math.round((Date.now() - date) / 1000);
    if (sec < 60)    return 'just now';
    if (sec < 3600)  return `${Math.floor(sec/60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec/3600)}h ago`;
    return `${Math.floor(sec/86400)}d ago`;
  }

  /* ── Public API ───────────────────────────────────────────── */
  window.dsNotif = {
    init,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    markRead,
    markAllRead,
    clearAll,
    filterTab,
    createNotification,
    createTest,
  };

  /* ── Auto-init after DOM ready ────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to let admin nav render
    setTimeout(init, 400);
  }

})();
