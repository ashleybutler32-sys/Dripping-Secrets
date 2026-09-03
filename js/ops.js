/* ============================================================
   DRIPPING SECRETS — BK-19 Production Operations & Monitoring
   js/ops.js  |  v16.7  |  2026-07-07
   Governs: system health, deployment readiness, error capture,
   incident log, rollback readiness, performance metrics.
   Stack: Netlify + Firebase — no external monitoring platforms.
   ============================================================ */

'use strict';

const DS_OPS_VERSION = '1.0.0';

// ── State ──────────────────────────────────────────────────
let _opsInit      = false;
let _opsIncidents = [];
let _opsErrors    = [];

// ── Firestore Helpers ──────────────────────────────────────
function opsDb()       { return window.db || (window.firebase?.apps?.length ? firebase.firestore() : null); }
function opsCol(name)  { const db = opsDb(); return db ? db.collection(name) : null; }

// ── Global Error Capture ───────────────────────────────────
(function installErrorCapture() {
  if (window._dsOpsErrorsInstalled) return;
  window._dsOpsErrorsInstalled = true;

  window.addEventListener('error', async (e) => {
    const col = opsCol('ops_error_logs');
    if (!col) return;
    try {
      await col.add({
        message:   e.message || 'Unknown error',
        source:    e.filename || 'unknown',
        line:      e.lineno  || 0,
        col:       e.colno   || 0,
        stack:     e.error?.stack || '',
        url:       location.href,
        ts:        firebase.firestore.FieldValue.serverTimestamp(),
        resolved:  false,
      });
    } catch (_) {}
  });

  window.addEventListener('unhandledrejection', async (e) => {
    const col = opsCol('ops_error_logs');
    if (!col) return;
    try {
      await col.add({
        message:   e.reason?.message || String(e.reason) || 'Unhandled rejection',
        source:    'promise',
        stack:     e.reason?.stack || '',
        url:       location.href,
        ts:        firebase.firestore.FieldValue.serverTimestamp(),
        resolved:  false,
      });
    } catch (_) {}
  });
})();

// ── Health Checks ──────────────────────────────────────────
async function opsCheckFirebase() {
  try {
    const db = opsDb();
    if (!db) return { ok: false, msg: 'Firestore not initialized' };
    await db.collection('ops_health_pings').doc('ping').set({ ts: firebase.firestore.FieldValue.serverTimestamp() });
    return { ok: true, msg: 'Connected' };
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

function opsCheckSW() {
  if (!('serviceWorker' in navigator)) return { ok: false, msg: 'Not supported' };
  const reg = navigator.serviceWorker.controller;
  if (!reg) return { ok: false, msg: 'Not active' };
  return { ok: true, msg: 'Active' };
}

function opsCheckAuth() {
  const user = window.firebase?.auth?.()?.currentUser;
  if (!user) return { ok: false, msg: 'Not authenticated' };
  return { ok: true, msg: user.email || 'Authenticated' };
}

function opsGetCacheVersion() {
  // Read from SW registration state
  return document.querySelector('meta[name="sw-cache"]')?.content || 'ds-v16.7';
}

function opsGetPerformance() {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) return null;
    return {
      dns:      Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      connect:  Math.round(nav.connectEnd - nav.connectStart),
      ttfb:     Math.round(nav.responseStart - nav.requestStart),
      domLoad:  Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      pageLoad: Math.round(nav.loadEventEnd - nav.startTime),
    };
  } catch (_) {
    return null;
  }
}

