// Dripping Secrets — Back Office Interactive Onboarding Tour
// v9.95 | Self-paced, saveable, togglable
// Ashley can start, pause, resume, or reset at any time.

(function () {
  'use strict';

  const STEP_KEY  = 'ds_tour_step';
  const DONE_KEY  = 'ds_tour_done';
  const SHOW_KEY  = 'ds_tour_shown_welcome';

  // ─── Tour Step Definitions ───────────────────────────────────────────────
  const STEPS = [
    {
      id: 'welcome',
      title: '👋 Welcome to your Back Office, Ashley!',
      body: 'This is your command center for everything Dripping Secrets. I\'ll walk you through each section at your own pace — take breaks whenever you need. Your progress is saved automatically so you can pick right back up.',
      target: null,
      tab: null,
      wide: true
    },
    {
      id: 'dashboard',
      title: '📊 Dashboard',
      body: 'Your daily snapshot. Real-time revenue, new orders, pending fulfillment, low-stock alerts, and recent activity — all the moment you log in. This is your home base.',
      target: 'nav-dashboard',
      tab: 'dashboard'
    },
    {
      id: 'orders',
      title: '📦 Orders',
      body: 'Every new order lands here in real time. Review details, update order status (Processing → Shipped → Delivered), and add tracking numbers. A pink badge shows when new orders are waiting.',
      target: 'nav-orders',
      tab: 'orders'
    },
    {
      id: 'parties',
      title: '🎉 Secrets Parties',
      body: 'Party booking requests come in here. See who booked, the date, the package, and their contact info. Confirm or decline requests and manage your party calendar all from this tab.',
      target: 'nav-parties',
      tab: 'parties'
    },
    {
      id: 'products',
      title: '🛍️ Products',
      body: 'Your full catalog lives here. Add new products, update prices, toggle in-stock / out-of-stock, upload images, and set inventory. Out-of-stock items automatically hide on the storefront — no action needed.',
      target: 'nav-products',
      tab: 'products'
    },
    {
      id: 'promo',
      title: '🏷️ Promo Codes',
      body: 'Create discount codes for sales, VIP customers, or influencer collabs. Set percent-off or dollar amounts, expiration dates, and per-code usage limits.',
      target: 'nav-promo',
      tab: 'promo'
    },
    {
      id: 'fulfillment',
      title: '🚚 Fulfillment Hub',
      body: 'Once an order is packed and ready, this is where you mark it shipped. Add tracking numbers, pick the carrier, and the customer gets notified automatically. Supplier orders are staged here too.',
      target: 'nav-fulfillment',
      tab: 'fulfillment'
    },
    {
      id: 'customers',
      title: '👥 Customers',
      body: 'Every customer profile in one place — purchase history, lifetime value, loyalty points, and contact info. Perfect for VIP outreach, resolving issues, or researching your best buyers.',
      target: 'nav-customers',
      tab: 'customers'
    },
    {
      id: 'team',
      title: '🧑‍💼 Team',
      body: 'Add or remove team member access. Set what each person can see and do in the Back Office. Your staff log in through their own Employee Portal — separate from this admin view.',
      target: 'nav-team',
      tab: 'team'
    },
    {
      id: 'analytics',
      title: '📈 Analytics',
      body: 'Revenue charts, top-selling products, traffic sources, and customer trends over time. Use this weekly to spot what\'s working and where you have room to grow.',
      target: 'nav-analytics',
      tab: 'analytics'
    },
    {
      id: 'commandcenter',
      title: '⚡ Command Center',
      body: 'An AI-powered operations assistant built for the Back Office. Pull quick reports, check stock levels, draft announcements, and run operational tasks without digging through menus.',
      target: 'nav-commandcenter',
      tab: 'commandcenter'
    },
    {
      id: 'rewards',
      title: '⭐ Rewards',
      body: 'Manage the DS loyalty rewards program. Set point values, view customer balances, create reward tiers, and push bonus point campaigns to drive repeat purchases.',
      target: 'nav-rewards',
      tab: 'rewards'
    },
    {
      id: 'memberships',
      title: '🎓 Memberships & DS Academy',
      body: 'Manage loyalty membership tiers and your DS Academy course library. Assign modules, drip content over time, and track customer progress toward certifications.',
      target: 'nav-memberships',
      tab: 'memberships'
    },
    {
      id: 'affiliates',
      title: '🤝 Affiliates',
      body: 'Manage your referral and affiliate program. See who\'s driving traffic, track commissions earned, and approve payouts — all from this tab.',
      target: 'nav-affiliates',
      tab: 'affiliates'
    },
    {
      id: 'creators',
      title: '✨ Creators',
      body: 'Review creator partnership applications. Approve or decline, set commission rates, and manage your active creator roster.',
      target: 'nav-creators',
      tab: 'creators'
    },
    {
      id: 'requests',
      title: '💬 Product Requests',
      body: 'Customers submit products they want to see in the shop. Use this wish list to guide your next sourcing round — the most-requested items are your safest bets.',
      target: 'nav-requests',
      tab: 'requests'
    },
    {
      id: 'subscriptions',
      title: '📬 Subscription Boxes',
      body: 'Manage your monthly subscription box program. View active subscribers, monthly recurring revenue, box contents by tier, and the shipment queue. Handle pauses, skips, or cancellations here.',
      target: 'nav-subscriptions',
      tab: 'subscriptions'
    },
    {
      id: 'community-admin',
      title: '💬 Community Feed',
      body: 'Your members post and interact here. Moderate posts — approve, flag, or remove content. Keep the community healthy with light-touch moderation from this tab.',
      target: 'nav-community-admin',
      tab: 'community-admin'
    },
    {
      id: 'creator-market-admin',
      title: '🎨 Creator Marketplace',
      body: 'A pipeline of creators who want to collab. Review portfolios, follower counts, and proposals. Approve to unlock a creator storefront on your site. Decline with a note.',
      target: 'nav-creator-market-admin',
      tab: 'creator-market-admin'
    },
    {
      id: 'media-admin',
      title: '📰 Media Hub',
      body: 'Publish blog posts, tutorials, and feature stories. Write or paste your content, add a cover image, set a category, and hit Publish. Content appears on the public Media Hub page instantly.',
      target: 'nav-media-admin',
      tab: 'media-admin'
    },
    {
      id: 'revenue-cmd',
      title: '💰 Revenue Command Dashboard',
      body: 'Your high-level financial overview — opens in its own tab. Total revenue, MRR, subscription vs. product revenue split, top earners, and payout status. Your boss-level numbers in one screen.',
      target: 'nav-revenue-cmd',
      tab: null // opens in new tab, don't auto-switch
    },
    {
      id: 'onmydesk',
      title: '📋 On My Desk',
      body: 'Your personal sticky-note board inside the Back Office. Flag items that need your attention, leave yourself reminders, and keep a running to-do list without ever leaving admin.',
      target: 'nav-onmydesk',
      tab: 'onmydesk'
    },
    {
      id: 'academy',
      title: '📚 DS Academy',
      body: 'The academy shortcut takes you directly to the course builder. Create modules, upload video or text lessons, and assign learning paths to customers or team members.',
      target: 'nav-academy',
      tab: 'academy'
    },
    {
      id: 'settings',
      title: '⚙️ Settings',
      body: 'Store name, business hours, payment configuration, notification preferences, and admin account settings. Change with care — these settings affect the whole site experience.',
      target: 'nav-settings',
      tab: 'settings'
    },
    {
      id: 'howto',
      title: '📖 How-To Guide',
      body: 'Stuck or need a refresher? Every Back Office feature has a step-by-step guide right here. This tab is always available — no need to leave the page or Google anything.',
      target: 'nav-howto',
      tab: 'howto'
    },
    {
      id: 'askdimi',
      title: '⭐ Dimi\'s Office',
      body: 'Ask Dimi anything — pull a report, check inventory, look up an order, draft a caption, or just brainstorm. Dimi lives here in the Back Office and in the site chat on the storefront.',
      target: 'nav-askdimi',
      tab: 'askdimi'
    },
    {
      id: 'done',
      title: '🌹 You\'re all set, Boss Lady!',
      body: 'You\'ve toured your entire Back Office. Anytime you need a refresher, hit the How-To Guide tab — every feature is documented there. You can also restart this tour anytime from the Dashboard. Now go run your empire.',
      target: null,
      tab: null,
      wide: true,
      final: true
    }
  ];

  // ─── State ────────────────────────────────────────────────────────────────
  let currentStep = 0;
  let tourActive   = false;

  function getSavedStep () {
    const v = localStorage.getItem(STEP_KEY);
    return v !== null ? parseInt(v, 10) : 0;
  }
  function isDone () {
    return localStorage.getItem(DONE_KEY) === '1';
  }
  function saveStep (n) {
    localStorage.setItem(STEP_KEY, n);
  }
  function markDone () {
    localStorage.setItem(DONE_KEY, '1');
    localStorage.removeItem(STEP_KEY);
  }
  function resetTour () {
    localStorage.removeItem(DONE_KEY);
    localStorage.removeItem(STEP_KEY);
    localStorage.removeItem(SHOW_KEY);
  }

  // ─── DOM helpers ─────────────────────────────────────────────────────────
  function el (id) { return document.getElementById(id); }
  function byId (id) { return document.getElementById(id); }

  // ─── Build overlay elements (once) ───────────────────────────────────────
  function buildOverlay () {
    if (byId('ot-overlay')) return;

    // Spotlight overlay (covers page, has a transparent cutout via border)
    const overlay = document.createElement('div');
    overlay.id = 'ot-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    // Spotlight cutout box
    const spot = document.createElement('div');
    spot.id = 'ot-spot';
    document.body.appendChild(spot);

    // Tooltip card
    const card = document.createElement('div');
    card.id = 'ot-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'Back Office Tour');
    card.innerHTML = `
      <div id="ot-header">
        <span id="ot-progress"></span>
        <button id="ot-close" aria-label="Exit tour" title="Exit tour">✕</button>
      </div>
      <h3 id="ot-title"></h3>
      <p id="ot-body"></p>
      <div id="ot-footer">
        <button id="ot-back">← Back</button>
        <div id="ot-dots"></div>
        <button id="ot-next">Next →</button>
      </div>`;
    document.body.appendChild(card);

    // Wire close
    card.querySelector('#ot-close').addEventListener('click', exitTour);
    card.querySelector('#ot-back').addEventListener('click', prevStep);
    card.querySelector('#ot-next').addEventListener('click', nextStep);

    // Close on overlay click
    overlay.addEventListener('click', exitTour);

    // Keyboard nav
    document.addEventListener('keydown', onKeyDown);
  }

  function onKeyDown (e) {
    if (!tourActive) return;
    if (e.key === 'Escape')      exitTour();
    if (e.key === 'ArrowRight')  nextStep();
    if (e.key === 'ArrowLeft')   prevStep();
  }

  // ─── Render a step ───────────────────────────────────────────────────────
  function renderStep (n) {
    if (n < 0) n = 0;
    if (n >= STEPS.length) n = STEPS.length - 1;
    currentStep = n;
    saveStep(n);

    const step   = STEPS[n];
    const card   = byId('ot-card');
    const overlay= byId('ot-overlay');
    const spot   = byId('ot-spot');

    // Update text
    byId('ot-title').textContent = step.title;
    byId('ot-body').textContent  = step.body;
    byId('ot-progress').textContent = `Step ${n + 1} of ${STEPS.length}`;

    // Back button
    const backBtn = byId('ot-back');
    backBtn.disabled = (n === 0);
    backBtn.style.opacity = (n === 0) ? '0.35' : '1';

    // Next button
    const nextBtn = byId('ot-next');
    if (step.final) {
      nextBtn.textContent = 'Finish ✓';
      nextBtn.style.background = '#2d7a3a';
    } else {
      nextBtn.textContent = 'Next →';
      nextBtn.style.background = '';
    }

    // Dots
    const dots = byId('ot-dots');
    dots.innerHTML = '';
    const total = STEPS.length;
    const shown = Math.min(total, 11);
    const start = Math.max(0, Math.min(n - 5, total - shown));
    for (let i = start; i < start + shown; i++) {
      const d = document.createElement('span');
      d.className = 'ot-dot' + (i === n ? ' active' : '');
      dots.appendChild(d);
    }

    // Wide modal (welcome / done)
    card.classList.toggle('wide', !!step.wide);

    // Switch to target tab
    if (step.tab && typeof window.switchTab === 'function') {
      window.switchTab(step.tab);
    }

    // Spotlight the target nav item
    positionSpotlight(step.target, card, overlay, spot);
  }

  function positionSpotlight (targetId, card, overlay, spot) {
    const PAD = 6;

    if (!targetId) {
      // No target — center modal, no spotlight
      overlay.style.opacity = '1';
      spot.style.display = 'none';
      card.style.position = 'fixed';
      card.style.top  = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
      card.style.maxWidth = card.classList.contains('wide') ? '480px' : '360px';
      return;
    }

    const target = byId(targetId);
    if (!target) {
      // Target not found — still show card centered
      positionSpotlight(null, card, overlay, spot);
      return;
    }

    // Scroll target into view
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    // Wait a tick for scroll then position
    setTimeout(() => {
      const r = target.getBoundingClientRect();

      // Spotlight box
      spot.style.display = 'block';
      spot.style.top    = (r.top    - PAD) + 'px';
      spot.style.left   = (r.left   - PAD) + 'px';
      spot.style.width  = (r.width  + PAD * 2) + 'px';
      spot.style.height = (r.height + PAD * 2) + 'px';

      // Position card to the right of nav, or below on mobile
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      card.style.transform = '';
      card.style.maxWidth  = '320px';

      const cardW = 320;
      const cardH = 240; // approx

      let top, left;

      if (r.right + cardW + 24 < vw) {
        // Right of nav
        left = r.right + 14;
        top  = Math.min(Math.max(r.top - 20, 10), vh - cardH - 10);
      } else if (r.left - cardW - 14 > 0) {
        // Left of nav (unlikely but safe)
        left = r.left - cardW - 14;
        top  = Math.min(Math.max(r.top - 20, 10), vh - cardH - 10);
      } else {
        // Below — mobile fallback
        left = Math.max(10, (vw - cardW) / 2);
        top  = Math.min(r.bottom + 14, vh - cardH - 10);
      }

      card.style.top  = top  + 'px';
      card.style.left = left + 'px';
      card.style.position = 'fixed';
    }, 80);
  }

  // ─── Tour controls ───────────────────────────────────────────────────────
  function nextStep () {
    const step = STEPS[currentStep];
    if (step.final) {
      finishTour();
      return;
    }
    renderStep(currentStep + 1);
  }

  function prevStep () {
    if (currentStep > 0) renderStep(currentStep - 1);
  }

  function exitTour () {
    tourActive = false;
    const overlay = byId('ot-overlay');
    const spot    = byId('ot-spot');
    const card    = byId('ot-card');
    if (overlay) overlay.style.display = 'none';
    if (spot)    spot.style.display    = 'none';
    if (card)    card.style.display    = 'none';
    updateResumeBtn();
    updateDashCard();
  }

  function finishTour () {
    markDone();
    exitTour();
    // Show a friendly completion toast
    showToast('🌹 Tour complete! Find all guides in the How-To tab anytime.');
    updateResumeBtn();
    updateDashCard();
  }

  function startTour (fromStep) {
    tourActive = true;
    buildOverlay();
    const overlay = byId('ot-overlay');
    const spot    = byId('ot-spot');
    const card    = byId('ot-card');
    overlay.style.display = 'block';
    card.style.display    = 'flex';
    renderStep(fromStep !== undefined ? fromStep : getSavedStep());
  }

  // ─── Resume / Start button ───────────────────────────────────────────────
  function buildResumeBtn () {
    if (byId('ot-resume-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'ot-resume-btn';
    btn.setAttribute('aria-label', 'Back Office tour');
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
      if (isDone()) {
        // Offer restart
        if (confirm('Restart the full Back Office tour from the beginning?')) {
          resetTour();
          startTour(0);
        }
      } else {
        startTour(getSavedStep());
      }
    });
    updateResumeBtn();
  }

  function updateResumeBtn () {
    const btn = byId('ot-resume-btn');
    if (!btn) return;
    if (isDone()) {
      btn.innerHTML = '🗺 Tour';
      btn.title = 'Restart Back Office tour';
      btn.style.opacity = '0.55';
    } else {
      const saved = getSavedStep();
      const pct   = Math.round((saved / STEPS.length) * 100);
      btn.innerHTML = saved === 0
        ? '🗺 Start Tour'
        : `🗺 Resume Tour <small>${pct}%</small>`;
      btn.title = saved === 0
        ? 'Take the Back Office walkthrough tour'
        : `Resume tour — you left off at step ${saved + 1} of ${STEPS.length}`;
      btn.style.opacity = '1';
    }
  }

  // ─── Toast helper ────────────────────────────────────────────────────────
  function showToast (msg) {
    let t = byId('ot-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ot-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  // ─── Inject CSS ──────────────────────────────────────────────────────────
  function injectCSS () {
    if (byId('ot-style')) return;
    const style = document.createElement('style');
    style.id = 'ot-style';
    style.textContent = `
/* ── Onboarding Tour Styles ── */
#ot-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(10,8,15,0.72);
  z-index: 9900;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
#ot-spot {
  display: none;
  position: fixed;
  border-radius: 8px;
  z-index: 9901;
  box-shadow: 0 0 0 9999px rgba(10,8,15,0.72);
  pointer-events: none;
  border: 2px solid rgba(183,110,121,0.9);
  transition: top 0.25s, left 0.25s, width 0.25s, height 0.25s;
}
#ot-card {
  display: none;
  flex-direction: column;
  gap: 10px;
  position: fixed;
  z-index: 9902;
  background: #1a1220;
  border: 1px solid rgba(183,110,121,0.5);
  border-radius: 14px;
  padding: 18px 20px 16px;
  width: 320px;
  max-width: calc(100vw - 20px);
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(183,110,121,0.15);
  color: #f0e6ef;
  font-family: inherit;
  transition: top 0.25s, left 0.25s;
}
#ot-card.wide {
  max-width: 480px;
  width: min(480px, calc(100vw - 24px));
}
#ot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
#ot-progress {
  font-size: 0.7rem;
  color: #B76E79;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
#ot-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}
#ot-close:hover { color: #fff; background: rgba(255,255,255,0.08); }
#ot-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8e8f0;
  margin: 0;
  line-height: 1.35;
}
#ot-body {
  font-size: 0.875rem;
  color: #cbbac4;
  line-height: 1.6;
  margin: 0;
}
#ot-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}
#ot-back, #ot-next {
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
  font-family: inherit;
}
#ot-back {
  background: rgba(255,255,255,0.07);
  color: #ccc;
}
#ot-back:hover:not(:disabled) { background: rgba(255,255,255,0.13); }
#ot-next {
  background: #B76E79;
  color: #fff;
}
#ot-next:hover { background: #c9808f; }
#ot-dots {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
}
.ot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(183,110,121,0.28);
  transition: background 0.2s, transform 0.2s;
}
.ot-dot.active {
  background: #B76E79;
  transform: scale(1.3);
}
/* Resume / Start button — floats near top of page */
#ot-resume-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9800;
  background: #1a1220;
  border: 1px solid rgba(183,110,121,0.6);
  border-radius: 24px;
  color: #f0e6ef;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.4);
  transition: opacity 0.2s, background 0.2s;
  font-family: inherit;
}
#ot-resume-btn:hover { background: #261830; border-color: #B76E79; }
#ot-resume-btn small {
  background: #B76E79;
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 0.7rem;
}
/* Toast */
#ot-toast {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 9999;
  background: #2d7a3a;
  color: #fff;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  font-family: inherit;
}
#ot-toast.show { opacity: 1; transform: translateY(0); }
@media (max-width: 600px) {
  #ot-card { left: 10px !important; right: 10px; width: auto; }
  #ot-resume-btn { bottom: 16px; right: 16px; font-size: 0.75rem; padding: 7px 12px; }
}
    `;
    document.head.appendChild(style);
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  window.DSOnboarding = {
    start:  () => { resetTour(); startTour(0); },
    resume: () => startTour(getSavedStep()),
    exit:   exitTour,
    reset:  () => { resetTour(); updateResumeBtn(); },
    isDone,
    step:   getSavedStep
  };

  // ─── Auto-init on DOMContentLoaded ───────────────────────────────────────
  function updateDashCard () {
    const statusEl   = byId('dash-tour-status');
    const resumeBtn  = byId('dash-resume-btn');
    if (!statusEl) return;
    const saved = getSavedStep();
    if (isDone()) {
      statusEl.textContent = '✅ Tour complete! You can restart it anytime by clicking Start Tour.';
      if (resumeBtn) resumeBtn.style.display = 'none';
    } else if (saved > 0) {
      const pct = Math.round((saved / STEPS.length) * 100);
      statusEl.textContent = `You're ${pct}% through the tour (step ${saved + 1} of ${STEPS.length}). Pick up right where you left off.`;
      if (resumeBtn) resumeBtn.style.display = 'inline-block';
    } else {
      statusEl.textContent = 'Take the guided walkthrough to learn every tab at your own pace — pause and resume anytime.';
      if (resumeBtn) resumeBtn.style.display = 'none';
    }
  }

  function init () {
    injectCSS();
    buildResumeBtn();
    updateDashCard();

    // If first ever visit to Back Office — auto-start welcome after 1.5s
    if (!isDone() && getSavedStep() === 0 && !localStorage.getItem(SHOW_KEY)) {
      localStorage.setItem(SHOW_KEY, '1');
      setTimeout(() => {
        // Only auto-open if page is still in focus
        if (document.visibilityState !== 'hidden') {
          startTour(0);
        }
      }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
