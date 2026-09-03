'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   DRIPPING SECRETS ACADEMY — Phase-Stepper LMS Engine v3.0
   Spec: DSAPB-ACADEMY-004 / DS-UI-002 / Platform Refinement Directive

   Architecture: Each lesson is a sequence of dedicated learning experiences.
   Each phase has its own optimized interface. The phase stepper navigates
   between experiences — it does NOT scroll through a long page.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Phase definitions ──────────────────────────────────────────────────────────
const LMS_PHASE_DEF = {
  overview:   { label: 'Overview',         icon: '📋', shortLabel: 'Overview'   },
  video:      { label: 'Instructor Video', icon: '🎬', shortLabel: 'Video'      },
  reading:    { label: 'Reading',          icon: '📖', shortLabel: 'Reading'    },
  kc:         { label: 'Knowledge Check',  icon: '✏️',  shortLabel: 'Quiz'       },
  reflection: { label: 'Reflection',       icon: '💭', shortLabel: 'Reflect'    },
  complete:   { label: 'Complete',         icon: '⭐', shortLabel: 'Complete'   },
};

// ── Dimi phase message bank ────────────────────────────────────────────────────
const DIMI_PHASE = {
  overview: [
    "Welcome! Take your time — quality learning always beats speed. I'm right here with you.",
    "You showed up, which means you mean business. Let's learn something powerful together.",
    "Every lesson you complete makes you a better Secret Keeper. Let's get into it.",
  ],
  video: [
    "Watch this through from start to finish. Videos lock in concepts visually — your brain will thank you. 🎬",
    "Take notes if you want, or just absorb it. I'll be here when you finish!",
    "Real learning happens when we pay full attention. You've got this.",
  ],
  reading: [
    "Read at your own pace. Scroll to the bottom and the lesson knows you made it. 📖",
    "This is your time to really understand — not just scan. Quality over speed.",
    "Every word in this lesson was chosen for a reason. I'm proud of you for diving in.",
  ],
  kc: [
    "Knowledge Check time! This isn't a test — it's a chance to see what stuck. You've got this. ✏️",
    "Take your time. Read each option carefully. Trust what you've learned.",
    "I'm rooting for you! And if you need a retry, that's completely okay — it's how we grow.",
  ],
  reflection: [
    "This is my favorite part. How does this lesson connect to your work at Dripping Secrets? 💭",
    "Write it like you're telling me directly — your real thoughts, in your own words.",
    "Reflection turns information into wisdom. There's no wrong answer here.",
  ],
  complete: [
    "You earned this! Every activity complete — lesson officially yours. Keep that energy. ⭐",
    "This is what showing up looks like. You did every single thing required. I'm proud of you.",
    "One lesson closer to mastery. The next one is waiting — ready when you are! 💫",
  ],
  complete_final: [
    "You've completed every lesson in this course. Time for your final exam — you've got this! 🎓",
    "Final lesson done! All that learning, all that effort — now go show what you know. 💫",
  ],
  kc_retry: [
    "Not quite — but that's okay. Review the reading and try again. I believe in you! 📖",
    "Close! Take another look at the lesson content and give it another shot.",
    "Learning includes getting things wrong first. Try again — you're closer than you think.",
  ],
};

// ── Phase runtime state ────────────────────────────────────────────────────────
let _lmsPhases   = [];   // [{ type, done }]
let _lmsCurrent  = 0;    // active phase index
let _lmsLessonId = null;
let _lmsTimers   = [];   // timeout IDs to cancel on lesson change

function _lmsClearTimers() {
  _lmsTimers.forEach(clearTimeout);
  _lmsTimers = [];
}

// ── Build phase list from lesson data ─────────────────────────────────────────
function _lmsBuildPhases(lesson) {
  const phases = [];
  phases.push({ type: 'overview', done: false });
  if (lesson.videoId)
    phases.push({ type: 'video', done: false });
  if (lesson.content && lesson.content.trim().length > 20)
    phases.push({ type: 'reading', done: false });
  if (typeof KNOWLEDGE_CHECKS !== 'undefined' && KNOWLEDGE_CHECKS && KNOWLEDGE_CHECKS[lesson.id])
    phases.push({ type: 'kc', done: false });
  phases.push({ type: 'reflection', done: false });
  phases.push({ type: 'complete',   done: false });
  return phases;
}

