// ─────────────────────────────────────────────────────────────
//  DIMI — Dripping Secrets Platform AI  v2.0
//  Personality: Sassy gay best friend meets chic & clever.
//  Voice: Web Speech API only (ElevenLabs pending)
//
//  ARCHITECTURAL DIRECTIVE (Dimi Independence):
//  Dimi is a platform-level AI service, NOT dependent on any
//  single execution provider. Chat routes through Netlify →
//  OpenAI (dimi-chat.js). If unavailable, keyword fallback
//  keeps Dimi operational. Generation tasks (image/video) use
//  interchangeable execution providers. Tasklet = one provider.
//  See: content-studio.js DimiProviders registry.
// ─────────────────────────────────────────────────────────────

(function () {
  // ── Structured Context Object ─────────────────────────────
  // Pages set window.dimiContext = { page, category, product, cartItems }
  // dimi.js enriches it dynamically; always the source of truth for backend calls.
  if (!window.dimiContext) window.dimiContext = {};

  function syncCartCount() {
    const badge = document.getElementById('cart-count');
    if (badge) {
      const n = parseInt(badge.textContent, 10) || 0;
      window.dimiContext.cartItems = n;
    }
  }

  function syncCategory() {
    const activeBtn = document.querySelector('.filter-btn.active, .cat-btn.active, [data-cat].active');
    if (activeBtn) {
      const label = activeBtn.textContent?.trim() || activeBtn?.dataset?.cat || '';
      window.dimiContext.category = label.toLowerCase() !== 'all' ? label : null;
    }
  }

  function syncProduct() {
    const modal = document.getElementById('product-modal') || document.querySelector('.product-modal');
    if (modal && (modal.style.display === 'flex' || modal.classList.contains('open') || modal.classList.contains('active'))) {
      const title = document.querySelector('.pm-title, .product-modal-title, .pm-name')?.textContent?.trim();
      window.dimiContext.product = title || null;
    } else {
      window.dimiContext.product = null;
    }
  }

  function isCheckoutOpen() {
    const cartPanel = document.getElementById('cart-panel') || document.querySelector('.cart-panel');
    const checkoutStep = document.querySelector('.checkout-step, #checkout-step, .payment-section');
    return !!(cartPanel && checkoutStep);
  }

  function setupContextWatchers() {
    // Watch for category filter clicks
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.filter-btn, .cat-btn, [data-cat]');
      if (btn) { setTimeout(syncCategory, 50); }
    }, true);

    // MutationObserver: product modal + filter active class
    const observer = new MutationObserver(function() {
      syncCategory();
      syncProduct();
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });

    // Cart count sync
    syncCartCount();
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
      const cartObserver = new MutationObserver(syncCartCount);
      cartObserver.observe(cartBadge, { childList: true, characterData: true, subtree: true });
    }

    // Initial sync
    syncCategory();
    syncProduct();
  }

  // ── Session Context Awareness ─────────────────────────────
  function getPageContext() {
    const path = window.location.pathname.replace(/\/$/, '').toLowerCase();

    // Checkout overrides everything
    if (isCheckoutOpen()) {
      window.dimiContext.page = 'checkout';
      return { page: 'checkout', label: 'Customer is checking out' };
    }

    // Product modal open
    const modal = document.getElementById('product-modal') || document.querySelector('.product-modal');
    if (modal && (modal.style.display === 'flex' || modal.classList.contains('open') || modal.classList.contains('active'))) {
      const title = window.dimiContext.product ||
        document.querySelector('.pm-title, .product-modal-title, .pm-name')?.textContent?.trim();
      window.dimiContext.product = title || null;
      return { page: 'product', label: title ? `Customer is viewing: ${title}` : 'Customer is viewing a product' };
    }

    // Use window.dimiContext.page if set by the page
    const ctxPage = window.dimiContext.page;

    // Category active — takes priority on shop/home
    const activeBtn = document.querySelector('.filter-btn.active, .cat-btn.active, [data-cat].active');
    const catLabel = activeBtn?.textContent?.trim() || activeBtn?.dataset?.cat;
    if (catLabel && catLabel.toLowerCase() !== 'all') {
      window.dimiContext.category = catLabel;
      const pageForCat = ctxPage || (path.includes('shop') ? 'shop' : 'home');
      return { page: pageForCat, label: `Customer is browsing: ${catLabel}` };
    } else {
      window.dimiContext.category = null;
    }

    // Page from window.dimiContext (set by each HTML page)
    if (ctxPage === 'shop')            return { page: 'shop',   label: 'Customer is browsing the shop' };
    if (ctxPage === 'party')           return { page: 'party',  label: 'Customer is planning an event' };
    if (ctxPage === 'booking')         return { page: 'booking',label: 'Customer is booking a service' };
    if (ctxPage === 'boxes')           return { page: 'boxes',  label: 'Customer is browsing subscription boxes' };
    if (ctxPage === 'bundles')         return { page: 'bundles',label: 'Customer is browsing bundles' };
    if (ctxPage === 'machines')        return { page: 'machines',label:'Customer is browsing machines' };
    if (ctxPage === 'account')         return { page: 'account',label: 'Customer is managing their account' };
    if (ctxPage === 'services')        return { page: 'services',label:'Customer is viewing services' };
    if (ctxPage === 'about')           return { page: 'about',  label: 'Customer is on the About page' };
    if (ctxPage === 'contact')         return { page: 'contact',label: 'Customer is on the Contact page' };
    if (ctxPage === 'sneaky-link-bags') return { page: 'sneaky-link-bags', label: 'Customer is browsing Sneaky Link Bags' };
    if (ctxPage === 'home')            return { page: 'home',   label: 'Customer is on the homepage' };

    // URL fallback
    if (path.includes('shop'))    return { page: 'shop',   label: 'Customer is browsing the shop' };
    if (path.includes('party'))   return { page: 'party',  label: 'Customer is planning an event' };
    if (path.includes('booking')) return { page: 'booking',label: 'Customer is booking a service' };
    if (path.includes('boxes'))   return { page: 'boxes',  label: 'Customer is browsing subscription boxes' };
    if (path.includes('bundles')) return { page: 'bundles',label: 'Customer is browsing bundles' };
    if (path.includes('machines'))return { page: 'machines',label:'Customer is browsing machines' };
    if (path.includes('account')) return { page: 'account',label: 'Customer is managing their account' };
    if (path.includes('services'))return { page: 'services',label:'Customer is viewing services' };
    if (path.includes('about'))   return { page: 'about',  label: 'Customer is on the About page' };
    if (path.includes('contact')) return { page: 'contact',label: 'Customer is on the Contact page' };
    if (path.includes('sneaky'))  return { page: 'sneaky-link-bags', label: 'Customer is browsing Sneaky Link Bags' };

    return { page: 'home', label: 'Customer is on the homepage' };
  }

  // ── Voice Config ──────────────────────────────────────────────────────────
  // Voice: Web Speech API only.

  let currentAudio = null;
  let isSpeaking   = false;
  let voiceEnabled = false; // DISABLED — voice not active at this stage

  // ── Responses ─────────────────────────────────────────────
  const responses = [
    {
      keywords: ['shipping', 'ship', 'deliver', 'how long', 'arrive', 'arrival', 'days'],
      reply: `Okay so here's the tea on shipping — orders under $35 start at $8.99 and we go up from there based on weight. Want it fast? Priority and Express options are at checkout. Most orders go out within 1–3 business days. Worth it, darling. 📦`
    },
    {
      keywords: ['return', 'refund', 'exchange', 'wrong', 'broken', 'defective'],
      reply: `Ugh, that's never the vibe. Email us at Assistant.Manager@DrippingSecrets.com with your order details and we'll make it right. We take care of our people. 🖤`
    },
    {
      keywords: ['subscription', 'box', 'monthly', 'subscribe', 'tease', 'couples', 'self-love', 'self love'],
      reply: `Oh you found the good stuff. 👀 We've got three boxes — Secret Tease at $39/mo, Couples Reconnect at $49/mo, and Self-Love at $44/mo. Each one is curated to help you keep her — and never repeats. Same box twice? Not how we move. Scroll up to the Subscription section to sign up!`
    },
    {
      keywords: ['lingerie', 'costume', 'outfit', 'wear', 'clothing', 'bodysuit', 'teddy'],
      reply: `Ooh yes — our lingerie and costume pieces are *chef's kiss*. Just a heads up: those items ship separately and take 7–14 business days. Totally worth the wait though, trust.`
    },
    {
      keywords: ['discount', 'coupon', 'promo', 'sale', 'code', 'deal', 'off'],
      reply: `I love a deal era! Keep an eye on your email after you create an account — that's where the good stuff lands. No account yet? Sign up, it's free and takes 30 seconds. 💜`
    },
    {
      keywords: ['payment', 'pay', 'cashapp', 'apple pay', 'card', 'credit', 'checkout'],
      reply: `We accept CashApp, PayPal, and Apple Pay at checkout. All secured, no drama. Easy. 💳`
    },
    {
      keywords: ['wishlist', 'wish list', 'save', 'favorite', 'heart'],
      reply: `Okay yes! Add anything to your wishlist by hitting the 💜 on a product — you'll need a free account to save them. Great for hinting to a partner, just saying. 😏`
    },
    {
      keywords: ['secret party', 'secrets party', 'party', 'event', 'host', 'book', 'booking'],
      reply: `A Secrets Party?! That's the move. 🥂 Our Secret Keepers bring the whole experience to you and your crew. Scroll down to the Secrets Parties section or hit "Book a Secret Party" to get started!`
    },
    {
      keywords: ['build', 'custom', 'box', 'own', 'create', 'pick'],
      reply: `Build-Your-Own Box is literally my favorite thing we offer. You pick what goes in, we handle the rest. Find it in the subscription section — your box, your rules. 🎁`
    },
    {
      keywords: ['contact', 'email', 'reach', 'help', 'support', 'question', 'human'],
      reply: `Real human? I got you. Email us anytime at Assistant.Manager@DrippingSecrets.com — we actually read these, promise. 🖤`
    },
    {
      keywords: ['hi', 'hey', 'hello', 'hii', 'heyy', 'sup', 'what\'s up', 'whats up', 'yo'],
      reply: `Hey gorgeous! 💜 I'm Dimi — your personal Secret Keeper guide. Ask me anything: shipping, products, subscriptions, events. I'm here and I'm ready. What do you need?`
    },
    {
      keywords: ['who are you', 'what are you', 'who is dimi', 'what is dimi', 'are you real', 'are you a bot', 'ai'],
      reply: `I'm Dimi — Dripping Secrets' very own assistant. Think of me as your stylish, opinionated, always-available shopping companion. Not a robot. Not basic. Just here for you. 💜`
    },
    {
      keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'afford'],
      reply: `Our prices are already marked way down from retail — like, *way* down. And we're always comparing against full retail so you can see exactly what you're saving. Scroll through the shop and you'll see the receipts. 👀`
    },
    {
      keywords: ['track', 'tracking', 'order', 'where is', 'status'],
      reply: `Log into your account and check the Orders section for tracking info. If something looks off, shoot us an email at Assistant.Manager@DrippingSecrets.com and we'll dig into it. 📦`
    },
    {
      keywords: ['discreet', 'private', 'packaging', 'plain', 'box', 'nosy'],
      reply: `Say less — all orders ship in plain, unmarked packaging. Nobody's business but yours. 🤫`
    }
  ];

  const fallbacks = [
    `Hmm, I'm not quite sure about that one — but our team definitely is. Email Assistant.Manager@DrippingSecrets.com and they'll sort you out. 🖤`,
    `Okay that one's above my pay grade, but just barely. 😄 Shoot us a note at Assistant.Manager@DrippingSecrets.com!`,
    `That's a great question and honestly? Email the team at Assistant.Manager@DrippingSecrets.com — they live for this stuff.`,
    `I don't have that answer right now, but I refuse to leave you hanging. Hit us at Assistant.Manager@DrippingSecrets.com. 💜`
  ];

  function getReply(input) {
    const text = input.toLowerCase();
    for (const r of responses) {
      if (r.keywords.some(k => text.includes(k))) return r.reply;
    }
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ── TTS ── Web Speech API only ───────────────────────────
  function _wssSpeak(cleanText) {
    isSpeaking = false;
    // Route through DimiActor — it handles Web Speech + actor state transitions
    if (window.DimiActor && window.DimiActor.speak) {
      window.DimiActor.speak(cleanText);
    }
  }

  async function speakText(text) {
    if (!voiceEnabled) {
      // Even without voice, briefly show speaking state so Dimi reacts visually
      if (window.DimiActor) {
        window.DimiActor.setState('speaking');
        setTimeout(() => { if (window.DimiActor) window.DimiActor.setState('idle'); }, 1800);
      }
      return;
    }
    // Stop if already speaking
    if (currentAudio) { currentAudio.pause(); currentAudio = null; isSpeaking = false; return; }
    isSpeaking = true;
    const cleanText = text.replace(/[*_~`]/g, '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

    // Web Speech API — only active voice layer
    _wssSpeak(cleanText);
  }

  // ── Build UI ──────────────────────────────────────────────
  function buildDimi() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #dimi-bubble {
        position: fixed; bottom: 24px; right: 24px; z-index: 9999;
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, #9b5fc0, #6d28d9);
        box-shadow: 0 4px 20px rgba(109,40,217,0.5);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 26px; border: none; outline: none;
        transition: transform 0.2s, box-shadow 0.2s;
        animation: dimi-pulse 3s ease-in-out infinite;
      }
      #dimi-bubble:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(109,40,217,0.7); }
      @keyframes dimi-pulse {
        0%,100% { box-shadow: 0 4px 20px rgba(109,40,217,0.5); }
        50%      { box-shadow: 0 4px 32px rgba(155,95,192,0.8); }
      }
      #dimi-badge {
        position: absolute; top: -4px; right: -4px;
        background: #ff4d8d; color: #fff; font-size: 11px; font-weight: 700;
        border-radius: 50%; width: 18px; height: 18px;
        display: flex; align-items: center; justify-content: center;
        display: none;
      }
      #dimi-panel {
        position: fixed; bottom: 96px; right: 24px; z-index: 9998;
        width: 340px; max-width: calc(100vw - 48px);
        background: #0e0e0e; border: 1px solid #3b1f5e;
        border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,0.7);
        display: none; flex-direction: column; overflow: hidden;
        font-family: 'Segoe UI', sans-serif;
        animation: dimi-slide-up 0.25s ease;
      }
      @keyframes dimi-slide-up {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #dimi-header {
        background: linear-gradient(135deg, #1a0a2e, #2d0e5e);
        padding: 14px 16px; display: flex; align-items: center; gap: 10px;
        border-bottom: 1px solid #3b1f5e;
      }
      #dimi-chat-avatar {
        width: 44px; height: 44px; border-radius: 50%;
        background: #1a0a2e;
        border: 2px solid #B76E79;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; overflow: hidden;
      }
      #dimi-chat-avatar img { width: 44px; height: 44px; object-fit: cover; }
      #dimi-header-info { flex: 1; }
      #dimi-header-name { color: #e2c4ff; font-size: 14px; font-weight: 700; }
      #dimi-header-status { color: #a78bca; font-size: 11px; margin-top: 1px; }
      #dimi-voice-toggle {
        background: none; border: 1px solid #5b2d8e; border-radius: 20px;
        color: #c4a0e8; font-size: 11px; padding: 4px 10px; cursor: pointer;
        transition: all 0.2s;
      }
      #dimi-voice-toggle.on { background: #3b1f5e; color: #e2c4ff; border-color: #9b5fc0; }
      #dimi-messages {
        flex: 1; overflow-y: auto; padding: 14px; display: flex;
        flex-direction: column; gap: 10px; max-height: 320px;
        scrollbar-width: thin; scrollbar-color: #3b1f5e transparent;
      }
      .dimi-msg {
        max-width: 88%; padding: 10px 13px; border-radius: 16px;
        font-size: 13.5px; line-height: 1.5; animation: dimi-fade 0.2s ease;
      }
      @keyframes dimi-fade { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
      .dimi-msg.dimi  { background: #1e0a3c; color: #e2c4ff; border-radius: 16px 16px 16px 4px; align-self: flex-start; }
      .dimi-msg.user  { background: linear-gradient(135deg, #7c3aed, #9b5fc0); color: #fff; border-radius: 16px 16px 4px 16px; align-self: flex-end; }
      .dimi-msg.typing { color: #9b5fc0; font-style: italic; font-size: 13px; }
      #dimi-input-row {
        display: flex; gap: 8px; padding: 12px 14px;
        border-top: 1px solid #1e0a3c; background: #0a0a0a;
      }
      #dimi-input {
        flex: 1; background: #1a0a2e; border: 1px solid #3b1f5e;
        border-radius: 20px; padding: 9px 14px; color: #e2c4ff;
        font-size: 13px; outline: none; font-family: inherit;
        transition: border-color 0.2s;
      }
      #dimi-input:focus { border-color: #9b5fc0; }
      #dimi-input::placeholder { color: #6b4a8a; }
      #dimi-send {
        background: linear-gradient(135deg, #9b5fc0, #6d28d9);
        border: none; border-radius: 50%; width: 38px; height: 38px;
        color: #fff; font-size: 16px; cursor: pointer; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.15s;
      }
      #dimi-send:hover { transform: scale(1.1); }
      #dimi-tagline {
        text-align: center; font-size: 10px; color: #4a2d6e;
        padding: 0 14px 10px; font-style: italic;
      }
      #dimi-context-bar {
        background: rgba(155,95,192,0.1); border-bottom: 1px solid #2a1050;
        padding: 5px 14px; display: flex; align-items: center; gap: 6px;
        font-size: 11px; color: #a78bca; white-space: nowrap; overflow: hidden;
      }
      #dimi-context-bar span { color: #e2c4ff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
    `;
    document.head.appendChild(style);

    // Build HTML
    const bubble = document.createElement('button');
    bubble.id = 'dimi-bubble';
    bubble.setAttribute('aria-label', 'Chat with Dimi');
    bubble.innerHTML = `<img src="images/dimi/dimi-portrait.png" alt="Dimi" style="width:52px;height:52px;object-fit:cover;border-radius:50%"><span id="dimi-badge">1</span>`;


    const panel = document.createElement('div');
    panel.id = 'dimi-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Chat with Dimi');
    panel.innerHTML = `
      <div id="dimi-header">
        <div id="dimi-chat-avatar"><img src="images/dimi/dimi-portrait.png" alt="Dimi"></div>
        <div id="dimi-header-info">
          <div id="dimi-header-name">Dimi</div>
          <div id="dimi-header-status">Your Secret Keeper guide</div>
        </div>
        <button id="dimi-voice-toggle" class="on" title="Toggle voice" aria-label="Toggle Dimi voice"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg> Voice</button>
      </div>
      <div id="dimi-context-bar">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
        Dimi knows: <span id="dimi-ctx-label">Loading…</span>
      </div>
      <div id="dimi-messages" role="log" aria-live="polite" aria-label="Conversation with Dimi">
        <div class="dimi-msg dimi">Hey gorgeous! 💜 I'm Dimi — your personal guide to everything Dripping Secrets. Ask me about products, shipping, subscriptions, or anything else. I'm all yours.</div>
      </div>
      <div id="dimi-input-row">
        <input id="dimi-input" type="text" placeholder="Ask Dimi anything…" autocomplete="off" aria-label="Type your message to Dimi" />
        <button id="dimi-send" aria-label="Send message">➤</button>
      </div>
      <div id="dimi-tagline">You deserve a secret this good.</div>
    `;

    document.body.appendChild(panel);
    document.body.appendChild(bubble);

    // ── Context Bar ──────────────────────────────────────────
    function refreshContextBar() {
      const ctx = getPageContext();
      const el = document.getElementById('dimi-ctx-label');
      if (el) el.textContent = ctx.label;
    }
    refreshContextBar();
    // Refresh on hash change and every 3s (catches filter clicks etc.)
    window.addEventListener('hashchange', refreshContextBar);
    window.addEventListener('popstate', refreshContextBar);
    setInterval(refreshContextBar, 3000);

    // Start dynamic context watchers (category, product modal, cart count)
    setupContextWatchers();

    // ── Logic ────────────────────────────────────────────────
    let open = false;

    function togglePanel() {
      open = !open;
      panel.style.display = open ? 'flex' : 'none';
      // Show/hide Dimi actor stage with chat panel
      const _actorStage = document.getElementById('dimi-stage');
      if (_actorStage) _actorStage.style.display = open ? 'block' : 'none';
      bubble.innerHTML = open ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>` : `<img src="images/dimi/dimi-portrait.png" alt="Dimi" style="width:52px;height:52px;object-fit:cover;border-radius:50%"><span id="dimi-badge" style="display:none">1</span>`;
      if (open) {
        document.getElementById('dimi-input').focus();
        // Welcome back message — Sprint C
        if (window.DS_MEM && window.DS_MEM.isReturning() && _customerHistory.length === 0) {
          setTimeout(() => {
            const msg = window.DS_MEM.welcomeBack();
            if (msg) addMessage(msg, 'dimi');
          }, 600);
        }
        // Actor: open → guiding state
        if (window.DimiActor) window.DimiActor.setState('guiding');
      }
    }

    bubble.addEventListener('click', togglePanel);

    const voiceBtn = document.getElementById('dimi-voice-toggle');
    voiceBtn.addEventListener('click', () => {
      voiceEnabled = !voiceEnabled;
      voiceBtn.innerHTML = voiceEnabled ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg> Voice' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle;margin-right:4px"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg> Voice';
      voiceBtn.classList.toggle('on', voiceEnabled);
    });

    // Per-session conversation history for multi-turn AI chat
    let _customerHistory = [];

    function addMessage(text, who) {
      const msgs = document.getElementById('dimi-messages');
      const div  = document.createElement('div');
      div.className = `dimi-msg ${who}`;
      // Allow basic HTML in Dimi's replies (links, bold)
      if (who === 'dimi') {
        div.innerHTML = text;
      } else {
        div.textContent = text;
      }
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
      return div;
    }

    function showTyping() {
      if (window.DimiActor) window.DimiActor.setState('thinking');
      return addMessage('Dimi is thinking…', 'dimi typing');
    }

    async function sendMessage(text) {
      if (!text.trim()) return;
      addMessage(text, 'user');
      const typing = showTyping();

      // Try AI endpoint first
      try {
        const pageCtx = getPageContext();
        syncCartCount();
        const res = await fetch('/.netlify/functions/dimi-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            mode: 'customer',
            history: _customerHistory.slice(-8),
            context: {
              pageContext: pageCtx.label,
              page:        pageCtx.page,
              category:    window.dimiContext.category  || null,
              product:     window.dimiContext.product   || null,
              cartItems:   window.dimiContext.cartItems || 0
            }
          })
        });

        if (!res.ok) throw new Error('Function ' + res.status);
        const data = await res.json();
        const reply = data.reply || getReply(text);

        typing.remove();

        // Track conversation history
        _customerHistory.push({ role: 'user', content: text });
        _customerHistory.push({ role: 'assistant', content: reply });
        if (_customerHistory.length > 20) _customerHistory = _customerHistory.slice(-16);

        addMessage(reply, 'dimi');
        speakText(reply.replace(/<[^>]*>/g, '')); // strip HTML for TTS

      } catch (err) {
        // Fallback to keyword matching
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        const reply = getReply(text);
        typing.remove();
        addMessage(reply, 'dimi');
        speakText(reply);
      }
    }

    document.getElementById('dimi-send').addEventListener('click', () => {
      const input = document.getElementById('dimi-input');
      const val = input.value.trim();
      if (val) { input.value = ''; sendMessage(val); }
    });

    document.getElementById('dimi-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const input = document.getElementById('dimi-input');
        const val = input.value.trim();
        if (val) { input.value = ''; sendMessage(val); }
      }
    });
  }

  // Init after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDimi);
  } else {
    buildDimi();
  }
})();
