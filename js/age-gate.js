/**
 * Dripping Secrets — Age Gate
 * v12.0 | WCAG 2.1 AA compliant | 30-day localStorage persistence
 * Luxury redesign — DS brand standard: plum/gold, no community badges
 */
(function () {
  'use strict';

  const KEY       = 'ds-age-verified';
  const DAYS      = 30;
  const MS        = DAYS * 24 * 60 * 60 * 1000;
  const LEAVE_URL = 'https://www.google.com';

  function isVerified() {
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) return false;
      return (Date.now() - parseInt(stored, 10)) < MS;
    } catch (_) { return false; }
  }

  function setVerified() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (_) {}
  }

  if (isVerified()) return;

  const style = document.createElement('style');
  style.textContent = `
    #ds-age-gate-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: radial-gradient(ellipse at 60% 40%, #1a0530 0%, #0a0014 55%, #000008 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    #ds-age-gate-overlay * { box-sizing: border-box; }

    /* Ambient glow layers */
    #ds-age-gate-overlay::before {
      content: '';
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 60% 40% at 20% 80%, rgba(183,110,121,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 50% 35% at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 60%);
    }

    #ds-age-gate-box {
      max-width: 520px; width: 100%;
      background: rgba(10, 2, 20, 0.82);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 16px;
      padding: 3rem 2.5rem 2.5rem;
      text-align: center;
      color: #f5e8d0;
      position: relative;
      box-shadow:
        0 0 0 1px rgba(212,175,55,0.08),
        0 0 40px rgba(124,58,237,0.18),
        0 32px 80px rgba(0,0,0,0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
    }

    /* Gold accent top rule */
    #ds-age-gate-box::before {
      content: '';
      display: block;
      height: 2px;
      width: 100%;
      border-radius: 16px 16px 0 0;
      position: absolute; top: -1px; left: -1px; right: -1px;
      background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 30%, #d4af37 50%, rgba(212,175,55,0.6) 70%, transparent 100%);
    }

    /* Bottom gold rule */
    #ds-age-gate-box::after {
      content: '';
      display: block;
      height: 1px;
      width: 60%;
      position: absolute; bottom: 0; left: 20%;
      background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent);
    }

    #ds-age-gate-logo {
      max-width: 100px; height: auto; margin: 0 auto 1.5rem;
      display: block;
      filter: drop-shadow(0 0 12px rgba(212,175,55,0.25));
    }

    #ds-age-gate-eyebrow {
      font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: rgba(212,175,55,0.7);
      margin: 0 0 0.75rem;
    }

    #ds-age-gate-headline {
      font-size: 1.5rem; font-weight: 600;
      color: #f0e4c8;
      margin: 0 0 0.5rem;
      line-height: 1.25;
      letter-spacing: 0.01em;
    }

    #ds-age-gate-divider {
      width: 48px; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent);
      margin: 1rem auto 1.25rem;
    }

    #ds-age-gate-body {
      font-size: 0.875rem; line-height: 1.7;
      color: rgba(240,228,200,0.65);
      margin: 0 0 2rem;
      max-width: 360px; margin-left: auto; margin-right: auto;
    }

    #ds-age-gate-actions {
      display: flex; flex-direction: column; gap: 0.75rem;
      max-width: 320px; margin: 0 auto 1.5rem;
    }

    #ds-age-gate-enter {
      background: linear-gradient(135deg, #6d1f8a 0%, #9c3db8 50%, #c9a84c 100%);
      color: #fff; border: none; border-radius: 50px;
      padding: 1rem 2rem; font-size: 0.8rem;
      font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
      cursor: pointer; transition: all 0.25s ease;
      box-shadow: 0 4px 24px rgba(124,58,237,0.35);
      font-family: inherit;
    }
    #ds-age-gate-enter:hover, #ds-age-gate-enter:focus {
      transform: translateY(-1px);
      box-shadow: 0 6px 32px rgba(124,58,237,0.5);
    }
    #ds-age-gate-enter:focus-visible {
      outline: 2px solid #c9a84c; outline-offset: 3px;
    }

    #ds-age-gate-leave {
      background: transparent; color: rgba(240,228,200,0.35);
      border: 1px solid rgba(212,175,55,0.12); border-radius: 50px;
      padding: 0.75rem 2rem; font-size: 0.78rem;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; transition: all 0.2s ease;
      font-family: inherit;
    }
    #ds-age-gate-leave:hover, #ds-age-gate-leave:focus {
      color: rgba(240,228,200,0.55);
      border-color: rgba(212,175,55,0.25);
    }
    #ds-age-gate-leave:focus-visible {
      outline: 1px solid rgba(212,175,55,0.4); outline-offset: 3px;
    }

    #ds-age-gate-sub {
      font-size: 0.7rem; color: rgba(240,228,200,0.28);
      line-height: 1.6; max-width: 340px; margin: 0 auto;
      letter-spacing: 0.02em;
    }

    @media (max-width: 480px) {
      #ds-age-gate-box { padding: 2.25rem 1.5rem 2rem; }
      #ds-age-gate-headline { font-size: 1.25rem; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ds-age-gate-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'ds-age-gate-headline');
  overlay.setAttribute('aria-describedby', 'ds-age-gate-body');

  overlay.innerHTML = `
    <div id="ds-age-gate-box">
      <img id="ds-age-gate-logo" src="/images/ds-circle-logo-official.png" alt="Dripping Secrets" />
      <p id="ds-age-gate-eyebrow">Adult Boutique &amp; Lifestyle</p>
      <h1 id="ds-age-gate-headline">You deserve a secret this good.</h1>
      <div id="ds-age-gate-divider"></div>
      <p id="ds-age-gate-body">
        This is an adults-only boutique. By entering, you confirm you are
        18 years of age or older and consent to viewing adult products and content.
      </p>
      <div id="ds-age-gate-actions">
        <button id="ds-age-gate-enter" type="button">
          Enter — I Am 18 or Older
        </button>
        <button id="ds-age-gate-leave" type="button">
          Leave — I Am Under 18
        </button>
      </div>
      <p id="ds-age-gate-sub">
        We do not store or share your age verification data.
        A local token keeps this screen from repeating for 30 days.
      </p>
    </div>
  `;

  function mount() {
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const enterBtn = document.getElementById('ds-age-gate-enter');
    const leaveBtn = document.getElementById('ds-age-gate-leave');

    setTimeout(() => enterBtn && enterBtn.focus(), 100);

    enterBtn.addEventListener('click', function () {
      setVerified();
      overlay.remove();
      document.body.style.overflow = '';
    });

    leaveBtn.addEventListener('click', function () {
      window.location.href = LEAVE_URL;
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = overlay.querySelectorAll('button');
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') e.preventDefault();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
