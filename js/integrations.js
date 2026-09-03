/* ============================================================
   DRIPPING SECRETS — ENTERPRISE INTEGRATION SERVICES ENGINE
   Sprint 7 · v17.0 · BK-Integration Services
   Scope: Integration registry, health monitor, interface governance,
          request/response log, connection status, integration audit
   Firestore collections:
     integration_registry · integration_logs · integration_audit
   ============================================================ */

'use strict';

const IntegrationServices = (() => {

  /* ── State ─────────────────────────────────────────────── */
  let _db = null;
  let _initialized = false;
  let _activeSection = 'registry';

  /* ── Approved Integrations (from authoritative platform spec) ── */
  const APPROVED_INTEGRATIONS = [
    {
      id: 'firebase-auth',
      name: 'Firebase Authentication',
      type: 'internal',
      domain: 'Security',
      description: 'Customer, employee, and admin portal authentication. Separate auth boundaries enforced.',
      endpoints: ['firebase.auth()'],
      status: 'active',
      owner: 'Platform',
      sla: '99.9% uptime (Google SLA)',
    },
    {
      id: 'firestore',
      name: 'Cloud Firestore',
      type: 'internal',
      domain: 'Data',
      description: 'Primary system of record. All operational data, documents, audit trails, signatures stored here.',
      endpoints: ['firebase.firestore()'],
      status: 'active',
      owner: 'Platform',
      sla: '99.999% uptime (Google SLA)',
    },
    {
      id: 'service-worker',
      name: 'Service Worker / PWA Cache',
      type: 'internal',
      domain: 'Performance',
      description: 'Offline-first PWA cache. Cache version must be bumped every deployment.',
      endpoints: ['sw.js'],
      status: 'active',
      owner: 'Platform',
      sla: 'Client-side',
    },
    {
      id: 'emailjs',
      name: 'EmailJS',
      type: 'external',
      domain: 'Communications',
      description: 'Order confirmation emails sent to customers only. Service ID: service_kkp11nt. No store copy.',
      endpoints: ['emailjs.send()'],
      status: 'active',
      owner: 'Operations',
      sla: 'Best effort',
    },
    {
      id: 'netlify',
      name: 'Netlify Hosting + Functions',
      type: 'external',
      domain: 'Deployment',
      description: 'Site hosting and serverless function runtime. Site: resplendent-boba-f2284c.',
      endpoints: ['netlify.app', '/.netlify/functions/'],
      status: 'active',
      owner: 'Platform',
      sla: '99.99% uptime (Netlify SLA)',
    },
    {
      id: '1on1wholesale',
      name: '1on1Wholesale',
      type: 'external',
      domain: 'Commerce',
      description: 'Primary product supplier. Blind shipping. Account: ashleybutler32. 87 products live. Name never disclosed to customers.',
      endpoints: ['1on1wholesale.co.uk'],
      status: 'active',
      owner: 'Operations',
      sla: '7–10 business days ship time',
    },
    {
      id: 'tasklet-webhooks',
      name: 'Tasklet Alert Webhooks',
      type: 'external',
      domain: 'Automation',
      description: 'Receives order, stock, and booking alerts from the platform. Fires Tasklet workflows.',
      endpoints: ['webhooks.tasklet.ai'],
      status: 'active',
      owner: 'Platform',
      sla: 'Event-driven',
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs Voice API',
      type: 'external',
      domain: 'Voice',
      description: 'BLACKLISTED — removed from all client-side code. Dimi is silent until further notice.',
      endpoints: [],
      status: 'blacklisted',
      owner: 'N/A',
      sla: 'N/A',
    },
  ];

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    if (_initialized) { _renderShell(); return; }
    _db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
    _initialized = true;
    _renderShell();
    _loadSection('registry');
  }

  /* ── Shell ─────────────────────────────────────────────── */
  function _renderShell() {
    const tab = document.getElementById('tab-integrations');
    if (!tab) return;
    tab.innerHTML = `
      <div class="int-wrap">
        <div class="int-header">
          <h2 class="int-title">🔌 Integration Services</h2>
          <p class="int-sub">Registry · Health · Governance · Logs · Audit</p>
        </div>
        <div class="int-nav">
          ${_navBtn('registry','📋','Integration Registry')}
          ${_navBtn('health','💚','Health Monitor')}
          ${_navBtn('governance','📐','Interface Governance')}
          ${_navBtn('reqlog','🔁','Request Log')}
          ${_navBtn('audit','📜','Integration Audit')}
        </div>
        <div id="int-body" class="int-body"></div>
      </div>`;
    _styleInject();
    _setActiveNav('registry');
  }

  function _navBtn(id, icon, label) {
    return `<button class="int-nav-btn" id="int-nav-${id}" onclick="IntegrationServices.loadSection('${id}')">${icon} ${label}</button>`;
  }

  /* ── Section Router ──────────────────────────────────── */
  function loadSection(sec) {
    _activeSection = sec;
    _setActiveNav(sec);
    _loadSection(sec);
  }

  function _setActiveNav(sec) {
    document.querySelectorAll('.int-nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`int-nav-${sec}`);
    if (btn) btn.classList.add('active');
  }

  function _loadSection(sec) {
    const body = document.getElementById('int-body');
    if (!body) return;
    body.innerHTML = `<div class="int-loading">Loading…</div>`;
    const map = {
      registry: _renderRegistry,
      health: _renderHealth,
      governance: _renderGovernance,
      reqlog: _renderReqLog,
      audit: _renderAudit,
    };
    if (map[sec]) map[sec]();
  }

  /* ══════════════════════════════════════════════════════
     SECTION 1 — INTEGRATION REGISTRY
  ══════════════════════════════════════════════════════ */
  function _renderRegistry() {
    const body = document.getElementById('int-body');
    if (!body) return;

    const active = APPROVED_INTEGRATIONS.filter(i => i.status !== 'blacklisted');
    const blacklisted = APPROVED_INTEGRATIONS.filter(i => i.status === 'blacklisted');

    body.innerHTML = `
      <div class="int-section">
        <div class="int-section-hdr">
          <h3>📋 Integration Registry</h3>
          <div class="int-reg-badges">
            <span class="int-badge int-badge-active">${active.length} Active</span>
            <span class="int-badge int-badge-blacklisted">${blacklisted.length} Blacklisted</span>
          </div>
        </div>
        <p class="int-note">Approved integrations only. No undocumented APIs, services, or transport protocols introduced.</p>
        <div class="int-reg-grid">
          ${APPROVED_INTEGRATIONS.map(i => `
            <div class="int-reg-card int-reg-${i.status}">
              <div class="int-reg-card-hdr">
                <span class="int-reg-name">${i.name}</span>
                <span class="int-badge int-badge-${i.status}">${i.status}</span>
              </div>
              <div class="int-reg-meta">
                <span class="int-meta-tag">🏷️ ${i.type}</span>
                <span class="int-meta-tag">🌐 ${i.domain}</span>
                <span class="int-meta-tag">👤 ${i.owner}</span>
              </div>
              <p class="int-reg-desc">${i.description}</p>
              ${i.endpoints.length ? `<div class="int-reg-endpoints">
                ${i.endpoints.map(e=>`<code class="int-endpoint">${e}</code>`).join('')}
              </div>`:''}
              <div class="int-reg-sla">SLA: ${i.sla}</div>
            </div>`).join('')}
        </div>
        <div class="int-reg-footer">
          <p>🔒 Integration list is governed by the Enterprise Master Blueprint. Adding new integrations requires platform governance review.</p>
        </div>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════
     SECTION 2 — HEALTH MONITOR
  ══════════════════════════════════════════════════════ */
  function _renderHealth() {
    const body = document.getElementById('int-body');
    if (!body) return;
    body.innerHTML = `
      <div class="int-section">
        <div class="int-section-hdr">
          <h3>💚 Integration Health Monitor</h3>
          <button class="int-btn-primary" onclick="IntegrationServices.runHealthCheck()">🔄 Refresh All</button>
        </div>
        <div id="int-health-grid" class="int-health-grid">
          <div class="int-loading">Running health checks…</div>
        </div>
        <div class="int-health-ts" id="int-health-ts"></div>
      </div>`;
    _runHealthCheck();
  }

  async function _runHealthCheck() {
    const grid = document.getElementById('int-health-grid');
    if (!grid) return;

    const checks = [
      { name:'Firebase Auth', icon:'🔐', check: () => typeof firebase !== 'undefined' && !!firebase.auth() },
      { name:'Cloud Firestore', icon:'🗄️', check: async () => { try{ if(!_db)return false;await _db.collection('_health').limit(1).get();return true; }catch{return false;} } },
      { name:'Service Worker', icon:'⚡', check: () => 'serviceWorker' in navigator && !!navigator.serviceWorker.controller },
      { name:'EmailJS', icon:'📧', check: () => typeof emailjs !== 'undefined' },
      { name:'Netlify Hosting', icon:'🌐', check: async () => { try{ const r=await fetch('/manifest.json',{cache:'no-cache'});return r.ok; }catch{return false;} } },
      { name:'PWA Manifest', icon:'📱', check: async () => { try{ const r=await fetch('/manifest.json');return r.ok; }catch{return false;} } },
      { name:'Admin Auth', icon:'🛡️', check: () => { try{ return !!firebase.auth().currentUser; }catch{return false;} } },
      { name:'Automation Engine', icon:'⚙️', check: () => typeof AutomationEngine !== 'undefined' },
      { name:'Business Ops Engine', icon:'💼', check: () => typeof BizOps !== 'undefined' },
      { name:'SK Office System', icon:'🏢', check: () => typeof window.initSKOS === 'function' || document.getElementById('tab-skos-directory') !== null },
    ];

    grid.innerHTML = `<div class="int-loading">Checking ${checks.length} integrations…</div>`;
    const results = [];
    for (const c of checks) {
      try { results.push({ ...c, ok: await Promise.resolve(c.check()) }); }
      catch(e) { results.push({ ...c, ok: false }); }
    }
    const passed = results.filter(r => r.ok).length;
    grid.innerHTML = `
      <div class="int-health-summary">
        <div class="int-health-score ${passed===checks.length?'int-score-green':passed>=7?'int-score-amber':'int-score-red'}">
          ${passed}/${checks.length}
        </div>
        <div class="int-health-score-lbl">Integrations Online</div>
      </div>
      ${results.map(r=>`
        <div class="int-health-card ${r.ok?'int-health-ok':'int-health-fail'}">
          <span class="int-health-icon">${r.icon}</span>
          <div class="int-health-info">
            <div class="int-health-name">${r.name}</div>
            <div class="int-health-status">${r.ok?'✅ Online':'❌ Offline / Not detected'}</div>
          </div>
        </div>`).join('')}`;
    const ts = document.getElementById('int-health-ts');
    if (ts) ts.textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
    if (_db) { await _integrationAudit('health_check', `${passed}/${checks.length} integrations online`); }
  }

  window.IntegrationServices = window.IntegrationServices || {};
  window.IntegrationServices.runHealthCheck = _runHealthCheck;

  /* ══════════════════════════════════════════════════════
     SECTION 3 — INTERFACE GOVERNANCE
  ══════════════════════════════════════════════════════ */
  function _renderGovernance() {
    const body = document.getElementById('int-body');
    if (!body) return;

    const contracts = [
      { name:'Order Confirmation Email', owner:'EmailJS', contract:'Customer email only; no store copy; reply-to orders@drippingsecrets.com; Template template_nbiinbo', status:'enforced' },
      { name:'Alert Webhook', owner:'Tasklet', contract:'POST to webhooks.tasklet.ai; fires on: new-order, low-stock, sold-out, booking, payment; auth token required', status:'enforced' },
      { name:'Firestore Customer Auth', owner:'Firebase Auth', contract:'Customer portal only; separate from employee and admin auth; no merge allowed', status:'enforced' },
      { name:'Firestore Employee Auth', owner:'Firebase Auth', contract:'Secret Keeper portal; Vault PIN: SecretKeeper2024 (configurable); separate collection boundary', status:'enforced' },
      { name:'Firestore Admin Auth', owner:'Firebase Auth', contract:'Back Office only; Ashley Butler account; separate auth domain', status:'enforced' },
      { name:'Supplier Blind Ship', owner:'1on1Wholesale', contract:'All orders ship blind; no supplier name on packaging or invoice; account ashleybutler32', status:'enforced' },
      { name:'Payment Channels', owner:'Platform', contract:'CashApp + PayPal + Apple Pay ONLY; no credit/debit processing; no Venmo', status:'enforced' },
      { name:'Automation Cross-Trigger', owner:'AutomationEngine', contract:'window.dsAutoFireTrigger(type, context) — all engines may call; Firestore automation_logs records every execution', status:'enforced' },
      { name:'ESF Signature Audit', owner:'ESF Phase 2', contract:'Every signing auto-issues ESF certificate; immutable audit trail in Firestore; QR verification via verification.html', status:'enforced' },
    ];

    body.innerHTML = `
      <div class="int-section">
        <div class="int-section-hdr">
          <h3>📐 Interface Governance</h3>
          <span class="int-badge int-badge-active">${contracts.filter(c=>c.status==='enforced').length} Contracts Enforced</span>
        </div>
        <p class="int-note">All interface contracts are defined by the Enterprise Master Blueprint. No undocumented interfaces are permitted.</p>
        <div class="int-contract-list">
          ${contracts.map(c=>`
            <div class="int-contract-card">
              <div class="int-contract-hdr">
                <span class="int-contract-name">${c.name}</span>
                <div class="int-contract-meta">
                  <span class="int-meta-tag">👤 ${c.owner}</span>
                  <span class="int-badge int-badge-${c.status==='enforced'?'active':'pending'}">${c.status}</span>
                </div>
              </div>
              <p class="int-contract-text">${c.contract}</p>
            </div>`).join('')}
        </div>
      </div>`;
  }

  /* ══════════════════════════════════════════════════════
     SECTION 4 — REQUEST / RESPONSE LOG
  ══════════════════════════════════════════════════════ */
  function _renderReqLog() {
    const body = document.getElementById('int-body');
    if (!body) return;
    body.innerHTML = `
      <div class="int-section">
        <div class="int-section-hdr">
          <h3>🔁 Request Log</h3>
          <button class="int-btn-primary" onclick="IntegrationServices.logManualRequest()">+ Log Request</button>
        </div>
        <div class="int-filter-row">
          <select id="int-req-filter" class="int-select" onchange="IntegrationServices.filterReqLog(this.value)">
            <option value="all">All Integrations</option>
            <option value="emailjs">EmailJS</option>
            <option value="firestore">Firestore</option>
            <option value="netlify">Netlify</option>
            <option value="1on1wholesale">1on1Wholesale</option>
            <option value="tasklet">Tasklet Webhook</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div id="int-req-list" class="int-table-wrap"><div class="int-loading">Loading request log…</div></div>
      </div>
      <div id="int-req-modal" class="int-modal" style="display:none">
        <div class="int-modal-box">
          <h4>Log Manual Request</h4>
          <label>Integration</label>
          <select id="int-req-integration" class="int-input">
            <option>EmailJS</option><option>Firestore</option><option>Netlify</option>
            <option>1on1Wholesale</option><option>Tasklet Webhook</option><option>Other</option>
          </select>
          <label>Action / Endpoint</label>
          <input id="int-req-action" class="int-input" placeholder="e.g. send_order_confirmation"/>
          <label>Status</label>
          <select id="int-req-status" class="int-input">
            <option value="success">Success</option><option value="failure">Failure</option><option value="pending">Pending</option>
          </select>
          <label>Response Summary</label>
          <textarea id="int-req-response" class="int-input" rows="2" placeholder="Brief response or error message…"></textarea>
          <div class="int-modal-actions">
            <button class="int-btn-secondary" onclick="IntegrationServices.closeModal('int-req-modal')">Cancel</button>
            <button class="int-btn-primary" onclick="IntegrationServices.saveReqLog()">Save</button>
          </div>
        </div>
      </div>`;
    _fetchReqLog('all');
  }

  async function _fetchReqLog(filter) {
    const list = document.getElementById('int-req-list');
    if (!list || !_db) { if(list) list.innerHTML = _noFirebase(); return; }
    try {
      let snap = await _db.collection('integration_logs').orderBy('timestamp','desc').limit(200).get();
      let docs = snap.docs.map(d=>({id:d.id,...d.data()}));
      if (filter!=='all') docs = docs.filter(d=>(d.integration||'').toLowerCase().includes(filter));
      if (!docs.length) { list.innerHTML='<p class="int-empty">No request logs yet.</p>'; return; }
      list.innerHTML=`<table class="int-table">
        <thead><tr><th>Time</th><th>Integration</th><th>Action</th><th>Status</th><th>Response</th></tr></thead>
        <tbody>${docs.map(d=>`<tr>
          <td class="int-mono">${_fmtDate(d.timestamp)}</td>
          <td>${_esc(d.integration||'—')}</td>
          <td>${_esc(d.action||'—')}</td>
          <td><span class="int-badge int-badge-${d.status==='success'?'active':d.status==='failure'?'blacklisted':'pending'}">${d.status||'—'}</span></td>
          <td>${_esc(d.response||'—')}</td>
        </tr>`).join('')}</tbody></table>`;
    } catch(e) { list.innerHTML=`<p class="int-error">${e.message}</p>`; }
  }

  window.IntegrationServices.filterReqLog = (v) => _fetchReqLog(v);
  window.IntegrationServices.logManualRequest = () => document.getElementById('int-req-modal').style.display='flex';
  window.IntegrationServices.saveReqLog = async () => {
    const integration=document.getElementById('int-req-integration').value;
    const action=document.getElementById('int-req-action').value.trim();
    const status=document.getElementById('int-req-status').value;
    const response=document.getElementById('int-req-response').value.trim();
    if(!action){_toast('Action required.');return;}
    if(_db){
      await _db.collection('integration_logs').add({integration,action,status,response,timestamp:firebase.firestore.FieldValue.serverTimestamp(),source:'manual'});
      await _integrationAudit('request_logged',`${integration}: ${action} → ${status}`);
    }
    window.IntegrationServices.closeModal('int-req-modal');
    _fetchReqLog('all');
    _toast('Request logged.');
  };

  /* ══════════════════════════════════════════════════════
     SECTION 5 — INTEGRATION AUDIT
  ══════════════════════════════════════════════════════ */
  function _renderAudit() {
    const body = document.getElementById('int-body');
    if (!body) return;
    body.innerHTML = `
      <div class="int-section">
        <div class="int-section-hdr">
          <h3>📜 Integration Audit Trail</h3>
          <button class="int-btn-secondary" onclick="IntegrationServices.clearOldAudit()">Clear Old (30d+)</button>
        </div>
        <div id="int-audit-list" class="int-table-wrap"><div class="int-loading">Loading…</div></div>
      </div>`;
    _fetchAuditTrail();
  }

  async function _fetchAuditTrail() {
    const list=document.getElementById('int-audit-list');
    if(!list||!_db){if(list)list.innerHTML=_noFirebase();return;}
    try{
      const snap=await _db.collection('integration_audit').orderBy('timestamp','desc').limit(200).get();
      const docs=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(!docs.length){list.innerHTML='<p class="int-empty">No audit records yet. Run a health check to generate the first entry.</p>';return;}
      list.innerHTML=`<table class="int-table">
        <thead><tr><th>Time</th><th>Event</th><th>Detail</th></tr></thead>
        <tbody>${docs.map(d=>`<tr>
          <td class="int-mono">${_fmtDate(d.timestamp)}</td>
          <td>${_esc(d.event||'—')}</td>
          <td>${_esc(d.detail||'—')}</td>
        </tr>`).join('')}</tbody></table>`;
    }catch(e){list.innerHTML=`<p class="int-error">${e.message}</p>`;}
  }

  window.IntegrationServices.clearOldAudit=async()=>{
    if(!_db||!confirm('Delete integration audit records older than 30 days?'))return;
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
    const snap=await _db.collection('integration_audit').where('timestamp','<',cutoff).get();
    const batch=_db.batch();snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
    _fetchAuditTrail();
    _toast(`${snap.size} records cleared.`);
  };

  /* ── Internal: Audit Writer ───────────────────────── */
  async function _integrationAudit(event, detail) {
    if (!_db) return;
    try { await _db.collection('integration_audit').add({ event, detail, timestamp: firebase.firestore.FieldValue.serverTimestamp() }); }
    catch(e) { console.warn('Int audit:', e); }
  }

  /* ── Shared Modal Close ───────────────────────────── */
  window.IntegrationServices.closeModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  };

  /* ── Expose ───────────────────────────────────────── */
  window.IntegrationServices.init = init;
  window.IntegrationServices.loadSection = loadSection;

  /* ── Helpers ──────────────────────────────────────── */
  function _esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function _fmtDate(ts){ if(!ts)return'—';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  function _noFirebase(){ return'<p class="int-empty">Firestore not available in this session.</p>'; }
  function _toast(msg){ if(typeof showToast==='function'){showToast(msg);}else{const t=document.createElement('div');t.className='ds-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);} }

  /* ── Styles ───────────────────────────────────────── */
  function _styleInject() {
    if (document.getElementById('int-styles')) return;
    const s = document.createElement('style');
    s.id = 'int-styles';
    s.textContent = `
      .int-wrap{padding:24px;max-width:1200px;margin:0 auto;}
      .int-header{margin-bottom:20px;}
      .int-title{font-size:1.6rem;font-weight:700;color:#4a1060;margin:0 0 4px;}
      .int-sub{color:#888;font-size:.9rem;margin:0;}
      .int-nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;border-bottom:2px solid #f0e6f6;padding-bottom:16px;}
      .int-nav-btn{padding:8px 16px;border:1px solid #d4a800;border-radius:20px;background:#fff;color:#4a1060;font-size:.85rem;cursor:pointer;transition:all .2s;}
      .int-nav-btn:hover,.int-nav-btn.active{background:#4a1060;color:#fff;border-color:#4a1060;}
      .int-section{animation:fadeIn .3s ease;}
      .int-section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
      .int-section-hdr h3{margin:0;font-size:1.2rem;color:#4a1060;}
      .int-loading{color:#888;padding:24px;text-align:center;font-style:italic;}
      .int-note{color:#888;font-size:.84rem;margin:0 0 16px;padding:10px 14px;background:#faf6ff;border-left:3px solid #d4a800;border-radius:4px;}
      .int-btn-primary{background:#4a1060;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:.85rem;font-weight:600;}
      .int-btn-primary:hover{background:#6a1890;}
      .int-btn-secondary{background:#f0e6f6;color:#4a1060;border:1px solid #d4a800;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.85rem;}
      .int-badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:.75rem;font-weight:600;}
      .int-badge-active{background:#d4edda;color:#155724;}
      .int-badge-blacklisted{background:#f8d7da;color:#721c24;}
      .int-badge-pending{background:#fff3cd;color:#856404;}
      .int-reg-badges{display:flex;gap:8px;}
      .int-reg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:16px;}
      .int-reg-card{background:#faf6ff;border:1px solid #e8d5f5;border-radius:10px;padding:16px;}
      .int-reg-blacklisted{background:#fff5f5;border-color:#f5c6cb;opacity:.8;}
      .int-reg-card-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
      .int-reg-name{font-weight:700;color:#4a1060;font-size:.95rem;}
      .int-reg-meta{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
      .int-meta-tag{font-size:.75rem;background:#f0e6f6;color:#4a1060;padding:2px 8px;border-radius:10px;}
      .int-reg-desc{font-size:.84rem;color:#444;line-height:1.5;margin:0 0 8px;}
      .int-reg-endpoints{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;}
      .int-endpoint{font-size:.78rem;background:#2d1b36;color:#f0e6f6;padding:2px 8px;border-radius:4px;}
      .int-reg-sla{font-size:.75rem;color:#888;}
      .int-reg-footer{background:#faf6ff;border:1px dashed #d4a800;border-radius:8px;padding:12px 16px;margin-top:8px;}
      .int-reg-footer p{margin:0;font-size:.82rem;color:#666;}
      .int-health-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:12px;}
      .int-health-summary{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#faf6ff;border:2px solid #e8d5f5;border-radius:10px;padding:20px;}
      .int-health-score{font-size:2.2rem;font-weight:700;}
      .int-score-green{color:#155724;}.int-score-amber{color:#856404;}.int-score-red{color:#721c24;}
      .int-health-score-lbl{font-size:.8rem;color:#888;margin-top:4px;}
      .int-health-card{display:flex;align-items:center;gap:12px;padding:14px;border-radius:10px;border:1px solid #e8d5f5;}
      .int-health-ok{background:#f0fff4;border-color:#c3e6cb;}
      .int-health-fail{background:#fff5f5;border-color:#f5c6cb;}
      .int-health-icon{font-size:1.4rem;}
      .int-health-name{font-weight:600;font-size:.9rem;color:#333;}
      .int-health-status{font-size:.78rem;color:#666;margin-top:2px;}
      .int-health-ts{font-size:.78rem;color:#aaa;text-align:right;margin-top:4px;}
      .int-contract-list{display:flex;flex-direction:column;gap:12px;}
      .int-contract-card{background:#faf6ff;border:1px solid #e8d5f5;border-radius:10px;padding:16px;}
      .int-contract-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;}
      .int-contract-name{font-weight:700;color:#4a1060;font-size:.95rem;}
      .int-contract-meta{display:flex;align-items:center;gap:8px;}
      .int-contract-text{font-size:.84rem;color:#555;margin:0;line-height:1.6;}
      .int-filter-row{margin-bottom:12px;}
      .int-select{padding:6px 12px;border:1px solid #d4a800;border-radius:6px;background:#fff;color:#333;font-size:.85rem;}
      .int-table-wrap{overflow-x:auto;}
      .int-table{width:100%;border-collapse:collapse;font-size:.88rem;}
      .int-table thead tr{background:#4a1060;color:#fff;}
      .int-table th{padding:10px 12px;text-align:left;font-weight:600;}
      .int-table td{padding:9px 12px;border-bottom:1px solid #f0e6f6;}
      .int-table tbody tr:hover{background:#faf6ff;}
      .int-mono{font-family:monospace;font-size:.82rem;}
      .int-empty{color:#888;padding:24px;text-align:center;font-style:italic;}
      .int-error{color:#c00;padding:12px;}
      .int-input{width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:.9rem;box-sizing:border-box;margin-bottom:10px;font-family:inherit;}
      .int-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;}
      .int-modal-box{background:#fff;border-radius:12px;padding:28px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(74,16,96,.25);}
      .int-modal-box h4{margin:0 0 18px;color:#4a1060;}
      .int-modal-box label{display:block;font-size:.82rem;font-weight:600;color:#555;margin-bottom:4px;}
      .int-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px;}
      @media(max-width:600px){.int-reg-grid{grid-template-columns:1fr;}.int-health-grid{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(s);
  }

  return { init, loadSection };
})();