// ── Incident CRUD ──────────────────────────────────────────
async function opsLoadIncidents() {
  const col = opsCol('ops_incidents');
  if (!col) { _opsIncidents = []; return; }
  const snap = await col.orderBy('createdAt', 'desc').limit(30).get();
  _opsIncidents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function opsLoadErrors() {
  const col = opsCol('ops_error_logs');
  if (!col) { _opsErrors = []; return; }
  const snap = await col.orderBy('ts', 'desc').limit(30).get();
  _opsErrors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function opsCreateIncident(data) {
  const col = opsCol('ops_incidents');
  if (!col) return;
  await col.add({
    ...data,
    status:    'open',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function opsResolveIncident(id) {
  const col = opsCol('ops_incidents');
  if (!col) return;
  await col.doc(id).update({
    status:     'resolved',
    resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
  });
}

async function opsDeleteIncident(id) {
  const col = opsCol('ops_incidents');
  if (!col) return;
  await col.doc(id).delete();
}

async function opsResolveError(id) {
  const col = opsCol('ops_error_logs');
  if (!col) return;
  await col.doc(id).update({ resolved: true });
}

// ── Timestamp Helper ───────────────────────────────────────
function opsTs(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ── Health Card ────────────────────────────────────────────
function opsHealthCard(label, status, msg, icon) {
  const ok    = status === true;
  const color = ok ? '#10b981' : '#ef4444';
  const bg    = ok ? '#10b98110' : '#ef444410';
  const dot   = ok ? '●' : '●';
  return `
    <div style="background:${bg};border:1px solid ${color}33;border-radius:10px;padding:14px 16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-size:1rem">${icon}</span>
        <span style="font-weight:600;color:#f3f4f6;font-size:.88rem">${label}</span>
        <span style="color:${color};font-size:.7rem;margin-left:auto">${dot} ${ok ? 'OK' : 'ISSUE'}</span>
      </div>
      <div style="color:#9ca3af;font-size:.78rem">${msg}</div>
    </div>
  `;
}

// ── Perf Bar ───────────────────────────────────────────────
function opsPerfBar(label, ms, maxMs) {
  const pct   = Math.min(100, Math.round((ms / maxMs) * 100));
  const color = ms < maxMs * 0.5 ? '#10b981' : ms < maxMs * 0.8 ? '#f59e0b' : '#ef4444';
  return `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="color:#9ca3af;font-size:.78rem">${label}</span>
        <span style="color:${color};font-size:.78rem;font-weight:600">${ms}ms</span>
      </div>
      <div style="height:5px;background:#2d1b4e;border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width .4s"></div>
      </div>
    </div>
  `;
}

// ── Render Health Panel ────────────────────────────────────
async function opsRenderHealth() {
  const container = document.getElementById('ops-health-cards');
  if (!container) return;

  container.innerHTML = `<div style="color:#a78bfa;font-size:.85rem;text-align:center;padding:20px">Running health checks…</div>`;

  const [fbResult] = await Promise.all([opsCheckFirebase()]);
  const swResult   = opsCheckSW();
  const authResult = opsCheckAuth();

  const perf = opsGetPerformance();

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:20px">
      ${opsHealthCard('Firebase / Firestore', fbResult.ok, fbResult.msg, '🔥')}
      ${opsHealthCard('Service Worker',        swResult.ok, swResult.msg, '⚙️')}
      ${opsHealthCard('Admin Auth',            authResult.ok, authResult.msg, '🔐')}
      ${opsHealthCard('Cache Version',         true, opsGetCacheVersion(), '🗂️')}
    </div>
    ${perf ? `
      <div style="background:#120823;border:1px solid #2d1b4e;border-radius:10px;padding:16px">
        <div style="color:#d8b4fe;font-size:.85rem;font-weight:600;margin-bottom:12px">📊 Page Performance</div>
        ${opsPerfBar('DNS Lookup',   perf.dns,      300)}
        ${opsPerfBar('TCP Connect',  perf.connect,  500)}
        ${opsPerfBar('TTFB',         perf.ttfb,     800)}
        ${opsPerfBar('DOM Ready',    perf.domLoad,  3000)}
        ${opsPerfBar('Page Load',    perf.pageLoad, 5000)}
      </div>
    ` : ''}
  `;
}

// ── Render Readiness Checklist ─────────────────────────────
function opsRenderChecklist() {
  const container = document.getElementById('ops-checklist');
  if (!container) return;

  const items = [
    { label: 'Service Worker registered',    ok: 'serviceWorker' in navigator },
    { label: 'Firebase SDK loaded',           ok: typeof firebase !== 'undefined' },
    { label: 'Firestore DB initialized',      ok: !!opsDb() },
    { label: 'Admin auth initialized',        ok: !!window.firebase?.auth },
    { label: 'EmailJS loaded',                ok: typeof emailjs !== 'undefined' },
    { label: 'Analytics engine loaded',       ok: typeof initAnalytics === 'function' },
    { label: 'ESF engine loaded',             ok: typeof initESF === 'function' },
    { label: 'SKOS engine loaded',            ok: typeof initSKOS === 'function' },
    { label: 'Automation engine loaded',      ok: typeof initAutomation === 'function' },
    { label: 'Notification center loaded',    ok: typeof window.dsNotifInit === 'function' || document.getElementById('notif-bell') !== null },
  ];

  const pass = items.filter(i => i.ok).length;
  const total = items.length;
  const pct = Math.round((pass / total) * 100);
  const barColor = pct === 100 ? '#10b981' : pct >= 80 ? '#f59e0b' : '#ef4444';

  container.innerHTML = `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="color:#d8b4fe;font-size:.85rem;font-weight:600">Operational Readiness</span>
        <span style="color:${barColor};font-weight:700;font-size:.9rem">${pass}/${total} — ${pct}%</span>
      </div>
      <div style="height:8px;background:#2d1b4e;border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:4px;transition:width .6s"></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${items.map(item => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:${item.ok ? '#10b98108' : '#ef444408'};border-radius:6px;border:1px solid ${item.ok ? '#10b98120' : '#ef444420'}">
          <span style="font-size:1rem">${item.ok ? '✅' : '❌'}</span>
          <span style="color:${item.ok ? '#f3f4f6' : '#fca5a5'};font-size:.84rem">${item.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Render Incident Log ────────────────────────────────────
function opsRenderIncidents() {
  const container = document.getElementById('ops-incidents-list');
  if (!container) return;

  if (!_opsIncidents.length) {
    container.innerHTML = `<div style="text-align:center;color:#6b7280;padding:30px;font-size:.9rem">No incidents logged — system running clean. 🟢</div>`;
    return;
  }

  container.innerHTML = _opsIncidents.map(inc => {
    const statusColor = inc.status === 'resolved' ? '#10b981' : '#ef4444';
    return `
      <div style="background:#1a0a2e;border:1px solid ${statusColor}33;border-radius:8px;padding:14px;display:flex;gap:12px;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;color:#f3f4f6;margin-bottom:4px;font-size:.9rem">${inc.title || 'Unnamed Incident'}</div>
          <div style="color:#9ca3af;font-size:.8rem;margin-bottom:6px">${inc.description || ''}</div>
          <div style="display:flex;gap:10px;align-items:center">
            <span style="background:${statusColor}22;color:${statusColor};font-size:.72rem;padding:2px 8px;border-radius:20px;font-weight:600;text-transform:uppercase">${inc.status}</span>
            <span style="color:#6b7280;font-size:.75rem">${opsTs(inc.createdAt)}</span>
            ${inc.resolvedAt ? `<span style="color:#6b7280;font-size:.75rem">Resolved: ${opsTs(inc.resolvedAt)}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          ${inc.status !== 'resolved' ? `<button onclick="opsResolveIncidentUI('${inc.id}')" style="padding:4px 10px;background:transparent;border:1px solid #10b981;border-radius:4px;color:#86efac;font-size:.75rem;cursor:pointer">Resolve</button>` : ''}
          <button onclick="opsDeleteIncidentUI('${inc.id}')" style="padding:4px 10px;background:transparent;border:1px solid #ef4444;border-radius:4px;color:#fca5a5;font-size:.75rem;cursor:pointer">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

window.opsResolveIncidentUI = async function(id) {
  await opsResolveIncident(id);
  await opsLoadIncidents();
  opsRenderIncidents();
};

window.opsDeleteIncidentUI = async function(id) {
  if (!confirm('Delete this incident record?')) return;
  await opsDeleteIncident(id);
  await opsLoadIncidents();
  opsRenderIncidents();
};

// ── Render Error Log ───────────────────────────────────────
function opsRenderErrors() {
  const container = document.getElementById('ops-errors-list');
  if (!container) return;

  const unresolvedErrors = _opsErrors.filter(e => !e.resolved);

  if (!unresolvedErrors.length) {
    container.innerHTML = `<div style="text-align:center;color:#6b7280;padding:30px;font-size:.9rem">No active errors captured. 🟢</div>`;
    return;
  }

  container.innerHTML = unresolvedErrors.map(e => `
    <div style="background:#1a0a2e;border:1px solid #ef444430;border-radius:8px;padding:12px;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="color:#fca5a5;font-size:.84rem;font-weight:600;margin-bottom:3px">${e.message}</div>
          <div style="color:#6b7280;font-size:.75rem;margin-bottom:3px">${e.source}${e.line ? ` : line ${e.line}` : ''}</div>
          <div style="color:#6b7280;font-size:.73rem">${opsTs(e.ts)}</div>
        </div>
        <button onclick="opsMarkErrorResolved('${e.id}')" style="padding:4px 10px;background:transparent;border:1px solid #10b981;border-radius:4px;color:#86efac;font-size:.75rem;cursor:pointer;flex-shrink:0">Mark Resolved</button>
      </div>
    </div>
  `).join('');
}

window.opsMarkErrorResolved = async function(id) {
  await opsResolveError(id);
  await opsLoadErrors();
  opsRenderErrors();
};

// ── New Incident Modal ─────────────────────────────────────
window.opsOpenIncidentModal = function() {
  const modal = document.createElement('div');
  modal.id = 'ops-incident-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px`;
  modal.innerHTML = `
    <div style="background:#1a0a2e;border:1px solid #7c3aed;border-radius:12px;padding:28px;width:100%;max-width:480px">
      <h3 style="color:#f5d060;margin:0 0 18px;font-size:1.05rem">🚨 Log New Incident</h3>
      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Title</label>
      <input id="ops-inc-title" placeholder="Brief incident title" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:12px">
      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Severity</label>
      <select id="ops-inc-severity" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:12px">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high" selected>High</option>
        <option value="critical">Critical</option>
      </select>
      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Description</label>
      <textarea id="ops-inc-desc" rows="3" placeholder="What happened?" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:18px;resize:vertical"></textarea>
      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button onclick="document.getElementById('ops-incident-modal')?.remove()" style="padding:8px 18px;background:transparent;border:1px solid #6b7280;border-radius:6px;color:#9ca3af;cursor:pointer">Cancel</button>
        <button onclick="opsSubmitIncident()" style="padding:8px 22px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border:none;border-radius:6px;color:#fff;cursor:pointer;font-weight:600">Log Incident</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.opsSubmitIncident = async function() {
  const title    = document.getElementById('ops-inc-title')?.value?.trim();
  const severity = document.getElementById('ops-inc-severity')?.value;
  const desc     = document.getElementById('ops-inc-desc')?.value?.trim();
  if (!title) { alert('Incident title is required.'); return; }
  await opsCreateIncident({ title, severity, description: desc });
  document.getElementById('ops-incident-modal')?.remove();
  await opsLoadIncidents();
  opsRenderIncidents();
};

// ── Release History ────────────────────────────────────────
const DS_RELEASE_HISTORY = [
  { version: 'v16.7', date: 'Jul 7, 2026', cache: 'ds-v16.7',   notes: 'BK-18 Automation Engine + BK-19 Production Ops & Monitoring' },
  { version: 'v16.6', date: 'Jul 7, 2026', cache: 'ds-v16.6',   notes: 'BK-17 Employee Ops — SKOS Engine (9 wings, Firestore-backed)' },
  { version: 'v16.5', date: 'Jul 7, 2026', cache: 'ds-v16.5',   notes: 'ESF Phase 2 — QR Verification, Audit Trail, Workflow Engine, Signature Console, Verification Portal' },
  { version: 'v16.4', date: 'Jul 7, 2026', cache: 'ds-v16.4',   notes: 'BK-16 Analytics Dashboard + BK-15 Notification Center' },
  { version: 'v16.3', date: 'Jul 2026',    cache: 'ds-v16.3',   notes: 'ADLS implementation, Wellness Library expanded to 23 articles' },
  { version: 'v16.2', date: 'Jul 2026',    cache: 'ds-v16.2',   notes: 'Academy 10 Colleges / 52 Courses / 161 Lessons, shop search, accessibility pass' },
  { version: 'v16.1', date: 'Jul 2026',    cache: 'ds-v16.1',   notes: 'v16.0 critical bug fixes hotfix' },
  { version: 'v16.0', date: 'Jul 2026',    cache: 'ds-v16.0',   notes: 'Platform 2.0 initial sprint — Enterprise Platform baseline' },
  { version: 'v15.0', date: '2026',        cache: 'ds-v15.0',   notes: 'Last confirmed-working production base before v16.x series' },
];

function opsRenderReleaseHistory() {
  const container = document.getElementById('ops-release-history');
  if (!container) return;
  container.innerHTML = DS_RELEASE_HISTORY.map((r, i) => `
    <div style="display:flex;gap:14px;align-items:flex-start;padding:10px 0;${i < DS_RELEASE_HISTORY.length - 1 ? 'border-bottom:1px solid #2d1b4e' : ''}">
      <div style="flex-shrink:0;width:80px">
        <span style="font-weight:700;color:${i === 0 ? '#f5d060' : '#a78bfa'};font-size:.88rem">${r.version}</span>
        ${i === 0 ? `<span style="display:block;color:#10b981;font-size:.7rem;margin-top:2px">CURRENT</span>` : ''}
      </div>
      <div style="flex-shrink:0;width:90px;color:#6b7280;font-size:.78rem;padding-top:2px">${r.date}</div>
      <div style="flex:1;color:#d1d5db;font-size:.82rem">${r.notes}</div>
    </div>
  `).join('');
}

// ── Main Init ──────────────────────────────────────────────
window.initOps = async function() {
  const container = document.getElementById('ops-inner');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h2 style="color:#f5d060;font-size:1.25rem;font-weight:700;margin:0">Production Operations</h2>
        <p style="color:#9ca3af;font-size:.85rem;margin:4px 0 0">System health, deployment readiness, incident log, error capture</p>
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="opsRefresh()" style="padding:8px 16px;background:transparent;border:1px solid #4c1d95;border-radius:8px;color:#a78bfa;cursor:pointer;font-size:.85rem">↻ Refresh</button>
        <button onclick="opsOpenIncidentModal()" style="padding:8px 16px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-size:.85rem">🚨 Log Incident</button>
      </div>
    </div>

    <!-- Health Checks -->
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px;margin-bottom:20px">
      <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0 0 16px">🔍 System Health</h3>
      <div id="ops-health-cards"><div style="color:#a78bfa;font-size:.85rem;padding:10px">Running checks…</div></div>
    </div>

    <!-- Operational Readiness -->
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px;margin-bottom:20px">
      <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0 0 16px">✅ Operational Readiness</h3>
      <div id="ops-checklist"></div>
    </div>

    <!-- Two column: Incidents + Errors -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px">
        <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0 0 14px">🚨 Incident Log</h3>
        <div id="ops-incidents-list"><div style="color:#6b7280;font-size:.85rem;padding:10px">Loading…</div></div>
      </div>
      <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px">
        <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0 0 14px">🐛 Error Capture</h3>
        <div id="ops-errors-list"><div style="color:#6b7280;font-size:.85rem;padding:10px">Loading…</div></div>
      </div>
    </div>

    <!-- Release History -->
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px">
      <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0 0 14px">📋 Release History</h3>
      <div id="ops-release-history"></div>
    </div>
  `;

  // Load data in parallel
  await Promise.all([
    opsRenderHealth(),
    opsLoadIncidents(),
    opsLoadErrors(),
  ]);

  opsRenderChecklist();
  opsRenderIncidents();
  opsRenderErrors();
  opsRenderReleaseHistory();
  _opsInit = true;
};

window.opsRefresh = async function() {
  await Promise.all([opsRenderHealth(), opsLoadIncidents(), opsLoadErrors()]);
  opsRenderChecklist();
  opsRenderIncidents();
  opsRenderErrors();
};
