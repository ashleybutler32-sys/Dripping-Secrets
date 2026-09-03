/* ================================================================
   Dripping Secrets — Phase 5 Engine
   Premium Lesson Cards · Dashboard Widgets · Cert Unlock
   Level-Up · Micro-interactions
   v18.0  |  Runs AFTER academy inline script
   ================================================================ */

(function() {
  'use strict';

  // ── Level titles ──────────────────────────────────────────────
  const P5_LEVEL_TITLES = [
    'Rising Star', 'Trailblazer', 'Secret Keeper', 'Elite Keeper',
    'Boss Elite', 'Inner Circle', 'Legend', 'Icon', 'DS Royalty', 'Untouchable'
  ];

  function p5GetLevel(xp) {
    // XP_LEVELS is defined in the inline script: [0,500,1200,2500,4500,7500,12000,20000,30000,50000]
    const levels = window.XP_LEVELS || [0,500,1200,2500,4500,7500,12000,20000,30000,50000];
    const idx = levels.findIndex((v, i) => xp < (levels[i+1] || Infinity));
    return Math.max(0, idx);
  }

  // ── Confetti ─────────────────────────────────────────────────
  function p5Confetti(container) {
    const colors = ['#c9a84c','#7c3aed','#e8a0b0','#f0c05a','#9333ea','#fff'];
    for (let i = 0; i < 36; i++) {
      const dot = document.createElement('div');
      dot.className = 'p5-confetti-dot';
      dot.style.cssText = `
        left:${10 + Math.random()*80}%;
        background:${colors[i % colors.length]};
        width:${4+Math.random()*5}px;
        height:${4+Math.random()*8}px;
        border-radius:${Math.random()>0.5?'50%':'2px'};
        animation-duration:${0.9+Math.random()*1.4}s;
        animation-delay:${Math.random()*0.5}s;
      `;
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 2500);
    }
  }

  // ── Cert Unlock Overlay ───────────────────────────────────────
  window.p5ShowCertUnlock = function(certName) {
    const overlay = document.getElementById('cert-unlock-overlay');
    if (!overlay) return;
    const nameEl = overlay.querySelector('#cert-unlock-name');
    if (nameEl) nameEl.textContent = certName;
    overlay.classList.add('show');
    const wrap = overlay.querySelector('.p5-confetti-wrap');
    if (wrap) p5Confetti(wrap);
  };

  window.p5CloseCertUnlock = function() {
    const overlay = document.getElementById('cert-unlock-overlay');
    if (overlay) overlay.classList.remove('show');
  };

  // ── Level-Up Overlay ─────────────────────────────────────────
  window.p5ShowLevelUp = function(levelNum, title) {
    const overlay = document.getElementById('level-up-overlay');
    if (!overlay) return;
    const numEl   = overlay.querySelector('#p5-lu-number');
    const titleEl = overlay.querySelector('#p5-lu-title');
    if (numEl)   numEl.textContent   = levelNum;
    if (titleEl) titleEl.textContent = title || '';
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 3200);
  };

  // ── Premium Lesson List ───────────────────────────────────────
  const _pathColorMap = {};
  // Will be populated lazily from LEARNING_PATHS global

  function p5GetPathColor(collegeId) {
    if (_pathColorMap[collegeId]) return _pathColorMap[collegeId];
    if (window.LEARNING_PATHS) {
      const p = window.LEARNING_PATHS.find(x => x.id === collegeId);
      if (p) { _pathColorMap[collegeId] = p.color; return p.color; }
    }
    return '#7c3aed';
  }

  function p5GetPathName(collegeId) {
    if (window.LEARNING_PATHS) {
      const p = window.LEARNING_PATHS.find(x => x.id === collegeId);
      if (p) return p.name;
    }
    return '';
  }

  function p5GetLessonStatus(lesson, idx, course) {
    const progress = window._progress || {};
    if (progress[lesson.id]?.done) return 'done';
    // Unlock logic: lesson 0 always unlocked; others unlock if previous done
    if (idx === 0) return 'next';
    const prev = course.lessons_data[idx - 1];
    if (prev && progress[prev.id]?.done) return 'next';
    return 'locked';
  }

  function p5GetCourseProgress(course) {
    const progress = window._progress || {};
    const total = (course.lessons_data || []).length;
    if (!total) return 0;
    const done = course.lessons_data.filter(l => progress[l.id]?.done).length;
    return Math.round((done / total) * 100);
  }

  // Ring SVG helper
  function p5RingSVG(status, pct) {
    const r = 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    const strokeClass = status === 'done' ? 'done' : status === 'next' ? 'active' : 'empty';
    const fillPct = status === 'done' ? 100 : status === 'next' ? 0 : 0;
    const realOffset = circ - (fillPct / 100) * circ;
    return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="${r}" class="p5-ring-bg" stroke-dasharray="${circ}" stroke-dashoffset="0"/>
      <circle cx="12" cy="12" r="${r}" class="p5-ring-fill ${strokeClass}" stroke-dasharray="${circ}" stroke-dashoffset="${realOffset}"/>
    </svg>`;
  }

  // Snippet from HTML content
  function p5Snippet(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    const text = tmp.textContent || tmp.innerText || '';
    const clean = text.replace(/\s+/g,' ').trim();
    return clean.length > 90 ? clean.substring(0, 90) + '…' : clean;
  }

  // Override renderLessonList
  if (typeof window.renderLessonList === 'function') {
    window.renderLessonList = function(course) {
      const container = document.getElementById('lesson-list-container');
      if (!container) return;

      const pathName  = p5GetPathName(course.college);
      const pathColor = p5GetPathColor(course.college);
      const progress  = window._progress || {};
      const coursePct = p5GetCourseProgress(course);
      const allLessonsDone = (course.lessons_data || []).every(l => progress[l.id]?.done);

      // Header
      const header = document.createElement('div');
      header.className = 'p5-course-header';
      header.innerHTML = `
        <div class="p5-course-path-tag" style="color:${pathColor}">${pathName}</div>
        <div class="p5-course-title">${course.title}</div>
        <div class="p5-course-meta-row">
          <span class="p5-course-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
            ${course.est || '~27 min'}
          </span>
          <span class="p5-course-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>
            ${course.lessons} lessons
          </span>
          <span class="p5-course-meta-item" style="color:${pathColor}">
            ${coursePct}% complete
          </span>
        </div>
        <div class="p5-course-progress-bar" style="margin-top:10px">
          <div class="p5-course-prog-fill" style="width:${coursePct}%;background:linear-gradient(90deg,${pathColor},var(--gold))"></div>
        </div>`;
      container.innerHTML = '';
      container.appendChild(header);

      // Lesson cards grid
      const grid = document.createElement('div');
      grid.className = 'p5-lesson-grid';

      const lessons = course.lessons_data || [];
      lessons.forEach((lesson, idx) => {
        const status = p5GetLessonStatus(lesson, idx, course);
        const isDone = status === 'done';

        const card = document.createElement('div');
        card.className = `p5-lc p5-lc-${status}`;

        const ctaText = isDone ? 'Review' : status === 'next' ? (idx === 0 ? 'Start' : 'Continue') : 'Locked';
        const statusLabel = isDone ? 'Complete' : status === 'next' ? 'Next Up' : 'Locked';

        card.innerHTML = `
          <div class="p5-lc-cover" style="background:linear-gradient(135deg,${pathColor}22,rgba(0,0,0,0.5))">
            <span class="p5-lc-cover-emoji">${course.icon || '📚'}</span>
            <div class="p5-lc-num-badge">${idx + 1}</div>
            <div class="p5-lc-status-badge ${status}">${statusLabel}</div>
            <div class="p5-lc-ring">${p5RingSVG(status, isDone ? 100 : 0)}</div>
          </div>
          <div class="p5-lc-body">
            <div class="p5-lc-pills">
              <span class="p5-lc-pill p5-pill-xp">+${window.XP_PER_LESSON || 10} XP</span>
              <span class="p5-lc-pill p5-pill-time">${lesson.est || '~8 min'}</span>
            </div>
            <div class="p5-lc-title">${lesson.title}</div>
            <div class="p5-lc-snippet">${p5Snippet(lesson.content)}</div>
            <div class="p5-lc-footer">
              <span class="p5-lc-cta ${ctaText.toLowerCase()}">${ctaText}</span>
              ${isDone ? '<span class="p5-lc-done-icon">✦</span>' : ''}
            </div>
          </div>`;

        if (status !== 'locked') {
          card.onclick = () => {
            if (typeof window.acadOpenLesson === 'function') window.acadOpenLesson(idx);
          };
        }
        grid.appendChild(card);
      });

      container.appendChild(grid);

      // Exam entry (full-width)
      const examDone = progress['EXAM-' + course.id]?.done;
      const examItem = document.createElement('div');
      examItem.className = 'p5-exam-card' + (!allLessonsDone ? ' locked' : '');
      examItem.innerHTML = `
        <div class="p5-exam-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="${allLessonsDone ? 'var(--gold)' : 'rgba(255,255,255,0.25)'}">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <div class="p5-exam-info">
          <div class="p5-exam-title" style="${!allLessonsDone ? 'color:rgba(255,255,255,0.3)' : ''}">
            ${examDone ? '✦ Exam Passed' : 'Final Exam'}
          </div>
          <div class="p5-exam-sub">
            ${examDone
              ? `Score: ${progress['EXAM-' + course.id]?.score || 100}% — Certificate earned`
              : allLessonsDone ? 'All lessons complete — exam unlocked' : 'Complete all lessons to unlock'}
          </div>
        </div>
        <div class="p5-exam-arrow">${allLessonsDone ? '›' : '🔒'}</div>`;

      if (allLessonsDone) {
        examItem.onclick = () => { if (typeof window.acadSwitchTabByName === 'function') window.acadSwitchTabByName('exam'); };
      }
      container.appendChild(examItem);

      // Fade-in
      const lessonView = document.getElementById('acad-lesson-view');
      if (lessonView) { lessonView.classList.remove('fade-in'); requestAnimationFrame(() => lessonView.classList.add('fade-in')); }
    };
  }

  // ── Dashboard Widgets ─────────────────────────────────────────
  function p5RenderDashWidgets() {
    const row = document.getElementById('dash-widgets-row');
    if (!row) return;

    const xp        = window._xp || 0;
    const streak    = window._streak || 0;
    const progress  = window._progress || {};
    const levels    = window.XP_LEVELS || [0,500,1200,2500,4500,7500,12000,20000,30000,50000];
    const levelIdx  = p5GetLevel(xp);
    const lvlXp     = levels[levelIdx] || 0;
    const nextXp    = levels[levelIdx + 1] || lvlXp + 500;
    const xpPct     = Math.min(100, Math.round(((xp - lvlXp) / (nextXp - lvlXp)) * 100));
    const levelTitle = P5_LEVEL_TITLES[levelIdx] || 'Secret Keeper';

    // Weekly goal: target = 3 lessons/week (configurable)
    const weeklyTarget = 3;
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    let weeklyDone = 0;
    Object.keys(progress).forEach(k => {
      if (k.startsWith('L-') && progress[k].done && progress[k].ts) {
        if (new Date(progress[k].ts) >= weekStart) weeklyDone++;
      }
    });
    const weeklyPct = Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100));

    // Dimi tip
    const tips = window.DIMI_TIPS?.default || ["Keep learning, Secret Keeper. Every lesson brings you closer to mastery."];
    const tip  = tips[Math.floor(Math.random() * tips.length)];

    // Ring SVG circumference
    const R = 25; const C = 2 * Math.PI * R;
    const xpOffset = C - (xpPct / 100) * C;

    row.innerHTML = `
      <!-- Progress Ring -->
      <div class="p5-widget">
        <div class="p5-widget-head">
          <span class="p5-widget-label">Your Level</span>
          <span class="p5-widget-icon">⚡</span>
        </div>
        <div class="p5-prog-widget">
          <div class="p5-prog-ring-wrap">
            <svg viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="p5-ring-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#7c3aed"/>
                  <stop offset="100%" stop-color="#c9a84c"/>
                </linearGradient>
              </defs>
              <circle cx="31" cy="31" r="${R}" class="p5-prog-ring-bg"/>
              <circle cx="31" cy="31" r="${R}" class="p5-prog-ring-fill" stroke="url(#p5-ring-grad)"
                stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${xpOffset.toFixed(1)}"/>
            </svg>
            <div class="p5-prog-ring-label" style="transform:translate(-50%,-50%) rotate(90deg);top:50%;left:50%;">
              <span style="font-size:0.8rem;font-weight:900;display:block;margin-top:18px;transform:rotate(-90deg)">${levelIdx + 1}</span>
            </div>
          </div>
          <div class="p5-prog-stats">
            <div class="p5-prog-val">${levelTitle}</div>
            <div class="p5-prog-sub">Level ${levelIdx + 1}</div>
            <div class="p5-prog-detail">${xp} / ${nextXp} XP</div>
          </div>
        </div>
      </div>

      <!-- Weekly Goal -->
      <div class="p5-widget">
        <div class="p5-widget-head">
          <span class="p5-widget-label">Weekly Goal</span>
          <span class="p5-widget-icon">🎯</span>
        </div>
        <div class="p5-goal-number">${weeklyDone}<span> / ${weeklyTarget}</span></div>
        <div class="p5-goal-bar-wrap">
          <div class="p5-goal-bar-fill" style="width:${weeklyPct}%"></div>
        </div>
        <div class="p5-goal-row">
          <span>Lessons this week</span>
          <span style="color:${weeklyPct>=100?'var(--gold)':'var(--text-muted)'}">${weeklyPct}%</span>
        </div>
      </div>

      <!-- Dimi Tip -->
      <div class="p5-widget p5-dimi-widget">
        <div class="p5-widget-head">
          <span class="p5-widget-label">Dimi Says</span>
          <span class="p5-widget-icon">✨</span>
        </div>
        <div class="p5-dimi-row">
          <img src="images/dimi/dimi-portrait.png" class="p5-dimi-avatar" alt="Dimi" onerror="this.style.display='none'">
          <div>
            <div class="p5-dimi-name">Dimi</div>
            <div class="p5-dimi-role">Your AI Mentor</div>
          </div>
        </div>
        <div class="p5-dimi-bubble">${tip}</div>
      </div>

      <!-- Streak -->
      <div class="p5-widget">
        <div class="p5-widget-head">
          <span class="p5-widget-label">Learning Streak</span>
          <span class="p5-widget-icon p5-streak-fire">🔥</span>
        </div>
        <div class="p5-streak-big">${streak}</div>
        <div class="p5-streak-label">Day streak</div>
        <div class="p5-streak-flame-row">
          ${Array.from({length:7}, (_,i) => `<span class="p5-flame${i < (streak % 7 || (streak >= 7 ? 7 : streak)) ? ' lit' : ''}">🔥</span>`).join('')}
        </div>
      </div>`;
  }

  // Override renderContinueCard with premium version
  if (typeof window.renderContinueCard === 'function') {
    window.renderContinueCard = function() {
      const section = document.getElementById('dash-continue-section');
      const card    = document.getElementById('dash-continue-card');
      if (!section || !card) return;

      const courses = window.ACAD_COURSES || [];
      const progress = window._progress || {};
      let lastCourse = null;

      for (const c of courses) {
        if (!c.lessons_data) continue;
        const allDone = c.lessons_data.every(l => progress[l.id]?.done);
        if (!allDone) {
          const nextLesson = c.lessons_data.find(l => !progress[l.id]?.done);
          if (nextLesson) { lastCourse = { course: c, lesson: nextLesson }; break; }
        }
      }

      if (!lastCourse) { section.style.display = 'none'; return; }

      const paths = window.LEARNING_PATHS || [];
      const path  = paths.find(p => p.id === lastCourse.course.college);
      const color = path?.color || '#7c3aed';
      const pct   = p5GetCourseProgress(lastCourse.course);

      section.style.display = 'block';
      card.innerHTML = `
        <div class="p5-continue-card" onclick="if(typeof acadOpenCourse==='function')acadOpenCourse('${lastCourse.course.id}')">
          <div class="p5-cc-icon" style="background:${color}22;font-size:1.3rem">
            ${lastCourse.course.icon || '📚'}
          </div>
          <div class="p5-cc-info">
            <div class="p5-cc-overtag" style="color:${color}">${path?.name || ''} — Continue Learning</div>
            <div class="p5-cc-title">${lastCourse.course.title}</div>
            <div class="p5-cc-next">Next: ${lastCourse.lesson.title}</div>
            <div class="p5-cc-bar"><div class="p5-cc-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <button class="p5-cc-cta">Continue →</button>
        </div>`;
    };
  }

  // Patch acadShowDashboard to render widgets
  if (typeof window.acadShowDashboard === 'function') {
    const _origASD = window.acadShowDashboard;
    window.acadShowDashboard = function() {
      _origASD.call(this);
      p5RenderDashWidgets();
    };
  }

  // ── Cert Unlock via exam submit patch ─────────────────────────
  if (typeof window.acadExamSubmit === 'function') {
    const _origSubmit = window.acadExamSubmit;
    window.acadExamSubmit = function() {
      const certsBefore = Object.keys(window._progress || {}).filter(k => k.startsWith('CERT-') && window._progress[k].done).length;
      _origSubmit.call(this);
      const progress = window._progress || {};
      const certsAfter = Object.keys(progress).filter(k => k.startsWith('CERT-') && progress[k].done).length;
      if (certsAfter > certsBefore) {
        const course = (window.ACAD_COURSES || []).find(c => c.id === window._currentCourseId);
        if (course) {
          const certInfo = (window.CERT_MAP || {})[course.college];
          if (certInfo) setTimeout(() => window.p5ShowCertUnlock(certInfo.name), 1600);
        }
      }
    };
  }

  // ── Level-up via saveProgress patch ──────────────────────────
  if (typeof window.saveProgress === 'function') {
    let _p5LastLevel = -1;
    const _origSave = window.saveProgress;
    window.saveProgress = function() {
      const curLevel = p5GetLevel(window._xp || 0);
      if (_p5LastLevel === -1) {
        _p5LastLevel = curLevel;
      } else if (curLevel > _p5LastLevel) {
        _p5LastLevel = curLevel;
        setTimeout(() => window.p5ShowLevelUp(curLevel + 1, P5_LEVEL_TITLES[curLevel] || 'Secret Keeper'), 800);
      } else {
        _p5LastLevel = curLevel;
      }
      _origSave.call(this);
    };
  }

  // ── Initial render call on page load ─────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    // The overlays need to exist in DOM (added in academy.html)
    // Trigger widget render if dashboard is already visible
    if (document.getElementById('dash-widgets-row')) {
      p5RenderDashWidgets();
    }
  });

  console.log('[DS Phase 5] Engine loaded ✦');
})();
