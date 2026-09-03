/* ============================================================
   DRIPPING SECRETS — Media Hub JS  (v9.94)
   Firestore collection: media
   ============================================================ */
'use strict';

const DSMedia = (() => {
  let db = null;
  let currentUser = null;
  let currentCat = 'all';
  let currentSearch = '';
  let currentArticleId = null;

  const CONTENT_TYPES = ['Article','Guide','Interview','Customer Story','Video','Podcast'];
  const CATEGORIES = ['Wellness','Intimacy','Self Care','Couples','Products','Events','Creator Spotlight'];
  const TAGS = ['self-love','intimacy','wellness','couples','beginners','products','tips','guides','interviews'];

  /* ── Init ─────────────────────────────────────────────────── */
  async function init() {
    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(u => { currentUser = u; });
    initSearch();
    await loadContent();
    loadTrending();
  }

  /* ── Search ───────────────────────────────────────────────── */
  function initSearch() {
    const inp = document.getElementById('med-search-input');
    if (!inp) return;
    let debounce;
    inp.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { currentSearch = inp.value.trim(); loadContent(); }, 350);
    });
  }

  function searchSubmit() {
    const inp = document.getElementById('med-search-input');
    currentSearch = inp?.value.trim() || '';
    loadContent();
  }

  /* ── Category Filter ─────────────────────────────────────── */
  function filterCat(cat) {
    currentCat = cat;
    document.querySelectorAll('.med-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    loadContent();
  }

  /* ── Load Content ─────────────────────────────────────────── */
  async function loadContent() {
    const grid = document.getElementById('med-grid');
    if (!grid) return;
    // Show article view if one is open
    if (currentArticleId) return;

    if (!db) { renderDemoContent(); return; }
    grid.innerHTML = '<p style="color:rgba(255,255,255,.4);padding:20px">Loading…</p>';
    try {
      let q = db.collection('media').where('published', '==', true);
      if (currentCat !== 'all') q = q.where('category', '==', currentCat);
      q = q.orderBy('publishedAt', 'desc').limit(12);
      const snap = await q.get();
      let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (currentSearch) {
        const s = currentSearch.toLowerCase();
        items = items.filter(a => (a.title||'').toLowerCase().includes(s) || (a.excerpt||'').toLowerCase().includes(s) || (a.tags||[]).some(t => t.toLowerCase().includes(s)));
      }
      if (!items.length) { grid.innerHTML = `<div style="text-align:center;padding:48px 20px;grid-column:1/-1"><div style="font-size:3rem;margin-bottom:12px">📰</div><p style="color:rgba(255,255,255,.4)">No content yet — check back soon!</p></div>`; return; }
      grid.innerHTML = items.map(a => buildCard(a)).join('');
    } catch (_) { renderDemoContent(); }
  }

  /* ── Card Builder ─────────────────────────────────────────── */
  function buildCard(a) {
    const dt = a.publishedAt?.toDate ? a.publishedAt.toDate().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
    const initials = (a.authorName||'DS').slice(0,2).toUpperCase();
    const thumbBg = a.thumbUrl ? `background:url(${a.thumbUrl}) center/cover` : `background:linear-gradient(135deg,#2d1040,hsl(${Math.abs(a.id?.charCodeAt(0)||0)*67%360},60%,25%))`;
    return `<article class="med-card" onclick="DSMedia.openArticle('${a.id}')" role="button" tabindex="0" aria-label="Read: ${escHtml(a.title||'')}">
      <div class="med-card-thumb" style="${thumbBg}">
        ${a.thumbUrl ? '' : `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:.4">${a.type==='Video'?'▶':a.type==='Podcast'?'🎙️':'📖'}</div>`}
        <span class="med-card-type">${escHtml(a.type||'Article')}</span>
      </div>
      <div class="med-card-body">
        <div class="med-card-cat">${escHtml(a.category||'Wellness')}</div>
        <h3 class="med-card-title">${escHtml(a.title||'')}</h3>
        <p class="med-card-excerpt">${escHtml(a.excerpt||'')}</p>
        <div class="med-card-meta">
          <div class="med-card-author"><div class="med-card-avatar-sm">${initials}</div><span>${escHtml(a.authorName||'Dripping Secrets')}</span></div>
          ${dt ? `<span>·</span><span>${dt}</span>` : ''}
          ${a.readTime ? `<span>· ${a.readTime} min read</span>` : ''}
        </div>
      </div>
    </article>`;
  }

  /* ── Open Article ─────────────────────────────────────────── */
  async function openArticle(id) {
    currentArticleId = id;
    const grid = document.getElementById('med-grid');
    const full = document.getElementById('med-article-full');
    if (!grid || !full) return;
    grid.style.display = 'none';
    full.style.display = 'block';
    full.innerHTML = '<p style="color:rgba(255,255,255,.4);padding:20px">Loading…</p>';

    let article = null;
    if (db) {
      try {
        const doc = await db.collection('media').doc(id).get();
        if (doc.exists) article = { id: doc.id, ...doc.data() };
      } catch (_) {}
    }

    if (!article) { full.innerHTML = '<p style="color:rgba(255,100,100,.6)">Article not found.</p>'; return; }

    const dt = article.publishedAt?.toDate ? article.publishedAt.toDate().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '';
    const initials = (article.authorName||'DS').slice(0,2).toUpperCase();

    full.innerHTML = `
      <button class="med-back-btn" onclick="DSMedia.closeArticle()">← Back to ${article.category||'Media Hub'}</button>
      <h1>${escHtml(article.title||'')}</h1>
      <div class="med-article-meta">
        <span>${escHtml(article.type||'Article')}</span>
        ${dt ? `<span>· ${dt}</span>` : ''}
        ${article.readTime ? `<span>· ${article.readTime} min read</span>` : ''}
      </div>
      <div class="med-article-body">${article.bodyHtml || `<p>${escHtml(article.body||article.excerpt||'')}</p>`}</div>
      ${article.tags?.length ? `<div style="margin-top:24px;display:flex;gap:6px;flex-wrap:wrap">${article.tags.map(t=>`<span class="med-tag">#${escHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="med-author-card">
        <div class="med-author-av">${article.authorAvatarUrl ? `<img src="${article.authorAvatarUrl}" alt="${article.authorName}"/>` : initials}</div>
        <div>
          <div class="med-author-name">${escHtml(article.authorName||'Dripping Secrets Team')}</div>
          <div class="med-author-title">${escHtml(article.authorTitle||'Contributor')}</div>
          ${article.authorBio ? `<div class="med-author-bio">${escHtml(article.authorBio)}</div>` : ''}
        </div>
      </div>`;

    // Increment view count
    if (db) try { db.collection('media').doc(id).update({ views: firebase.firestore.FieldValue.increment(1) }); } catch (_) {}
  }

  function closeArticle() {
    currentArticleId = null;
    const grid = document.getElementById('med-grid');
    const full = document.getElementById('med-article-full');
    if (grid) grid.style.display = '';
    if (full) full.style.display = 'none';
  }

  /* ── Trending Sidebar ─────────────────────────────────────── */
  async function loadTrending() {
    const wrap = document.getElementById('med-trending-wrap');
    if (!wrap || !db) return;
    try {
      const snap = await db.collection('media').where('published','==',true).orderBy('views','desc').limit(5).get();
      if (snap.empty) return;
      wrap.innerHTML = snap.docs.map(d => {
        const a = d.data();
        return `<div class="med-sidebar-item" onclick="DSMedia.openArticle('${d.id}')">
          <div class="med-si-thumb">${a.thumbUrl ? `<img src="${a.thumbUrl}" alt=""/>` : ''}</div>
          <div class="med-si-body"><div class="med-si-title">${escHtml(a.title||'')}</div><div class="med-si-cat">${escHtml(a.category||'')}</div></div>
        </div>`;
      }).join('');
    } catch (_) {}
  }

  /* ── Demo Content ─────────────────────────────────────────── */
  function renderDemoContent() {
    const grid = document.getElementById('med-grid');
    if (!grid) return;
    const demos = [
      { id:'d1', type:'Article', category:'Wellness', title:'The Beginner\'s Guide to Intimate Self-Care', excerpt:'Everything you need to know to start — without the overwhelm.', authorName:'The DS Team', readTime:5 },
      { id:'d2', type:'Guide', category:'Couples', title:'5 Ways to Reignite the Spark This Weekend', excerpt:'Simple, intentional ideas that actually work.', authorName:'The DS Team', readTime:4 },
      { id:'d3', type:'Interview', category:'Creator Spotlight', title:'How She Built a Business Around Confidence', excerpt:'A creator\'s journey from doubt to dollar signs.', authorName:'DS Editorial', readTime:7 },
      { id:'d4', type:'Customer Story', category:'Self Care', title:'What Monthly Boxes Did for My Relationship With Myself', excerpt:'Real talk from a real subscriber about transformation.', authorName:'Community Member', readTime:3 },
      { id:'d5', type:'Podcast', category:'Intimacy', title:'Let\'s Talk About Pleasure, Sis', excerpt:'A conversation we should have been having all along.', authorName:'The DS Team', readTime:22 },
      { id:'d6', type:'Article', category:'Products', title:'How to Build Your First Intimacy Kit', excerpt:'The essentials, explained — no experience required.', authorName:'DS Editorial', readTime:6 }
    ];
    grid.innerHTML = demos.map(a => buildCard(a)).join('');
  }

  /* ── Admin Publishing Center ──────────────────────────────── */
  async function adminPublish(e) {
    e.preventDefault();
    if (!db) { alert('Database not available.'); return; }
    const title   = document.getElementById('med-pub-title')?.value.trim();
    const excerpt = document.getElementById('med-pub-excerpt')?.value.trim();
    const body    = document.getElementById('med-pub-body')?.value.trim();
    const type    = document.getElementById('med-pub-type')?.value;
    const category= document.getElementById('med-pub-cat')?.value;
    const tags    = (document.getElementById('med-pub-tags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean);
    const author  = document.getElementById('med-pub-author')?.value.trim() || 'Dripping Secrets';
    const readTime= parseInt(document.getElementById('med-pub-readtime')?.value||'5',10);
    if (!title || !body) { alert('Title and body are required.'); return; }
    const btn = document.getElementById('med-pub-submit');
    if (btn) { btn.disabled=true; btn.textContent='Publishing…'; }
    try {
      await db.collection('media').add({
        title, excerpt, body, type, category, tags, authorName: author, readTime,
        published: true, views: 0,
        publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('med-pub-form')?.reset();
      alert('Article published!');
    } catch (err) { alert('Error publishing. Try again.'); }
    if (btn) { btn.disabled=false; btn.textContent='Publish'; }
  }

  async function adminLoadContent() {
    const wrap = document.getElementById('admin-media-wrap');
    if (!wrap || !db) return;
    try {
      const snap = await db.collection('media').orderBy('publishedAt','desc').limit(50).get();
      if (snap.empty) { wrap.innerHTML='<p style="color:rgba(255,255,255,.4)">No content yet.</p>'; return; }
      wrap.innerHTML=`<table style="width:100%;border-collapse:collapse"><thead><tr style="color:rgba(255,255,255,.4);font-size:.78rem;border-bottom:1px solid rgba(255,255,255,.08)"><th style="padding:8px;text-align:left">Title</th><th style="padding:8px;text-align:left">Type</th><th style="padding:8px;text-align:left">Category</th><th style="padding:8px;text-align:left">Views</th><th style="padding:8px;text-align:left">Actions</th></tr></thead><tbody>${
        snap.docs.map(d=>{const a=d.data();return`<tr style="border-bottom:1px solid rgba(255,255,255,.04);font-size:.83rem"><td style="padding:8px;color:#fff;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(a.title||'—')}</td><td style="padding:8px;color:rgba(255,255,255,.6)">${escHtml(a.type||'—')}</td><td style="padding:8px;color:rgba(255,255,255,.6)">${escHtml(a.category||'—')}</td><td style="padding:8px;color:rgba(255,255,255,.5)">${a.views||0}</td><td style="padding:8px"><button onclick="DSMedia.adminTogglePublish('${d.id}','${!a.published}')" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:.78rem">${a.published?'Unpublish':'Publish'}</button></td></tr>`;}).join('')
      }</tbody></table>`;
    } catch (_) { wrap.innerHTML='<p style="color:rgba(255,100,100,.6)">Error loading content.</p>'; }
  }

  async function adminTogglePublish(id, val) {
    if (!db) return;
    await db.collection('media').doc(id).update({ published: val==='true' });
    adminLoadContent();
  }

  /* ── Helpers ─────────────────────────────────────────────── */
  function escHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  return {
    init, filterCat, searchSubmit, openArticle, closeArticle,
    loadTrending, adminPublish, adminLoadContent, adminTogglePublish,
    CONTENT_TYPES, CATEGORIES, TAGS
  };
})();

document.addEventListener('DOMContentLoaded', DSMedia.init);