// ── Override: acadOpenLesson ───────────────────────────────────────────────────
window.acadOpenLesson = function(idx) {
  const course = (typeof ACAD_COURSES !== 'undefined')
    ? ACAD_COURSES.find(c => c.id === _currentCourseId) : null;
  if (!course || !course.lessons_data) return;
  _currentLessonIdx = idx;
  const lesson = course.lessons_data[idx];
  if (!lesson) return;

  _lmsClearTimers();
  _lmsLessonId = lesson.id;
  _lmsPhases   = _lmsBuildPhases(lesson);
  _lmsCurrent  = 0;

  // Replace player inner HTML with phase shell
  const panel = document.getElementById('tab-player');
  if (!panel) return;
  panel.innerHTML = `
    <div class="lms-stepper-bar" id="lms-stepper-bar"></div>
    <div class="lms-phase-viewport" id="lms-phase-viewport"></div>
  `;

  // Hide old lesson-nav-footer (phase Complete handles navigation)
  const footer = document.getElementById('lesson-nav-footer');
  if (footer) footer.style.display = 'none';

  _lmsRenderStepper();
  _lmsShowPhase(0, lesson, course);
  if (typeof acadSwitchTabByName === 'function') acadSwitchTabByName('player');
};

// ── Render stepper bar ─────────────────────────────────────────────────────────
function _lmsRenderStepper() {
  const bar = document.getElementById('lms-stepper-bar');
  if (!bar) return;
  bar.innerHTML = _lmsPhases.map((p, i) => {
    const def = LMS_PHASE_DEF[p.type] || { shortLabel: p.type, icon: '•' };
    const state = p.done ? 'done' : (i === _lmsCurrent ? 'active' : 'upcoming');
    const connector = (i < _lmsPhases.length - 1)
      ? `<div class="lms-step-line ${p.done ? 'done' : ''}"></div>` : '';
    return `<div class="lms-step ${state}">
        <div class="lms-step-pill">
          <span class="lms-step-icon">${p.done ? '✓' : def.icon}</span>
          <span class="lms-step-label">${def.shortLabel}</span>
        </div>
      </div>${connector}`;
  }).join('');
}

// ── Show a phase (with slide transition) ──────────────────────────────────────
function _lmsShowPhase(idx, lesson, course) {
  const viewport = document.getElementById('lms-phase-viewport');
  if (!viewport) return;
  _lmsCurrent = idx;
  _lmsRenderStepper();

  // Update Dimi
  const phase   = _lmsPhases[idx];
  const bank    = DIMI_PHASE[phase ? phase.type : 'overview'] || DIMI_PHASE.overview;
  const dimiMsg = bank[Math.floor(Math.random() * bank.length)];
  if (typeof setDimiMessage === 'function') setDimiMessage(dimiMsg);

  // Transition out
  viewport.classList.add('lms-vp-exit');
  _lmsTimers.push(setTimeout(() => {
    if (!phase) return;
    let html = '';
    switch (phase.type) {
      case 'overview':   html = _lmsPhaseOverview(lesson, course);   break;
      case 'video':      html = _lmsPhaseVideo(lesson);               break;
      case 'reading':    html = _lmsPhaseReading(lesson);             break;
      case 'kc':         html = _lmsPhaseKC(lesson);                  break;
      case 'reflection': html = _lmsPhaseReflection(lesson);         break;
      case 'complete':   html = _lmsPhaseComplete(lesson, course);   break;
      default:           html = '<div class="lms-phase"><p style="color:var(--text-secondary);padding:32px;">Loading phase…</p></div>';
    }
    viewport.innerHTML = html;
    viewport.classList.remove('lms-vp-exit');
    viewport.classList.add('lms-vp-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { viewport.classList.remove('lms-vp-enter'); });
    });
    _lmsStartAutoComplete(idx, lesson, course);
  }, 220));
}

