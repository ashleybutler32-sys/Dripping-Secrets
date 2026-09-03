/**
 * DIMI CONCIERGE v5 — DrippingSecrets.com
 * PNG frame animation — walk-in, talk, pose states
 * No SVG path animation (that's what broke v1–v3)
 * ─────────────────────────────────────────────────
 * Frames:
 *   dimi-idle.png     → arms crossed, default float
 *   dimi-walk1.png    → walk frame A
 *   dimi-walk2.png    → walk frame B
 *   dimi-point.png    → guide mode (dimiPoint)
 *   dimi-chat.png     → explain mode (dimiChat)
 *   dimi-success.png  → success mode (dimiSuccess)
 *   dimi-warning.png  → policy mode (dimiWarning)
 *   dimi-portrait.png → chat button face
 */

(function () {
  'use strict';

  const BASE = '/images/dimi/';
  const FRAMES = {
    idle:    BASE + 'dimi-idle.png',
    walk1:   BASE + 'dimi-walk1.png',
    walk2:   BASE + 'dimi-walk2.png',
    point:   BASE + 'dimi-point.png',
    chat:    BASE + 'dimi-chat.png',
    success: BASE + 'dimi-success.png',
    warning: BASE + 'dimi-warning.png',
  };

  // Preload all frames
  Object.values(FRAMES).forEach(src => { const i = new Image(); i.src = src; });

  let walkerEl = null;
  let imgEl = null;
  let currentPose = 'idle';
  let walkInterval = null;
  let poseTimeout = null;
  let idleCycleInterval = null;
  let isWalking = false;
  let isTalking = false;
  let talkInterval = null;

  // Idle microexpressions — subtle bob & sway
  const IDLE_CYCLE = ['idle', 'idle', 'idle', 'point', 'idle', 'idle'];
  let idleCycleIdx = 0;

  function createWalker() {
    if (document.getElementById('dimi-walker')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'dimi-walker';
    wrapper.innerHTML = `
      <div class="dimi-walker-inner">
        <img id="dimi-walker-img" src="${FRAMES.walk1}" alt="Dimi" draggable="false" />
        <div class="dimi-walker-bubble" id="dimi-walker-bubble"></div>
      </div>
    `;
    document.body.appendChild(wrapper);

    walkerEl = wrapper;
    imgEl = document.getElementById('dimi-walker-img');

    // Click to open chat
    wrapper.addEventListener('click', () => {
      if (typeof window.openDimiChat === 'function') window.openDimiChat();
    });

    // Start walk-in
    startWalkIn();
  }

  function setFrame(name) {
    if (!imgEl) return;
    currentPose = name;
    imgEl.src = FRAMES[name] || FRAMES.idle;
  }

  function startWalkIn() {
    if (!walkerEl) return;
    isWalking = true;

    walkerEl.classList.add('dimi-walking-in');
    walkerEl.classList.remove('dimi-landed');

    // Alternate walk frames during slide-in
    let wf = 1;
    walkInterval = setInterval(() => {
      wf = wf === 1 ? 2 : 1;
      setFrame('walk' + wf);
    }, 160);

    // Walk-in CSS transition: 1.6s slide from right
    // After it lands, settle into idle
    setTimeout(() => {
      clearInterval(walkInterval);
      walkInterval = null;
      isWalking = false;
      walkerEl.classList.remove('dimi-walking-in');
      walkerEl.classList.add('dimi-landed');
      setFrame('idle');
      startIdleCycle();
      showBubble("Hey gorgeous, I'm Dimi. What can I help you find today? 🩷");
    }, 1700);
  }

  function startIdleCycle() {
    clearInterval(idleCycleInterval);
    idleCycleInterval = setInterval(() => {
      if (isWalking || isTalking || currentPose === 'success' || currentPose === 'warning') return;
      idleCycleIdx = (idleCycleIdx + 1) % IDLE_CYCLE.length;
      setFrame(IDLE_CYCLE[idleCycleIdx]);
    }, 4000);
  }

  function showBubble(text, duration = 4000) {
    const bubble = document.getElementById('dimi-walker-bubble');
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('visible');
    setTimeout(() => bubble.classList.remove('visible'), duration);
  }

  function setPose(name, bubbleText, duration) {
    clearTimeout(poseTimeout);
    setFrame(name);
    if (bubbleText) showBubble(bubbleText, duration || 3500);
    if (duration !== 0) {
      poseTimeout = setTimeout(() => {
        setFrame('idle');
      }, (duration || 3500) + 200);
    }
  }

  // ── Talk animation ──────────────────────────────
  function startTalking() {
    if (isTalking) return;
    isTalking = true;
    clearInterval(talkInterval);
    let tf = true;
    setFrame('chat');
    // Subtle scale pulse to simulate talking
    talkInterval = setInterval(() => {
      if (imgEl) {
        imgEl.style.transform = tf ? 'scale(1.02)' : 'scale(1)';
        tf = !tf;
      }
    }, 220);
  }

  function stopTalking() {
    isTalking = false;
    clearInterval(talkInterval);
    talkInterval = null;
    if (imgEl) imgEl.style.transform = 'scale(1)';
    setFrame('idle');
  }

  // ── Public API hooks ────────────────────────────
  window.dimiSuccess = function (msg) {
    setPose('success', msg || "That's what I like to see! 🎉", 4000);
  };

  window.dimiPoint = function (msg) {
    setPose('point', msg || 'Let me show you the way ✨', 3000);
  };

  window.dimiChat = function (msg) {
    setPose('chat', msg || null, 0); // stays until manually reset
  };

  window.dimiWarning = function (msg) {
    setPose('warning', msg || 'Quick reminder before you continue 💜', 4000);
  };

  window.dimiIdle = function () {
    clearTimeout(poseTimeout);
    setFrame('idle');
  };

  window.dimiSay = function (text, pose) {
    if (pose) setPose(pose, text, 4000);
    else showBubble(text, 4000);
  };

  window.dimiStartTalking = startTalking;
  window.dimiStopTalking = stopTalking;

  // ── ElevenLabs audio sync ───────────────────────
  // Hook into ElevenLabs play/end events if available
  document.addEventListener('elevenlabs:start', startTalking);
  document.addEventListener('elevenlabs:end', stopTalking);

  // Fallback: watch any <audio> element with id="dimi-audio"
  document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('dimi-audio');
    if (audio) {
      audio.addEventListener('play', startTalking);
      audio.addEventListener('pause', stopTalking);
      audio.addEventListener('ended', stopTalking);
    }
  });

  // ── Cart/checkout hooks ─────────────────────────
  document.addEventListener('dimi:itemAdded', (e) => {
    window.dimiSuccess(e.detail?.msg || 'Added to your cart, love! 🛒');
  });
  document.addEventListener('dimi:orderComplete', () => {
    window.dimiSuccess('Order placed — consider it done. 💜');
  });
  document.addEventListener('dimi:lowStock', (e) => {
    window.dimiWarning(e.detail?.msg || 'Heads up — only a few left! 🔥');
  });

  // ── Init ────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWalker);
  } else {
    createWalker();
  }

})();
