// ================================================================
// RECOMMENDATIONS — DS v9.78
// Recently Viewed · Customers Also Bought · FBT · Recommended For You · Cart Upsell
// Zero external APIs — localStorage + existing PRODUCTS catalog
// ================================================================

(function () {
  'use strict';

  const REC_KEY   = 'ds_viewed';
  const BOUGHT_KEY = 'ds_bought';
  const MAX_H      = 20;

  // ── Data helpers ─────────────────────────────────────────────

  function products()  { return (window.PRODUCTS || window.DEFAULT_PRODUCTS || []).filter(p => p.inStock !== false); }
  function getViewed() { try { return JSON.parse(localStorage.getItem(REC_KEY) || '[]'); } catch { return []; } }
  function getBought() { try { return JSON.parse(localStorage.getItem(BOUGHT_KEY) || '[]'); } catch { return []; } }

  function addViewed(id) {
    let v = getViewed().filter(x => x !== id);
    v.unshift(id);
    if (v.length > MAX_H) v = v.slice(0, MAX_H);
    localStorage.setItem(REC_KEY, JSON.stringify(v));
  }

  function recordPurchase(ids) {
    let b = getBought();
    (ids || []).forEach(id => { if (!b.includes(id)) b.push(id); });
    localStorage.setItem(BOUGHT_KEY, JSON.stringify(b));
  }

  // ── Engines ──────────────────────────────────────────────────

  function recentlyViewed(limit) {
    const pool = products();
    return getViewed().map(id => pool.find(p => p.id === id)).filter(Boolean).slice(0, limit || 4);
  }

  function customersAlsoBought(productId, limit) {
    const pool = products();
    const cur = pool.find(p => p.id === productId);
    if (!cur) return recommendedForYou(limit);
    const same  = pool.filter(p => p.id !== productId && p.category === cur.category);
    const other = pool.filter(p => p.id !== productId && p.category !== cur.category);
    return [...same, ...other].slice(0, limit || 4);
  }

  function frequentlyBoughtTogether(productId, limit) {
    const pool = products();
    const cur  = pool.find(p => p.id === productId);
    if (!cur) return [];
    const comp = { machines:['toys','accessories'], toys:['accessories','lingerie','machines'], accessories:['toys','machines'], lingerie:['accessories','toys'], bags:['accessories'], boxes:['toys','accessories'], bundles:['accessories','toys'], sets:['accessories','toys'] };
    const cats = comp[cur.category] || [];
    const out  = pool.filter(p => p.id !== productId && (cats.includes(p.category) || p.category === cur.category));
    return out.sort(() => Math.random() - .5).slice(0, limit || 3);
  }

  function recommendedForYou(limit) {
    const pool   = products();
    const viewed = getViewed();
    const bought = getBought();
    const unseen = pool.filter(p => !viewed.includes(p.id) && !bought.includes(p.id));
    const seen   = pool.filter(p =>  viewed.includes(p.id) && !bought.includes(p.id));
    return [...unseen, ...seen].sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0)).slice(0, limit || 4);
  }

  function cartUpsell(cartItems, limit) {
    const pool    = products();
    const cartIds = (cartItems || []).map(i => i.id);
    const cartCats = cartIds.map(id => { const p = pool.find(x => x.id === id); return p ? p.category : null; }).filter(Boolean);
    const scored  = pool.filter(p => !cartIds.includes(p.id)).map(p => {
      let s = 0;
      if (cartCats.includes(p.category)) s += 2;
      if (p.badge) s += 1;
      if (p.comparePrice && p.comparePrice > p.price) s += 1;
      return { p, s };
    });
    return scored.sort((a, b) => b.s - a.s).slice(0, limit || 3).map(x => x.p);
  }

  // ── Render helpers ────────────────────────────────────────────

  function card(p) {
    const save = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    return `<div class="rec-card" onclick="typeof openProductModal==='function'&&openProductModal(${p.id})" role="button" tabindex="0" aria-label="View ${p.name}">
      <div class="rec-img-wrap">
        <img src="/${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='/images/placeholder.jpg'">
        ${p.badge ? `<span class="rec-badge">${p.badge}</span>` : ''}
        ${save >= 10 ? `<span class="rec-badge rec-badge-sale">-${save}%</span>` : ''}
      </div>
      <div class="rec-body">
        <div class="rec-name">${p.name}</div>
        <div class="rec-price">$${p.price.toFixed(2)}${p.comparePrice ? `<span class="rec-compare">$${p.comparePrice.toFixed(2)}</span>` : ''}</div>
      </div>
    </div>`;
  }

  function section(containerId, title, list) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!list || !list.length) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = `<div class="rec-section"><h3 class="rec-title">${title}</h3><div class="rec-grid">${list.map(card).join('')}</div></div>`;
  }

  // ── Public API ───────────────────────────────────────────────

  window.DS_REC = {
    track:          addViewed,
    recordPurchase,
    recentlyViewed,
    customersAlsoBought,
    frequentlyBoughtTogether,
    recommendedForYou,
    cartUpsell,
    section,

    renderForProduct(id) {
      addViewed(id);
      section('rec-customers-bought',  'Customers Also Bought',          customersAlsoBought(id));
      section('rec-fbt',               'Frequently Bought Together',     frequentlyBoughtTogether(id));
      section('rec-recently-viewed',   'Recently Viewed',                recentlyViewed(4).filter(p => p.id !== id));
    },

    renderForCart() {
      const items = window.cart || [];
      section('rec-cart-upsell', 'You Might Also Love', cartUpsell(items));
      section('rec-cart-viewed', 'Recently Viewed',     recentlyViewed(3));
    },

    renderForPage() {
      section('rec-homepage', 'Recommended For You', recommendedForYou(4));
    }
  };

  // ── Auto-hooks ───────────────────────────────────────────────

  document.addEventListener('cart:opened', () => window.DS_REC.renderForCart());

  document.addEventListener('dimi:success', () => {
    try { window.DS_REC.recordPurchase((window.cart || []).map(i => i.id)); } catch (_) {}
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.DS_REC.renderForPage(), 400);
  });

})();
