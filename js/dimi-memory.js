// ================================================================
// DIMI MEMORY — DS v9.79
// Conversation memory · Welcome Back · Smart Suggestions · Checkout Assist
// Pure localStorage — no voice APIs, no paid services
// ================================================================

(function () {
  'use strict';

  const MEM_KEY  = 'ds_dimi_mem';
  const SES_KEY  = 'ds_dimi_ses';

  function getMem()  { try { return JSON.parse(localStorage.getItem(MEM_KEY)  || '{}'); } catch { return {}; } }
  function getSes()  { try { return JSON.parse(sessionStorage.getItem(SES_KEY) || '{}'); } catch { return {}; } }
  function saveMem(m) { localStorage.setItem(MEM_KEY,  JSON.stringify(m)); }
  function saveSes(s) { sessionStorage.setItem(SES_KEY, JSON.stringify(s)); }

  // ── Track ────────────────────────────────────────────────────

  function trackCategory(cat) {
    if (!cat) return;
    const m = getMem();
    m.lastCategory = cat; m.lastSeen = Date.now();
    m.visitCount = (m.visitCount || 0);
    saveMem(m);
  }

  function trackProduct(name, id) {
    if (!name) return;
    const m = getMem();
    m.lastProduct = name; m.lastProductId = id; m.lastSeen = Date.now();
    saveMem(m);
    const s = getSes();
    s.viewedProducts = s.viewedProducts || [];
    if (!s.viewedProducts.includes(id)) s.viewedProducts.unshift(id);
    if (s.viewedProducts.length > 10) s.viewedProducts = s.viewedProducts.slice(0, 10);
    saveSes(s);
  }

  function trackCartSize(n) {
    const m = getMem(); m.lastCartSize = n; saveMem(m);
    const s = getSes(); s.cartSize = n; saveSes(s);
  }

  function trackQuestion(q) {
    if (!q) return;
    const m = getMem(); m.lastQuestion = q; m.lastSeen = Date.now(); saveMem(m);
  }

  function bumpVisit() {
    const m = getMem();
    m.visitCount  = (m.visitCount || 0) + 1;
    m.lastVisitTs = Date.now();
    saveMem(m);
  }

  // ── Welcome Back ─────────────────────────────────────────────

  function isReturning() {
    const m = getMem();
    return !!(m.lastSeen && (m.visitCount || 0) > 1);
  }

  function welcomeBack() {
    const m    = getMem();
    const cart = window.cart || [];

    if (cart.length > 0) {
      const msgs = [
        `Need help finishing your order? You left ${cart.length} item${cart.length > 1 ? 's' : ''} in your cart.`,
        `Still thinking it over? Your cart's waiting — and so am I. 💜`,
        `I saved your cart for you! Want to pick up where we left off?`
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (m.lastCategory) {
      const msgs = [
        `Welcome back, gorgeous. Still curious about our ${m.lastCategory} collection?`,
        `Hey girl, hey! Ready to finish exploring our ${m.lastCategory} picks?`,
        `You came back! I knew you would. Shall we check out ${m.lastCategory} together?`
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    const msgs = [
      `Welcome back, gorgeous. Ready to find something special?`,
      `You're back! I was waiting for you — what are we shopping for today?`,
      `Hey babe, good to see you again! Let me know if you need anything. 💜`,
      `Welcome back! Anything catch your eye last time? I can help you decide.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  // ── Smart Suggestions ────────────────────────────────────────

  function suggestions(context) {
    const all  = (window.PRODUCTS || window.DEFAULT_PRODUCTS || []).filter(p => p.inStock !== false);
    const cart = window.cart || [];
    const ids  = cart.map(i => i.id);
    let pool   = all.filter(p => !ids.includes(p.id));

    if (context?.category) {
      const sub = pool.filter(p => p.category === context.category.toLowerCase());
      if (sub.length >= 2) pool = sub;
    }
    if (context?.product) {
      const cur = all.find(p => p.name === context.product);
      if (cur) {
        const sub = pool.filter(p => p.category === cur.category && p.id !== cur.id);
        if (sub.length >= 2) pool = sub;
      }
    }
    return pool.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0)).slice(0, 3);
  }

  function suggestMessage(list, context) {
    if (!list.length) return null;
    const cat = context?.category || context?.page;
    const names = list.map(p => `**${p.name}**`);
    const intro = cat
      ? `Since you're browsing our ${cat} collection, here are my top picks:`
      : `Here are some pieces I think you'd love:`;
    if (list.length === 1) {
      return `You might love the **${list[0].name}** — $${list[0].price.toFixed(2)} and one of my favorites. Want to see it?`;
    }
    return `${intro}\n• ${names.join('\n• ')}\n\nWant details on any of these?`;
  }

  // ── Checkout Assistance ──────────────────────────────────────

  function checkoutHelp(msg) {
    const m = (msg || '').toLowerCase();
    if (/ship|deliver|how long|arrive/.test(m))
      return `Shipping info: Orders over $50 in the DFW area qualify for same-day local delivery. Standard shipping is 3–7 business days. All packages ship discreetly — no brand name on the outside. Anything else I can clarify?`;
    if (/pay|cashapp|paypal|apple/.test(m))
      return `We accept CashApp, PayPal, and Apple Pay — all secure and private. Once you select your method at checkout, the payment details appear. Need help with a specific one?`;
    if (/discount|coupon|code|promo/.test(m))
      return `Promo codes go in the discount field at checkout. Keep an eye out for flash sales too — I'll give you a heads-up when something drops!`;
    if (/return|refund|exchange/.test(m))
      return `For returns or exchanges, reach out through the Contact page. Due to the nature of our products, all sales are generally final — but we always work with our customers. 💕`;
    return null;
  }

  // ── System-prompt memory context ─────────────────────────────

  function buildContext() {
    const m    = getMem();
    const s    = getSes();
    const cart = window.cart || [];
    const lines = [];
    if (isReturning())            lines.push(`Returning customer (${m.visitCount} visits)`);
    if (m.lastCategory)           lines.push(`Last browsed category: ${m.lastCategory}`);
    if (m.lastProduct)            lines.push(`Last viewed product: ${m.lastProduct}`);
    if (cart.length)              lines.push(`Cart: ${cart.map(i => `${i.name} x${i.qty}`).join(', ')}`);
    if (m.lastQuestion)           lines.push(`Last question: "${m.lastQuestion}"`);
    if (s.viewedProducts?.length) lines.push(`Products viewed this session: ${s.viewedProducts.length}`);
    return lines.length ? '\n\n[Customer Memory]\n' + lines.join('\n') : '';
  }

  // ── Public API ───────────────────────────────────────────────

  window.DS_MEM = {
    trackCategory, trackProduct, trackCartSize, trackQuestion, bumpVisit,
    isReturning, welcomeBack, suggestions, suggestMessage, checkoutHelp, buildContext
  };

  // ── Auto-wire context watchers ───────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    bumpVisit();

    // Category clicks
    document.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn,.cat-btn,[data-cat]');
      if (btn) {
        const cat = btn.textContent?.trim() || btn.dataset?.cat || '';
        if (cat && cat.toLowerCase() !== 'all') setTimeout(() => trackCategory(cat), 80);
      }
    }, true);

    // Product modal observer
    const obs = new MutationObserver(() => {
      const modal = document.getElementById('product-modal') || document.querySelector('.product-modal');
      if (!modal) return;
      const open = modal.style.display === 'flex' || modal.classList.contains('open');
      if (open) {
        const name = document.querySelector('.pm-title,.pm-name,.product-modal-title')?.textContent?.trim();
        const id   = parseInt(modal.dataset?.productId) || 0;
        if (name) {
          trackProduct(name, id);
          if (window.DS_REC && id) window.DS_REC.renderForProduct(id);
        }
      }
    });
    obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class','style'] });

    // Cart badge observer
    const badge = document.getElementById('cart-count');
    if (badge) {
      const cObs = new MutationObserver(() => trackCartSize(parseInt(badge.textContent, 10) || 0));
      cObs.observe(badge, { childList: true, characterData: true, subtree: true });
    }
  });

})();
