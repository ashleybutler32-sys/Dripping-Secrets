/* ═══════════════════════════════════════════════════════════════
   SEO ENHANCEMENT SYSTEM  —  js/seo.js
   Dripping Secrets v9.83
   Injects JSON-LD structured data, canonical tags, and enhances
   meta descriptions for product, collection, and blog pages.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const BASE_URL = 'https://drippingsecrets.com';
  const BRAND   = 'Dripping Secrets';

  /* ── Helpers ── */
  function injectLD(obj) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }

  function setMeta(name, content, prop) {
    if (!content) return;
    const sel = prop
      ? `meta[property="${name}"]`
      : `meta[name="${name}"]`;
    let el = document.querySelector(sel);
    if (!el) {
      el = document.createElement('meta');
      if (prop) el.setAttribute('property', name);
      else el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setCanonical(url) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.rel = 'canonical';
      document.head.appendChild(el);
    }
    el.href = url;
  }

  /* ── Organization schema (every page) ── */
  injectLD({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: BASE_URL,
    logo: BASE_URL + '/images/ds-logo.png',
    sameAs: [
      'https://www.instagram.com/drippingsecrets',
      'https://www.tiktok.com/@drippingsecrets',
      'https://pinterest.com/drippingsecrets'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  });

  /* ── WebSite schema + SearchAction ── */
  injectLD({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: BASE_URL + '/shop.html?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  });

  /* ── BreadcrumbList for collection + blog pages ── */
  function breadcrumbs(items) {
    injectLD({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url
      }))
    });
  }

  /* ══════════════════════════════════════════════════════════════
     PAGE-SPECIFIC LOGIC
     ══════════════════════════════════════════════════════════════ */
  const path = window.location.pathname;

  /* ── Product page (shop.html with ?id=) ── */
  if (path.includes('shop.html') && location.search.includes('id=')) {
    document.addEventListener('DOMContentLoaded', function () {
      const id = parseInt(new URLSearchParams(location.search).get('id'));
      if (!window.DS_PRODUCTS) return;
      const p = window.DS_PRODUCTS.find(x => x.id === id);
      if (!p) return;

      const productUrl = BASE_URL + '/shop.html?id=' + id;
      setCanonical(productUrl);

      setMeta('og:url', productUrl, true);
      setMeta('og:title', p.name + ' | ' + BRAND, true);
      setMeta('og:description', (p.description || '').substring(0, 200), true);
      if (p.image) setMeta('og:image', p.image, true);

      injectLD({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: p.description || '',
        image: [p.image].concat(p.images || []).filter(Boolean),
        brand: { '@type': 'Brand', name: BRAND },
        url: productUrl,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: p.price.toFixed(2),
          availability: (p.qty === 0)
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: BRAND }
        }
      });

      breadcrumbs([
        { name: 'Home', url: BASE_URL + '/' },
        { name: 'Shop', url: BASE_URL + '/shop.html' },
        { name: p.name, url: productUrl }
      ]);
    });
  }

  /* ── Collection pages ── */
  const collectionMeta = {
    'best-sellers.html':      { title: 'Best Sellers | ' + BRAND, desc: 'Our most-loved products, chosen by customers across DFW and nationwide. Shop the best sellers at Dripping Secrets.' },
    'new-arrivals.html':      { title: 'New Arrivals | ' + BRAND, desc: 'Just landed. Browse the newest additions to the Dripping Secrets catalog — fresh picks added regularly.' },
    'gifts-under-25.html':    { title: 'Gifts Under $25 | ' + BRAND, desc: 'Thoughtful, intimate gifts under $25. Perfect for birthdays, date nights, or just because.' },
    'gifts-under-50.html':    { title: 'Gifts Under $50 | ' + BRAND, desc: 'Premium intimate gifts under $50. Find the perfect present without breaking the bank.' },
    'trending.html':          { title: 'Trending Products | ' + BRAND, desc: "What everyone's buying right now. Discover trending products at Dripping Secrets." },
    'customer-favorites.html':{ title: 'Customer Favorites | ' + BRAND, desc: 'The products our community loves most. Handpicked customer favorites at Dripping Secrets.' },
    'couples-play.html':      { title: 'Couples Play | ' + BRAND, desc: 'Explore. Connect. Play together. Our best products for couples, from playful to adventurous.' },
    'beginner-friendly.html': { title: 'Best for Beginners | ' + BRAND, desc: 'New to intimate wellness? Start here. Our most approachable, beginner-friendly picks.' },
    'date-night.html':        { title: 'Date Night Essentials | ' + BRAND, desc: 'Everything you need for the perfect date night in. Games, accessories, and more.' },
    'beauty-wellness.html':   { title: 'Beauty & Wellness | ' + BRAND, desc: 'Skincare, hair tools, and wellness products curated for your glow-up at Dripping Secrets.' }
  };

  const pageName = path.split('/').pop();
  if (collectionMeta[pageName]) {
    const m = collectionMeta[pageName];
    document.title = m.title;
    setMeta('description', m.desc);
    setMeta('og:title', m.title, true);
    setMeta('og:description', m.desc, true);
    setCanonical(BASE_URL + '/' + pageName);

    const label = pageName.replace('.html','').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    breadcrumbs([
      { name: 'Home', url: BASE_URL + '/' },
      { name: 'Collections', url: BASE_URL + '/shop.html' },
      { name: label, url: BASE_URL + '/' + pageName }
    ]);

    injectLD({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: m.title,
      description: m.desc,
      url: BASE_URL + '/' + pageName,
      breadcrumb: label
    });
  }

  /* ── Blog posts ── */
  if (path.includes('/blog/') && path.endsWith('.html')) {
    const article = document.querySelector('article[data-author]');
    if (article) {
      const title   = document.title;
      const desc    = document.querySelector('meta[name="description"]')?.content || '';
      const pubDate = article.dataset.date || '2026-06-23';
      const imgEl   = article.querySelector('img');

      injectLD({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: desc,
        datePublished: pubDate,
        dateModified: pubDate,
        author: { '@type': 'Organization', name: BRAND },
        publisher: {
          '@type': 'Organization',
          name: BRAND,
          logo: { '@type': 'ImageObject', url: BASE_URL + '/images/ds-logo.png' }
        },
        image: imgEl ? imgEl.src : BASE_URL + '/images/ds-brand-poster.png',
        mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + path }
      });

      breadcrumbs([
        { name: 'Home', url: BASE_URL + '/' },
        { name: 'Blog', url: BASE_URL + '/blog/' },
        { name: title, url: BASE_URL + path }
      ]);
    }
  }

  /* ── Homepage ── */
  if (path === '/' || path.endsWith('index.html')) {
    setCanonical(BASE_URL + '/');
    injectLD({
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: BRAND,
      url: BASE_URL,
      image: BASE_URL + '/images/ds-brand-poster.png',
      description: 'Premium adult products, intimate apparel, Secrets Parties, and wellness experiences. DFW Metro & Nationwide.',
      address: { '@type': 'PostalAddress', addressRegion: 'TX', addressCountry: 'US' },
      priceRange: '$$',
      paymentAccepted: 'CashApp, PayPal, Apple Pay'
    });
  }

})();
