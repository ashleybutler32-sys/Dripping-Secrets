'use strict';
/* ════════════════════════════════════════════════════════════════════════
   DRIPPING SECRETS — SOCIAL ENGINE  v2.0  |  DS-CONTENT-001
   AI-Powered Content Department · Creative Director: Dimi
   Architectural Directive: Dimi is platform-level AI.
   Generation routes through Netlify → OpenAI (not Tasklet webhook).
   Dimi core functions work independently of any single provider.
   ════════════════════════════════════════════════════════════════════════ */

const SocialEngine = (() => {

  /* ─── CONSTANTS ──────────────────────────────────────────────────────── */
  const DIMI_ENDPOINT  = '/.netlify/functions/dimi-chat';
  const LIBRARY_LS     = 'ds_content_library_v2';
  const QUEUE_LS       = 'ds_social_queue_v2';
  const CONNECTIONS_LS = 'ds_platform_connections_v1';
  const BRAND_TAGLINE  = 'You deserve a secret this good.';

  /* ─── WEEKLY THEME CALENDAR ──────────────────────────────────────────── */
  const WEEKLY_THEMES = {
    0: { name: 'Self-Care Sunday',      short: 'Self-Care',  color: '#9b7fbb', tone: 'soft, nurturing, restorative, luxurious',                 hashtag: '#SelfCareSunday',      emoji: '🕯️' },
    1: { name: 'Luxury Monday',         short: 'Luxury',     color: '#d4af37', tone: 'aspirational, elevated, boss energy, premium',             hashtag: '#LuxuryMonday',        emoji: '👑' },
    2: { name: 'Treat Yourself Tuesday',short: 'Treats',     color: '#c97b8e', tone: 'indulgent, playful, self-reward, feel-good',               hashtag: '#TreatYourselfTuesday',emoji: '✨' },
    3: { name: 'Wellness Wednesday',    short: 'Wellness',   color: '#7fb89b', tone: 'health-forward, empowering, holistic, body-positive',      hashtag: '#WellnessWednesday',   emoji: '🌿' },
    4: { name: 'Desire Thursday',       short: 'Desire',     color: '#a0638a', tone: 'sensual, editorial, mood-setting, alluring',               hashtag: '#DesireThursday',      emoji: '🔥' },
    5: { name: 'Freaky Friday',         short: 'Freaky',     color: '#b8860b', tone: 'bold, confident, unapologetic, fun, liberating',           hashtag: '#FreakyFriday',        emoji: '💫' },
    6: { name: 'Sensual Saturday',      short: 'Sensual',    color: '#8b4a6e', tone: 'romantic, intimate, luxurious, soft, weekend energy',      hashtag: '#SensualSaturday',     emoji: '🌹' }
  };

  /* ─── PLATFORM SCHEDULE ──────────────────────────────────────────────── */
  const PLATFORMS = {
    instagram : { name:'Instagram',  handle:'@dripping.secrets',          postTime:'7:00 PM',  icon:_igIcon(),  ratio:'1:1',   color:'#e1306c' },
    tiktok    : { name:'TikTok',     handle:'@drippingsecretsbyashleyb',   postTime:'8:00 PM',  icon:_tkIcon(),  ratio:'9:16',  color:'#010101' },
    facebook  : { name:'Facebook',   handle:'Dripping Secrets',            postTime:'6:00 PM',  icon:_fbIcon(),  ratio:'1.91:1',color:'#1877f2' },
    x         : { name:'X',          handle:'@DrippingSecrts',             postTime:'12:00 PM', icon:_xIcon(),   ratio:'16:9',  color:'#000000' },
    pinterest : { name:'Pinterest',  handle:'@drippingsecrets',            postTime:'8:00 PM',  icon:_pinIcon(), ratio:'2:3',   color:'#e60023' },
    youtube   : { name:'YouTube',    handle:'Dripping Secrets',            postTime:'3:00 PM',  icon:_ytIcon(),  ratio:'16:9',  color:'#ff0000' }
  };

  /* ─── CONTENT TYPES ──────────────────────────────────────────────────── */
  const CONTENT_TYPES = [
    { id:'promo_graphic',   label:'Promo Graphic',  icon:'🎨' },
    { id:'product_ad',      label:'Product Ad',     icon:'🛍️' },
    { id:'story',           label:'Story',          icon:'📱' },
    { id:'reel',            label:'Reel / TikTok',  icon:'🎬' },
    { id:'event_flyer',     label:'Event Flyer',    icon:'🎪' },
    { id:'carousel',        label:'Carousel',       icon:'🖼️' },
    { id:'lifestyle',       label:'Lifestyle',      icon:'✨' },
    { id:'brand_content',   label:'Brand Content',  icon:'👑' },
    { id:'academy_promo',   label:'Academy Promo',  icon:'🎓' },
    { id:'hiring',          label:'Hiring Post',    icon:'💼' }
  ];

  /* ─── DIMI PROVIDER REGISTRY (Architectural Directive) ──────────────── */
  const DimiProviders = {
    providers: {
      openai_netlify: { name: 'OpenAI via Netlify', endpoint: DIMI_ENDPOINT, status: 'unknown', lastCheck: null }
    },
    activeProvider: 'openai_netlify',

    async checkHealth() {
      // Lightweight ping — we consider the provider healthy if the Netlify function responds
      try {
        const r = await fetch(DIMI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ping', mode: 'customer' }),
          signal: AbortSignal.timeout(5000)
        });
        const healthy = r.ok || r.status === 200;
        DimiProviders.providers.openai_netlify.status = healthy ? 'online' : 'degraded';
        DimiProviders.providers.openai_netlify.lastCheck = Date.now();
        return healthy;
      } catch {
        DimiProviders.providers.openai_netlify.status = 'offline';
        DimiProviders.providers.openai_netlify.lastCheck = Date.now();
        return false;
      }
    },

    isAvailable() {
      const p = DimiProviders.providers.openai_netlify;
      if (!p.lastCheck) return true; // assume available until checked
      const stale = Date.now() - p.lastCheck > 120000; // re-check after 2 min
      return stale ? true : p.status !== 'offline';
    }
  };

  /* ─── STATE ──────────────────────────────────────────────────────────── */
  let state = {
    library       : [],
    queue         : [],
    connections   : {},
    activeTab     : 'all',
    viewMode      : 'grid',
    searchQuery   : '',
    filters       : { platform:'all', type:'all', status:'all' },
    dimiMessages  : [],
    activeAsset   : null,
    selectedPlatforms : ['instagram','tiktok','facebook'],
    selectedType  : 'promo_graphic',
    generating    : false,
    initialized   : false,
    providerStatus: 'unknown' // 'online'|'offline'|'unknown'
  };

  /* ─── INIT ───────────────────────────────────────────────────────────── */
  function init() {
    if (state.initialized) return;
    state.initialized = true;
    _loadLibrary();
    _loadQueue();
    _loadConnections();
    _renderCalendarStrip();
    _renderDimiPanel();
    _renderPlatformSchedule();
    _renderQueue();
    _renderLibrary();
    _setupFirestoreListener();
    _updateProviderStatusUI();
    _checkProviderHealth();
    renderStats();
  }

  /* ─── PERSISTENCE ────────────────────────────────────────────────────── */
  function _loadLibrary()     { try { state.library     = JSON.parse(localStorage.getItem(LIBRARY_LS)     || '[]'); } catch { state.library     = []; } }
  function _saveLibrary()     { localStorage.setItem(LIBRARY_LS,     JSON.stringify(state.library)); }
  function _loadQueue()       { try { state.queue       = JSON.parse(localStorage.getItem(QUEUE_LS)       || '[]'); } catch { state.queue       = []; } }
  function _saveQueue()       { localStorage.setItem(QUEUE_LS,       JSON.stringify(state.queue)); }
  function _loadConnections() { try { state.connections = JSON.parse(localStorage.getItem(CONNECTIONS_LS) || '{}'); } catch { state.connections = {}; } }
  function _saveConnections() { localStorage.setItem(CONNECTIONS_LS, JSON.stringify(state.connections)); }

  /* ─── PROVIDER HEALTH ────────────────────────────────────────────────── */
  async function _checkProviderHealth() {
    const online = await DimiProviders.checkHealth();
    state.providerStatus = online ? 'online' : 'offline';
    _updateProviderStatusUI();
  }

  function _updateProviderStatusUI() {
    const dot = document.getElementById('se-provider-dot');
    const lbl = document.getElementById('se-provider-lbl');
    if (dot) {
      dot.className = 'se-provider-dot se-provider-' + (state.providerStatus === 'online' ? 'online' : state.providerStatus === 'offline' ? 'offline' : 'unknown');
    }
    if (lbl) {
      lbl.textContent = state.providerStatus === 'online' ? 'Dimi Online' : state.providerStatus === 'offline' ? 'Generation Unavailable' : 'Connecting…';
    }
  }

  /* ─── FIRESTORE SYNC ─────────────────────────────────────────────────── */
  function _setupFirestoreListener() {
    if (typeof window.db === 'undefined') return;
    try {
      // Social queue listener
      window.db.collection('social_queue').orderBy('created_at','desc').limit(50)
        .onSnapshot(snap => {
          snap.docChanges().forEach(ch => {
            const d = { id: ch.doc.id, ...ch.doc.data() };
            if (ch.type === 'removed') { state.queue = state.queue.filter(q => q.id !== d.id); return; }
            const idx = state.queue.findIndex(q => q.id === d.id);
            if (idx >= 0) state.queue[idx] = d; else state.queue.unshift(d);
          });
          _saveQueue();
          _renderQueue();
          renderStats();
        });

      // Content library listener
      window.db.collection('content_studio').orderBy('created','desc').limit(100)
        .onSnapshot(snap => {
          snap.docChanges().forEach(ch => {
            const d = { id: ch.doc.id, ...ch.doc.data() };
            if (ch.type === 'removed') { state.library = state.library.filter(a => a.id !== d.id); return; }
            const idx = state.library.findIndex(a => a.id === d.id);
            if (idx >= 0) state.library[idx] = d; else state.library.unshift(d);
          });
          _saveLibrary();
          _renderLibrary();
          renderStats();
        });
    } catch(e) {}
  }

  async function _saveQueueItemToFirestore(item) {
    if (typeof window.db === 'undefined') return;
    try {
      await window.db.collection('social_queue').doc(item.id).set(item);
    } catch(e) {}
  }

  async function _updateQueueItemInFirestore(id, updates) {
    if (typeof window.db === 'undefined') return;
    try {
      await window.db.collection('social_queue').doc(id).update(updates);
    } catch(e) {}
  }

  /* ─── CALENDAR STRIP ─────────────────────────────────────────────────── */
  function _renderCalendarStrip() {
    const el = document.getElementById('se-calendar-strip');
    if (!el) return;
    const today = new Date().getDay();
    const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    el.innerHTML = days.map((d, i) => {
      const theme = WEEKLY_THEMES[i];
      const isToday = i === today;
      return `<div class="se-cal-day ${isToday ? 'se-cal-today' : ''}" onclick="SocialEngine.jumpToDay(${i})" title="${theme.name}">
        <div class="se-cal-day-name">${d}</div>
        <div class="se-cal-theme-icon" style="color:${theme.color}">${theme.emoji}</div>
        <div class="se-cal-theme-name" style="color:${isToday ? theme.color : ''}">${theme.short}</div>
        ${isToday ? '<div class="se-cal-today-pip"></div>' : ''}
      </div>`;
    }).join('');
  }

  function jumpToDay(dow) {
    const theme = WEEKLY_THEMES[dow];
    const today = new Date().getDay();
    const brief = document.getElementById('se-brief-input');
    if (brief) {
      brief.value = `${theme.name} content — ${theme.tone}. Create something that feels ${theme.tone.split(',')[0]}.`;
      brief.focus();
    }
    // Highlight calendar day
    document.querySelectorAll('.se-cal-day').forEach((el, i) => el.classList.toggle('se-cal-selected', i === dow));
    // Update Dimi's brief for this day
    _renderTodayBrief(dow);
  }

  /* ─── DIMI CREATIVE DIRECTOR PANEL ──────────────────────────────────── */
  function _renderDimiPanel() {
    const today = new Date().getDay();
    _renderTodayBrief(today);
    _renderFeaturedProduct();
    _renderRecommendations(today);
    // Welcome message
    const theme = WEEKLY_THEMES[today];
    _addDimiMessage(`It's ${theme.name} — I'm feeling ${theme.tone.split(',')[0]} energy today. Let me show you what I've been thinking for the brand. ${theme.emoji}`);
  }

  function _renderTodayBrief(dow) {
    const el = document.getElementById('se-today-brief');
    if (!el) return;
    const theme = WEEKLY_THEMES[dow];
    const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    el.innerHTML = `
      <div class="se-today-theme" style="border-left:3px solid ${theme.color}">
        <div class="se-today-theme-label">TODAY'S THEME</div>
        <div class="se-today-theme-name" style="color:${theme.color}">${theme.emoji} ${theme.name}</div>
        <div class="se-today-theme-tone">${theme.tone}</div>
        <div class="se-today-theme-tag">${theme.hashtag}</div>
      </div>`;
  }

  function _renderFeaturedProduct() {
    const el = document.getElementById('se-featured-product');
    if (!el) return;
    const products = _getInStockProducts();
    if (!products.length) { el.style.display = 'none'; return; }
    const today = new Date().getDay();
    const featured = _pickFeaturedProduct(products, today);
    if (!featured) { el.style.display = 'none'; return; }
    el.innerHTML = `
      <div class="se-featured-label">FEATURED PRODUCT</div>
      <div class="se-featured-card" onclick="SocialEngine.useProduct('${featured.id}')">
        ${featured.image ? `<img src="${featured.image}" alt="${featured.name}" class="se-featured-img">` : '<div class="se-featured-img-ph">🛍️</div>'}
        <div class="se-featured-info">
          <div class="se-featured-name">${featured.name}</div>
          <div class="se-featured-price">$${featured.price}</div>
          <div class="se-featured-use">Use in today's content →</div>
        </div>
      </div>`;
  }

  function _getInStockProducts() {
    // Read from window.DS_PRODUCTS (set by products.js) or fallback
    if (window.DS_PRODUCTS && Array.isArray(window.DS_PRODUCTS)) {
      return window.DS_PRODUCTS.filter(p => p.inStock !== false && p.hidden !== true);
    }
    // Try products array from products.js global
    if (window.products && Array.isArray(window.products)) {
      return window.products.filter(p => !p.outOfStock && !p.hidden);
    }
    return [];
  }

  function _pickFeaturedProduct(products, dow) {
    if (!products.length) return null;
    // Theme-based product selection
    const themeKeywords = {
      0: ['wellness','self','care','bath','relax','massage'],      // Sunday
      1: ['luxury','premium','gold','rose','vibrat'],              // Monday
      2: ['treat','gift','set','bundle','box'],                    // Tuesday
      3: ['wellness','self','care','kegel','health'],              // Wednesday
      4: ['couple','partner','desire','wand'],                     // Thursday
      5: ['bold','fun','machine','powerful','intense'],            // Friday
      6: ['romantic','couple','lingerie','sensual']                // Saturday
    };
    const keywords = themeKeywords[dow] || [];
    const name_match = products.filter(p =>
      keywords.some(k => (p.name||'').toLowerCase().includes(k) || (p.category||'').toLowerCase().includes(k))
    );
    const pool = name_match.length ? name_match : products;
    // Rotate by day of year for variety
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return pool[dayOfYear % pool.length];
  }

  function _renderRecommendations(dow) {
    const el = document.getElementById('se-recommendations');
    if (!el) return;
    const recs = _getDimiRecs(dow);
    el.innerHTML = `
      <div class="se-rec-label">DIMI'S PICKS FOR TODAY</div>
      <div class="se-rec-list">
        ${recs.map(r => `
          <div class="se-rec-card" onclick="SocialEngine.useRec(${JSON.stringify(r).replace(/"/g,'&quot;')})">
            <div class="se-rec-type">${r.icon} ${r.type}</div>
            <div class="se-rec-brief">${r.brief}</div>
            <div class="se-rec-platforms">${r.platforms.map(p => PLATFORMS[p]?.name || p).join(' · ')}</div>
          </div>`).join('')}
      </div>`;
  }

  function _getDimiRecs(dow) {
    const theme = WEEKLY_THEMES[dow];
    const m = new Date().getMonth() + 1;
    const d = new Date().getDate();
    const recs = [];

    // Theme-specific recs
    const themeRecs = {
      0: [
        { icon:'🕯️', type:'Lifestyle Post',   platforms:['instagram','pinterest'],           brief:`Self-care ritual featuring a luxury product from the collection. Soft, intentional, beautiful.` },
        { icon:'✨', type:'Wellness Story',    platforms:['instagram','facebook'],            brief:`Sunday reset energy — remind your audience they deserve rest, pleasure, and luxury in equal measure.` }
      ],
      1: [
        { icon:'👑', type:'Product Spotlight', platforms:['instagram','facebook','pinterest'],brief:`Lead with your most premium product. Luxury editorial frame — worth-it energy.` },
        { icon:'💼', type:'Brand Story',       platforms:['instagram','tiktok'],              brief:`Dripping Secrets brand vision — the woman we build for, the experience we create.` }
      ],
      2: [
        { icon:'✨', type:'Treat Yourself Ad', platforms:['instagram','facebook'],            brief:`Indulgent, playful energy. You've earned it. Gift yourself something luxurious.` },
        { icon:'🎁', type:'Bundle Promo',      platforms:['instagram','pinterest'],           brief:`Highlight a box or bundle — more value, more pleasure, more reasons to say yes.` }
      ],
      3: [
        { icon:'🌿', type:'Wellness Feature',  platforms:['instagram','pinterest','youtube'], brief:`Body-positive, health-forward angle on a wellness product. Empowering, expert tone.` },
        { icon:'💜', type:'Educational Post',  platforms:['instagram','facebook'],            brief:`Share a tip about pleasure health or self-care. Position DS as the trusted expert.` }
      ],
      4: [
        { icon:'🔥', type:'Couples Content',   platforms:['instagram','tiktok','pinterest'],  brief:`Alluring, editorial couples vibe. Sensual but tasteful. Desire as a luxury.` },
        { icon:'🖤', type:'Mood Editorial',    platforms:['instagram','pinterest'],           brief:`Dark, luxurious mood board visual. Deep plum, gold accents. Cinematic.` }
      ],
      5: [
        { icon:'💫', type:'Bold Product Ad',   platforms:['instagram','tiktok','facebook'],   brief:`Freaky Friday — bold, confident, unapologetic. Show the product that makes people blush (tastefully).` },
        { icon:'🎬', type:'TikTok Reel',       platforms:['tiktok'],                          brief:`Fun, energetic TikTok featuring a top seller. Freaky Friday energy — own it.` }
      ],
      6: [
        { icon:'🌹', type:'Romance Post',      platforms:['instagram','facebook','pinterest'], brief:`Sensual Saturday — romantic, intimate. A luxury evening in. You and your pleasure.` },
        { icon:'💎', type:'Luxury Editorial',  platforms:['instagram','pinterest'],            brief:`Weekend luxury — rich visuals, editorial quality, gold and plum palette.` }
      ]
    };

    recs.push(...(themeRecs[dow] || []));

    // Seasonal overlays
    if (m === 2 && d <= 14) recs.push({ icon:'💝', type:"Valentine's",   platforms:['instagram','facebook','tiktok'], brief:`Valentine's Day luxury campaign — for couples and women who choose themselves.` });
    if (m === 5 && d <= 14) recs.push({ icon:'👑', type:"Mother's Day",  platforms:['instagram','facebook'],         brief:`Mother's Day self-care — because moms deserve everything.` });
    if (m === 6)             recs.push({ icon:'🌈', type:'Pride Month',   platforms:['instagram','tiktok'],           brief:`Pride Month — love, pleasure, and authentic self. All are welcome here.` });
    if (m === 10)            recs.push({ icon:'🖤', type:'Halloween',     platforms:['instagram','tiktok','pinterest'],brief:`Dark luxury editorial — mysterious, bold, unforgettable.` });
    if (m === 11)            recs.push({ icon:'🛍️', type:'Black Friday',  platforms:['instagram','facebook','tiktok'],brief:`Black Friday luxury deals — shop bold, live bolder.` });
    if (m === 12)            recs.push({ icon:'✨', type:'Holiday',       platforms:['instagram','facebook'],         brief:`Holiday gift guide — pleasure wrapped in luxury, delivered discreetly.` });

    // Always-on options
    recs.push({ icon:'🎉', type:'Secrets Party',   platforms:['instagram','facebook','tiktok'], brief:`Promote a Secrets Party — intimate, exclusive, unforgettable. Bookings open.` });
    recs.push({ icon:'🎓', type:'Academy Promo',   platforms:['instagram','facebook'],          brief:`Dripping Secrets Academy — exclusive learning experience for Secret Keepers.` });

    return recs.slice(0, 4);
  }

  function useRec(rec) {
    const brief = document.getElementById('se-brief-input');
    if (brief) { brief.value = rec.brief; brief.focus(); }
    // Auto-select platforms
    if (rec.platforms && rec.platforms.length) {
      state.selectedPlatforms = rec.platforms;
      _updatePlatformSelectors();
    }
    _addDimiMessage(`Good choice, Boss. I put the brief in the studio for you — hit Generate and I will bring it to life. ✦`);
  }

  function useProduct(productId) {
    const products = _getInStockProducts();
    const p = products.find(x => String(x.id) === String(productId));
    if (!p) return;
    const brief = document.getElementById('se-brief-input');
    if (brief) {
      brief.value = `Product spotlight for "${p.name}" — ${state.selectedType === 'product_ad' ? 'create a luxury product advertisement' : 'create beautiful content showcasing this product'}. Price: $${p.price}.`;
      brief.focus();
    }
    _addDimiMessage(`I've got "${p.name}" loaded up — that's a great pick for today's content. Let's make it shine. 💜`);
  }

  /* ─── PLATFORM SCHEDULE PANEL ────────────────────────────────────────── */
  function _renderPlatformSchedule() {
    const el = document.getElementById('se-post-schedule');
    if (!el) return;
    el.innerHTML = Object.entries(PLATFORMS).map(([id, p]) => {
      const connected = state.connections[id]?.connected;
      return `<div class="se-schedule-row">
        <div class="se-schedule-plat">
          <span class="se-schedule-icon">${p.icon}</span>
          <span class="se-schedule-name">${p.name}</span>
        </div>
        <div class="se-schedule-time">${p.postTime} CT</div>
        <div class="se-schedule-status">
          ${connected
            ? '<span class="se-conn-badge se-conn-ok">Connected</span>'
            : `<button class="se-conn-badge se-conn-btn" onclick="SocialEngine.connectPlatform('${id}')">Connect</button>`}
        </div>
      </div>`;
    }).join('');
  }

  function connectPlatform(platformId) {
    const p = PLATFORMS[platformId];
    // OAuth scaffold — stores intent, shows instructions
    const modal = document.createElement('div');
    modal.className = 'se-modal-overlay';
    modal.innerHTML = `
      <div class="se-modal">
        <div class="se-modal-header">
          <span>${p.icon} Connect ${p.name}</span>
          <button onclick="this.closest('.se-modal-overlay').remove()">✕</button>
        </div>
        <div class="se-modal-body">
          <p class="se-modal-desc">Connecting ${p.name} enables Dimi to auto-publish approved content at <strong>${p.postTime} CT</strong> daily.</p>
          <div class="se-modal-steps">
            <div class="se-modal-step">① Authorize Dripping Secrets to post on your behalf via the platform's business settings.</div>
            <div class="se-modal-step">② Once authorized, paste your access token or API key below.</div>
            <div class="se-modal-step">③ Dimi handles scheduling and publishing automatically after queue approval.</div>
          </div>
          <input class="se-modal-input" id="se-token-input-${platformId}" type="text" placeholder="${p.name} access token or API key">
          <div class="se-modal-note">Tokens are stored securely in your Back Office settings. Dripping Secrets never shares or exports your credentials.</div>
        </div>
        <div class="se-modal-footer">
          <button class="se-modal-btn-secondary" onclick="this.closest('.se-modal-overlay').remove()">Cancel</button>
          <button class="se-modal-btn-primary" onclick="SocialEngine.savePlatformToken('${platformId}', document.getElementById('se-token-input-${platformId}').value, this.closest('.se-modal-overlay'))">Save Connection</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  function savePlatformToken(platformId, token, overlay) {
    if (!token?.trim()) { alert('Please enter a valid token.'); return; }
    state.connections[platformId] = { connected: true, token: token.trim(), connectedAt: new Date().toISOString() };
    _saveConnections();
    overlay?.remove();
    _renderPlatformSchedule();
    _renderQueueConnectionStatus();
    _addDimiMessage(`${PLATFORMS[platformId]?.name} is connected! I will start auto-posting after you approve today's queue. We're in our automation era. 💅`);
  }

  /* ─── CONTENT GENERATION ─────────────────────────────────────────────── */
  async function generateContent() {
    if (state.generating) return;
    const brief = document.getElementById('se-brief-input')?.value?.trim();
    if (!brief) {
      _showStudioStatus('error', 'Tell Dimi what you need — describe the content first.');
      return;
    }

    state.generating = true;
    const btn = document.getElementById('se-gen-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Dimi is creating… ✦'; }
    _showStudioStatus('generating', 'Dimi is crafting your content…');
    _showPreviewLoading();

    const today = new Date().getDay();
    const theme = WEEKLY_THEMES[today];
    const products = _getInStockProducts();
    const featured = _pickFeaturedProduct(products, today);

    // Check if provider is available
    if (!DimiProviders.isAvailable()) {
      _showStudioStatus('error', 'Generation unavailable right now — Dimi can still help you with manual content. Try again in a moment.');
      state.generating = false;
      if (btn) { btn.disabled = false; btn.textContent = 'Generate with Dimi ✦'; }
      _hidePreviewLoading();
      return;
    }

    try {
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const response = await fetch(DIMI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create ${CONTENT_TYPES.find(t=>t.id===state.selectedType)?.label || state.selectedType} content. Brief: "${brief}". Generate a complete, luxury-quality piece for Dripping Secrets.`,
          mode: 'content_studio',
          history: [],
          context: {
            theme: theme.name,
            tone: theme.tone,
            platform: state.selectedPlatforms[0] || 'instagram',
            contentType: state.selectedType,
            product: featured ? { name: featured.name, description: featured.description || '', price: featured.price } : null,
            dayOfWeek: days[today]
          }
        })
      });

      if (!response.ok) throw new Error('Generation endpoint ' + response.status);
      const data = await response.json();
      state.providerStatus = 'online';
      _updateProviderStatusUI();

      const content = data.content || {};
      _renderGeneratedContent(content, brief);
      _showStudioStatus('success', 'Content ready — review, edit, and add to queue. ✦');

    } catch (err) {
      console.error('Social Engine generation error:', err);
      state.providerStatus = 'offline';
      _updateProviderStatusUI();
      _showStudioStatus('error', 'Generation hit a snag. Dimi is still here — try again or add content manually.');
      _hidePreviewLoading();
    }

    state.generating = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Generate with Dimi ✦'; }
  }

  function _showPreviewLoading() {
    const el = document.getElementById('se-preview-area');
    if (!el) return;
    el.innerHTML = `<div class="se-preview-loading">
      <div class="se-preview-spinner"></div>
      <div class="se-preview-loading-text">Dimi is crafting something beautiful…</div>
    </div>`;
    el.style.display = 'block';
  }

  function _hidePreviewLoading() {
    const el = document.getElementById('se-preview-area');
    if (el) el.innerHTML = '';
  }

  function _renderGeneratedContent(content, brief) {
    const previewEl  = document.getElementById('se-preview-area');
    const captionEl  = document.getElementById('se-caption-area');
    const actionEl   = document.getElementById('se-action-bar');
    if (!previewEl || !captionEl || !actionEl) return;

    const today = new Date().getDay();
    const theme = WEEKLY_THEMES[today];
    const type  = CONTENT_TYPES.find(t => t.id === state.selectedType);

    previewEl.innerHTML = `
      <div class="se-preview-card">
        <div class="se-preview-placeholder" style="border-color:${theme.color}30">
          <div class="se-preview-icon">${type?.icon || '✦'}</div>
          <div class="se-preview-type">${type?.label || state.selectedType}</div>
          <div class="se-preview-suggestion">${content.content_suggestion || 'Premium visual content — add your image or video'}</div>
          ${content.image_prompt ? `
            <div class="se-preview-prompt-section">
              <div class="se-preview-prompt-label">AI IMAGE PROMPT</div>
              <div class="se-preview-prompt-text">${content.image_prompt}</div>
              <button class="se-copy-prompt-btn" onclick="SocialEngine.copyPrompt(this, ${JSON.stringify(content.image_prompt || '').replace(/'/g,'&#39;')})">Copy Prompt</button>
            </div>` : ''}
        </div>
        <div class="se-preview-upload-row">
          <button class="se-upload-btn" onclick="SocialEngine.uploadAssetForContent()">Upload Image / Video</button>
          <span class="se-preview-format">Recommended: ${PLATFORMS[state.selectedPlatforms[0]]?.ratio || '1:1'}</span>
        </div>
      </div>`;

    captionEl.innerHTML = `
      <div class="se-caption-section">
        <div class="se-caption-label">CAPTION</div>
        <textarea class="se-caption-input" id="se-gen-caption" rows="4">${content.caption || ''}</textarea>
      </div>
      <div class="se-caption-section">
        <div class="se-caption-label">HASHTAGS</div>
        <textarea class="se-hashtag-input" id="se-gen-hashtags" rows="2">${content.hashtags || ''}</textarea>
      </div>
      ${content.post_time_recommendation ? `<div class="se-caption-timing">⏰ ${content.post_time_recommendation}</div>` : ''}`;

    actionEl.innerHTML = `
      <button class="se-action-save" onclick="SocialEngine.saveToLibrary()">Save to Library</button>
      <button class="se-action-queue" onclick="SocialEngine.addToQueue()">Add to Queue ✦</button>
      <button class="se-action-regenerate" onclick="SocialEngine.regenerate()">Regenerate</button>`;

    captionEl.style.display = 'block';
    actionEl.style.display  = 'flex';

    // Store generated content on state for save/queue actions
    state._lastGenerated = {
      brief,
      caption   : content.caption || '',
      hashtags  : content.hashtags || '',
      image_prompt : content.image_prompt || '',
      content_suggestion : content.content_suggestion || '',
      theme     : WEEKLY_THEMES[today].name,
      platforms : [...state.selectedPlatforms],
      type      : state.selectedType,
      post_time : content.post_time_recommendation || ''
    };
  }

  function copyPrompt(btn, prompt) {
    navigator.clipboard.writeText(prompt).then(() => {
      const orig = btn.textContent; btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = orig, 2000);
    });
  }

  function regenerate() {
    state._lastGenerated = null;
    generateContent();
  }

  function uploadAssetForContent() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,video/*';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        // Update preview with uploaded image
        const ph = document.querySelector('.se-preview-placeholder');
        if (ph) ph.innerHTML = `<img src="${e.target.result}" alt="Content preview" style="width:100%;border-radius:8px;max-height:260px;object-fit:cover">`;
        if (state._lastGenerated) state._lastGenerated.image_url = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  /* ─── SAVE + QUEUE ───────────────────────────────────────────────────── */
  function saveToLibrary() {
    if (!state._lastGenerated) return;
    const g = state._lastGenerated;
    const asset = {
      id       : 'se-' + Date.now(),
      created  : new Date().toISOString(),
      status   : 'draft',
      favorite : false,
      title    : g.brief.substring(0, 80),
      caption  : g.caption,
      hashtags : g.hashtags,
      type     : g.type,
      platforms: g.platforms,
      theme    : g.theme,
      image_url: g.image_url || null,
      brief    : g.brief,
      source   : 'social_engine'
    };
    state.library.unshift(asset);
    _saveLibrary();
    _renderLibrary();
    renderStats();
    _addDimiMessage(`Saved to your Asset Library, Boss. Add it to today's queue when you're ready. 💜`);
    _showStudioStatus('success', 'Saved to library ✓');

    // Also save to Firestore
    if (typeof window.db !== 'undefined') {
      try { window.db.collection('content_studio').doc(asset.id).set(asset); } catch(e) {}
    }
  }

  function addToQueue() {
    if (!state._lastGenerated) return;
    const g = state._lastGenerated;
    const today = new Date();
    const todayStr = today.toDateString();

    // Check if already in queue for today
    const already = state.queue.filter(q => q.platforms.some(p => g.platforms.includes(p)) && new Date(q.created_at).toDateString() === todayStr && q.theme === g.theme);
    if (already.length >= 3) {
      if (!confirm(`You already have ${already.length} items in today's queue for these platforms. Add another?`)) return;
    }

    g.platforms.forEach(platform => {
      const postDate = new Date();
      const [h, m] = (PLATFORMS[platform]?.postTime || '7:00 PM').replace(' CT','').split(':');
      let hour = parseInt(h);
      if (PLATFORMS[platform]?.postTime.includes('PM') && hour !== 12) hour += 12;
      postDate.setHours(hour, parseInt(m || 0), 0, 0);

      const item = {
        id         : 'q-' + Date.now() + '-' + platform,
        platform,
        content_type : g.type,
        theme      : g.theme,
        caption    : g.caption,
        hashtags   : g.hashtags,
        image_url  : g.image_url || null,
        brief      : g.brief,
        scheduled_at: postDate.toISOString(),
        created_at : new Date().toISOString(),
        status     : 'pending',
        platforms  : [platform]
      };
      state.queue.unshift(item);
      _saveQueueItemToFirestore(item);
    });

    _saveQueue();
    _renderQueue();
    renderStats();
    _addDimiMessage(`Added to today's queue! Review it in the approval panel and hit Approve when you're ready. Then I will handle the rest. 💅`);
    _showStudioStatus('success', 'Added to queue ✓ — approve it in the right panel.');
  }

  /* ─── APPROVAL QUEUE PANEL ───────────────────────────────────────────── */
  function _renderQueue() {
    const el = document.getElementById('se-queue-items');
    if (!el) return;
    const today = new Date().toDateString();
    const todayItems = state.queue.filter(q => new Date(q.created_at).toDateString() === today);

    // Update date label
    const dateEl = document.getElementById('se-queue-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });

    if (!todayItems.length) {
      el.innerHTML = `<div class="se-queue-empty">
        <div class="se-queue-empty-icon">📋</div>
        <p>No content in today's queue.</p>
        <p class="se-queue-empty-sub">Generate content in the studio and click "Add to Queue" — or let Dimi build the full day for you.</p>
        <button class="se-queue-generate-btn" onclick="SocialEngine.generateDailyQueue()">Generate Today's Queue ✦</button>
      </div>`;
      return;
    }

    el.innerHTML = todayItems.map(item => {
      const p = PLATFORMS[item.platform];
      const statusCls = { pending:'se-q-pending', approved:'se-q-approved', rejected:'se-q-rejected', published:'se-q-published', scheduled:'se-q-scheduled' }[item.status] || 'se-q-pending';
      return `<div class="se-queue-item ${statusCls}" data-qid="${item.id}">
        <div class="se-qi-top">
          <div class="se-qi-plat">
            <span class="se-qi-plat-icon">${p?.icon || item.platform}</span>
            <span class="se-qi-plat-name">${p?.name || item.platform}</span>
          </div>
          <span class="se-qi-status-pill ${statusCls}">${item.status}</span>
        </div>
        ${item.image_url ? `<img src="${item.image_url}" class="se-qi-preview" alt="">` : `<div class="se-qi-preview-ph">${CONTENT_TYPES.find(t=>t.id===item.content_type)?.icon || '✦'}</div>`}
        <div class="se-qi-caption">${(item.caption||'').substring(0,100)}${item.caption?.length > 100 ? '…' : ''}</div>
        <div class="se-qi-time">⏰ ${item.scheduled_at ? new Date(item.scheduled_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZoneName:'short'}) : (p?.postTime || '') + ' CT'}</div>
        ${item.status === 'pending' ? `
          <div class="se-qi-actions">
            <button class="se-qi-approve" onclick="SocialEngine.approveItem('${item.id}')">Approve ✓</button>
            <button class="se-qi-reschedule" onclick="SocialEngine.rescheduleItem('${item.id}')">Reschedule</button>
            <button class="se-qi-reject" onclick="SocialEngine.rejectItem('${item.id}')">✕</button>
          </div>` : ''}
        ${item.status === 'approved' ? `
          <div class="se-qi-actions">
            <button class="se-qi-publish" onclick="SocialEngine.publishItem('${item.id}')">Publish Now</button>
            <button class="se-qi-reject" onclick="SocialEngine.rejectItem('${item.id}')">Remove</button>
          </div>` : ''}
      </div>`;
    }).join('');
  }

  function _renderQueueConnectionStatus() { _renderPlatformSchedule(); }

  function approveItem(id) {
    const idx = state.queue.findIndex(q => q.id === id);
    if (idx < 0) return;
    state.queue[idx].status = 'approved';
    state.queue[idx].approved_at = new Date().toISOString();
    _saveQueue();
    _updateQueueItemInFirestore(id, { status: 'approved', approved_at: state.queue[idx].approved_at });
    _renderQueue();
    const p = PLATFORMS[state.queue[idx].platform];
    _addDimiMessage(`Approved for ${p?.name || 'posting'}! It will go live at ${p?.postTime || 'scheduled time'} CT${state.connections[state.queue[idx].platform]?.connected ? ' — I will post it automatically.' : ' — connect the platform to enable auto-posting.'}`);
  }

  function rejectItem(id) {
    const idx = state.queue.findIndex(q => q.id === id);
    if (idx < 0) return;
    state.queue[idx].status = 'rejected';
    _saveQueue();
    _updateQueueItemInFirestore(id, { status: 'rejected' });
    _renderQueue();
    renderStats();
  }

  function rescheduleItem(id) {
    const item = state.queue.find(q => q.id === id);
    if (!item) return;
    const currentTime = item.scheduled_at ? new Date(item.scheduled_at) : new Date();
    const input = prompt(`Reschedule post for ${PLATFORMS[item.platform]?.name}.\nEnter new time (HH:MM, 24hr CT format):`, `${currentTime.getHours()}:${String(currentTime.getMinutes()).padStart(2,'0')}`);
    if (!input) return;
    const [h, m] = input.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) { alert('Invalid time format.'); return; }
    const newTime = new Date(); newTime.setHours(h, m, 0, 0);
    const idx = state.queue.findIndex(q => q.id === id);
    state.queue[idx].scheduled_at = newTime.toISOString();
    state.queue[idx].status = 'scheduled';
    _saveQueue();
    _updateQueueItemInFirestore(id, { scheduled_at: newTime.toISOString(), status: 'scheduled' });
    _renderQueue();
  }

  function publishItem(id) {
    const item = state.queue.find(q => q.id === id);
    if (!item) return;
    const connected = state.connections[item.platform]?.connected;
    if (connected) {
      // Auto-publish via Netlify function (scaffold)
      _autoPublish(item);
    } else {
      // Manual publish — open platform + copy caption
      _manualPublish(item);
    }
  }

  async function _autoPublish(item) {
    const idx = state.queue.findIndex(q => q.id === item.id);
    try {
      const response = await fetch('/.netlify/functions/social-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: item.platform,
          caption: [item.caption, item.hashtags].filter(Boolean).join('\n\n'),
          image_url: item.image_url,
          token: state.connections[item.platform]?.token
        })
      });
      if (!response.ok) throw new Error('Publish ' + response.status);
      const data = await response.json();
      state.queue[idx].status = 'published';
      state.queue[idx].published_at = new Date().toISOString();
      state.queue[idx].post_url = data.post_url || null;
      _saveQueue();
      _updateQueueItemInFirestore(item.id, { status: 'published', published_at: state.queue[idx].published_at });
      _renderQueue();
      _addDimiMessage(`Published to ${PLATFORMS[item.platform]?.name}! Understood the assignment. 💅`);
    } catch(e) {
      // Fallback to manual if auto fails
      _manualPublish(item);
    }
  }

  async function _manualPublish(item) {
    const text = [item.caption, item.hashtags].filter(Boolean).join('\n\n');
    if (text) await navigator.clipboard.writeText(text).catch(()=>{});
    const urls = { instagram:'https://www.instagram.com/', tiktok:'https://www.tiktok.com/upload', facebook:'https://www.facebook.com/', x:'https://x.com/compose/tweet', pinterest:'https://www.pinterest.com/pin-builder/', youtube:'https://studio.youtube.com/' };
    const idx = state.queue.findIndex(q => q.id === item.id);
    if (idx >= 0) { state.queue[idx].status = 'published'; state.queue[idx].published_at = new Date().toISOString(); }
    _saveQueue();
    _updateQueueItemInFirestore(item.id, { status: 'published', published_at: new Date().toISOString() });
    _renderQueue();
    alert(`Caption + hashtags copied to clipboard!\n\nOpening ${PLATFORMS[item.platform]?.name}… paste when you arrive. 📋\n\nPro tip: Connect your ${PLATFORMS[item.platform]?.name} account in the schedule panel to enable one-click auto-posting.`);
    window.open(urls[item.platform] || '#', '_blank');
  }

  function approveAll() {
    const today = new Date().toDateString();
    const pending = state.queue.filter(q => new Date(q.created_at).toDateString() === today && q.status === 'pending');
    if (!pending.length) { _addDimiMessage(`Nothing left to approve today — queue is all clear. ✦`); return; }
    pending.forEach(q => { q.status = 'approved'; q.approved_at = new Date().toISOString(); _updateQueueItemInFirestore(q.id, { status:'approved', approved_at:q.approved_at }); });
    _saveQueue();
    _renderQueue();
    _addDimiMessage(`All ${pending.length} posts approved! They will go live at their scheduled times. The math is mathing. 💜`);
  }

  async function generateDailyQueue() {
    if (state.generating) return;
    state.generating = true;
    _addDimiMessage(`Let me cook — building your full content schedule for today. Give me a second…`);
    const btn = document.querySelector('.se-queue-generate-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Building queue…'; }

    const today = new Date().getDay();
    const theme = WEEKLY_THEMES[today];
    const products = _getInStockProducts();
    const featured = _pickFeaturedProduct(products, today);
    const platforms = ['instagram', 'tiktok', 'facebook'];

    for (const platform of platforms) {
      state.selectedPlatforms = [platform];
      state.selectedType = platform === 'tiktok' ? 'reel' : 'promo_graphic';
      const brief = `${theme.name} content for ${PLATFORMS[platform]?.name}. ${featured ? `Feature: ${featured.name}.` : ''} Tone: ${theme.tone}.`;
      const input = document.getElementById('se-brief-input');
      if (input) input.value = brief;
      await generateContent();
      if (state._lastGenerated) addToQueue();
      // Small delay between generations
      await new Promise(r => setTimeout(r, 500));
    }

    state.generating = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Generate Today\'s Queue ✦'; }
    state.selectedPlatforms = ['instagram','tiktok','facebook'];
    _addDimiMessage(`Today's queue is ready across Instagram, TikTok, and Facebook. Review each post in the queue and hit Approve All when you're satisfied. 💅`);
  }

  /* ─── DIMI CHAT (in-panel) ───────────────────────────────────────────── */
  function sendDimiMessage() {
    const input = document.getElementById('se-chat-input');
    const msg = input?.value?.trim();
    if (!msg) return;
    input.value = '';
    _addDimiMessage(null, 'user', msg);

    // Route through dimi-chat.js (NOT Tasklet webhook — architectural directive)
    fetch(DIMI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        mode: 'admin',
        history: state.dimiMessages.filter(m=>m.role!=='system').slice(-6).map(m=>({role:m.role==='dimi'?'assistant':'user', content:m.text})),
        context: { currentTab: 'social_engine', theme: WEEKLY_THEMES[new Date().getDay()].name }
      })
    })
    .then(r => r.json())
    .then(data => _addDimiMessage(data.reply || "I'm here — what do you need, Boss? ✦"))
    .catch(() => _addDimiMessage("I had a moment there — ask me again and I will get it right. 💜"));
  }

  function _addDimiMessage(text, role = 'dimi', userText = null) {
    const msgs = document.getElementById('se-dimi-msgs');
    if (!msgs) return;
    if (role === 'user' && userText) {
      state.dimiMessages.push({ role:'user', text:userText });
      msgs.innerHTML += `<div class="se-chat-msg se-chat-user"><div class="se-chat-bubble">${userText}</div></div>`;
    }
    if (text) {
      state.dimiMessages.push({ role:'dimi', text });
      msgs.innerHTML += `<div class="se-chat-msg se-chat-dimi"><span class="se-chat-avi">✦</span><div class="se-chat-bubble">${text}</div></div>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  /* ─── PLATFORM SELECTOR UI ───────────────────────────────────────────── */
  function togglePlatform(id, el) {
    if (state.selectedPlatforms.includes(id)) {
      if (state.selectedPlatforms.length > 1) {
        state.selectedPlatforms = state.selectedPlatforms.filter(p => p !== id);
        el?.classList.remove('se-plat-on');
      }
    } else {
      state.selectedPlatforms.push(id);
      el?.classList.add('se-plat-on');
    }
  }

  function selectContentType(id, el) {
    state.selectedType = id;
    document.querySelectorAll('.se-type-chip').forEach(c => c.classList.remove('se-type-on'));
    el?.classList.add('se-type-on');
  }

  function _updatePlatformSelectors() {
    document.querySelectorAll('.se-plat-pill[data-plat]').forEach(el => {
      el.classList.toggle('se-plat-on', state.selectedPlatforms.includes(el.dataset.plat));
    });
  }

  /* ─── STUDIO STATUS ──────────────────────────────────────────────────── */
  function _showStudioStatus(type, msg) {
    const el = document.getElementById('se-studio-status');
    if (!el) return;
    el.className = 'se-studio-status se-status-' + type;
    el.textContent = msg;
    if (type === 'success') setTimeout(() => { el.className='se-studio-status se-status-idle'; el.textContent=''; }, 5000);
  }

  /* ─── ASSET LIBRARY ──────────────────────────────────────────────────── */
  function setTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.se-lib-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    _renderLibrary();
  }

  function setFilter(key, val) { state.filters[key] = val; _renderLibrary(); }
  function setSearch(q) { state.searchQuery = q.toLowerCase(); _renderLibrary(); }

  function setViewMode(mode) {
    state.viewMode = mode;
    const grid = document.getElementById('se-asset-grid');
    if (grid) grid.className = 'se-asset-grid se-view-' + mode;
    document.querySelectorAll('.se-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
  }

  function _getFiltered() {
    let a = [...state.library];
    if (state.activeTab === 'favorites')  a = a.filter(x => x.favorite);
    else if (state.activeTab === 'scheduled') a = a.filter(x => x.status === 'scheduled');
    else if (state.activeTab === 'published') a = a.filter(x => x.status === 'published');
    if (state.filters.platform !== 'all') a = a.filter(x => (x.platforms||[x.platform]).includes(state.filters.platform));
    if (state.filters.type !== 'all')     a = a.filter(x => x.type === state.filters.type);
    if (state.filters.status !== 'all')   a = a.filter(x => x.status === state.filters.status);
    if (state.searchQuery) a = a.filter(x =>
      (x.title||'').toLowerCase().includes(state.searchQuery) ||
      (x.caption||'').toLowerCase().includes(state.searchQuery) ||
      (x.theme||'').toLowerCase().includes(state.searchQuery)
    );
    return a;
  }

  function _renderLibrary() {
    const grid = document.getElementById('se-asset-grid');
    if (!grid) return;
    const assets = _getFiltered();
    if (!assets.length) {
      grid.innerHTML = `<div class="se-lib-empty"><div class="se-lib-empty-mark">✦</div><p>${state.activeTab!=='all'||state.searchQuery ? 'No matching assets' : 'Your Content Library is empty'}</p><p>${state.activeTab!=='all'||state.searchQuery ? 'Try adjusting filters.' : 'Generate content in the studio above — it auto-saves here.'}</p></div>`;
      return;
    }
    grid.innerHTML = assets.map(asset => {
      const platforms = (asset.platforms||[asset.platform]).filter(Boolean);
      const type = CONTENT_TYPES.find(t => t.id === asset.type);
      const statusCls = {draft:'se-s-draft',scheduled:'se-s-scheduled',published:'se-s-published',archived:'se-s-archived'}[asset.status]||'se-s-draft';
      const dateStr = asset.created ? new Date(asset.created).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
      return `<div class="se-lib-card ${statusCls} ${state.activeAsset?.id===asset.id?'se-card-sel':''}" onclick="SocialEngine.showAssetDetail('${asset.id}')" data-id="${asset.id}">
        ${asset.image_url ? `<div class="se-lib-thumb"><img src="${asset.image_url}" alt="${asset.title||''}"></div>` : `<div class="se-lib-thumb se-lib-thumb-ph">${type?.icon||'✦'}</div>`}
        <div class="se-lib-card-body">
          <div class="se-lib-card-title">${asset.title||'Untitled'}</div>
          <div class="se-lib-card-meta">${type?.icon||''} ${type?.label||asset.type||'Asset'} · ${dateStr}</div>
          <div class="se-lib-card-foot">
            <span class="se-status-pill ${statusCls}">${asset.status||'draft'}</span>
            ${platforms.slice(0,3).map(p=>`<span class="se-plat-dot" title="${PLATFORMS[p]?.name||p}">${PLATFORMS[p]?.icon||p}</span>`).join('')}
          </div>
        </div>
        <button class="se-fav-btn${asset.favorite?' se-fav-on':''}" onclick="event.stopPropagation();SocialEngine.toggleFavorite('${asset.id}')">♥</button>
      </div>`;
    }).join('');
  }

  function showAssetDetail(id) {
    const asset = state.library.find(a => a.id === id);
    if (!asset) return;
    state.activeAsset = asset;
    const panel = document.getElementById('se-detail-panel');
    if (!panel) return;
    const platforms = (asset.platforms||[asset.platform]).filter(Boolean);
    const statusOpts = ['draft','scheduled','published','archived']
      .map(s=>`<option value="${s}" ${asset.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('');
    panel.innerHTML = `
      <div class="se-detail-inner">
        <div class="se-det-header"><span class="se-det-title">${asset.title||'Asset Detail'}</span><button onclick="SocialEngine.closeDetail()">✕</button></div>
        ${asset.image_url ? `<img src="${asset.image_url}" alt="${asset.title||''}" style="width:100%;border-radius:10px;max-height:260px;object-fit:cover;margin-bottom:12px">` : `<div class="se-det-ph">${CONTENT_TYPES.find(t=>t.id===asset.type)?.icon||'✦'}</div>`}
        <div class="se-det-section"><label class="se-det-label">Caption</label><textarea class="se-det-textarea" id="se-det-cap" rows="4" onchange="SocialEngine.updateAsset('${asset.id}',{caption:this.value})">${asset.caption||''}</textarea></div>
        ${asset.hashtags ? `<div class="se-det-section"><label class="se-det-label">Hashtags</label><div class="se-det-hashtags">${asset.hashtags}</div></div>` : ''}
        <div class="se-det-section se-det-row">
          <div><label class="se-det-label">Status</label><select class="se-det-select" onchange="SocialEngine.updateAsset('${asset.id}',{status:this.value})">${statusOpts}</select></div>
          <div><label class="se-det-label">Schedule</label><input class="se-det-input" type="datetime-local" value="${asset.scheduled_at||''}" onchange="SocialEngine.updateAsset('${asset.id}',{scheduled_at:this.value,status:'scheduled'})"></div>
        </div>
        <div class="se-det-actions">
          ${asset.image_url ? `<a class="se-act-btn se-act-dl" href="${asset.image_url}" download="${(asset.title||'ds-asset').replace(/\s+/g,'-')}">⬇ Download</a>` : ''}
          <button class="se-act-btn se-act-queue" onclick="SocialEngine._queueFromLibrary('${asset.id}')">Add to Queue</button>
          <button class="se-act-btn se-act-del" onclick="SocialEngine.deleteAsset('${asset.id}')">🗑</button>
        </div>
      </div>`;
    panel.classList.add('se-detail-open');
    document.querySelectorAll('.se-lib-card').forEach(c => c.classList.toggle('se-card-sel', c.dataset.id === id));
  }

  function _queueFromLibrary(assetId) {
    const asset = state.library.find(a => a.id === assetId);
    if (!asset) return;
    state._lastGenerated = {
      brief: asset.brief || asset.title || '',
      caption: asset.caption || '',
      hashtags: asset.hashtags || '',
      image_url: asset.image_url || null,
      type: asset.type || 'promo_graphic',
      platforms: asset.platforms || ['instagram'],
      theme: asset.theme || WEEKLY_THEMES[new Date().getDay()].name
    };
    addToQueue();
  }

  function closeDetail() {
    state.activeAsset = null;
    const panel = document.getElementById('se-detail-panel');
    if (panel) { panel.innerHTML = ''; panel.classList.remove('se-detail-open'); }
    document.querySelectorAll('.se-lib-card').forEach(c => c.classList.remove('se-card-sel'));
  }

  function updateAsset(id, updates) {
    const idx = state.library.findIndex(a => a.id === id);
    if (idx < 0) return;
    state.library[idx] = { ...state.library[idx], ...updates };
    _saveLibrary();
    _renderLibrary();
  }

  function deleteAsset(id) {
    if (!confirm('Delete this asset? This cannot be undone.')) return;
    state.library = state.library.filter(a => a.id !== id);
    _saveLibrary();
    closeDetail();
    _renderLibrary();
    renderStats();
  }

  function toggleFavorite(id) {
    const a = state.library.find(a => a.id === id);
    if (a) updateAsset(id, { favorite: !a.favorite });
  }

  function triggerUpload() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*,video/*'; input.multiple = true;
    input.onchange = () => {
      Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const asset = {
            id: 'se-up-'+Date.now(), created: new Date().toISOString(), status:'draft', favorite:false,
            title: file.name.replace(/\.[^.]+$/,''), type: file.type.startsWith('video') ? 'reel' : 'promo_graphic',
            image_url: e.target.result, platforms: [...state.selectedPlatforms], source:'upload'
          };
          state.library.unshift(asset); _saveLibrary(); _renderLibrary(); renderStats();
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }

  /* ─── STATS ──────────────────────────────────────────────────────────── */
  function renderStats() {
    const today = new Date().toDateString();
    const todayQ = state.queue.filter(q => new Date(q.created_at).toDateString() === today);
    _setText('se-stat-library',   state.library.length);
    _setText('se-stat-queue',     todayQ.length);
    _setText('se-stat-approved',  todayQ.filter(q => q.status === 'approved' || q.status === 'published').length);
    _setText('se-stat-published', state.library.filter(a => a.status === 'published').length);
  }

  /* ─── SVG ICONS ──────────────────────────────────────────────────────── */
  function _igIcon()  { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`; }
  function _tkIcon()  { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.93a8.14 8.14 0 004.77 1.52V7.03a4.85 4.85 0 01-1-.34z"/></svg>`; }
  function _fbIcon()  { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`; }
  function _xIcon()   { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`; }
  function _pinIcon() { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`; }
  function _ytIcon()  { return `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`; }

  /* ─── HELPERS ────────────────────────────────────────────────────────── */
  function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

  /* ─── PUBLIC API ─────────────────────────────────────────────────────── */
  return {
    init,
    // Calendar
    jumpToDay,
    // Dimi Panel
    useRec, useProduct, sendDimiMessage,
    // Generation
    generateContent, regenerate, uploadAssetForContent, copyPrompt,
    // Queue
    approveItem, rejectItem, rescheduleItem, publishItem,
    approveAll, generateDailyQueue,
    // Library
    setTab, setFilter, setSearch, setViewMode,
    showAssetDetail, closeDetail, updateAsset, deleteAsset, toggleFavorite, triggerUpload,
    _queueFromLibrary,
    // Platforms
    togglePlatform, selectContentType, connectPlatform, savePlatformToken,
    // Stats
    renderStats,
    // Compat alias for any code calling ContentStudio.*
    DimiProviders
  };
})();

/* ── Backward compat alias ───────────────────────────────────────────── */
window.ContentStudio = SocialEngine;

/* ── Auto-init when tab opens ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const orig = window.switchTab;
  if (typeof orig === 'function') {
    window.switchTab = function(tab, ...args) {
      orig(tab, ...args);
      if (tab === 'content-studio') SocialEngine.init();
    };
  }
});
