/* ============================================================
   DIMI PERSONAL SHOPPER (v9.91)
   Companion module — does NOT touch dimi.js core chat.
   Adds: Smart Recommendations · Bundle Generator · Cart Rescue
         Sales Prompts · Analytics Tracking
   Reads window.dimiContext (set by dimi.js) for live page state.
   ============================================================ */

'use strict';

window.DimiShopper = (() => {

  /* ── Config ─────────────────────────────────────────────── */
  const CART_RESCUE_DELAY = 35000; // 35s before cart rescue prompt
  let db = null;
  let currentUser = null;
  let cartRescueTimer = null;
  let cartRescueFired = false;

  /* ── Bundle Definitions ─────────────────────────────────── */
  const BUNDLES = {
    date_night: {
      name: 'Date Night',
      icon: '🌹',
      tagline: 'Set the mood. Own the night.',
      tags: ['massage', 'candle', 'lingerie', 'couples', 'oil', 'romance', 'satin'],
      dimiLine: 'I put together the Date Night bundle — everything you need to make tonight unforgettable. 🌹'
    },
    first_timer: {
      name: 'First Time Explorer',
      icon: '✨',
      tagline: 'Gentle intro, big confidence.',
      tags: ['beginner', 'starter', 'intro', 'first', 'wellness', 'light', 'gentle'],
      dimiLine: 'This is the bundle I recommend to everyone just getting started. Start here and thank me later. ✨'
    },
    girls_night: {
      name: "Girls Night",
      icon: '👑',
      tagline: 'You and the girls deserve this.',
      tags: ['solo', 'relaxation', 'bath', 'self care', 'fun', 'party', 'girls'],
      dimiLine: 'Okay the Girls Night bundle is giving EVERYTHING. Let me show you what we pulled together. 👑'
    },
    luxury: {
      name: 'Luxury Experience',
      icon: '💎',
      tagline: 'The finest. No compromises.',
      tags: ['luxury', 'premium', 'silk', 'gold', 'exclusive', 'top', 'luxe', 'high-end'],
      dimiLine: 'The Luxury Experience bundle? Chef\'s kiss. Only the finest for you, darling. 💎'
    },
    couples_weekend: {
      name: "Couples Weekend",
      icon: '💑',
      tagline: 'Two days, zero distractions.',
      tags: ['couples', 'weekend', 'retreat', 'together', 'duo', 'partner', 'romance', 'connection'],
      dimiLine: "The Couples Weekend bundle is literally designed for a full weekend away from the world. You're welcome. 💑"
    }
  };

  /* ── Recommendation Engine ──────────────────────────────── */
  function getRecommendations() {
    const ctx = window.dimiContext || {};
    const recs = [];

    // Based on current category
    if (ctx.category) {
      recs.push({ type: 'category', label: `More from ${ctx.category}`, reason: `You're browsing ${ctx.category}` });
    }

    // Based on cart contents
    const cartCount = ctx.cartItems || parseInt(document.getElementById('cart-badge')?.textContent || '0', 10);
    if (cartCount > 0 && cartCount < 3) {
      recs.push({ type: 'cart_upsell', label: 'Complete the set', reason: 'Most customers add one more item' });
    }

    // Based on current product
    if (ctx.product) {
      recs.push({ type: 'product_pair', label: 'Perfect pairing found', reason: `Pairs perfectly with ${ctx.product}` });
    }

    // Based on page
    const page = ctx.page || '';
    if (page === 'shop' || page === 'home') recs.push({ type: 'bundle', label: 'Build a bundle', reason: 'Save with a curated bundle' });
    if (page === 'subscriptions' || page === 'boxes') recs.push({ type: 'sub', label: 'Subscribe & save', reason: 'Members save 15% on every order' });

    return recs.slice(0, 3);
  }

  /* ── Bundle UI ──────────────────────────────────────────── */
  function renderBundleSuggestion(bundleKey) {
    const b = BUNDLES[bundleKey];
    if (!b) return '';
    return `<div class="dimi-bundle-card" data-bundle="${bundleKey}" style="background:rgba(233,30,140,.06);border:1px solid rgba(233,30,140,.2);border-radius:14px;padding:16px;margin:8px 0;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:1.8rem">${b.icon}</span>
        <div>
          <div style="color:#fff;font-size:.95rem;font-weight:700">${b.name}</div>
          <div style="color:rgba(255,255,255,.5);font-size:.8rem">${b.tagline}</div>
        </div>
      </div>
      <button onclick="DimiShopper.addBundleToCart('${bundleKey}')"
        style="background:linear-gradient(135deg,#E91E8C,#c2185b);color:#fff;border:none;padding:10px 20px;border-radius:50px;font-size:.85rem;font-weight:700;cursor:pointer;width:100%;margin-top:4px">
        Add Entire Bundle to Cart
      </button>
    </div>`;
  }

  function showBundleSuggestion(bundleKey) {
    const b = BUNDLES[bundleKey];
    if (!b) return;

    trackEvent('recommendation_shown', { type: 'bundle', bundle: bundleKey });

    // Try to inject into Dimi chat as a message
    injectDimiMessage(b.dimiLine, renderBundleSuggestion(bundleKey));
  }

  function addBundleToCart(bundleKey) {
    const b = BUNDLES[bundleKey];
    if (!b) return;
    trackEvent('recommendation_accepted', { type: 'bundle', bundle: bundleKey });

    // Get available products matching bundle tags
    const products = getProductsByTags(b.tags);
    if (!products.length) {
      showDimiToast(`I've got the ${b.name} bundle ready — head to the shop to pick your pieces! 🛍️`);
      window.location.href = '/shop.html';
      return;
    }

    let addedCount = 0;
    products.slice(0, 4).forEach(p => {
      if (window.addToCart && p) {
        addToCart(p.id || p.name || p, 1);
        addedCount++;
      }
    });

    const estimatedRevenue = products.slice(0, 4).reduce((sum, p) => sum + (p.price || 0), 0);
    if (estimatedRevenue > 0) trackEvent('revenue_attributed', { bundle: bundleKey, amount: estimatedRevenue });

    showDimiToast(`${b.icon} ${b.name} bundle added to your cart! That's ${addedCount} item${addedCount !== 1 ? 's' : ''} worth every penny. 🛍️`);
  }

  function getProductsByTags(tags) {
    // Try to pull from window.DS_PRODUCTS or the products array
    const pool = window.DS_PRODUCTS || window.allProducts || [];
    if (!pool.length) return [];
    return pool.filter(p => {
      if (!p || p.inStock === false || p.active === false) return false;
      const text = ((p.name || '') + ' ' + (p.category || '') + ' ' + (p.description || '')).toLowerCase();
      return tags.some(tag => text.includes(tag.toLowerCase()));
    });
  }

  /* ── Sales Prompts ──────────────────────────────────────── */
  const SALES_PROMPTS = [
    { trigger: 'product_view', msgs: [
      "I found something that pairs perfectly with that. Want me to show you? 👀",
      "Oh this one? Great taste. Most customers grab one more thing with it. 😌",
      "Okay that's a solid pick. I might have the perfect add-on if you're interested."
    ]},
    { trigger: 'cart_item', msgs: [
      "Most customers combine these — let me pull the top pairings real quick. 🛍️",
      "You've got great taste. Want to see what goes with what's in your cart?",
      "I see what you're building. Can I suggest one more thing that ties it all together?"
    ]},
    { trigger: 'category_browse', msgs: [
      "Browsing ${category}? I have some insider picks in that section. ✨",
      "There's a bundle in ${category} that's been flying off the virtual shelves. Just saying.",
      "Let me know if you want me to curate something in the ${category} space — I got you."
    ]},
    { trigger: 'idle', msgs: [
      "Still here and absolutely ready to help. Want me to pull some top picks? 🌸",
      "No pressure, but I found a few things you might love. Say the word and I'll show you.",
      "I don't want to rush you, but there's a bundle with your name on it. 👀"
    ]}
  ];

  function getSalesPrompt(trigger, vars = {}) {
    const set = SALES_PROMPTS.find(p => p.trigger === trigger);
    if (!set) return '';
    const msg = set.msgs[Math.floor(Math.random() * set.msgs.length)];
    return msg.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] || '');
  }

  /* ── Cart Rescue ─────────────────────────────────────────── */
  function startCartRescueWatch() {
    if (cartRescueFired) return;
    clearTimeout(cartRescueTimer);
    cartRescueTimer = setTimeout(() => {
      const cartCount = parseInt(document.getElementById('cart-badge')?.textContent || '0', 10);
      if (cartCount > 0 && !cartRescueFired) {
        cartRescueFired = true;
        fireCartRescue();
      }
    }, CART_RESCUE_DELAY);
  }

  function fireCartRescue() {
    const ctx = window.dimiContext || {};
    trackEvent('cart_rescue_shown', { cartItems: ctx.cartItems });

    const rescueMsgs = [
      "Hey — I noticed you've been here a bit. Can I help you with anything in your cart? I know this inventory well. 😊",
      "Still deciding? No rush — but if you have questions about any of the products, I can tell you everything. Just ask.",
      "I'm here if you need me! Sometimes I can suggest alternatives or explain products in more detail. What's making you hesitate? 💕",
      "Okay I see you thinking. Let me help — any questions about what's in your cart? I got answers, sis."
    ];
    const msg = rescueMsgs[Math.floor(Math.random() * rescueMsgs.length)];

    // Attempt to auto-open Dimi chat with the message
    if (window.dimiAutoMessage) {
      window.dimiAutoMessage(msg);
    } else {
      // Try to pulse the Dimi button
      const dimiBtn = document.getElementById('dimi-open-btn') || document.querySelector('.dimi-open-btn, #dimi-fab');
      if (dimiBtn) {
        dimiBtn.style.animation = 'dimi-rescue-pulse 0.8s ease 3';
        // Add pulse keyframes if not present
        if (!document.getElementById('dimi-rescue-style')) {
          const s = document.createElement('style');
          s.id = 'dimi-rescue-style';
          s.textContent = '@keyframes dimi-rescue-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18);box-shadow:0 0 0 8px rgba(233,30,140,.3)}}';
          document.head.appendChild(s);
        }
        showDimiToast(msg);
      }
    }
  }

  /* ── Recommendation Prompt in Dimi Chat ─────────────────── */
  function injectDimiMessage(text, htmlExtra) {
    const chatBody = document.getElementById('dimi-chat-body') || document.querySelector('.dimi-chat-messages, .dimi-messages');
    if (!chatBody) { showDimiToast(text); return; }

    const wrap = document.createElement('div');
    wrap.className = 'dimi-msg dimi-msg-bot';
    wrap.style.cssText = 'display:flex;gap:10px;align-items:flex-start;margin-bottom:12px;animation:fadeIn .3s ease';
    wrap.innerHTML = `<div style="font-size:1.4rem;flex-shrink:0">✨</div>
      <div style="flex:1">
        <div style="background:rgba(233,30,140,.08);border:1px solid rgba(233,30,140,.15);border-radius:14px 14px 14px 2px;padding:12px 14px;color:rgba(255,255,255,.9);font-size:.9rem;line-height:1.5">${text}</div>
        ${htmlExtra || ''}
      </div>`;
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ── Recommendation Chips ───────────────────────────────── */
  function showRecommendationChips() {
    const recs = getRecommendations();
    if (!recs.length) return;
    trackEvent('recommendation_shown', { count: recs.length, context: window.dimiContext?.page });

    const chatBody = document.getElementById('dimi-chat-body') || document.querySelector('.dimi-chat-messages');
    if (!chatBody) return;

    const chipsHtml = recs.map(r =>
      `<button onclick="DimiShopper.handleChip('${r.type}')"
        style="background:rgba(233,30,140,.1);border:1px solid rgba(233,30,140,.25);color:#fff;padding:8px 14px;border-radius:50px;font-size:.82rem;cursor:pointer;transition:all .2s;margin:3px 2px;white-space:nowrap"
        onmouseover="this.style.background='rgba(233,30,140,.25)'" onmouseout="this.style.background='rgba(233,30,140,.1)'">${r.label}</button>`
    ).join('');

    const wrap = document.createElement('div');
    wrap.innerHTML = `<div style="margin-bottom:12px">
      <div style="color:rgba(255,255,255,.5);font-size:.78rem;margin-bottom:6px;padding-left:4px">Suggestions for you</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${chipsHtml}</div>
    </div>`;
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function handleChip(type) {
    trackEvent('recommendation_accepted', { type });
    switch (type) {
      case 'bundle': showBundleSuggestion('date_night'); break;
      case 'cart_upsell': injectDimiMessage(getSalesPrompt('cart_item')); break;
      case 'product_pair': injectDimiMessage(getSalesPrompt('product_view')); break;
      case 'sub': injectDimiMessage("Subscribing saves you 15% every month and gets you first access to new drops. Want to see the plans? 📦"); break;
      case 'category_browse': injectDimiMessage(getSalesPrompt('category_browse', { category: window.dimiContext?.category || 'this section' })); break;
      default: injectDimiMessage("Let me pull some top picks for you right now! One sec. ✨");
    }
  }

  /* ── Toast ──────────────────────────────────────────────── */
  function showDimiToast(msg) {
    let t = document.getElementById('dimi-shopper-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'dimi-shopper-toast';
      t.setAttribute('aria-live', 'polite');
      t.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#1e0d2e;border:1px solid rgba(233,30,140,.4);color:#fff;padding:14px 20px;border-radius:14px;z-index:99998;max-width:300px;font-size:.88rem;line-height:1.4;box-shadow:0 4px 24px rgba(0,0,0,.5);transform:translateY(20px);opacity:0;transition:all .3s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translateY(0)'; t.style.opacity = '1';
    setTimeout(() => { t.style.transform = 'translateY(20px)'; t.style.opacity = '0'; }, 5000);
  }

  /* ── Analytics ──────────────────────────────────────────── */
  async function trackEvent(eventType, data = {}) {
    try {
      if (!db) return;
      await db.collection('dimi_analytics').add({
        eventType,
        ...data,
        page: window.dimiContext?.page || window.location.pathname,
        userId: currentUser?.uid || null,
        sessionId: getSessionId(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (_) {}
  }

  async function getAnalyticsSummary() {
    if (!db) return null;
    try {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const snap = await db.collection('dimi_analytics').where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(weekAgo)).get();
      const events = snap.docs.map(d => d.data());
      return {
        shown: events.filter(e => e.eventType === 'recommendation_shown').length,
        accepted: events.filter(e => e.eventType === 'recommendation_accepted').length,
        cartRescues: events.filter(e => e.eventType === 'cart_rescue_shown').length,
        revenue: events.filter(e => e.eventType === 'revenue_attributed').reduce((s, e) => s + (e.amount || 0), 0),
        conversionRate: events.length ? ((events.filter(e => e.eventType === 'recommendation_accepted').length / Math.max(events.filter(e => e.eventType === 'recommendation_shown').length, 1)) * 100).toFixed(1) : 0
      };
    } catch (_) { return null; }
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('ds_session_id');
    if (!sid) { sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); sessionStorage.setItem('ds_session_id', sid); }
    return sid;
  }

  /* ── Init ────────────────────────────────────────────────── */
  function init() {
    if (window.firebase) {
      db = firebase.firestore();
      firebase.auth().onAuthStateChanged(u => { currentUser = u; });
    }

    // Watch for cart items — start cart rescue
    const cartBadge = document.getElementById('cart-badge') || document.getElementById('cart-count');
    if (cartBadge) {
      const observer = new MutationObserver(() => {
        const count = parseInt(cartBadge.textContent || '0', 10);
        if (count > 0) startCartRescueWatch();
        else { clearTimeout(cartRescueTimer); cartRescueFired = false; }
      });
      observer.observe(cartBadge, { childList: true, characterData: true, subtree: true });
    }

    // Hook into Dimi chat open — show recommendation chips after first open
    const dimiBtn = document.getElementById('dimi-open-btn') || document.querySelector('.dimi-open-btn, #dimi-fab');
    if (dimiBtn) {
      let chipsShown = false;
      dimiBtn.addEventListener('click', () => {
        if (chipsShown) return;
        chipsShown = true;
        setTimeout(() => {
          showRecommendationChips();
          trackEvent('recommendation_shown', { trigger: 'chat_open', page: window.dimiContext?.page });
        }, 1200);
      });
    }

    // Expose for dimi.js to call when context changes
    window.dimiShopperContextChange = function(ctx) {
      if (ctx?.product && Math.random() < 0.4) {
        // 40% chance show a product-view sales prompt
        setTimeout(() => injectDimiMessage(getSalesPrompt('product_view')), 800);
      }
    };
  }

  /* ── Public API ──────────────────────────────────────────── */
  return {
    init,
    showBundleSuggestion,
    addBundleToCart,
    showRecommendationChips,
    handleChip,
    getSalesPrompt,
    fireCartRescue,
    getAnalyticsSummary,
    trackEvent,
    BUNDLES
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', DimiShopper.init);
} else {
  DimiShopper.init();
}