// ── Auto-completion triggers ───────────────────────────────────────────────────
function _lmsStartAutoComplete(idx, lesson, course) {
  const phase = _lmsPhases[idx];
  if (!phase || phase.done) return;
  switch (phase.type) {
    case 'overview': _lmsAutoOverview(idx, lesson, course); break;
    case 'reading':  _lmsAutoReading(idx, lesson, course);  break;
    case 'video':    _lmsAutoVideo(idx, lesson, course);    break;
    // kc, reflection: user action only
  }
}

function _lmsAutoOverview(idx, lesson, course) {
  let secs = 5;
  const update = () => {
    const btn = document.getElementById('lms-overview-btn');
    if (!btn) return; // phase changed
    if (secs <= 0) { _lmsCompletePhase(idx, lesson, course); return; }
    btn.dataset.countdown = secs;
    secs--;
    _lmsTimers.push(setTimeout(update, 1000));
  };
  _lmsTimers.push(setTimeout(update, 1000));
}

function _lmsAutoVideo(idx, lesson, course) {
  // Auto-confirm after 25s if user hasn't clicked
  const t = setTimeout(() => {
    const btn = document.getElementById('lms-video-btn');
    if (btn && !btn.disabled) _lmsCompletePhase(idx, lesson, course);
  }, 25000);
  _lmsTimers.push(t);
}

function _lmsAutoReading(idx, lesson, course) {
  // Estimate read time (200 wpm, min 8s, cap at 30s for UX)
  const words = (lesson.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const ms    = Math.min(30000, Math.max(8000, Math.round(words / 200 * 60000 * 0.5)));

  let scrollDone = false;
  let timeDone   = false;
  const tryComplete = () => {
    if ((scrollDone || timeDone) && !(_lmsPhases[idx] || {}).done)
      _lmsCompletePhase(idx, lesson, course);
  };

  const scrollEl = document.getElementById('lms-reading-scroll');
  if (scrollEl) {
    const onScroll = () => {
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 80) {
        scrollDone = true;
        scrollEl.removeEventListener('scroll', onScroll);
        tryComplete();
      }
    };
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
  }

  const t = setTimeout(() => { timeDone = true; tryComplete(); }, ms);
  _lmsTimers.push(t);
}

// ── Complete a phase → advance ─────────────────────────────────────────────────
function _lmsCompletePhase(idx, lesson, course) {
  if (!_lmsPhases[idx] || _lmsPhases[idx].done) return;
  _lmsPhases[idx].done = true;

  const next = idx + 1;
  // Skip 'complete' type — that's handled by _lmsLessonDone
  if (next < _lmsPhases.length && _lmsPhases[next].type !== 'complete') {
    _lmsTimers.push(setTimeout(() => _lmsShowPhase(next, lesson, course), 350));
  } else {
    // All content phases done → trigger lesson completion then show complete phase
    _lmsTimers.push(setTimeout(() => {
      _lmsLessonDone(lesson, course);
    }, 350));
  }
}

