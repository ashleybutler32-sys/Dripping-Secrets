// Dripping Secrets — Service Worker v9.99
const CACHE = 'ds-v22.0';
const ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/verification.html',
  '/machines.html',
  '/booking.html',
  '/bundles.html',
  '/boxes.html',
  '/services.html',
  '/contact.html',
  '/about.html',
  '/sneaky-link-bags.html',
  '/party.html',
  '/affiliates.html',
  '/academy.html',
  '/account.html',
  '/employee.html',
  '/privacy.html',
  '/creators.html',
  '/events.html',
  '/wellness.html',
  '/vendors.html',
  '/subscriptions.html',
  '/community.html',
  '/media.html',
  '/offline.html',
  '/css/style.css',
  '/css/events.css',
  '/css/wellness.css',
  '/css/vendors.css',
  '/css/creator-portal.css',
  '/css/memberships.css',
  '/css/rewards.css',
  '/js/products.js',
  '/js/cart.js',
  '/js/auth.js',
  '/js/boxes.js',
  '/js/dimi.js',
  '/js/dimi-walker.js',
  '/js/dimi-actor.js',
  '/js/dimi-memory.js',
  '/js/firebase-config.js',
  '/js/events.js',
  '/js/wellness.js',
  '/js/vendors.js',
  '/js/pwa.js',
  '/manifest.json',
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/dimi/dimi-portrait.png',
  '/images/dimi/dimi-idle.png'
];

// Install — cache core assets + offline fallback
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first for HTML/JS/CSS, cache first for images, offline fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  const url = new URL(e.request.url);

  // Skip firebase/analytics requests
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

  const isImage = /\.(png|jpg|jpeg|gif|svg|webp|woff2?|ico)$/i.test(url.pathname);
  const isHTML  = url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.');

  if (isImage) {
    // Cache first for static assets
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
      )
    );
  } else if (isHTML) {
    // Network first for pages, offline fallback
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached => cached || caches.match('/offline.html'))
        )
    );
  } else {
    // Network first for scripts/styles
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
