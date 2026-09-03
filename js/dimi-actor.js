/* ═══════════════════════════════════════════════════════════════
   DIMI ACTOR SYSTEM  —  js/dimi-actor.js
   Dripping Secrets v9.76
   SVG character · State machine · Emotion engine · Walk-in · Speech
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── SVG character template ─────────────────────────────── */
  const DIMI_SVG = `
<svg id="dimi-avatar-svg" viewBox="0 0 80 130" xmlns="http://www.w3.org/2000/svg"
     aria-hidden="true" focusable="false">
  <ellipse id="dimi-shadow" cx="40" cy="126" rx="16" ry="4" fill="rgba(0,0,0,0.18)"/>
  <g id="dimi-char">
    <!-- Legs -->
    <g id="dimi-legs">
      <rect id="leg-left"   x="28.5" y="93" width="8"  height="26" rx="4"   fill="#1a1a2e"/>
      <rect id="leg-right"  x="43.5" y="93" width="8"  height="26" rx="4"   fill="#1a1a2e"/>
      <ellipse id="shoe-left"  cx="32.5" cy="120" rx="7"   ry="3.5" fill="#B76E79"/>
      <ellipse id="shoe-right" cx="47.5" cy="120" rx="7"   ry="3.5" fill="#B76E79"/>
      <rect id="heel-left"  x="30"   y="119" width="3"  height="5"  rx="1"  fill="#8B4A55"/>
      <rect id="heel-right" x="45"   y="119" width="3"  height="5"  rx="1"  fill="#8B4A55"/>
    </g>
    <!-- Dress -->
    <path id="dimi-dress"
      d="M24 65 Q28 58 40 58 Q52 58 56 65 L60 95 Q50 100 40 100 Q30 100 20 95 Z"
      fill="#1a1a2e"/>
    <path d="M36 58 Q40 62 44 58 Q42 56 40 56 Q38 56 36 58Z" fill="#2d1b3d"/>
    <!-- Torso -->
    <rect id="dimi-torso" x="27" y="51" width="26" height="16" rx="5" fill="#2d1b3d"/>
    <!-- Arms -->
    <g id="arm-left" style="transform-origin:27px 58px">
      <path d="M27 58 Q12 68 10 80" stroke="#F0C8B8" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <circle cx="10" cy="81" r="4.5" fill="#F0C8B8"/>
    </g>
    <g id="arm-right" style="transform-origin:53px 58px">
      <path d="M53 58 Q68 68 70 78" stroke="#F0C8B8" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <circle cx="70" cy="79" r="4"   fill="#F0C8B8"/>
      <circle id="finger-point" cx="74" cy="75" r="2.5" fill="#F0C8B8" opacity="0"/>
    </g>
    <!-- Neck -->
    <rect x="36" y="43" width="8" height="11" rx="3" fill="#F0C8B8"/>
    <!-- Head -->
    <circle id="dimi-head-shape" cx="40" cy="28" r="20" fill="#F0C8B8"/>
    <!-- Hair -->
    <path id="dimi-hair"
      d="M20 26 Q21 9 40 8 Q59 9 60 26 Q54 13 40 15 Q26 13 20 26Z"
      fill="#1a1a2e"/>
    <path d="M20 26 Q18 35 22 42" stroke="#1a1a2e" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M60 26 Q62 35 58 42" stroke="#1a1a2e" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path id="dimi-hair-hi"
      d="M36 10 Q40 8 44 10 Q42 13 40 12 Q38 13 36 10Z"
      fill="#B76E79" opacity="0.75"/>
    <!-- Face -->
    <g id="dimi-face">
      <g id="dimi-eyebrows">
        <path id="brow-left"  d="M27 21 Q31 18 35 20" stroke="#2d1b3d" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path id="brow-right" d="M45 20 Q49 18 53 21" stroke="#2d1b3d" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </g>
      <g id="dimi-eyes">
        <g id="eye-left">
          <ellipse cx="31" cy="27" rx="4.5" ry="5" fill="white"/>
          <circle id="pupil-left"  cx="31" cy="28" r="3.2" fill="#1a1a2e"/>
          <circle cx="32.3" cy="26.5" r="1.1" fill="white"/>
          <path id="lid-left"  d="M26.5 27 Q31 22 35.5 27" fill="#F0C8B8" opacity="0"/>
        </g>
        <g id="eye-right">
          <ellipse cx="49" cy="27" rx="4.5" ry="5" fill="white"/>
          <circle id="pupil-right" cx="49" cy="28" r="3.2" fill="#1a1a2e"/>
          <circle cx="50.3" cy="26.5" r="1.1" fill="white"/>
          <path id="lid-right" d="M44.5 27 Q49 22 53.5 27" fill="#F0C8B8" opacity="0"/>
        </g>
      </g>
      <path d="M39 33 Q40 36 41 33" stroke="#d4a0a7" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path id="dimi-mouth" d="M34 39 Q40 44 46 39" stroke="#B76E79" stroke-width="2.3" stroke-linecap="round" fill="none"/>
      <g id="dimi-blush" opacity="0">
        <ellipse cx="25" cy="33" rx="5"   ry="3"   fill="#FFB6C1" opacity="0.55"/>
        <ellipse cx="55" cy="33" rx="5"   ry="3"   fill="#FFB6C1" opacity="0.55"/>
      </g>
      <g id="dimi-sweat" opacity="0">
        <path d="M57 16 Q59 11 61 16 Q61 20 59 21 Q57 20 57 16Z" fill="#7EC8E3" opacity="0.9"/>
      </g>
      <g id="dimi-sparkles" opacity="0">
        <text x="3"  y="18" font-size="9" font-family="serif">✨</text>
        <text x="60" y="12" font-size="7" font-family="serif">✨</text>
        <text x="57" y="42" font-size="6" font-family="serif">⭐</text>
      </g>
      <g id="dimi-think-dots" opacity="0">
        <circle cx="61" cy="22" r="2.5" fill="#B76E79"/>
        <circle cx="68" cy="14" r="3"   fill="#B76E79" opacity="0.7"/>
        <circle cx="74" cy="7"  r="3.5" fill="#B76E79" opacity="0.4"/>
      </g>
    </g><!-- /face -->
  </g><!-- /char -->
</svg>`.trim();

  /* ── Emotion definitions ────────────────────────────────── */
  // Each emotion defines SVG path `d` values and overlay opacities.
  const EMOTIONS = {
    neutral: {
      browL: 'M27 21 Q31 18 35 20',
      browR: 'M45 20 Q49 18 53 21',
      mouth: 'M34 39 Q40 44 46 39',
      blush: 0, sweat: 0, squint: 0
    },
    happy: {
      browL: 'M27 20 Q31 17 35 19',
      browR: 'M45 19 Q49 17 53 20',
      mouth: 'M33 38 Q40 45 47 38',
      blush: 0, sweat: 0, squint: 0.45
    },
    thinking: {
      browL: 'M27 20 Q31 19 35 21',
      browR: 'M45 19 Q49 17 53 20',
      mouth: 'M35 41 Q40 41 45 40',
      blush: 0, sweat: 0, squint: 0
    },
    excited: {
      browL: 'M27 19 Q31 15 35 18',
      browR: 'M45 18 Q49 15 53 19',
      mouth: 'M32 37 Q40 46 48 37',
      blush: 0.95, sweat: 0, squint: 0.55
    },
    concerned: {
      browL: 'M27 20 Q31 23 35 22',
      browR: 'M45 22 Q49 23 53 20',
      mouth: 'M34 42 Q40 38 46 42',
      blush: 0, sweat: 0.95, squint: 0
    },
    professional: {
      browL: 'M27 21 Q31 19 35 21',
      browR: 'M45 21 Q49 19 53 21',
      mouth: 'M34 39 Q40 43 46 39',
      blush: 0, sweat: 0, squint: 0
    }
  };

  /* ── Page → default emotion ─────────────────────────────── */
  const PAGE_EMOTION = {
    home:              'happy',
    shop:              'professional',
    'sneaky-link-bags':'excited',
    boxes:             'excited',
    bundles:           'happy',
    services:          'professional',
    booking:           'professional',
    machines:          'professional',
    about:             'happy',
    contact:           'happy',
    account:           'professional'
  };

  /* ── Proactive greeting by page ─────────────────────────── */
  const PAGE_GREET = {
    home:              'Hey bestie! Ready to discover something dripping? 🖤',
    shop:              'Find something gorgeous for you today?',
    'sneaky-link-bags':'Our bags are everything. Need help choosing?',
    boxes:             'Boxes make the perfect gift. Let me help!',
    bundles:           'Better value, better vibe. Find your bundle?',
    services:          'Questions about our services? I\'ve got you.',
    booking:           'Ready to book? I can walk you through it.',
    machines:          'Need help picking the right machine?',
    about:             'Get to know us — we\'re more than a shop!',
    contact:           'Need to reach the team? I can help.',
    account:           'Welcome back! Manage your account here.'
  };

  /* ── DimiActor public interface ─────────────────────────── */
  window.DimiActor = {
    currentState:   'idle',
    currentEmotion: 'neutral',
    _stateTimer:    null,
    _blinkTimer:    null,
    _greetShown:    false,
    els:            {},

    /* ── Bootstrap ─────────────────────────────────────── */
    init() {
      this._injectStage();
      this._cacheEls();
      if (!this.els['dimi-stage']) return; // safety

      // Initial emotion from page context
      const page    = (window.dimiContext && window.dimiContext.page) || 'home';
      const emotion = PAGE_EMOTION[page] || 'neutral';
      this.setEmotion(emotion);

      this._startBlink();
      this._bindEvents();

      // Walk-in after brief pause (let dimi.js finish its DOM build)
      setTimeout(() => this._walkIn(), 700);
    },

    /* ── Inject stage ──────────────────────────────────── */
    _injectStage() {
      const old = document.getElementById('dimi-stage');
      if (old) old.remove();

      const stage = document.createElement('div');
      stage.id = 'dimi-stage';
      stage.setAttribute('aria-hidden', 'true');
      stage.innerHTML = '<div id="dimi-speech-bubble"></div>' + DIMI_SVG;
      document.body.appendChild(stage);
    },

    /* ── Cache DOM references ──────────────────────────── */
    _cacheEls() {
      [
        'dimi-stage','dimi-speech-bubble','dimi-char',
        'brow-left','brow-right','dimi-mouth',
        'dimi-blush','dimi-sweat','dimi-sparkles','dimi-think-dots',
        'lid-left','lid-right','pupil-left','pupil-right',
        'arm-right','arm-left','finger-point',
        'leg-left','leg-right','shoe-left','shoe-right','dimi-head-shape'
      ].forEach(id => { this.els[id] = document.getElementById(id); });
    },

    /* ── setState ──────────────────────────────────────── */
    setState(state, autoReturnMs) {
      const stage = this.els['dimi-stage'];
      if (!stage) return;
      clearTimeout(this._stateTimer);

      const ALL = ['idle','thinking','speaking','guiding','success','warning','celebrating'];
      ALL.forEach(s => stage.classList.remove('state-' + s));
      stage.classList.remove('walking');

      this.currentState = state;
      stage.classList.add('state-' + state);

      /* side-effects per state */
      switch (state) {
        case 'thinking':
          this.setEmotion('thinking');
          break;

        case 'speaking':
          this.setEmotion('happy');
          break;

        case 'guiding':
          this.setEmotion('excited');
          if (this.els['finger-point']) this.els['finger-point'].style.opacity = '1';
          break;

        case 'success':
          this.setEmotion('excited');
          this._stateTimer = setTimeout(() => this.setState('celebrating'), 750);
          break;

        case 'celebrating':
          this.setEmotion('excited');
          if (this.els['dimi-sparkles']) this.els['dimi-sparkles'].style.opacity = '1';
          this._stateTimer = setTimeout(() => {
            if (this.els['dimi-sparkles']) this.els['dimi-sparkles'].style.opacity = '0';
            this._toIdle();
          }, 2500);
          break;

        case 'warning':
          this.setEmotion('concerned');
          this._stateTimer = setTimeout(() => this._toIdle(), 2200);
          break;

        case 'idle':
          if (this.els['finger-point']) this.els['finger-point'].style.opacity = '0';
          this._toIdleEmotion();
          break;
      }

      if (autoReturnMs) {
        clearTimeout(this._stateTimer);
        this._stateTimer = setTimeout(() => this._toIdle(), autoReturnMs);
      }
    },

    _toIdle() { this.setState('idle'); },

    _toIdleEmotion() {
      const page = (window.dimiContext && window.dimiContext.page) || 'home';
      this.setEmotion(PAGE_EMOTION[page] || 'neutral');
    },

    /* ── setEmotion ────────────────────────────────────── */
    setEmotion(name) {
      const e = EMOTIONS[name] || EMOTIONS.neutral;
      this.currentEmotion = name;
      const { els } = this;

      if (els['brow-left'])  els['brow-left'].setAttribute('d',  e.browL);
      if (els['brow-right']) els['brow-right'].setAttribute('d', e.browR);
      if (els['dimi-mouth']) els['dimi-mouth'].setAttribute('d', e.mouth);

      if (els['dimi-blush'])  els['dimi-blush'].style.opacity  = e.blush;
      if (els['dimi-sweat'])  els['dimi-sweat'].style.opacity  = e.sweat;
      if (els['lid-left'])    els['lid-left'].style.opacity    = e.squint;
      if (els['lid-right'])   els['lid-right'].style.opacity   = e.squint;
    },

    /* ── Walk-in sequence ──────────────────────────────── */
    _walkIn() {
      const stage = this.els['dimi-stage'];
      if (!stage) return;
      stage.classList.add('walking');

      setTimeout(() => {
        stage.classList.remove('walking');
        this.setState('idle');
        const page = (window.dimiContext && window.dimiContext.page) || '';
        this._onArrival(page);
      }, 1350);
    },

    /* ── Page arrival behaviour ────────────────────────── */
    _onArrival(page) {
      if (page === 'home' || page === 'sneaky-link-bags' || page === 'booking') {
        setTimeout(() => {
          this.setState('guiding');
          setTimeout(() => this.setState('idle'), 2200);
          setTimeout(() => this._showGreet(page), 900);
        }, 300);
      } else {
        setTimeout(() => this._showGreet(page), 1300);
      }
    },

    /* ── Proactive greeting bubble ─────────────────────── */
    _showGreet(page) {
      if (this._greetShown) return;
      this._greetShown = true;
      const msg = PAGE_GREET[page];
      if (msg) this.showBubble(msg, 5200);
    },

    showBubble(text, durationMs) {
      const el = this.els['dimi-speech-bubble'];
      if (!el) return;
      el.textContent = text;
      el.classList.add('visible');
      setTimeout(() => el.classList.remove('visible'), durationMs || 4200);
    },

    hideBubble() {
      const el = this.els['dimi-speech-bubble'];
      if (el) el.classList.remove('visible');
    },

    /* ── Blink ─────────────────────────────────────────── */
    _startBlink() {
      const doB = () => {
        const e = EMOTIONS[this.currentEmotion] || EMOTIONS.neutral;
        if (e.squint < 0.4 && this.els['lid-left']) {
          this.els['lid-left'].style.opacity  = '1';
          this.els['lid-right'].style.opacity = '1';
          setTimeout(() => {
            if (this.els['lid-left']) {
              this.els['lid-left'].style.opacity  = String(e.squint);
              this.els['lid-right'].style.opacity = String(e.squint);
            }
          }, 130);
        }
        this._blinkTimer = setTimeout(doB, 2200 + Math.random() * 3000);
      };
      this._blinkTimer = setTimeout(doB, 2500 + Math.random() * 2000);
    },

    /* ── Eye direction ─────────────────────────────────── */
    lookAt(dir) {
      const offsets = {
        left:   { lx:29, ly:28, rx:47, ry:28 },
        right:  { lx:33, ly:28, rx:51, ry:28 },
        up:     { lx:31, ly:26, rx:49, ry:26 },
        center: { lx:31, ly:28, rx:49, ry:28 }
      };
      const p = offsets[dir] || offsets.center;
      const { els } = this;
      if (els['pupil-left'])  { els['pupil-left'].setAttribute('cx',  p.lx); els['pupil-left'].setAttribute('cy',  p.ly); }
      if (els['pupil-right']) { els['pupil-right'].setAttribute('cx', p.rx); els['pupil-right'].setAttribute('cy', p.ry); }
    },

    /* ── Web Speech TTS ────────────────────────────────── */
    // Called by dimi.js as the Web Speech fallback.
    // Pass the cleaned text; DimiActor handles voice selection + state.
    speak(text, opts) {
      if (!window.speechSynthesis) return false;
      if (!text || !text.trim()) return false;

      window.speechSynthesis.cancel();
      const o   = opts || {};
      const utt = new SpeechSynthesisUtterance(text.slice(0, 350));
      utt.rate   = o.rate   || 0.91;
      utt.pitch  = o.pitch  || 1.10;
      utt.volume = o.volume || 0.83;

      // Pick a female English voice when available
      const voices = window.speechSynthesis.getVoices();
      const pref = voices.find(v =>
        /samantha|victoria|karen|tessa|zira|fiona|female|woman/i.test(v.name) &&
        /en/i.test(v.lang)
      ) || voices.find(v => /en-US|en-GB/i.test(v.lang)) || voices[0];
      if (pref) utt.voice = pref;

      this.setState('speaking');
      this.lookAt('center');

      utt.onend = () => {
        if (window.DimiActor) window.DimiActor.setState('idle');
        if (window.DimiActor) window.DimiActor.lookAt('center');
      };
      utt.onerror = () => {
        if (window.DimiActor) window.DimiActor.setState('idle');
      };

      window.speechSynthesis.speak(utt);
      return true;
    },

    stopSpeaking() {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      this.setState('idle');
    },

    /* ── Custom event bindings ─────────────────────────── */
    _bindEvents() {
      document.addEventListener('dimi:success', () => this.setState('success'));

      document.addEventListener('dimi:warning', e => {
        this.setState('warning');
        if (e.detail && e.detail.message) this.showBubble(e.detail.message, 3800);
      });

      document.addEventListener('dimi:guide', e => {
        this.setState('guiding');
        if (e.detail && e.detail.message) this.showBubble(e.detail.message, 3500);
        this._stateTimer = setTimeout(() => this.setState('idle'), 3200);
      });

      // When cart count rises, briefly celebrate
      let _lastCartCount = 0;
      setInterval(() => {
        const n = parseInt((document.getElementById('cart-count') || {}).textContent || '0', 10);
        if (n > _lastCartCount && this.currentState === 'idle') {
          this.setEmotion('excited');
          this.showBubble('Nice pick! 🖤 Keep browsing?', 3200);
        }
        _lastCartCount = n;
      }, 4000);
    }
  };

  /* ── Auto-init after DOM + dimi.js have settled ───────── */
  function maybeInit() {
    if (document.getElementById('dimi-bubble')) {
      window.DimiActor.init();
    } else {
      setTimeout(maybeInit, 120);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(maybeInit, 80));
  } else {
    setTimeout(maybeInit, 80);
  }

})();
