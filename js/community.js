/* ============================================================
   DRIPPING SECRETS — Secrets Society Community (v9.92)
   Firestore collection: community
   ============================================================ */
'use strict';

const DSCommunity = (() => {
  let db = null;
  let currentUser = null;
  let currentArea = 'singles_lounge';
  let lastDoc = null;
  const PAGE_SIZE = 10;

  const AREAS = {
    singles_lounge:  { label: 'Singles Lounge',  icon: '💫', desc: 'Solo vibes, self-love, independence' },
    couples_corner:  { label: 'Couples Corner',   icon: '💑', desc: 'For the dynamic duos' },
    wellness_space:  { label: 'Wellness Space',   icon: '🌿', desc: 'Mind, body, and intimacy' },
    events_lounge:   { label: 'Events Lounge',    icon: '🎉', desc: 'Event talk, tickets, parties' },
    creator_corner:  { label: 'Creator Corner',   icon: '🎬', desc: 'For creators and collaborators' }
  };

  /* ── Init ─────────────────────────────────────────────────── */
  async function init() {
    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(async u => {
      currentUser = u;
      renderSidebar();
      await loadPosts();
      loadAreaCounts();
    });
    initComposeModal();
  }

  /* ── Sidebar ─────────────────────────────────────────────── */
  function renderSidebar() {
    const el = document.getElementById('com-areas-list');
    if (!el) return;
    el.innerHTML = Object.entries(AREAS).map(([key, a]) =>
      `<button class="com-area-btn${key===currentArea?' active':''}" onclick="DSCommunity.switchArea('${key}')" data-area="${key}">
        <span class="com-area-icon">${a.icon}</span>
        <span class="com-area-label">${a.label}</span>
        <span class="com-area-count" id="area-count-${key}"></span>
      </button>`
    ).join('');
  }

  async function loadAreaCounts() {
    if (!db) return;
    for (const key of Object.keys(AREAS)) {
      try {
        const snap = await db.collection('community').where('area', '==', key).where('flagged', '==', false).get();
        const el = document.getElementById(`area-count-${key}`);
        if (el) el.textContent = snap.size > 0 ? snap.size : '';
      } catch (_) {}
    }
  }

  function switchArea(areaKey) {
    currentArea = areaKey;
    lastDoc = null;
    const title = document.getElementById('com-area-title');
    if (title) title.textContent = AREAS[areaKey]?.label || '';
    document.querySelectorAll('.com-area-btn').forEach(b => b.classList.toggle('active', b.dataset.area === areaKey));
    const feed = document.getElementById('com-feed');
    if (feed) feed.innerHTML = '';
    loadPosts();
  }

  /* ── Load Posts ──────────────────────────────────────────── */
  async function loadPosts(loadMore = false) {
    if (!db) { renderDemoPosts(); return; }
    const feed = document.getElementById('com-feed');
    if (!feed) return;
    if (!loadMore) { feed.innerHTML = '<div style="color:rgba(255,255,255,.4);padding:20px">Loading posts...</div>'; lastDoc = null; }

    try {
      let q = db.collection('community')
        .where('area', '==', currentArea)
        .where('flagged', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(PAGE_SIZE);
      if (loadMore && lastDoc) q = q.startAfter(lastDoc);
      const snap = await q.get();
      if (!loadMore) feed.innerHTML = '';
      if (snap.empty && !loadMore) {
        feed.innerHTML = `<div style="text-align:center;padding:48px 20px">
          <div style="font-size:3rem;margin-bottom:12px">${AREAS[currentArea]?.icon}</div>
          <p style="color:rgba(255,255,255,.4)">No posts yet — be the first to share in the ${AREAS[currentArea]?.label}!</p>
        </div>`;
        return;
      }
      lastDoc = snap.docs[snap.docs.length - 1] || null;
      snap.docs.forEach(d => feed.insertAdjacentHTML('beforeend', buildPostCard({ id: d.id, ...d.data() })));
      attachPostActions();
      // Show load more button
      const existing = document.getElementById('com-load-more-btn');
      if (existing) existing.remove();
      if (snap.docs.length === PAGE_SIZE) {
        const btn = document.createElement('button');
        btn.id = 'com-load-more-btn'; btn.className = 'com-load-more';
        btn.textContent = 'Load more posts';
        btn.onclick = () => loadPosts(true);
        feed.appendChild(btn);
      }
    } catch (err) { renderDemoPosts(); }
  }

  /* ── Build Post Card ─────────────────────────────────────── */
  function buildPostCard(post) {
    const initials = (post.authorName || 'DS').slice(0, 2).toUpperCase();
    const area = AREAS[post.area] || { label: post.area, icon: '💬' };
    const time = post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : 'just now';
    const isOwner = currentUser && currentUser.uid === post.userId;
    const hearts = post.reactions?.heart || 0;
    const fires  = post.reactions?.fire  || 0;

    return `<article class="com-post" id="post-${post.id}" data-post-id="${post.id}">
      <div class="com-post-header">
        <div class="com-avatar">${post.avatarUrl ? `<img src="${post.avatarUrl}" alt="${post.authorName}"/>` : initials}</div>
        <div class="com-post-meta">
          <div class="com-post-author">${escapeHtml(post.authorName || 'Anonymous')}</div>
          <div class="com-post-time">${time}</div>
        </div>
        <span class="com-post-area-badge">${area.icon} ${area.label}</span>
      </div>
      <div class="com-post-body">${escapeHtml(post.body || '')}</div>
      <div class="com-post-actions">
        <button class="com-action-btn react-btn" data-post="${post.id}" data-reaction="heart" aria-label="Heart reaction">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${(post.myReaction==='heart')?'#E91E8C':'none'}" stroke="#E91E8C" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span id="heart-count-${post.id}">${hearts || ''}</span>
        </button>
        <button class="com-action-btn react-btn" data-post="${post.id}" data-reaction="fire" aria-label="Fire reaction">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/></svg>
          <span id="fire-count-${post.id}">${fires || ''}</span>
        </button>
        <button class="com-action-btn toggle-comments-btn" data-post="${post.id}" aria-label="Show comments">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span id="comment-count-${post.id}">${post.commentCount || ''}</span> Comment
        </button>
        ${isOwner ? `<button class="com-action-btn" style="color:rgba(255,100,100,.6)" onclick="DSCommunity.deletePost('${post.id}')" aria-label="Delete post">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>` : ''}
      </div>
      <div class="com-comments" id="comments-${post.id}">
        <div id="comments-list-${post.id}"></div>
        ${currentUser ? `<div class="com-comment-input-wrap">
          <input class="com-comment-input" id="comment-input-${post.id}" placeholder="Add a comment…" aria-label="Add comment"/>
          <button class="com-comment-submit" onclick="DSCommunity.submitComment('${post.id}')">Post</button>
        </div>` : `<p style="color:rgba(255,255,255,.4);font-size:.82rem;text-align:center;padding:8px 0"><a href="/account.html" style="color:#E91E8C">Sign in</a> to comment.</p>`}
      </div>
    </article>`;
  }

  function attachPostActions() {
    document.querySelectorAll('.react-btn').forEach(btn => {
      btn.onclick = () => reactToPost(btn.dataset.post, btn.dataset.reaction);
    });
    document.querySelectorAll('.toggle-comments-btn').forEach(btn => {
      btn.onclick = () => toggleComments(btn.dataset.post);
    });
  }

  /* ── Reactions ───────────────────────────────────────────── */
  async function reactToPost(postId, reaction) {
    if (!currentUser) { alert('Sign in to react.'); return; }
    if (!db) return;
    try {
      const postRef = db.collection('community').doc(postId);
      const field = `reactions.${reaction}`;
      await postRef.update({ [field]: firebase.firestore.FieldValue.increment(1) });
      const countEl = document.getElementById(`${reaction}-count-${postId}`);
      if (countEl) countEl.textContent = parseInt(countEl.textContent || '0', 10) + 1;
    } catch (_) {}
  }

  /* ── Comments ─────────────────────────────────────────────── */
  async function toggleComments(postId) {
    const el = document.getElementById(`comments-${postId}`);
    if (!el) return;
    const isOpen = el.classList.toggle('open');
    if (isOpen && !el.dataset.loaded) { el.dataset.loaded = '1'; await loadComments(postId); }
  }

  async function loadComments(postId) {
    const list = document.getElementById(`comments-list-${postId}`);
    if (!list || !db) return;
    try {
      const snap = await db.collection('community').doc(postId).collection('comments')
        .orderBy('createdAt', 'asc').limit(20).get();
      if (snap.empty) { list.innerHTML = '<p style="color:rgba(255,255,255,.35);font-size:.8rem;text-align:center;padding:4px 0">No comments yet.</p>'; return; }
      list.innerHTML = snap.docs.map(d => {
        const c = d.data();
        const initials = (c.authorName || 'DS').slice(0, 2).toUpperCase();
        return `<div class="com-comment">
          <div class="com-comment-avatar">${initials}</div>
          <div class="com-comment-body">
            <div class="com-comment-author">${escapeHtml(c.authorName || 'Anonymous')}</div>
            <div class="com-comment-text">${escapeHtml(c.body || '')}</div>
          </div>
        </div>`;
      }).join('');
    } catch (_) {}
  }

  async function submitComment(postId) {
    if (!currentUser) { alert('Sign in to comment.'); return; }
    const input = document.getElementById(`comment-input-${postId}`);
    const body = input?.value.trim();
    if (!body || !db) return;
    input.value = '';
    try {
      await db.collection('community').doc(postId).collection('comments').add({
        userId: currentUser.uid,
        authorName: currentUser.displayName || 'Member',
        body,
        flagged: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await db.collection('community').doc(postId).update({ commentCount: firebase.firestore.FieldValue.increment(1) });
      loadComments(postId);
      const countEl = document.getElementById(`comment-count-${postId}`);
      if (countEl) countEl.textContent = parseInt(countEl.textContent || '0', 10) + 1;
    } catch (_) {}
  }

  /* ── New Post ─────────────────────────────────────────────── */
  function initComposeModal() {
    const overlay = document.getElementById('com-compose-overlay');
    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeCompose(); });
  }

  function openCompose() {
    if (!currentUser) { window.location.href = '/account.html'; return; }
    const overlay = document.getElementById('com-compose-overlay');
    if (overlay) overlay.classList.add('open');
  }

  function closeCompose() {
    const overlay = document.getElementById('com-compose-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  async function submitPost() {
    if (!currentUser || !db) return;
    const area = document.getElementById('com-post-area')?.value || currentArea;
    const body = document.getElementById('com-post-body')?.value.trim();
    if (!body || body.length < 3) { alert('Write something first!'); return; }
    const btn = document.getElementById('com-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; }
    try {
      await db.collection('community').add({
        userId: currentUser.uid,
        authorName: currentUser.displayName || 'Member',
        avatarUrl: currentUser.photoURL || null,
        area, body,
        flagged: false,
        reactions: { heart: 0, fire: 0 },
        commentCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('com-post-body').value = '';
      closeCompose();
      if (area === currentArea) { lastDoc = null; await loadPosts(); }
      loadAreaCounts();
    } catch (err) { alert('Error posting. Try again.'); }
    if (btn) { btn.disabled = false; btn.textContent = 'Post'; }
  }

  async function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    if (!db) return;
    await db.collection('community').doc(postId).update({ flagged: true });
    document.getElementById(`post-${postId}`)?.remove();
  }

  /* ── Profile / Saved ─────────────────────────────────────── */
  function renderUserProfile() {
    const wrap = document.getElementById('com-user-profile');
    if (!wrap || !currentUser) return;
    wrap.innerHTML = `<div class="com-profile">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div class="com-avatar" style="width:48px;height:48px;font-size:1.3rem">${(currentUser.displayName||'DS').slice(0,2).toUpperCase()}</div>
        <div>
          <div style="color:#fff;font-weight:700">${escapeHtml(currentUser.displayName||'Member')}</div>
          <div style="color:rgba(255,255,255,.4);font-size:.8rem">${escapeHtml(currentUser.email||'')}</div>
        </div>
      </div>
      <a href="/account.html" style="display:block;text-align:center;background:rgba(233,30,140,.1);border:1px solid rgba(233,30,140,.2);color:#E91E8C;padding:9px;border-radius:50px;font-size:.85rem;font-weight:600;text-decoration:none;">Edit Profile</a>
    </div>`;
  }

  /* ── Demo Fallback ────────────────────────────────────────── */
  function renderDemoPosts() {
    const feed = document.getElementById('com-feed');
    if (!feed) return;
    const area = AREAS[currentArea];
    feed.innerHTML = `<div style="text-align:center;padding:48px 20px">
      <div style="font-size:3rem;margin-bottom:16px">${area?.icon}</div>
      <h3 style="color:#fff;margin:0 0 8px">Welcome to the ${area?.label}</h3>
      <p style="color:rgba(255,255,255,.5);margin:0 0 24px">${area?.desc}</p>
      ${currentUser ? `<button class="com-post-btn" onclick="DSCommunity.openCompose()">Start the conversation</button>` : `<a href="/account.html" style="background:linear-gradient(135deg,#E91E8C,#c2185b);color:#fff;padding:12px 24px;border-radius:50px;font-size:.95rem;font-weight:700;text-decoration:none;display:inline-block">Sign in to join</a>`}
    </div>`;
  }

  /* ── Admin ────────────────────────────────────────────────── */
  async function adminLoadPosts() {
    if (!db) return;
    const wrap = document.getElementById('admin-com-wrap');
    if (!wrap) return;
    try {
      const snap = await db.collection('community').orderBy('createdAt', 'desc').limit(50).get();
      if (snap.empty) { wrap.innerHTML = '<p style="color:rgba(255,255,255,.4)">No community posts yet.</p>'; return; }
      wrap.innerHTML = `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="color:rgba(255,255,255,.4);font-size:.78rem;border-bottom:1px solid rgba(255,255,255,.08)">
          <th style="padding:8px;text-align:left">Author</th><th style="padding:8px;text-align:left">Area</th>
          <th style="padding:8px;text-align:left">Post</th><th style="padding:8px;text-align:left">Status</th>
          <th style="padding:8px;text-align:left">Actions</th>
        </tr></thead>
        <tbody>${snap.docs.map(d => {
          const p = d.data();
          return `<tr style="border-bottom:1px solid rgba(255,255,255,.04);font-size:.83rem">
            <td style="padding:8px;color:rgba(255,255,255,.7)">${escapeHtml(p.authorName||'—')}</td>
            <td style="padding:8px;color:rgba(255,255,255,.6)">${AREAS[p.area]?.label||p.area}</td>
            <td style="padding:8px;color:#fff;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml((p.body||'').slice(0,80))}</td>
            <td style="padding:8px;color:${p.flagged?'#ff4757':'#4CAF50'}">${p.flagged?'Flagged':'Active'}</td>
            <td style="padding:8px"><button onclick="DSCommunity.adminFlag('${d.id}','${!p.flagged}')" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">${p.flagged?'Unflag':'Flag'}</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table>`;
    } catch (err) { wrap.innerHTML = '<p style="color:rgba(255,100,100,.7)">Error loading posts.</p>'; }
  }

  async function adminFlag(postId, flag) {
    if (!db) return;
    await db.collection('community').doc(postId).update({ flagged: flag === 'true' || flag === true });
    adminLoadPosts();
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`;
    return `${Math.floor(seconds/86400)}d ago`;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  return {
    init, switchArea, loadPosts, reactToPost, toggleComments, submitComment,
    openCompose, closeCompose, submitPost, deletePost,
    renderUserProfile, adminLoadPosts, adminFlag,
    AREAS
  };
})();

document.addEventListener('DOMContentLoaded', DSCommunity.init);
