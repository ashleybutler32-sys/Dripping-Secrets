// Dripping Secrets — PWA Install Logic v9.20
// Covers: Chrome/Android (native install), iOS Safari (Add to Home Screen guide),
// iOS Chrome/Firefox/Edge (redirect guide — iOS WebKit restriction)

// ── Mobile nav: move outside header to fix iOS Safari backdrop-filter z-index bug ──
// backdrop-filter creates a stacking context; position:fixed children must be
// at the body level for correct rendering in PWA standalone mode on iOS.
(function fixMobileNav() {
  function reposition() {
    var nav = document.getElementById('main-nav');
    var header = document.getElementById('site-header');
    if (!nav || !header) return;
    if (window.innerWidth <= 768) {
      if (header.contains(nav)) {
        header.parentNode.insertBefore(nav, header.nextSibling);
      }
    } else {
      var inner = header.querySelector('.header-inner');
      if (inner && !inner.contains(nav)) {
        var actions = inner.querySelector('.header-actions');
        inner.insertBefore(nav, actions || null);
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reposition);
  } else {
    reposition();
  }
  window.addEventListener('resize', reposition);
})();

(function () {
  'use strict';

  const DISMISSED_KEY = 'ds_pwa_dismissed_v2';
  const INSTALLED_KEY = 'ds_pwa_installed';

  // ── Detect platform ──────────────────────────────────────────
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isIOSChrome = isIOS && /CriOS/.test(ua);
  const isIOSFirefox = isIOS && /FxiOS/.test(ua);
  const isIOSEdge = isIOS && /EdgiOS/.test(ua);
  const isIOSOtherBrowser = isIOS && (isIOSChrome || isIOSFirefox || isIOSEdge);
  const isIOSSafari = isIOS && /Safari/.test(ua) && !isIOSOtherBrowser;
  const isAndroidChrome = /Android/.test(ua) && /Chrome/.test(ua) && !/SamsungBrowser/.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  if (isStandalone) return; // Already installed — do nothing

  // ── iOS Non-Safari: show "Open in Safari" guide ─────────────
  function showIOSSafariGuide(browserName) {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-ios-guide';
    banner.innerHTML = `
      <div style="
        position:fixed;bottom:0;left:0;right:0;z-index:99999;
        background:linear-gradient(135deg,#4B1F5F,#2d1138);
        color:#fff;padding:16px 18px 24px;
        border-top:2px solid #B76E79;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        box-shadow:0 -4px 20px rgba(0,0,0,.45);
        animation:slideUpBanner .35s ease;">
        <button onclick="document.getElementById('pwa-ios-guide').remove();localStorage.setItem('${DISMISSED_KEY}',1);"
          style="position:absolute;top:10px;right:14px;background:none;border:none;color:#B76E79;font-size:22px;cursor:pointer;line-height:1;">×</button>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <img src="/images/icon-192.png" width="44" height="44" style="border-radius:10px;flex-shrink:0;" alt="DS">
          <div>
            <div style="font-size:13px;font-weight:700;color:#B76E79;letter-spacing:.5px;margin-bottom:4px;">INSTALL THE APP</div>
            <div style="font-size:14px;line-height:1.45;margin-bottom:10px;">
              You're using <strong>${browserName}</strong> on iPhone. To add Dripping Secrets to your home screen, open this page in <strong>Safari</strong>:
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <div style="background:rgba(255,255,255,.1);border-radius:8px;padding:7px 12px;font-size:12px;line-height:1.5;">
                <div style="font-weight:700;margin-bottom:3px;">Step 1</div>
                Tap the <strong>Share</strong> button
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin:0 2px;"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                in Safari
              </div>
              <div style="background:rgba(255,255,255,.1);border-radius:8px;padding:7px 12px;font-size:12px;line-height:1.5;">
                <div style="font-weight:700;margin-bottom:3px;">Step 2</div>
                Tap <strong>"Add to Home Screen"</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin:0 2px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
            </div>
            <a href="https://drippingsecrets.com" id="pwa-safari-link"
              style="display:inline-block;margin-top:12px;background:#B76E79;color:#fff;border:none;padding:9px 20px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;"
              onclick="localStorage.setItem('${DISMISSED_KEY}',1);">
              Open in Safari →
            </a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(banner);

    // Wire the Safari link to actually open Safari via x-web-search or just the URL
    // On iOS, tapping a bare URL link from within Chrome will open in Safari
    const link = document.getElementById('pwa-safari-link');
    if (link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.setItem(DISMISSED_KEY, '1');
        // x-safari-https opens the URL directly in Safari on iOS
        window.location.href = 'x-safari-https://drippingsecrets.com';
      });
    }
  }

  // ── iOS Safari: Add to Home Screen prompt ───────────────────
  function showIOSSafariPrompt() {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-ios-safari';
    banner.innerHTML = `
      <div style="
        position:fixed;bottom:0;left:0;right:0;z-index:99999;
        background:linear-gradient(135deg,#4B1F5F,#2d1138);
        color:#fff;padding:16px 18px 30px;
        border-top:2px solid #B76E79;
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        box-shadow:0 -4px 20px rgba(0,0,0,.45);
        animation:slideUpBanner .35s ease;">
        <button onclick="document.getElementById('pwa-ios-safari').remove();localStorage.setItem('${DISMISSED_KEY}',1);"
          style="position:absolute;top:10px;right:14px;background:none;border:none;color:#B76E79;font-size:22px;cursor:pointer;line-height:1;">×</button>
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <img src="/images/icon-192.png" width="44" height="44" style="border-radius:10px;flex-shrink:0;" alt="DS">
          <div>
            <div style="font-size:13px;font-weight:700;color:#B76E79;letter-spacing:.5px;margin-bottom:4px;">ADD TO HOME SCREEN</div>
            <div style="font-size:14px;line-height:1.45;margin-bottom:10px;">
              Install Dripping Secrets for the full app experience — quick access, no browser bar.
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span style="font-size:13px;">Tap</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B76E79" stroke-width="2.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span style="font-size:13px;">then <strong>"Add to Home Screen"</strong></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B76E79" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
          </div>
        </div>
        <div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);
          width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;
          border-top:10px solid #B76E79;"></div>
      </div>`;
    document.body.appendChild(banner);
  }

  // ── Android/Desktop Chrome: native install prompt ────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (localStorage.getItem(DISMISSED_KEY) || localStorage.getItem(INSTALLED_KEY)) return;

    setTimeout(() => {
      const banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.innerHTML = `
        <div style="
          position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
          z-index:99999;max-width:380px;width:calc(100% - 32px);
          background:linear-gradient(135deg,#4B1F5F,#2d1138);
          color:#fff;border-radius:16px;padding:16px 18px;
          border:1px solid #B76E79;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          box-shadow:0 8px 32px rgba(0,0,0,.5);
          animation:slideUpBanner .35s ease;">
          <button onclick="document.getElementById('pwa-install-banner').remove();localStorage.setItem('${DISMISSED_KEY}',1);"
            style="position:absolute;top:10px;right:12px;background:none;border:none;color:#B76E79;font-size:20px;cursor:pointer;line-height:1;">×</button>
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="/images/icon-192.png" width="44" height="44" style="border-radius:10px;" alt="DS">
            <div>
              <div style="font-size:13px;font-weight:700;color:#B76E79;margin-bottom:3px;">INSTALL THE APP</div>
              <div style="font-size:13px;opacity:.85;">Add Dripping Secrets to your home screen for faster access.</div>
            </div>
          </div>
          <button id="pwa-install-btn"
            style="margin-top:14px;width:100%;background:#B76E79;color:#fff;border:none;padding:11px;border-radius:24px;font-size:14px;font-weight:700;cursor:pointer;">
            Install App
          </button>
        </div>`;
      document.body.appendChild(banner);

      document.getElementById('pwa-install-btn').addEventListener('click', () => {
        document.getElementById('pwa-install-banner')?.remove();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(r => {
            if (r.outcome === 'accepted') localStorage.setItem(INSTALLED_KEY, '1');
          });
          deferredPrompt = null;
        }
      });
    }, 3000);
  });

  window.addEventListener('appinstalled', () => {
    localStorage.setItem(INSTALLED_KEY, '1');
    document.getElementById('pwa-install-banner')?.remove();
  });

  // ── Trigger correct flow ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(DISMISSED_KEY) || localStorage.getItem(INSTALLED_KEY)) return;

    if (isIOSChrome) {
      setTimeout(() => showIOSSafariGuide('Chrome'), 3000);
    } else if (isIOSFirefox) {
      setTimeout(() => showIOSSafariGuide('Firefox'), 3000);
    } else if (isIOSEdge) {
      setTimeout(() => showIOSSafariGuide('Edge'), 3000);
    } else if (isIOSSafari) {
      setTimeout(() => showIOSSafariPrompt(), 3000);
    }
    // Android Chrome handled by beforeinstallprompt above
  });

  // ── CSS animation ────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `@keyframes slideUpBanner{from{transform:translateY(100%)}to{transform:translateY(0)}}
  #pwa-install-banner>div{animation:slideUpBanner .35s ease;}`;
  document.head.appendChild(style);
})();

/* ============================================================
   DRIPPING SECRETS — PWA Bottom Nav + Page Transitions (v9.88)
   Mobile bottom navigation bar + smooth page transitions.
   ============================================================ */
(function DSBottomNav() {
  'use strict';

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  function getActivePath() {
    const p = window.location.pathname;
    if (p === '/' || p.includes('index')) return 'home';
    if (p.includes('shop') || p.includes('best-sellers') || p.includes('new-arrivals') || p.includes('bundles') || p.includes('boxes')) return 'shop';
    if (p.includes('events')) return 'events';
    if (p.includes('wellness')) return 'wellness';
    if (p.includes('account')) return 'account';
    return '';
  }

  function buildNav() {
    if (document.getElementById('ds-bottom-nav')) return;
    const active = getActivePath();
    const nav = document.createElement('nav');
    nav.id = 'ds-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile bottom navigation');
    nav.innerHTML =
      '<a href="/index.html" class="ds-bnav-item' + (active==='home'?' active':'') + '" aria-label="Home">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Home</span></a>' +
      '<a href="/shop.html" class="ds-bnav-item' + (active==='shop'?' active':'') + '" aria-label="Shop">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg><span>Shop</span></a>' +
      '<a href="/events.html" class="ds-bnav-item' + (active==='events'?' active':'') + '" aria-label="Events">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Events</span></a>' +
      '<a href="/wellness.html" class="ds-bnav-item' + (active==='wellness'?' active':'') + '" aria-label="Wellness">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><span>Wellness</span></a>' +
      '<a href="/account.html" class="ds-bnav-item' + (active==='account'?' active':'') + '" aria-label="Account">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Account</span></a>';

    var css = document.createElement('style');
    css.textContent =
      '#ds-bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:8888;' +
      'background:rgba(26,10,36,0.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'border-top:1px solid rgba(255,255,255,0.08);padding:8px 0;flex-direction:row;align-items:stretch;}' +
      '.ds-bnav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;' +
      'text-decoration:none;color:rgba(255,255,255,0.45);font-size:0.62rem;font-weight:500;transition:color .2s;line-height:1;}' +
      '.ds-bnav-item.active{color:#E91E8C;}' +
      '.ds-bnav-item:hover{color:rgba(233,30,140,0.7);}' +
      '@media(max-width:768px){#ds-bottom-nav{display:flex;}body{padding-bottom:calc(64px + env(safe-area-inset-bottom));}}' +
      '@media(display-mode:standalone){#ds-bottom-nav{display:flex;}body{padding-bottom:calc(64px + env(safe-area-inset-bottom));}}';
    document.head.appendChild(css);
    document.body.appendChild(nav);
  }

  function initTransitions() {
    var s = document.createElement('style');
    s.textContent = '@keyframes ds-page-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}' +
      '.ds-page-enter{animation:ds-page-in 0.25s ease forwards}';
    document.head.appendChild(s);
    var main = document.getElementById('main-content') || document.querySelector('main');
    if (main) main.classList.add('ds-page-enter');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { buildNav(); initTransitions(); });
  } else {
    buildNav(); initTransitions();
  }
})();
