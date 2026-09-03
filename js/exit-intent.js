// ================================================================
// EXIT INTENT — DS v9.78
// Detects exit intent (mouse leave / fast upward scroll on mobile).
// Offers 10% off first order, stores lead to Firestore: newsletter_leads.
// ================================================================

(function () {
  'use strict';

  const SEEN_KEY = 'ds_exit_seen';
  let shown = false;
  let ready = false;

  function skip() {
    const p = window.location.pathname;
    if (p.includes('admin') || p.includes('employee')) return true;
    if (localStorage.getItem(SEEN_KEY) === '1') return true;
    if (sessionStorage.getItem('ds_exit_shown')) return true;
    return false;
  }

  function show() {
    if (shown || skip()) return;
    shown = true;
    sessionStorage.setItem('ds_exit_shown', '1');
    const ov = document.getElementById('ds-exit-ov');
    if (ov) ov.style.display = 'flex';
  }

  function hide() {
    const ov = document.getElementById('ds-exit-ov');
    if (ov) ov.style.display = 'none';
  }

  function dismiss(permanent) {
    if (permanent) localStorage.setItem(SEEN_KEY, '1');
    hide();
  }

  async function onSubmit(e) {
    e.preventDefault();
    const name  = (document.getElementById('ei-name')?.value  || '').trim();
    const email = (document.getElementById('ei-email')?.value || '').trim();
    if (!name || !email || !email.includes('@')) {
      const err = document.getElementById('ei-err');
      if (err) { err.textContent = 'Please enter your name and a valid email.'; err.style.display = 'block'; }
      return;
    }
    const btn = document.getElementById('ei-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      await firebase.firestore().collection('newsletter_leads').add({
        name, email,
        source: 'exit_intent_popup',
        offer: '10_percent_first_order',
        page: window.location.pathname,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      sessionStorage.setItem('ds_exit_discount', 'WELCOME10');
      const form = document.getElementById('ei-form');
      const suc  = document.getElementById('ei-success');
      if (form) form.style.display = 'none';
      if (suc)  suc.style.display  = 'block';
      dismiss(true);
      setTimeout(hide, 4000);
    } catch (_) {
      if (btn) { btn.disabled = false; btn.textContent = 'Claim My 10% Off'; }
    }
  }

  function inject() {
    if (document.getElementById('ds-exit-ov') || skip()) return;
    const ov = document.createElement('div');
    ov.id = 'ds-exit-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Special offer — 10% off your first order');
    ov.style.cssText = 'display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.75);align-items:center;justify-content:center;padding:20px';

    ov.innerHTML = `
      <div style="background:linear-gradient(145deg,#1a0a2e,#2d1138);border:1px solid rgba(183,110,121,.45);
        border-radius:20px;max-width:440px;width:100%;padding:36px 28px;position:relative;text-align:center;
        box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(183,110,121,.14)">
        <button onclick="window._eiClose(true)" aria-label="Close offer" style="position:absolute;top:12px;right:14px;
          background:none;border:none;color:rgba(255,255,255,.35);font-size:1.3rem;cursor:pointer;line-height:1">✕</button>
        <div style="font-size:2.4rem;margin-bottom:10px" aria-hidden="true">🌹</div>
        <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.8rem;color:#fff;margin:0 0 6px;line-height:1.2">
          Wait — Before You Go</h2>
        <p style="color:rgba(255,255,255,.6);font-size:.88rem;margin:0 0 14px">Your first order deserves something special.</p>
        <div style="background:linear-gradient(135deg,rgba(183,110,121,.18),rgba(75,31,95,.22));
          border:1px solid rgba(183,110,121,.35);border-radius:12px;padding:14px 20px;margin:0 0 16px;display:inline-block">
          <div style="font-size:2.2rem;font-weight:800;color:#B76E79;letter-spacing:.03em">10% OFF</div>
          <div style="font-size:.76rem;color:rgba(255,255,255,.45);margin-top:2px">your first order</div>
        </div>
        <form id="ei-form" onsubmit="window._eiSubmit(event)">
          <input id="ei-name" type="text" placeholder="Your first name" required autocomplete="given-name"
            style="width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(183,110,121,.3);color:#fff;
            padding:11px 13px;border-radius:9px;font-size:.88rem;outline:none;font-family:inherit;margin-bottom:10px" />
          <input id="ei-email" type="email" placeholder="Email address" required autocomplete="email"
            style="width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(183,110,121,.3);color:#fff;
            padding:11px 13px;border-radius:9px;font-size:.88rem;outline:none;font-family:inherit" />
          <div id="ei-err" style="display:none;color:#f44336;font-size:.75rem;margin-top:5px;text-align:left"></div>
          <button id="ei-btn" type="submit" style="width:100%;margin-top:14px;
            background:linear-gradient(135deg,#B76E79,#4B1F5F);color:#fff;border:none;
            padding:13px;border-radius:9px;font-size:.95rem;font-weight:700;cursor:pointer;
            font-family:inherit;transition:opacity .2s">Claim My 10% Off</button>
        </form>
        <div id="ei-success" style="display:none">
          <div style="font-size:2rem;margin-bottom:10px">✨</div>
          <h3 style="color:#B76E79;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;margin:0 0 8px">You're in, gorgeous!</h3>
          <p style="color:rgba(255,255,255,.6);font-size:.86rem;margin:0">
            Use code <strong style="color:#B76E79">WELCOME10</strong> at checkout for 10% off your first order.
          </p>
        </div>
        <p style="margin-top:14px;font-size:.7rem;color:rgba(255,255,255,.25)">No spam. Unsubscribe anytime.</p>
      </div>`;

    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) dismiss(false); });
  }

  window._eiClose  = dismiss;
  window._eiSubmit = onSubmit;

  document.addEventListener('DOMContentLoaded', () => {
    if (skip()) return;
    inject();
    setTimeout(() => { ready = true; }, 3500);

    // Desktop: mouse leaves viewport upward
    document.addEventListener('mouseleave', e => {
      if (ready && !shown && e.clientY <= 5) show();
    });

    // Mobile: fast upward scroll near top
    let lastY = window.scrollY;
    let lastT = Date.now();
    window.addEventListener('scroll', () => {
      if (!ready || shown) return;
      const now = Date.now();
      const dy  = window.scrollY - lastY;
      const dt  = now - lastT;
      if (dy < -70 && dt < 280 && window.scrollY < 180) show();
      lastY = window.scrollY; lastT = now;
    }, { passive: true });
  });

})();
