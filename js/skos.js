/* ============================================================
   DRIPPING SECRETS — SK OFFICE SYSTEM (SKOS) ENGINE
   js/skos.js  |  v16.6  |  BK-17 Employee Operations
   ============================================================
   Covers:
   - SK Directory (profiles, add/edit/status)
   - Task Board (kanban, assign, priority, due date)
   - Training Center (modules, completion tracking)
   - Performance Dashboard (per-SK KPIs)
   - Recognition Board (give + feed)
   - Request Management (approve/deny, audit trail)
   - SK Calendar (monthly view, event CRUD)
   - Announcements (post, pin, priority)
   - Candidate Concierge (hiring pipeline, stage moves)
   ============================================================ */

(function () {
  'use strict';

  /* ── Firestore shorthand ── */
  const db = () => window.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);
  const ts = () => firebase.firestore.FieldValue.serverTimestamp();

  /* ── Utility ── */
  function fmt(d) {
    if (!d) return '—';
    const dt = d.toDate ? d.toDate() : new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtShort(d) {
    if (!d) return '—';
    const dt = d.toDate ? d.toDate() : new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function statusBadge(status, map) {
    const m = map || { active: '#66bb6a', inactive: '#fa4a4a', 'on leave': '#ffa726', open: '#4fc3f7', approved: '#66bb6a', denied: '#fa4a4a', pending: '#ffa726', hired: '#66bb6a', declined: '#fa4a4a', applied: '#4fc3f7', review: '#64b5f6', interview: '#ffa726', offer: '#ab47bc', onboarding: '#26a69a' };
    const color = m[(status || '').toLowerCase()] || '#aaa';
    return `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:.72em;font-weight:700;background:${color}22;color:${color};border:1px solid ${color}55;text-transform:capitalize">${status || '—'}</span>`;
  }
  function toast(msg, color) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, { position: 'fixed', bottom: '24px', right: '24px', background: color || '#1a1a2e', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '.9em', fontWeight: '600', border: '1px solid rgba(212,175,55,.3)', zIndex: 99999, boxShadow: '0 4px 20px rgba(0,0,0,.5)', transition: 'opacity .4s' });
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
  }
  function cardStyle(extra) {
    return `background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px;${extra || ''}`;
  }
  function inputStyle() {
    return 'padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:8px;width:100%;box-sizing:border-box';
  }
  function btnGold(label, onclick) {
    return `<button onclick="${onclick}" style="padding:10px 18px;background:var(--gold,#d4af37);color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-size:.88em">${label}</button>`;
  }
  function btnGhost(label, onclick, danger) {
    return `<button onclick="${onclick}" style="padding:8px 14px;background:${danger ? 'rgba(250,74,74,.12)' : 'rgba(255,255,255,.07)'};color:${danger ? '#fa4a4a' : '#ccc'};border:1px solid ${danger ? 'rgba(250,74,74,.3)' : 'rgba(255,255,255,.12)'};border-radius:8px;cursor:pointer;font-size:.82em">${label}</button>`;
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 1 — SK DIRECTORY
  ══════════════════════════════════════════════════════════════ */

  let _skCache = [];
  let _skUnsubscribe = null;

  window.openAddSKModal = function (id) {
    const sk = id ? _skCache.find(s => s.id === id) : null;
    const m = document.getElementById('add-sk-modal');
    if (!m) return;
    document.getElementById('sk-new-name').value = sk ? sk.name : '';
    document.getElementById('sk-new-email').value = sk ? sk.email : '';
    document.getElementById('sk-new-phone').value = sk ? sk.phone || '' : '';
    document.getElementById('sk-new-role').value = sk ? sk.role : 'Concierge';
    document.getElementById('sk-new-start').value = sk && sk.startDate ? (sk.startDate.toDate ? sk.startDate.toDate().toISOString().slice(0, 10) : sk.startDate) : '';
    m.dataset.editId = id || '';
    m.style.display = 'flex';
  };

  window.closeAddSKModal = function () {
    const m = document.getElementById('add-sk-modal');
    if (m) { m.style.display = 'none'; m.dataset.editId = ''; }
  };

  window.saveSK = async function () {
    const m = document.getElementById('add-sk-modal');
    const name = document.getElementById('sk-new-name').value.trim();
    const email = document.getElementById('sk-new-email').value.trim();
    const phone = document.getElementById('sk-new-phone').value.trim();
    const role = document.getElementById('sk-new-role').value;
    const startDate = document.getElementById('sk-new-start').value;
    if (!name || !email) return toast('Name and email are required.', '#fa4a4a');
    const data = { name, email, phone, role, startDate, updatedAt: ts() };
    const editId = m.dataset.editId;
    try {
      if (editId) {
        await db().collection('sk_profiles').doc(editId).update(data);
        toast('Secret Keeper updated.');
      } else {
        data.status = 'Active';
        data.createdAt = ts();
        await db().collection('sk_profiles').add(data);
        toast('Secret Keeper added!');
      }
      window.closeAddSKModal();
    } catch (e) { toast('Error saving Secret Keeper: ' + e.message, '#fa4a4a'); }
  };

  window.setSKStatus = async function (id, status) {
    try {
      await db().collection('sk_profiles').doc(id).update({ status, updatedAt: ts() });
      toast(`Status updated to ${status}.`);
    } catch (e) { toast('Error updating status.', '#fa4a4a'); }
  };

  window.skFilterAll = function () {
    const search = (document.getElementById('sk-search')?.value || '').toLowerCase();
    const role = document.getElementById('sk-role-filter')?.value || '';
    const status = document.getElementById('sk-status-filter')?.value || '';
    const filtered = _skCache.filter(sk => {
      const matchSearch = !search || sk.name.toLowerCase().includes(search) || sk.email.toLowerCase().includes(search);
      const matchRole = !role || sk.role === role;
      const matchStatus = !status || sk.status === status;
      return matchSearch && matchRole && matchStatus;
    });
    renderSKGrid(filtered);
  };

  function renderSKGrid(list) {
    const grid = document.getElementById('sk-directory-grid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No Secret Keepers found.</div>';
      return;
    }
    grid.innerHTML = list.map(sk => `
      <div style="${cardStyle()}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-weight:700;color:#fff;font-size:1em;margin-bottom:4px">${sk.name}</div>
            <div style="font-size:.78em;color:var(--gold,#d4af37)">${sk.role}</div>
          </div>
          ${statusBadge(sk.status)}
        </div>
        <div style="font-size:.8em;color:var(--muted);margin-bottom:4px">📧 ${sk.email}</div>
        ${sk.phone ? `<div style="font-size:.8em;color:var(--muted);margin-bottom:4px">📱 ${sk.phone}</div>` : ''}
        <div style="font-size:.8em;color:var(--muted);margin-bottom:14px">📅 Since ${fmt(sk.startDate)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${btnGhost('Edit', `openAddSKModal('${sk.id}')`)}
          ${sk.status === 'Active'
            ? btnGhost('Set Leave', `setSKStatus('${sk.id}','On Leave')`)
            : btnGhost('Activate', `setSKStatus('${sk.id}','Active')`)}
          ${sk.status !== 'Inactive' ? btnGhost('Deactivate', `setSKStatus('${sk.id}','Inactive')`, true) : ''}
        </div>
      </div>
    `).join('');
  }

  function loadSKDirectory() {
    if (_skUnsubscribe) return; // already listening
    const grid = document.getElementById('sk-directory-grid');
    if (!grid) return;
    if (!db()) { grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Database not available.</div>'; return; }
    _skUnsubscribe = db().collection('sk_profiles').orderBy('name').onSnapshot(snap => {
      _skCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      skFilterAll();
      refreshSKDropdowns();
    }, () => {
      if (grid) grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Could not load Secret Keepers.</div>';
    });
  }

  function refreshSKDropdowns() {
    const active = _skCache.filter(s => s.status === 'Active');
    const opts = '<option value="">Assign to…</option>' + active.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    ['new-task-assignee', 'recog-recipient'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = opts;
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 2 — TASK BOARD
  ══════════════════════════════════════════════════════════════ */

  let _taskUnsubscribe = null;

  window.createAdminTask = async function () {
    const title = document.getElementById('new-task-title')?.value.trim();
    const assigneeId = document.getElementById('new-task-assignee')?.value;
    const priority = document.getElementById('new-task-priority')?.value || 'normal';
    const due = document.getElementById('new-task-due')?.value;
    if (!title) return toast('Task title is required.', '#fa4a4a');
    const assignee = _skCache.find(s => s.id === assigneeId);
    try {
      await db().collection('sk_tasks').add({
        title, assigneeId, assigneeName: assignee?.name || 'Unassigned',
        priority, due: due || null, status: 'todo',
        createdAt: ts(), updatedAt: ts()
      });
      document.getElementById('new-task-title').value = '';
      document.getElementById('new-task-assignee').value = '';
      document.getElementById('new-task-due').value = '';
      toast('Task created!');
    } catch (e) { toast('Error creating task: ' + e.message, '#fa4a4a'); }
  };

  window.moveTask = async function (id, newStatus) {
    try {
      await db().collection('sk_tasks').doc(id).update({ status: newStatus, updatedAt: ts() });
    } catch (e) { toast('Error moving task.', '#fa4a4a'); }
  };

  window.deleteTask = async function (id) {
    if (!confirm('Delete this task?')) return;
    try { await db().collection('sk_tasks').doc(id).delete(); toast('Task deleted.'); }
    catch (e) { toast('Error deleting task.', '#fa4a4a'); }
  };

  function priorityColor(p) {
    return p === 'urgent' ? '#fa4a4a' : p === 'high' ? '#ffa726' : '#aaa';
  }

  function renderTaskBoard(tasks) {
    const cols = { todo: 'admin-tasks-todo', inprogress: 'admin-tasks-inprogress', done: 'admin-tasks-done' };
    Object.entries(cols).forEach(([status, elId]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      const col = tasks.filter(t => t.status === status);
      if (!col.length) { el.innerHTML = '<div style="color:var(--muted);font-size:.82em;padding:12px 0">Empty</div>'; return; }
      el.innerHTML = col.map(t => `
        <div style="${cardStyle('margin-bottom:10px')}">
          <div style="font-weight:600;color:#fff;font-size:.9em;margin-bottom:6px">${t.title}</div>
          <div style="font-size:.75em;color:var(--muted);margin-bottom:8px">
            👤 ${t.assigneeName || 'Unassigned'}
            ${t.due ? ` · 📅 ${fmtShort(t.due)}` : ''}
            · <span style="color:${priorityColor(t.priority)};font-weight:700;text-transform:uppercase">${t.priority}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${status !== 'todo' ? btnGhost('← To Do', `moveTask('${t.id}','todo')`) : ''}
            ${status !== 'inprogress' ? btnGhost('→ In Progress', `moveTask('${t.id}','inprogress')`) : ''}
            ${status !== 'done' ? btnGhost('✓ Done', `moveTask('${t.id}','done')`) : ''}
            ${btnGhost('✕', `deleteTask('${t.id}')`, true)}
          </div>
        </div>
      `).join('');
    });
  }

  function loadTaskBoard() {
    if (_taskUnsubscribe) return;
    if (!db()) return;
    _taskUnsubscribe = db().collection('sk_tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
      const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderTaskBoard(tasks);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 3 — TRAINING CENTER
  ══════════════════════════════════════════════════════════════ */

  let _trainingUnsubscribe = null;
  let _trainingModules = [];

  window.openAddModuleModal = function (id) {
    const mod = id ? _trainingModules.find(m => m.id === id) : null;
    let modal = document.getElementById('training-add-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'training-add-modal';
      modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;align-items:center;justify-content:center';
      modal.innerHTML = `
        <div style="background:#1a1a2e;border:1px solid var(--gold,#d4af37);border-radius:14px;padding:30px;width:min(500px,92vw);max-height:90vh;overflow-y:auto">
          <h3 style="color:var(--gold,#d4af37);margin-bottom:20px" id="training-modal-title">Add Training Module</h3>
          <div style="display:grid;gap:12px">
            <input id="tm-name" placeholder="Module Name" style="${inputStyle()}"/>
            <textarea id="tm-desc" placeholder="Description…" rows="3" style="${inputStyle()}resize:vertical;"></textarea>
            <select id="tm-category" style="${inputStyle()}">
              <option value="Onboarding">Onboarding</option>
              <option value="Sales">Sales</option>
              <option value="Compliance">Compliance</option>
              <option value="Product Knowledge">Product Knowledge</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Operations">Operations</option>
            </select>
            <input id="tm-duration" placeholder="Estimated Duration (e.g. 30 min)" style="${inputStyle()}"/>
            <select id="tm-required" style="${inputStyle()}">
              <option value="true">Required</option>
              <option value="false">Optional</option>
            </select>
          </div>
          <div style="display:flex;gap:12px;margin-top:20px">
            ${btnGold('Save Module', 'saveTrainingModule()')}
            <button onclick="closeTrainingModal()" style="flex:1;padding:10px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:8px;cursor:pointer">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    modal.dataset.editId = id || '';
    document.getElementById('training-modal-title').textContent = id ? 'Edit Training Module' : 'Add Training Module';
    document.getElementById('tm-name').value = mod?.name || '';
    document.getElementById('tm-desc').value = mod?.description || '';
    document.getElementById('tm-category').value = mod?.category || 'Onboarding';
    document.getElementById('tm-duration').value = mod?.duration || '';
    document.getElementById('tm-required').value = String(mod?.required !== false);
    modal.style.display = 'flex';
  };

  window.closeTrainingModal = function () {
    const m = document.getElementById('training-add-modal');
    if (m) m.style.display = 'none';
  };

  window.saveTrainingModule = async function () {
    const modal = document.getElementById('training-add-modal');
    const name = document.getElementById('tm-name').value.trim();
    const description = document.getElementById('tm-desc').value.trim();
    const category = document.getElementById('tm-category').value;
    const duration = document.getElementById('tm-duration').value.trim();
    const required = document.getElementById('tm-required').value === 'true';
    if (!name) return toast('Module name is required.', '#fa4a4a');
    const data = { name, description, category, duration, required, updatedAt: ts() };
    const editId = modal.dataset.editId;
    try {
      if (editId) {
        await db().collection('sk_training_modules').doc(editId).update(data);
        toast('Module updated.');
      } else {
        data.createdAt = ts();
        data.active = true;
        await db().collection('sk_training_modules').add(data);
        toast('Training module added!');
      }
      window.closeTrainingModal();
    } catch (e) { toast('Error saving module: ' + e.message, '#fa4a4a'); }
  };

  window.deleteTrainingModule = async function (id) {
    if (!confirm('Delete this training module?')) return;
    try { await db().collection('sk_training_modules').doc(id).delete(); toast('Module deleted.'); }
    catch (e) { toast('Error deleting module.', '#fa4a4a'); }
  };

  function renderTrainingModules(modules) {
    const grid = document.getElementById('training-modules-grid');
    if (!grid) return;
    if (!modules.length) {
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No training modules yet. Add one to get started.</div>';
      return;
    }
    // Also fix the + Module button
    const btn = grid.closest('.card')?.querySelector('button[onclick*="alert"]');
    if (btn) btn.setAttribute('onclick', 'openAddModuleModal()');

    grid.innerHTML = modules.map(m => `
      <div style="${cardStyle()}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div style="font-weight:700;color:#fff">${m.name}</div>
          <span style="font-size:.72em;color:var(--gold,#d4af37);background:rgba(212,175,55,.1);padding:3px 10px;border-radius:20px;border:1px solid rgba(212,175,55,.25)">${m.category}</span>
        </div>
        <p style="font-size:.82em;color:var(--muted);margin-bottom:10px">${m.description || 'No description.'}</p>
        <div style="font-size:.78em;color:var(--muted);margin-bottom:12px">
          ⏱ ${m.duration || '—'}
          · ${m.required ? '<span style="color:#66bb6a;font-weight:700">Required</span>' : '<span style="color:#aaa">Optional</span>'}
        </div>
        <div style="display:flex;gap:8px">
          ${btnGhost('Edit', `openAddModuleModal('${m.id}')`)}
          ${btnGhost('Delete', `deleteTrainingModule('${m.id}')`, true)}
        </div>
      </div>
    `).join('');
  }

  function loadTrainingCenter() {
    if (_trainingUnsubscribe) return;
    if (!db()) return;
    _trainingUnsubscribe = db().collection('sk_training_modules').orderBy('createdAt', 'desc').onSnapshot(snap => {
      _trainingModules = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderTrainingModules(_trainingModules);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 4 — PERFORMANCE DASHBOARD
  ══════════════════════════════════════════════════════════════ */

  async function loadPerformance() {
    const [activeEl, tasksEl, reqEl, listEl] = ['perf-active-count', 'perf-tasks-done', 'perf-open-requests', 'perf-sk-list'].map(id => document.getElementById(id));
    if (!db()) return;
    try {
      const [skSnap, taskSnap, reqSnap] = await Promise.all([
        db().collection('sk_profiles').where('status', '==', 'Active').get(),
        db().collection('sk_tasks').where('status', '==', 'done').get(),
        db().collection('sk_requests').where('status', '==', 'open').get()
      ]);
      if (activeEl) activeEl.textContent = skSnap.size;
      if (tasksEl) tasksEl.textContent = taskSnap.size;
      if (reqEl) reqEl.textContent = reqSnap.size;

      // Per-SK summary
      if (listEl && skSnap.size > 0) {
        const skIds = skSnap.docs.map(d => d.id);
        const allTaskSnap = await db().collection('sk_tasks').get();
        const allTasks = allTaskSnap.docs.map(d => d.data());
        const allRecogSnap = await db().collection('sk_recognition').orderBy('createdAt', 'desc').get();
        const allRecog = allRecogSnap.docs.map(d => d.data());

        listEl.innerHTML = skSnap.docs.map(d => {
          const sk = { id: d.id, ...d.data() };
          const myTasks = allTasks.filter(t => t.assigneeId === sk.id);
          const doneTasks = myTasks.filter(t => t.status === 'done').length;
          const pendingTasks = myTasks.filter(t => t.status !== 'done').length;
          const myRecog = allRecog.filter(r => r.recipientId === sk.id).length;
          const pct = myTasks.length ? Math.round((doneTasks / myTasks.length) * 100) : 0;
          return `
            <div style="${cardStyle()}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div>
                  <div style="font-weight:700;color:#fff">${sk.name}</div>
                  <div style="font-size:.78em;color:var(--gold,#d4af37)">${sk.role}</div>
                </div>
                ${statusBadge(sk.status)}
              </div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px">
                <div style="text-align:center;background:rgba(255,255,255,.03);border-radius:8px;padding:10px">
                  <div style="font-size:1.4em;font-weight:700;color:#66bb6a">${doneTasks}</div>
                  <div style="font-size:.7em;color:var(--muted)">Done</div>
                </div>
                <div style="text-align:center;background:rgba(255,255,255,.03);border-radius:8px;padding:10px">
                  <div style="font-size:1.4em;font-weight:700;color:#ffa726">${pendingTasks}</div>
                  <div style="font-size:.7em;color:var(--muted)">Pending</div>
                </div>
                <div style="text-align:center;background:rgba(255,255,255,.03);border-radius:8px;padding:10px">
                  <div style="font-size:1.4em;font-weight:700;color:#ab47bc">${myRecog}</div>
                  <div style="font-size:.7em;color:var(--muted)">Awards</div>
                </div>
              </div>
              <div style="background:rgba(255,255,255,.05);border-radius:6px;height:8px;margin-bottom:6px">
                <div style="background:linear-gradient(90deg,var(--gold,#d4af37),#c084fc);height:100%;border-radius:6px;width:${pct}%;transition:width .4s"></div>
              </div>
              <div style="font-size:.75em;color:var(--muted)">${pct}% task completion</div>
            </div>`;
        }).join('');
      } else if (listEl) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No active Secret Keepers.</div>';
      }
    } catch (e) {
      console.warn('Performance load error:', e);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 5 — RECOGNITION BOARD
  ══════════════════════════════════════════════════════════════ */

  let _recognitionUnsubscribe = null;

  window.sendAdminRecognition = async function () {
    const recipientId = document.getElementById('recog-recipient')?.value;
    const type = document.getElementById('recog-type')?.value;
    const message = document.getElementById('recog-message')?.value.trim();
    if (!recipientId) return toast('Select a Secret Keeper.', '#fa4a4a');
    if (!message) return toast('Write a recognition message.', '#fa4a4a');
    const recipient = _skCache.find(s => s.id === recipientId);
    try {
      await db().collection('sk_recognition').add({
        recipientId, recipientName: recipient?.name || 'Unknown',
        type, message, givenBy: 'Ashley Butler',
        createdAt: ts()
      });
      document.getElementById('recog-message').value = '';
      document.getElementById('recog-recipient').value = '';
      toast('Recognition sent!');
    } catch (e) { toast('Error sending recognition: ' + e.message, '#fa4a4a'); }
  };

  const recogIcons = { shoutout: '🗣️', 'above-beyond': '⭐', 'customer-love': '💜', teamwork: '🤝', milestone: '🎯' };

  function loadRecognitionFeed() {
    if (_recognitionUnsubscribe) return;
    if (!db()) return;
    _recognitionUnsubscribe = db().collection('sk_recognition').orderBy('createdAt', 'desc').limit(30).onSnapshot(snap => {
      const feed = document.getElementById('recognition-feed');
      if (!feed) return;
      if (snap.empty) { feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No recognitions yet. Be the first to celebrate your team!</div>'; return; }
      feed.innerHTML = snap.docs.map(d => {
        const r = d.data();
        return `
          <div style="${cardStyle('display:flex;gap:14px;align-items:flex-start')}">
            <div style="font-size:1.8em;flex-shrink:0">${recogIcons[r.type] || '🏆'}</div>
            <div style="flex:1">
              <div style="font-weight:700;color:var(--gold,#d4af37);margin-bottom:4px">${r.recipientName}</div>
              <div style="font-size:.85em;color:#ccc;margin-bottom:6px">${r.message}</div>
              <div style="font-size:.75em;color:var(--muted)">By ${r.givenBy || 'Admin'} · ${fmt(r.createdAt)}</div>
            </div>
          </div>`;
      }).join('');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 6 — REQUEST MANAGEMENT
  ══════════════════════════════════════════════════════════════ */

  let _requestsCache = [];
  let _requestsUnsubscribe = null;

  window.filterAdminRequests = function () {
    const status = document.getElementById('req-status-filter')?.value || '';
    const type = document.getElementById('req-type-filter')?.value || '';
    const filtered = _requestsCache.filter(r =>
      (!status || r.status === status) && (!type || r.type === type)
    );
    renderRequests(filtered);
  };

  window.approveRequest = async function (id) {
    try {
      await db().collection('sk_requests').doc(id).update({ status: 'approved', resolvedAt: ts(), resolvedBy: 'Ashley Butler' });
      toast('Request approved.');
    } catch (e) { toast('Error approving request.', '#fa4a4a'); }
  };

  window.denyRequest = async function (id) {
    try {
      await db().collection('sk_requests').doc(id).update({ status: 'denied', resolvedAt: ts(), resolvedBy: 'Ashley Butler' });
      toast('Request denied.');
    } catch (e) { toast('Error denying request.', '#fa4a4a'); }
  };

  function renderRequests(list) {
    const el = document.getElementById('requests-list');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No requests found.</div>'; return; }
    el.innerHTML = list.map(r => `
      <div style="${cardStyle('display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap')}">
        <div style="flex:1">
          <div style="font-weight:700;color:#fff;margin-bottom:4px">${r.skName || 'Unknown'} — ${r.type}</div>
          <div style="font-size:.84em;color:#ccc;margin-bottom:6px">${r.notes || '—'}</div>
          <div style="font-size:.76em;color:var(--muted)">Submitted ${fmt(r.createdAt)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${statusBadge(r.status)}
          ${r.status === 'open' || r.status === 'pending' ? `
            ${btnGold('Approve', `approveRequest('${r.id}')`)}
            ${btnGhost('Deny', `denyRequest('${r.id}')`, true)}
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  function loadRequests() {
    if (_requestsUnsubscribe) return;
    if (!db()) return;
    _requestsUnsubscribe = db().collection('sk_requests').orderBy('createdAt', 'desc').onSnapshot(snap => {
      _requestsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      filterAdminRequests();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 7 — SK CALENDAR
  ══════════════════════════════════════════════════════════════ */

  let _calYear, _calMonth;
  let _calEvents = [];
  let _calUnsubscribe = null;

  window.changeCalMonth = function (delta) {
    _calMonth += delta;
    if (_calMonth > 11) { _calMonth = 0; _calYear++; }
    if (_calMonth < 0) { _calMonth = 11; _calYear--; }
    renderCalendar();
  };

  window.openAddCalEventModal = function (dateStr) {
    let modal = document.getElementById('cal-event-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cal-event-modal';
      modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;align-items:center;justify-content:center';
      modal.innerHTML = `
        <div style="background:#1a1a2e;border:1px solid var(--gold,#d4af37);border-radius:14px;padding:30px;width:min(460px,92vw)">
          <h3 style="color:var(--gold,#d4af37);margin-bottom:20px">Add Calendar Event</h3>
          <div style="display:grid;gap:12px">
            <input id="cal-ev-title" placeholder="Event Title" style="${inputStyle()}"/>
            <input id="cal-ev-date" type="date" style="${inputStyle()}"/>
            <input id="cal-ev-time" type="time" style="${inputStyle()}"/>
            <select id="cal-ev-type" style="${inputStyle()}">
              <option value="shift">Shift</option>
              <option value="meeting">Meeting</option>
              <option value="training">Training</option>
              <option value="event">Event</option>
              <option value="holiday">Holiday / Day Off</option>
              <option value="other">Other</option>
            </select>
            <textarea id="cal-ev-notes" placeholder="Notes…" rows="2" style="${inputStyle()}resize:vertical;"></textarea>
          </div>
          <div style="display:flex;gap:12px;margin-top:20px">
            ${btnGold('Save Event', 'saveCalEvent()')}
            <button onclick="closeCalModal()" style="flex:1;padding:10px;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:8px;cursor:pointer">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById('cal-ev-date').value = dateStr || '';
    modal.style.display = 'flex';
  };

  window.closeCalModal = function () {
    const m = document.getElementById('cal-event-modal');
    if (m) m.style.display = 'none';
  };

  window.saveCalEvent = async function () {
    const title = document.getElementById('cal-ev-title')?.value.trim();
    const date = document.getElementById('cal-ev-date')?.value;
    const time = document.getElementById('cal-ev-time')?.value;
    const type = document.getElementById('cal-ev-type')?.value;
    const notes = document.getElementById('cal-ev-notes')?.value.trim();
    if (!title || !date) return toast('Title and date are required.', '#fa4a4a');
    try {
      await db().collection('sk_calendar_events').add({ title, date, time, type, notes, createdAt: ts() });
      toast('Event added!');
      window.closeCalModal();
    } catch (e) { toast('Error saving event: ' + e.message, '#fa4a4a'); }
  };

  window.deleteCalEvent = async function (id) {
    if (!confirm('Delete this event?')) return;
    try { await db().collection('sk_calendar_events').doc(id).delete(); toast('Event deleted.'); }
    catch (e) { toast('Error deleting event.', '#fa4a4a'); }
  };

  const calEventColors = { shift: '#4fc3f7', meeting: '#ffa726', training: '#66bb6a', event: '#ab47bc', holiday: '#fa4a4a', other: '#aaa' };

  function renderCalendar() {
    const label = document.getElementById('cal-month-label');
    const grid = document.getElementById('sk-cal-grid');
    if (!label || !grid) return;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    label.textContent = `${months[_calMonth]} ${_calYear}`;

    const firstDay = new Date(_calYear, _calMonth, 1).getDay();
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
    const today = new Date();

    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += '<div></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${_calYear}-${String(_calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.getFullYear() === _calYear && today.getMonth() === _calMonth && today.getDate() === day;
      const dayEvents = _calEvents.filter(e => e.date === dateStr);
      cells += `
        <div onclick="openAddCalEventModal('${dateStr}')" style="min-height:70px;background:${isToday ? 'rgba(212,175,55,.12)' : 'rgba(255,255,255,.03)'};border:1px solid ${isToday ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.07)'};border-radius:8px;padding:6px;cursor:pointer;transition:background .2s" onmouseover="this.style.background='rgba(212,175,55,.07)'" onmouseout="this.style.background='${isToday ? 'rgba(212,175,55,.12)' : 'rgba(255,255,255,.03)'}'">
          <div style="font-size:.82em;font-weight:${isToday ? '700' : '400'};color:${isToday ? 'var(--gold,#d4af37)' : '#ccc'};margin-bottom:4px">${day}</div>
          ${dayEvents.slice(0, 2).map(ev => `<div onclick="event.stopPropagation()" style="font-size:.68em;background:${calEventColors[ev.type] || '#aaa'}22;color:${calEventColors[ev.type] || '#aaa'};border-radius:4px;padding:2px 5px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer" title="${ev.title}" onclick="deleteCalEvent('${ev.id}')">${ev.title}</div>`).join('')}
          ${dayEvents.length > 2 ? `<div style="font-size:.65em;color:var(--muted)">+${dayEvents.length - 2} more</div>` : ''}
        </div>`;
    }
    grid.innerHTML = cells;

    // Fix "Add Event" button
    const addBtn = document.querySelector('#tab-skos-calendar button[onclick*="alert"]');
    if (addBtn) addBtn.setAttribute('onclick', 'openAddCalEventModal()');
  }

  function loadCalendar() {
    const now = new Date();
    _calYear = _calYear || now.getFullYear();
    _calMonth = _calMonth !== undefined ? _calMonth : now.getMonth();
    if (_calUnsubscribe) { renderCalendar(); return; }
    if (!db()) { renderCalendar(); return; }
    _calUnsubscribe = db().collection('sk_calendar_events').orderBy('date').onSnapshot(snap => {
      _calEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderCalendar();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 8 — ANNOUNCEMENTS
  ══════════════════════════════════════════════════════════════ */

  let _annUnsubscribe = null;

  window.postAdminAnnouncement = async function () {
    const title = document.getElementById('ann-title')?.value.trim();
    const body = document.getElementById('ann-body')?.value.trim();
    const priority = document.getElementById('ann-priority')?.value || 'normal';
    const pinned = document.getElementById('ann-pinned')?.checked || false;
    if (!title || !body) return toast('Title and content are required.', '#fa4a4a');
    try {
      await db().collection('sk_announcements').add({ title, body, priority, pinned, postedBy: 'Ashley Butler', createdAt: ts() });
      document.getElementById('ann-title').value = '';
      document.getElementById('ann-body').value = '';
      document.getElementById('ann-pinned').checked = false;
      document.getElementById('ann-priority').value = 'normal';
      toast('Announcement posted!');
    } catch (e) { toast('Error posting announcement: ' + e.message, '#fa4a4a'); }
  };

  window.deleteAnnouncement = async function (id) {
    if (!confirm('Delete this announcement?')) return;
    try { await db().collection('sk_announcements').doc(id).delete(); toast('Announcement deleted.'); }
    catch (e) { toast('Error deleting.', '#fa4a4a'); }
  };

  window.pinAnnouncement = async function (id, pinned) {
    try { await db().collection('sk_announcements').doc(id).update({ pinned: !pinned }); }
    catch (e) { toast('Error updating pin.', '#fa4a4a'); }
  };

  function loadAnnouncements() {
    if (_annUnsubscribe) return;
    if (!db()) return;
    _annUnsubscribe = db().collection('sk_announcements').orderBy('pinned', 'desc').onSnapshot(snap => {
      const feed = document.getElementById('announcements-feed');
      if (!feed) return;
      if (snap.empty) { feed.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">No announcements yet.</div>'; return; }
      const priorityColors = { normal: '#4fc3f7', important: '#ffa726', urgent: '#fa4a4a' };
      feed.innerHTML = snap.docs.map(d => {
        const a = { id: d.id, ...d.data() };
        const pColor = priorityColors[a.priority] || '#aaa';
        return `
          <div style="${cardStyle(`border-left:3px solid ${pColor};`)}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:8px">
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  ${a.pinned ? '<span style="font-size:.7em;color:var(--gold,#d4af37);font-weight:700;background:rgba(212,175,55,.12);padding:2px 8px;border-radius:20px;border:1px solid rgba(212,175,55,.25)">📌 PINNED</span>' : ''}
                  <span style="font-size:.72em;color:${pColor};text-transform:uppercase;font-weight:700">${a.priority}</span>
                </div>
                <div style="font-weight:700;color:#fff;margin-top:4px">${a.title}</div>
              </div>
              <div style="display:flex;gap:6px">
                ${btnGhost(a.pinned ? 'Unpin' : 'Pin', `pinAnnouncement('${a.id}',${a.pinned})`)}
                ${btnGhost('Delete', `deleteAnnouncement('${a.id}')`, true)}
              </div>
            </div>
            <p style="font-size:.85em;color:#ccc;margin-bottom:8px">${a.body}</p>
            <div style="font-size:.75em;color:var(--muted)">Posted by ${a.postedBy || 'Admin'} · ${fmt(a.createdAt)}</div>
          </div>`;
      }).join('');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 9 — CANDIDATE CONCIERGE
  ══════════════════════════════════════════════════════════════ */

  let _ccCache = [];
  let _ccStageFilter = '';
  let _ccUnsubscribe = null;

  window.openAddCandidateModal = function (id) {
    const c = id ? _ccCache.find(x => x.id === id) : null;
    const m = document.getElementById('cc-add-modal');
    if (!m) return;
    document.getElementById('cc-name').value = c?.name || '';
    document.getElementById('cc-email').value = c?.email || '';
    document.getElementById('cc-phone').value = c?.phone || '';
    document.getElementById('cc-role').value = c?.role || '';
    document.getElementById('cc-stage').value = c?.stage || 'applied';
    document.getElementById('cc-applied-date').value = c?.appliedDate || '';
    document.getElementById('cc-notes').value = c?.notes || '';
    m.dataset.editId = id || '';
    m.style.display = 'flex';
  };

  window.closeCandidateModal = function () {
    const m = document.getElementById('cc-add-modal');
    if (m) { m.style.display = 'none'; m.dataset.editId = ''; }
  };

  window.saveCandidate = async function () {
    const m = document.getElementById('cc-add-modal');
    const name = document.getElementById('cc-name')?.value.trim();
    const email = document.getElementById('cc-email')?.value.trim();
    const phone = document.getElementById('cc-phone')?.value.trim();
    const role = document.getElementById('cc-role')?.value;
    const stage = document.getElementById('cc-stage')?.value;
    const appliedDate = document.getElementById('cc-applied-date')?.value;
    const notes = document.getElementById('cc-notes')?.value.trim();
    if (!name) return toast('Candidate name is required.', '#fa4a4a');
    const data = { name, email, phone, role, stage, appliedDate, notes, updatedAt: ts() };
    const editId = m.dataset.editId;
    try {
      if (editId) {
        await db().collection('candidates').doc(editId).update(data);
        toast('Candidate updated.');
      } else {
        data.createdAt = ts();
        await db().collection('candidates').add(data);
        toast('Candidate added!');
      }
      window.closeCandidateModal();
    } catch (e) { toast('Error saving candidate: ' + e.message, '#fa4a4a'); }
  };

  window.deleteCandidate = async function (id) {
    if (!confirm('Delete this candidate?')) return;
    try { await db().collection('candidates').doc(id).delete(); toast('Candidate removed.'); }
    catch (e) { toast('Error deleting candidate.', '#fa4a4a'); }
  };

  window.updateCandidateStage = async function (id, stage) {
    try {
      await db().collection('candidates').doc(id).update({ stage, updatedAt: ts() });
      toast(`Moved to ${stage}.`);
    } catch (e) { toast('Error updating stage.', '#fa4a4a'); }
  };

  window.ccFilterStage = function (stage) {
    _ccStageFilter = _ccStageFilter === stage ? '' : stage;
    const stageFilter = document.getElementById('cc-stage-filter');
    if (stageFilter) stageFilter.value = _ccStageFilter;
    ccRender();
  };

  window.ccRender = function () {
    const search = (document.getElementById('cc-search')?.value || '').toLowerCase();
    const stage = document.getElementById('cc-stage-filter')?.value || _ccStageFilter;
    const role = document.getElementById('cc-role-filter')?.value || '';
    const filtered = _ccCache.filter(c =>
      (!search || c.name.toLowerCase().includes(search) || (c.email || '').toLowerCase().includes(search)) &&
      (!stage || c.stage === stage) &&
      (!role || c.role === role)
    );

    // Update counts
    ['applied', 'review', 'interview', 'offer', 'onboarding', 'hired'].forEach(s => {
      const el = document.getElementById(`cc-cnt-${s}`);
      if (el) el.textContent = _ccCache.filter(c => c.stage === s).length;
    });

    // Render table
    const tbody = document.getElementById('cc-tbody');
    if (!tbody) return;
    if (!filtered.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No candidates match your filters.</td></tr>';
      return;
    }
    const stageOpts = ['applied','review','interview','offer','onboarding','hired','declined'].map(s => `<option value="${s}" ${''}>Move → ${s}</option>`).join('');
    tbody.innerHTML = filtered.map(c => `
      <tr style="border-bottom:1px solid rgba(255,255,255,.07);transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
        <td style="padding:12px;color:#fff;font-weight:600">${c.name}</td>
        <td style="padding:12px;color:var(--muted)">${c.role || '—'}</td>
        <td style="padding:12px">${statusBadge(c.stage)}</td>
        <td style="padding:12px;color:var(--muted);font-size:.82em">${c.appliedDate ? fmtShort(c.appliedDate) : '—'}</td>
        <td style="padding:12px;color:var(--muted);font-size:.82em;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.notes || '—'}</td>
        <td style="padding:12px;text-align:center">
          <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
            ${btnGhost('Edit', `openAddCandidateModal('${c.id}')`)}
            <select onchange="updateCandidateStage('${c.id}',this.value);this.value=''" style="padding:6px 8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);color:#ccc;border-radius:8px;font-size:.78em;cursor:pointer">
              <option value="">Move to…</option>
              ${stageOpts}
            </select>
            ${btnGhost('✕', `deleteCandidate('${c.id}')`, true)}
          </div>
        </td>
      </tr>`).join('');
  };

  function loadCandidates() {
    if (_ccUnsubscribe) return;
    if (!db()) return;
    _ccUnsubscribe = db().collection('candidates').orderBy('createdAt', 'desc').onSnapshot(snap => {
      _ccCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      ccRender();
    });
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 10 — INIT & TAB ROUTING
  ══════════════════════════════════════════════════════════════ */

  let _skosInitDone = false;

  window.initSKOS = function (subtab) {
    // Load directory on first overall init
    if (!_skosInitDone) {
      _skosInitDone = true;
      loadSKDirectory();
    }
    // Route to specific subtab data
    const tab = subtab || 'skos-directory';
    if (tab === 'skos-directory') { /* already loaded */ }
    else if (tab === 'skos-tasks') loadTaskBoard();
    else if (tab === 'skos-training') loadTrainingCenter();
    else if (tab === 'skos-performance') loadPerformance();
    else if (tab === 'skos-recognition') loadRecognitionFeed();
    else if (tab === 'skos-requests') loadRequests();
    else if (tab === 'skos-calendar') loadCalendar();
    else if (tab === 'skos-announcements') loadAnnouncements();
    else if (tab === 'candidate-concierge') loadCandidates();
  };

  window.initCandidateConcierge = function () {
    window.initSKOS('candidate-concierge');
  };

  /* Expose individual loaders for switchTab hook */
  window.loadSKOSDirectory = () => { if (!_skosInitDone) { _skosInitDone = true; } loadSKDirectory(); };
  window.loadSKOSTasks = loadTaskBoard;
  window.loadSKOSTraining = loadTrainingCenter;
  window.loadSKOSPerformance = loadPerformance;
  window.loadSKOSRecognition = loadRecognitionFeed;
  window.loadSKOSRequests = loadRequests;
  window.loadSKOSCalendar = loadCalendar;
  window.loadSKOSAnnouncements = loadAnnouncements;

  console.log('✅ SKOS Engine v16.6 loaded — BK-17 Employee Operations');
})();
