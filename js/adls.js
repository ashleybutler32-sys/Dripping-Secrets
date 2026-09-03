/* ============================================================
   DRIPPING SECRETS — Adaptive Dynamic Logo System (ADLS)
   Version: 1.0 | v16.3
   Context-aware brand image renderer.
   DS Boss and Dimi are living brand characters — pose, clothing,
   and environment shift per department automatically.
   ============================================================ */

'use strict';

const ADLS = (() => {

  /* ── Variant Registry ──────────────────────────────────── */
  const VARIANTS = {
    'hero':           { src: '/images/adls/adls-hero.png',           alt: 'Dripping Secrets — Welcome' },
    'admin':          { src: '/images/adls/adls-admin.jpeg',         alt: 'Dripping Secrets — Admin Desk' },
    'shop':           { src: '/images/adls/adls-shop.png',           alt: 'Dripping Secrets — Shop Lobby' },
    'events':         { src: '/images/adls/adls-events.jpeg',        alt: 'Dripping Secrets — Events' },
    'event-hq':       { src: '/images/adls/adls-event-hq.png',       alt: 'Dripping Secrets — Event Headquarters' },
    'customer-care':  { src: '/images/adls/adls-customer-care.jpeg', alt: 'Dripping Secrets — Customer Care' },
    'logistics':      { src: '/images/adls/adls-logistics.jpeg',     alt: 'Dripping Secrets — Logistics' },
    'front-desk':     { src: '/images/adls/adls-front-desk.png',     alt: 'Dripping Secrets — Front Desk' },
    'affiliate':      { src: '/images/adls/adls-affiliate.jpeg',     alt: 'Dripping Secrets — Affiliate Portal' },
    'content-creator':{ src: '/images/adls/adls-content-creator.jpeg', alt: 'Dripping Secrets — Content Creator' },
    'social-creator': { src: '/images/adls/adls-social-creator.jpeg', alt: 'Dripping Secrets — Social Content Creator' },
    'luxury':         { src: '/images/adls/adls-luxury-lifestyle.jpeg', alt: 'Dripping Secrets — Luxury Lifestyle' },
    'academy':        { src: '/images/adls/adls-academy-seal.png',   alt: 'Dripping Secrets — Dripping Secrets Academy' },
    'ai-concierge':   { src: '/images/adls/adls-ai-concierge.png',   alt: 'Dripping Secrets — Luxury AI Concierge' },
    'truck':          { src: '/images/adls/adls-truck.png',          alt: 'Dripping Secrets — Delivery' },
    'truck-2':        { src: '/images/adls/adls-truck-2.png',        alt: 'Dripping Secrets — Delivery Fleet' },
    'selfie':         { src: '/images/adls/adls-selfie.png',         alt: 'Dripping Secrets — Brand Moment' },
    'logo-black':     { src: '/images/adls/adls-logo-black.png',     alt: 'Dripping Secrets' },
    'logo-vector':    { src: '/images/adls/adls-logo-vector.png',    alt: 'Dripping Secrets' },
  };

  /* ── Page → Context Map ────────────────────────────────── */
  const PAGE_CONTEXT = {
    'index':          'hero',
    'shop':           'shop',
    'admin':          'admin',
    'events':         'events',
    'booking':        'event-hq',
    'wellness':       'luxury',
    'beauty-wellness':'luxury',
    'academy':        'academy',
    'affiliates':     'affiliate',
    'employee':       'front-desk',
    'creators':       'content-creator',
    'creator-marketplace': 'social-creator',
    'contact':        'customer-care',
    'account':        'customer-care',
    'community':      'selfie',
    'media':          'social-creator',
    'about':          'luxury',
    'party':          'events',
    'vendors':        'logistics',
    'subscriptions':  'luxury',
    'bundles':        'shop',
    'boxes':          'shop',
    'new-arrivals':   'shop',
    'trending':       'shop',
    'best-sellers':   'shop',
    'gifts-under-25': 'shop',
    'gifts-under-50': 'shop',
    'date-night':     'luxury',
    'couples-play':   'luxury',
    'machines':       'shop',
    'services':       'front-desk',
    'revenue-dashboard': 'admin',
  };

  /* ── Detect current page context ──────────────────────── */
  function detectContext() {
    const page = window.location.pathname
      .replace(/^\//, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '') || 'index';
    return PAGE_CONTEXT[page] || 'hero';
  }

  /* ── Get variant data ──────────────────────────────────── */
  function getVariant(context) {
    return VARIANTS[context] || VARIANTS['hero'];
  }

  /* ── Render a single ADLS slot ─────────────────────────── */
  function renderSlot(el) {
    const context = el.dataset.adls || detectContext();
    const variant = getVariant(context);
    const lazy = el.dataset.adlsLazy !== 'false';

    // Support <img> or container div
    if (el.tagName === 'IMG') {
      el.src = variant.src;
      el.alt = variant.alt;
      if (lazy) el.loading = 'lazy';
    } else {
      const img = document.createElement('img');
      img.src = variant.src;
      img.alt = variant.alt;
      if (lazy) img.loading = 'lazy';
      img.className = el.dataset.adlsClass || 'adls-img';
      el.innerHTML = '';
      el.appendChild(img);
    }
    el.classList.add('adls-loaded');
  }

  /* ── Render all ADLS slots on the page ─────────────────── */
  function renderAll() {
    document.querySelectorAll('[data-adls]').forEach(el => {
      try { renderSlot(el); } catch (e) { /* fail silently */ }
    });
  }

  /* ── Preload a specific variant ────────────────────────── */
  function preload(context) {
    const variant = getVariant(context);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = variant.src;
    document.head.appendChild(link);
  }

  /* ── Init ──────────────────────────────────────────────── */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderAll);
    } else {
      renderAll();
    }
  }

  // Auto-init
  init();

  return { getVariant, renderSlot, renderAll, preload, detectContext, VARIANTS };

})();