// ── Lesson done: award XP, update records ────────────────────────────────────
function _lmsLessonDone(lesson, course) {
  const alreadyDone = (typeof _progress !== 'undefined') && _progress[lesson.id]?.done;
  if (!alreadyDone) {
    if (typeof _progress !== 'undefined')
      _progress[lesson.id] = { done: true, ts: Date.now() };
    const xpAmt = (typeof XP_PER_LESSON !== 'undefined') ? XP_PER_LESSON : 50;
    if (typeof _xp !== 'undefined') _xp += xpAmt;
    if (typeof checkBadges === 'function') checkBadges();
    if (typeof checkCourseComplete === 'function') checkCourseComplete(course);
    if (typeof saveProgress === 'function') saveProgress();
    if (typeof showToast === 'function') showToast(`Lesson complete! +${xpAmt} XP`, '⭐');
    lmsShowXP(xpAmt, 'Lesson Complete!');
  }
  if (typeof renderRightPanel === 'function') renderRightPanel();
  if (typeof renderLessonList === 'function') renderLessonList(course);
  if (typeof renderSidebar === 'function') renderSidebar();
  if (typeof updateDashHeroStats === 'function') updateDashHeroStats();
  if (typeof renderLessonDots === 'function') renderLessonDots(course, _currentLessonIdx);

  // Mark complete phase done and show it
  const completeIdx = _lmsPhases.findIndex(p => p.type === 'complete');
  if (completeIdx >= 0) {
    _lmsPhases[completeIdx].done = false; // leave unchecked (it's the final view)
    _lmsCurrent = completeIdx;
    _lmsShowPhase(completeIdx, lesson, course);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE HTML BUILDERS
// Each phase returns a self-contained HTML string for its dedicated view.
// ═════════════════════════════════════════════════════════════════════════════

// ── Overview Phase ─────────────────────────────────────────────────────────────
function _lmsPhaseOverview(lesson, course) {
  const objectives = _lmsObjectives(lesson);
  const obHtml = objectives.map(o =>
    `<li class="lms-ov-obj-item"><span class="lms-ov-obj-check">✓</span><span>${o}</span></li>`
  ).join('');
  const phaseCount = _lmsPhases.filter(p => p.type !== 'complete').length;
  return `
    <div class="lms-phase lms-phase-overview">
      <div class="lms-ov-inner">
        <div class="lms-ov-top">
          <div class="lms-ov-crumb">
            <span>${course.path || 'Academy'}</span>
            <span class="lms-ov-sep">›</span>
            <span class="lms-ov-course">${course.title}</span>
          </div>
          <h2 class="lms-ov-title">${lesson.title}</h2>
          <div class="lms-ov-pills">
            <span class="lms-meta-pill pill-lesson">Lesson ${_currentLessonIdx + 1} of ${course.lessons_data.length}</span>
            <span class="lms-meta-pill pill-xp">+${(typeof XP_PER_LESSON !== 'undefined' ? XP_PER_LESSON : 50)} XP</span>
            <span class="lms-meta-pill pill-time">${phaseCount} activities</span>
          </div>
        </div>

        <div class="lms-ov-objectives">
          <div class="lms-ov-obj-head">
            <span class="lms-ov-obj-icon">🎯</span>
            <span>What You'll Learn</span>
          </div>
          <ul class="lms-ov-obj-list">${obHtml}</ul>
        </div>

        <div class="lms-ov-dimi-card">
          <div class="lms-ov-dimi-avatar"><img src="images/dimi/dimi-ai-hologram.jpeg" alt="Dimi" style="width:64px;height:64px;object-fit:cover;border-radius:50%;filter:drop-shadow(0 0 10px rgba(124,58,237,0.6))"></div>
          <div class="lms-ov-dimi-bubble">
            <div class="lms-ov-dimi-name">Dimi</div>
            <div class="lms-ov-dimi-msg">"Welcome to <strong>${lesson.title}</strong>. I'll guide you through every step of this lesson — Overview, ${_lmsPhases.filter(p => !['overview','complete'].includes(p.type)).map(p => LMS_PHASE_DEF[p.type].label).join(', ')}, and Completion. Let's do this."</div>
          </div>
        </div>

        <div class="lms-ov-footer">
          <button class="lms-phase-btn primary" id="lms-overview-btn" onclick="lmsBeginLesson()">
            Begin Lesson →
          </button>
          <div class="lms-ov-auto-hint" id="lms-ov-auto">Auto-starts in 5s</div>
        </div>
      </div>
    </div>`;
}

// ── Video Phase ────────────────────────────────────────────────────────────────
function _lmsPhaseVideo(lesson) {
  return `
    <div class="lms-phase lms-phase-video">
      <div class="lms-vid-header">
        <div class="lms-phase-label-tag">🎬 Instructor Video</div>
        <h3 class="lms-vid-title">${lesson.title}</h3>
        <p class="lms-vid-sub">Watch the video below. Take notes or just absorb — then mark it watched.</p>
      </div>
      <div class="lms-vid-body">
        <div class="lesson-video-container">
          <iframe
            src="https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1"
            allowfullscreen loading="lazy" title="${lesson.title}"></iframe>
        </div>
      </div>
      <div class="lms-vid-footer">
        <button class="lms-phase-btn primary" id="lms-video-btn" onclick="lmsConfirmVideo()">
          ✓ I've Watched the Video
        </button>
        <div class="lms-vid-auto-hint">Will auto-confirm after 25 seconds</div>
      </div>
    </div>`;
}

// ── Reading Phase ──────────────────────────────────────────────────────────────
function _lmsPhaseReading(lesson) {
  const words = (lesson.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `
    <div class="lms-phase lms-phase-reading">
      <div class="lms-read-header">
        <div class="lms-phase-label-tag">📖 Lesson Reading</div>
        <h3 class="lms-read-title">${lesson.title}</h3>
        <div class="lms-read-meta">~${mins} min read · Scroll to the bottom to continue</div>
      </div>
      <div class="lms-read-scroll-wrap" id="lms-reading-scroll">
        <div class="lms-read-content lesson-body">${lesson.content}</div>
        <div class="lms-read-end">
          <div class="lms-read-end-marker">
            <span class="lms-read-end-icon">📖</span>
            <span class="lms-read-end-text">End of reading — advancing…</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Knowledge Check Phase ──────────────────────────────────────────────────────
function _lmsPhaseKC(lesson) {
  const kc = (typeof KNOWLEDGE_CHECKS !== 'undefined') ? KNOWLEDGE_CHECKS[lesson.id] : null;
  if (!kc) return `<div class="lms-phase lms-phase-kc"><p style="color:var(--text-secondary);padding:32px;">No knowledge check available.</p></div>`;
  const opts = kc.opts.map((opt, i) =>
    `<button class="kc-option" onclick="acadSelectKC(this,${i},'kc-${lesson.id}')">${opt}</button>`
  ).join('');
  return `
    <div class="lms-phase lms-phase-kc">
      <div class="lms-kc-header">
        <div class="lms-phase-label-tag">✏️ Knowledge Check</div>
        <p class="lms-kc-sub">Answer correctly to continue. You can retry if needed — no penalty.</p>
      </div>
      <div class="lms-kc-body">
        <div class="knowledge-check lms-kc-card">
          <div class="kc-header">
            <span class="kc-badge">Knowledge Check</span>
          </div>
          <div class="kc-question">${kc.q}</div>
          <div class="kc-options" id="kco-${lesson.id}">${opts}</div>
          <div class="kc-feedback" id="kcf-${lesson.id}" style="display:none;"></div>
          <button class="kc-submit" onclick="acadSubmitKC('${lesson.id}',${kc.correct})">Submit Answer</button>
        </div>
      </div>
    </div>`;
}

// ── Reflection Phase ───────────────────────────────────────────────────────────
function _lmsPhaseReflection(lesson) {
  const prompt = _lmsReflectPrompt(lesson);
  return `
    <div class="lms-phase lms-phase-reflection">
      <div class="lms-ref-header">
        <div class="lms-phase-label-tag">💭 Reflection</div>
        <h3 class="lms-ref-title">Apply What You've Learned</h3>
        <p class="lms-ref-sub">This is your space. Write honestly — there are no wrong answers.</p>
      </div>
      <div class="lms-ref-body">
        <div class="lms-ref-dimi-prompt">
          <div class="lms-ref-dimi-icon"><img src="images/dimi/dimi-ai-hologram.jpeg" alt="Dimi" style="width:48px;height:48px;object-fit:cover;border-radius:50%;filter:drop-shadow(0 0 8px rgba(124,58,237,0.5))"></div>
          <div class="lms-ref-dimi-text">
            <span class="lms-ref-dimi-name">Dimi asks:</span>
            <em class="lms-ref-question">${prompt}</em>
          </div>
        </div>
        <div class="lms-ref-input-area">
          <textarea
            class="lms-reflect-ta"
            id="lms-reflect-ta"
            rows="6"
            placeholder="Share your thoughts — at least a sentence or two…"
            oninput="document.getElementById('lms-reflect-ct').textContent = this.value.length + ' characters'"></textarea>
          <div class="lms-reflect-foot">
            <span class="lms-reflect-ct" id="lms-reflect-ct">0 characters</span>
            <button class="lms-reflect-btn" id="lms-reflect-btn" onclick="lmsSubmitReflection()">
              Submit Reflection →
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Complete Phase ─────────────────────────────────────────────────────────────
function _lmsPhaseComplete(lesson, course) {
  const isLast     = _currentLessonIdx === course.lessons_data.length - 1;
  const nextLabel  = isLast ? 'Start Final Exam →' : 'Next Lesson →';
  const nextAction = isLast ? 'lmsGoToExam()' : 'lmsNextLesson()';
  const xpAmt      = (typeof XP_PER_LESSON !== 'undefined') ? XP_PER_LESSON : 50;
  const achieved   = _lmsPhases.filter(p => p.type !== 'complete').map(p =>
    `<div class="lms-comp-item"><span class="lms-comp-check">✓</span><span>${LMS_PHASE_DEF[p.type].label}</span></div>`
  ).join('');
  return `
    <div class="lms-phase lms-phase-complete">
      <div class="lms-comp-glow-ring"></div>
      <div class="lms-comp-hero">
        <div class="lms-comp-star">⭐</div>
        <h2 class="lms-comp-title">Lesson Complete!</h2>
        <p class="lms-comp-sub">Every required activity finished. Well done, Secret Keeper.</p>
      </div>
      <div class="lms-comp-xp-badge">
        <div class="lms-comp-xp-num">+${xpAmt}</div>
        <div class="lms-comp-xp-unit">XP Earned</div>
      </div>
      <div class="lms-comp-achieved">
        <div class="lms-comp-ach-title">What you accomplished:</div>
        ${achieved}
      </div>
      <div class="lms-comp-footer">
        <button class="lms-phase-btn primary large" onclick="${nextAction}">${nextLabel}</button>
      </div>
    </div>`;
}

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL ACTION HANDLERS  (called by phase HTML onclick)
// ═════════════════════════════════════════════════════════════════════════════

window.lmsBeginLesson = function() {
  const l = _lmsCurrentLesson(), c = _lmsCurrentCourse();
  if (l && c) _lmsCompletePhase(_lmsCurrent, l, c);
};

window.lmsConfirmVideo = function() {
  const btn = document.getElementById('lms-video-btn');
  if (btn) { btn.disabled = true; btn.textContent = '✓ Video Complete'; }
  const l = _lmsCurrentLesson(), c = _lmsCurrentCourse();
  if (l && c) _lmsTimers.push(setTimeout(() => _lmsCompletePhase(_lmsCurrent, l, c), 500));
};

window.lmsSubmitReflection = function() {
  const ta = document.getElementById('lms-reflect-ta');
  if (!ta) return;
  const val = ta.value.trim();
  if (val.length < 15) {
    if (typeof showToast === 'function') showToast('Please write a bit more — at least a sentence.', '💭');
    ta.focus();
    return;
  }
  const btn = document.getElementById('lms-reflect-btn');
  if (btn) { btn.disabled = true; btn.textContent = '✓ Reflection Saved'; btn.classList.add('submitted'); }
  ta.disabled = true;
  const l = _lmsCurrentLesson(), c = _lmsCurrentCourse();
  if (l && c) _lmsTimers.push(setTimeout(() => _lmsCompletePhase(_lmsCurrent, l, c), 600));
};

window.lmsNextLesson = function() {
  const c = _lmsCurrentCourse();
  if (!c || !c.lessons_data) return;
  const next = _currentLessonIdx + 1;
  if (next < c.lessons_data.length) window.acadOpenLesson(next);
};

window.lmsGoToExam = function() {
  const c = _lmsCurrentCourse();
  if (typeof acadSwitchTabByName === 'function') acadSwitchTabByName('exam');
  if (c && typeof renderExam === 'function') renderExam(c);
};

// ── Override acadSubmitKC → integrate with phase engine ───────────────────────
window.acadSubmitKC = function(lessonId, correct) {
  const kc       = (typeof KNOWLEDGE_CHECKS !== 'undefined') ? (KNOWLEDGE_CHECKS[lessonId] || null) : null;
  const feedback = kc ? (kc.fb || '') : '';
  const kcId     = 'kc-' + lessonId;
  const selected = (typeof _kcSelected !== 'undefined') ? _kcSelected[kcId] : undefined;

  if (selected === undefined) {
    if (typeof showToast === 'function') showToast('Select an answer first', '⚠️');
    return;
  }

  const opts = document.querySelectorAll(`#kco-${lessonId} .kc-option`);
  const fbEl = document.getElementById('kcf-' + lessonId);
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct)                             btn.classList.add('correct');
    else if (i === selected && selected !== correct) btn.classList.add('incorrect');
  });

  const passed = (selected === correct);
  if (fbEl) {
    fbEl.style.display = 'block';
    fbEl.className = 'kc-feedback ' + (passed ? 'correct' : 'wrong');
    fbEl.textContent = (passed ? '✓ Correct! ' : '✗ Not quite. ') + feedback;
  }

  if (passed) {
    if (typeof _xp !== 'undefined') _xp += 25;
    if (typeof renderRightPanel === 'function') renderRightPanel();
    if (typeof saveProgress === 'function') saveProgress();
    const l = _lmsCurrentLesson(), c = _lmsCurrentCourse();
    if (l && c) _lmsTimers.push(setTimeout(() => _lmsCompletePhase(_lmsCurrent, l, c), 900));
  } else {
    // Retry after 1.5s
    const retryMsg = DIMI_PHASE.kc_retry[Math.floor(Math.random() * DIMI_PHASE.kc_retry.length)];
    if (typeof setDimiMessage === 'function') setDimiMessage(retryMsg);
    _lmsTimers.push(setTimeout(() => {
      opts.forEach(btn => { btn.disabled = false; btn.classList.remove('incorrect', 'correct'); });
      if (typeof _kcSelected !== 'undefined') delete _kcSelected[kcId];
      if (fbEl) { fbEl.style.display = 'none'; fbEl.textContent = ''; }
    }, 1500));
  }
};

// ── Overview countdown visual ─────────────────────────────────────────────────
// Uses data-countdown attr set by _lmsAutoOverview
const _lmsCountdownObserver = new MutationObserver(() => {
  const btn = document.getElementById('lms-overview-btn');
  if (!btn) return;
  const n = parseInt(btn.dataset.countdown || '', 10);
  if (!isNaN(n) && n > 0) {
    const hint = document.getElementById('lms-ov-auto');
    if (hint) hint.textContent = `Auto-starts in ${n}s`;
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const vp = document.getElementById('lms-phase-viewport');
  if (vp) _lmsCountdownObserver.observe(vp, { attributes: true, subtree: true });
});

// ── XP celebration overlay ────────────────────────────────────────────────────
function lmsShowXP(amount, msg) {
  let overlay = document.getElementById('lms-xp-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id        = 'lms-xp-overlay';
    overlay.className = 'lms-xp-overlay';
    overlay.innerHTML = `
      <div class="lms-xp-inner">
        <div class="lms-xp-num" id="lms-xp-num"></div>
        <div class="lms-xp-msg" id="lms-xp-msg"></div>
      </div>`;
    document.body.appendChild(overlay);
  }
  const numEl = document.getElementById('lms-xp-num');
  const msgEl = document.getElementById('lms-xp-msg');
  if (numEl) numEl.textContent = `+${amount} XP`;
  if (msgEl) msgEl.textContent = msg || 'Lesson Complete!';
  overlay.classList.remove('hide');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('show')));
  setTimeout(() => {
    overlay.classList.add('hide');
    overlay.classList.remove('show');
  }, 2400);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _lmsCurrentLesson() {
  const c = _lmsCurrentCourse();
  return c && c.lessons_data ? c.lessons_data[_currentLessonIdx] : null;
}

function _lmsCurrentCourse() {
  return (typeof ACAD_COURSES !== 'undefined')
    ? ACAD_COURSES.find(c => c.id === _currentCourseId) : null;
}

function _lmsObjectives(lesson) {
  return [
    `Understand the core concepts of ${lesson.title.toLowerCase()}`,
    `Apply this knowledge to real Dripping Secrets scenarios`,
    `Demonstrate your understanding through a knowledge check`,
    `Reflect on how this connects to your Secret Keeper role`,
  ];
}

function _lmsReflectPrompt(lesson) {
  const prompts = [
    `How will you apply "${lesson.title}" in your day-to-day role at Dripping Secrets?`,
    `What's the most important thing you'll remember from this lesson?`,
    `How does "${lesson.title}" connect to the Dripping Secrets brand values?`,
    `What would you tell a new team member about "${lesson.title}"?`,
    `How does what you learned today make you a better Secret Keeper?`,
  ];
  const seed = lesson.id ? lesson.id.charCodeAt(lesson.id.length - 1) : 0;
  return prompts[seed % prompts.length];
}
