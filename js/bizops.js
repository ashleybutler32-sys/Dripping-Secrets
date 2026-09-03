/* ============================================================
   DRIPPING SECRETS — BUSINESS OPERATIONS ENGINE
   Sprint 4 · v17.0 · BK-Business Operations
   Scope: Finance records, approval queue, policy center,
          business records, operational compliance, audit log
   Firestore collections:
     biz_finance_records · biz_approvals · biz_policies
     biz_records · biz_compliance · biz_audit_log
   ============================================================ */

'use strict';

const BizOps = (() => {

  /* ── State ─────────────────────────────────────────────── */
  let _db = null;
  let _initialized = false;
  let _activeSection = 'finance';

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    if (_initialized) { _renderShell(); return; }
    _db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
    _initialized = true;
    _renderShell();
    _loadSection('finance');
  }

  /* ── Shell ─────────────────────────────────────────────── */
  function _renderShell() {
    const tab = document.getElementById('tab-bizops');
    if (!tab) return;
    tab.innerHTML = `
      <div class="bizops-wrap">
        <div class="bizops-header">
          <h2 class="bizops-title">💼 Business Operations</h2>
          <p class="bizops-sub">Finance · Approvals · Policy · Records · Compliance · Audit</p>
        </div>
        <div class="bizops-nav">
          ${_navBtn('finance','💰','Finance Records')}
          ${_navBtn('approvals','✅','Approval Queue')}
          ${_navBtn('policy','📋','Policy Center')}
          ${_navBtn('records','🗂️','Business Records')}
          ${_navBtn('compliance','🛡️','Compliance')}
          ${_navBtn('auditlog','📜','Audit Log')}
        </div>
        <div id="bizops-body" class="bizops-body"></div>
      </div>`;
    _styleInject();
    _setActiveNav('finance');
  }

  function _navBtn(id, icon, label) {
    return `<button class="bizops-nav-btn" id="bizops-nav-${id}" onclick="BizOps.loadSection('${id}')">${icon} ${label}</button>`;
  }

  /* ── Section Router ──────────────────────────────────── */
  function loadSection(sec) {
    _activeSection = sec;
    _setActiveNav(sec);
    _loadSection(sec);
  }

  function _setActiveNav(sec) {
    document.querySelectorAll('.bizops-nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`bizops-nav-${sec}`);
    if (btn) btn.classList.add('active');
  }

  function _loadSection(sec) {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `<div class="bizops-loading">Loading…</div>`;
    const map = { finance: _renderFinance, approvals: _renderApprovals, policy: _renderPolicy, records: _renderRecords, compliance: _renderCompliance, auditlog: _renderAuditLog };
    if (map[sec]) map[sec]();
  }

  /* ══════════════════════════════════════════════════════
     SECTION 1 — FINANCE RECORDS
  ══════════════════════════════════════════════════════ */
  function _renderFinance() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>💰 Finance Records</h3>
          <button class="biz-btn-primary" onclick="BizOps.openFinanceModal()">+ New Record</button>
        </div>
        <div class="biz-stats-row" id="biz-finance-stats">
          <div class="biz-stat-card"><div class="biz-stat-val" id="biz-fin-income">—</div><div class="biz-stat-lbl">Total Income</div></div>
          <div class="biz-stat-card"><div class="biz-stat-val" id="biz-fin-expense">—</div><div class="biz-stat-lbl">Total Expenses</div></div>
          <div class="biz-stat-card"><div class="biz-stat-val" id="biz-fin-net">—</div><div class="biz-stat-lbl">Net</div></div>
          <div class="biz-stat-card"><div class="biz-stat-val" id="biz-fin-count">—</div><div class="biz-stat-lbl">Records</div></div>
        </div>
        <div class="biz-filter-row">
          <select id="biz-fin-filter" onchange="BizOps.filterFinance(this.value)" class="biz-select">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="refund">Refund</option>
            <option value="commission">Commission</option>
          </select>
        </div>
        <div id="biz-finance-list" class="biz-table-wrap"><div class="bizops-loading">Loading records…</div></div>
      </div>
      <!-- Finance Modal -->
      <div id="biz-fin-modal" class="biz-modal" style="display:none">
        <div class="biz-modal-box">
          <h4>New Finance Record</h4>
          <label>Type</label>
          <select id="biz-fin-type" class="biz-input">
            <option>income</option><option>expense</option><option>refund</option><option>commission</option>
          </select>
          <label>Category</label>
          <input id="biz-fin-cat" class="biz-input" placeholder="e.g. Product Sales, Shipping, Marketing…"/>
          <label>Amount ($)</label>
          <input id="biz-fin-amount" class="biz-input" type="number" step="0.01" placeholder="0.00"/>
          <label>Description</label>
          <textarea id="biz-fin-desc" class="biz-input" rows="2" placeholder="Brief description…"></textarea>
          <label>Date</label>
          <input id="biz-fin-date" class="biz-input" type="date" value="${new Date().toISOString().split('T')[0]}"/>
          <div class="biz-modal-actions">
            <button class="biz-btn-secondary" onclick="BizOps.closeModal('biz-fin-modal')">Cancel</button>
            <button class="biz-btn-primary" onclick="BizOps.saveFinanceRecord()">Save Record</button>
          </div>
        </div>
      </div>`;
    _fetchFinanceRecords('all');
  }

  async function _fetchFinanceRecords(filter) {
    const list = document.getElementById('biz-finance-list');
    if (!list) return;
    if (!_db) { list.innerHTML = _noFirebase(); _updateFinStats([], filter); return; }
    try {
      const snap = await _db.collection('biz_finance_records').orderBy('date','desc').limit(200).get();
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const records = filter === 'all' ? all : all.filter(r => r.type === filter);
      _updateFinStats(all, filter);
      if (!records.length) { list.innerHTML = '<p class="biz-empty">No finance records yet. Add your first record above.</p>'; return; }
      list.innerHTML = `<table class="biz-table">
        <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead>
        <tbody>${records.map(r => `<tr>
          <td>${r.date || '—'}</td>
          <td><span class="biz-badge biz-badge-${r.type}">${r.type}</span></td>
          <td>${_esc(r.category||'—')}</td>
          <td>${_esc(r.description||'—')}</td>
          <td class="${r.type==='income'||r.type==='commission'?'biz-pos':'biz-neg'}">${r.type==='income'||r.type==='commission'?'+':'-'}$${parseFloat(r.amount||0).toFixed(2)}</td>
          <td><button class="biz-icon-btn" onclick="BizOps.deleteFinanceRecord('${r.id}')">🗑</button></td>
        </tr>`).join('')}</tbody></table>`;
    } catch(e) { list.innerHTML = `<p class="biz-error">Error: ${e.message}</p>`; }
  }

  function _updateFinStats(all, filter) {
    const income = all.filter(r=>r.type==='income'||r.type==='commission').reduce((s,r)=>s+parseFloat(r.amount||0),0);
    const expense = all.filter(r=>r.type==='expense'||r.type==='refund').reduce((s,r)=>s+parseFloat(r.amount||0),0);
    const records = filter==='all' ? all : all.filter(r=>r.type===filter);
    _setText('biz-fin-income',`$${income.toFixed(2)}`);
    _setText('biz-fin-expense',`$${expense.toFixed(2)}`);
    _setText('biz-fin-net',`$${(income-expense).toFixed(2)}`);
    _setText('biz-fin-count',records.length);
  }

  window.BizOps = window.BizOps || {};
  window.BizOps.filterFinance = (v) => _fetchFinanceRecords(v);

  window.BizOps.openFinanceModal = () => {
    document.getElementById('biz-fin-modal').style.display='flex';
  };

  window.BizOps.saveFinanceRecord = async () => {
    const type = document.getElementById('biz-fin-type').value;
    const category = document.getElementById('biz-fin-cat').value.trim();
    const amount = parseFloat(document.getElementById('biz-fin-amount').value)||0;
    const description = document.getElementById('biz-fin-desc').value.trim();
    const date = document.getElementById('biz-fin-date').value;
    if (!category||!amount) { _toast('Fill in category and amount.'); return; }
    if (_db) {
      await _db.collection('biz_finance_records').add({ type, category, amount, description, date, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      await _auditLog('finance_record_created',`${type}: $${amount} — ${category}`);
    }
    window.BizOps.closeModal('biz-fin-modal');
    _fetchFinanceRecords(document.getElementById('biz-fin-filter')?.value||'all');
    _toast('Finance record saved.');
  };

  window.BizOps.deleteFinanceRecord = async (id) => {
    if (!confirm('Delete this record?')) return;
    if (_db) { await _db.collection('biz_finance_records').doc(id).delete(); await _auditLog('finance_record_deleted',`ID: ${id}`); }
    _fetchFinanceRecords(document.getElementById('biz-fin-filter')?.value||'all');
    _toast('Record deleted.');
  };

  /* ══════════════════════════════════════════════════════
     SECTION 2 — APPROVAL QUEUE
  ══════════════════════════════════════════════════════ */
  function _renderApprovals() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>✅ Approval Queue</h3>
          <button class="biz-btn-primary" onclick="BizOps.openApprovalModal()">+ New Request</button>
        </div>
        <div class="biz-tab-pills">
          <button class="biz-pill active" onclick="BizOps.filterApprovals('pending',this)">Pending</button>
          <button class="biz-pill" onclick="BizOps.filterApprovals('approved',this)">Approved</button>
          <button class="biz-pill" onclick="BizOps.filterApprovals('denied',this)">Denied</button>
          <button class="biz-pill" onclick="BizOps.filterApprovals('all',this)">All</button>
        </div>
        <div id="biz-approvals-list" class="biz-table-wrap"><div class="bizops-loading">Loading…</div></div>
      </div>
      <div id="biz-approval-modal" class="biz-modal" style="display:none">
        <div class="biz-modal-box">
          <h4>New Approval Request</h4>
          <label>Request Type</label>
          <select id="biz-appr-type" class="biz-input">
            <option>Refund Authorization</option><option>Vendor Payment</option><option>Expense Approval</option>
            <option>Order Exception</option><option>Policy Exception</option><option>Other</option>
          </select>
          <label>Requestor</label>
          <input id="biz-appr-requestor" class="biz-input" placeholder="Name or system"/>
          <label>Amount ($) — if applicable</label>
          <input id="biz-appr-amount" class="biz-input" type="number" step="0.01" placeholder="0.00"/>
          <label>Justification</label>
          <textarea id="biz-appr-just" class="biz-input" rows="3" placeholder="Explain the request…"></textarea>
          <div class="biz-modal-actions">
            <button class="biz-btn-secondary" onclick="BizOps.closeModal('biz-approval-modal')">Cancel</button>
            <button class="biz-btn-primary" onclick="BizOps.saveApproval()">Submit Request</button>
          </div>
        </div>
      </div>`;
    _fetchApprovals('pending');
  }

  async function _fetchApprovals(status) {
    const list = document.getElementById('biz-approvals-list');
    if (!list) return;
    if (!_db) { list.innerHTML = _noFirebase(); return; }
    try {
      let q = _db.collection('biz_approvals').orderBy('createdAt','desc').limit(100);
      const snap = await q.get();
      let docs = snap.docs.map(d=>({id:d.id,...d.data()}));
      if (status!=='all') docs = docs.filter(d=>d.status===status);
      if (!docs.length) { list.innerHTML=`<p class="biz-empty">No ${status} requests.</p>`; return; }
      list.innerHTML=`<table class="biz-table">
        <thead><tr><th>Date</th><th>Type</th><th>Requestor</th><th>Amount</th><th>Justification</th><th>Status</th><th></th></tr></thead>
        <tbody>${docs.map(d=>`<tr>
          <td>${_fmtDate(d.createdAt)}</td>
          <td>${_esc(d.type||'—')}</td>
          <td>${_esc(d.requestor||'—')}</td>
          <td>${d.amount?`$${parseFloat(d.amount).toFixed(2)}`:'—'}</td>
          <td>${_esc(d.justification||'—')}</td>
          <td><span class="biz-badge biz-badge-${d.status||'pending'}">${d.status||'pending'}</span></td>
          <td class="biz-action-cell">
            ${d.status==='pending'?`
              <button class="biz-btn-xs biz-green" onclick="BizOps.resolveApproval('${d.id}','approved')">Approve</button>
              <button class="biz-btn-xs biz-red" onclick="BizOps.resolveApproval('${d.id}','denied')">Deny</button>`:
            `<button class="biz-icon-btn" onclick="BizOps.deleteApproval('${d.id}')">🗑</button>`}
          </td>
        </tr>`).join('')}</tbody></table>`;
    } catch(e) { list.innerHTML=`<p class="biz-error">${e.message}</p>`; }
  }

  window.BizOps.filterApprovals = (status, btn) => {
    document.querySelectorAll('.biz-pill').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    _fetchApprovals(status);
  };
  window.BizOps.openApprovalModal = () => document.getElementById('biz-approval-modal').style.display='flex';
  window.BizOps.saveApproval = async () => {
    const type = document.getElementById('biz-appr-type').value;
    const requestor = document.getElementById('biz-appr-requestor').value.trim()||'Admin';
    const amount = document.getElementById('biz-appr-amount').value;
    const justification = document.getElementById('biz-appr-just').value.trim();
    if (!justification) { _toast('Please provide justification.'); return; }
    if (_db) {
      await _db.collection('biz_approvals').add({ type, requestor, amount, justification, status:'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      await _auditLog('approval_submitted',`${type} by ${requestor}`);
    }
    window.BizOps.closeModal('biz-approval-modal');
    _fetchApprovals('pending');
    _toast('Approval request submitted.');
  };
  window.BizOps.resolveApproval = async (id, status) => {
    if (!_db) return;
    await _db.collection('biz_approvals').doc(id).update({ status, resolvedAt: firebase.firestore.FieldValue.serverTimestamp(), resolvedBy:'Ashley Butler' });
    await _auditLog('approval_resolved',`ID ${id} → ${status}`);
    _fetchApprovals('pending');
    _toast(`Request ${status}.`);
  };
  window.BizOps.deleteApproval = async (id) => {
    if (!confirm('Delete this record?')) return;
    if (_db) { await _db.collection('biz_approvals').doc(id).delete(); }
    _fetchApprovals('all');
    _toast('Deleted.');
  };

  /* ══════════════════════════════════════════════════════
     SECTION 3 — POLICY CENTER
  ══════════════════════════════════════════════════════ */
  function _renderPolicy() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>📋 Policy Center</h3>
          <button class="biz-btn-primary" onclick="BizOps.openPolicyModal()">+ New Policy</button>
        </div>
        <div id="biz-policy-list" class="biz-card-grid"><div class="bizops-loading">Loading policies…</div></div>
      </div>
      <div id="biz-policy-modal" class="biz-modal" style="display:none">
        <div class="biz-modal-box">
          <h4 id="biz-policy-modal-title">New Policy</h4>
          <input id="biz-policy-id-edit" type="hidden" value=""/>
          <label>Policy Name</label>
          <input id="biz-pol-name" class="biz-input" placeholder="e.g. Refund Policy, Shipping Policy…"/>
          <label>Category</label>
          <select id="biz-pol-cat" class="biz-input">
            <option>Operations</option><option>Finance</option><option>HR</option><option>Legal</option><option>Customer</option><option>Vendor</option>
          </select>
          <label>Status</label>
          <select id="biz-pol-status" class="biz-input">
            <option value="active">Active</option><option value="draft">Draft</option><option value="retired">Retired</option>
          </select>
          <label>Policy Text</label>
          <textarea id="biz-pol-text" class="biz-input" rows="5" placeholder="Enter policy details…"></textarea>
          <div class="biz-modal-actions">
            <button class="biz-btn-secondary" onclick="BizOps.closeModal('biz-policy-modal')">Cancel</button>
            <button class="biz-btn-primary" onclick="BizOps.savePolicy()">Save Policy</button>
          </div>
        </div>
      </div>`;
    _fetchPolicies();
  }

  async function _fetchPolicies() {
    const list = document.getElementById('biz-policy-list');
    if (!list) return;
    if (!_db) { list.innerHTML=_noFirebase(); return; }
    try {
      const snap = await _db.collection('biz_policies').orderBy('name').get();
      const docs = snap.docs.map(d=>({id:d.id,...d.data()}));
      if (!docs.length) {
        list.innerHTML=`<div class="biz-empty-card">No policies yet. Add your first business policy above.<br><br>
          <button class="biz-btn-primary" onclick="BizOps.seedPolicies()">Seed Default Policies</button></div>`;
        return;
      }
      list.innerHTML=docs.map(p=>`
        <div class="biz-policy-card">
          <div class="biz-policy-card-hdr">
            <span class="biz-policy-name">${_esc(p.name||'—')}</span>
            <span class="biz-badge biz-badge-${p.status||'draft'}">${p.status||'draft'}</span>
          </div>
          <div class="biz-policy-cat">📂 ${_esc(p.category||'—')}</div>
          <div class="biz-policy-text">${_esc(p.text||'—')}</div>
          <div class="biz-policy-actions">
            <button class="biz-btn-xs" onclick="BizOps.editPolicy('${p.id}','${_esc(p.name)}','${_esc(p.category)}','${_esc(p.status)}',\`${p.text?.replace(/`/g,"'")}\`)">Edit</button>
            <button class="biz-btn-xs biz-red" onclick="BizOps.deletePolicy('${p.id}')">Delete</button>
          </div>
        </div>`).join('');
    } catch(e) { list.innerHTML=`<p class="biz-error">${e.message}</p>`; }
  }

  window.BizOps.openPolicyModal = () => {
    document.getElementById('biz-policy-id-edit').value='';
    document.getElementById('biz-policy-modal-title').textContent='New Policy';
    document.getElementById('biz-pol-name').value='';
    document.getElementById('biz-pol-text').value='';
    document.getElementById('biz-policy-modal').style.display='flex';
  };
  window.BizOps.editPolicy = (id,name,cat,status,text) => {
    document.getElementById('biz-policy-id-edit').value=id;
    document.getElementById('biz-policy-modal-title').textContent='Edit Policy';
    document.getElementById('biz-pol-name').value=name;
    document.getElementById('biz-pol-cat').value=cat;
    document.getElementById('biz-pol-status').value=status;
    document.getElementById('biz-pol-text').value=text;
    document.getElementById('biz-policy-modal').style.display='flex';
  };
  window.BizOps.savePolicy = async () => {
    const id=document.getElementById('biz-policy-id-edit').value;
    const name=document.getElementById('biz-pol-name').value.trim();
    const category=document.getElementById('biz-pol-cat').value;
    const status=document.getElementById('biz-pol-status').value;
    const text=document.getElementById('biz-pol-text').value.trim();
    if(!name||!text){_toast('Name and policy text required.');return;}
    const data={name,category,status,text,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    if(_db){
      if(id){await _db.collection('biz_policies').doc(id).update(data);}
      else{await _db.collection('biz_policies').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp()});}
      await _auditLog('policy_saved',`${status}: ${name}`);
    }
    window.BizOps.closeModal('biz-policy-modal');
    _fetchPolicies();
    _toast('Policy saved.');
  };
  window.BizOps.deletePolicy = async (id) => {
    if(!confirm('Delete this policy?'))return;
    if(_db){await _db.collection('biz_policies').doc(id).delete();}
    _fetchPolicies();_toast('Deleted.');
  };
  window.BizOps.seedPolicies = async () => {
    if(!_db)return;
    const defaults=[
      {name:'Refund & Returns Policy',category:'Customer',status:'active',text:'All sales are final except where product arrived damaged or incorrect. Refund requests must be submitted within 7 days of delivery. Approved refunds are processed via the original payment method within 3–5 business days.'},
      {name:'Shipping & Delivery Policy',category:'Operations',status:'active',text:'Standard shipping: 7–10 business days. Same-day local delivery available for orders over $50 in the Dallas metro area. All orders ship blind — no supplier names on packaging.'},
      {name:'Payment Acceptance Policy',category:'Finance',status:'active',text:'Accepted payment methods: CashApp, PayPal, Apple Pay. No credit/debit card processing. No Venmo. Payment must clear before order fulfillment begins.'},
      {name:'Vendor Confidentiality Policy',category:'Vendor',status:'active',text:'Supplier and vendor names are never disclosed to customers. All shipments use blind shipping. Vendor agreements are confidential internal documents.'},
      {name:'Employee Access Policy',category:'HR',status:'active',text:'Employee portal access requires a valid Secret Keeper account. Vault PIN: configured in Back Office Settings. All employee actions are logged and auditable.'},
    ];
    for(const p of defaults){
      await _db.collection('biz_policies').add({...p,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
    await _auditLog('policies_seeded','5 default policies added');
    _fetchPolicies();_toast('Default policies loaded.');
  };

  /* ══════════════════════════════════════════════════════
     SECTION 4 — BUSINESS RECORDS
  ══════════════════════════════════════════════════════ */
  function _renderRecords() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>🗂️ Business Records</h3>
          <button class="biz-btn-primary" onclick="BizOps.openRecordModal()">+ New Record</button>
        </div>
        <div class="biz-filter-row">
          <select id="biz-rec-filter" onchange="BizOps.filterRecords(this.value)" class="biz-select">
            <option value="all">All Categories</option>
            <option value="contract">Contract</option>
            <option value="license">License</option>
            <option value="permit">Permit</option>
            <option value="agreement">Agreement</option>
            <option value="registration">Registration</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div id="biz-records-list" class="biz-table-wrap"><div class="bizops-loading">Loading records…</div></div>
      </div>
      <div id="biz-record-modal" class="biz-modal" style="display:none">
        <div class="biz-modal-box">
          <h4>New Business Record</h4>
          <label>Record Name</label>
          <input id="biz-rec-name" class="biz-input" placeholder="e.g. Texas Business License"/>
          <label>Category</label>
          <select id="biz-rec-cat" class="biz-input">
            <option>contract</option><option>license</option><option>permit</option><option>agreement</option><option>registration</option><option>other</option>
          </select>
          <label>Reference Number</label>
          <input id="biz-rec-ref" class="biz-input" placeholder="Document/reference number"/>
          <label>Expiration Date (if applicable)</label>
          <input id="biz-rec-exp" class="biz-input" type="date"/>
          <label>Status</label>
          <select id="biz-rec-status" class="biz-input">
            <option value="active">Active</option><option value="expired">Expired</option><option value="pending">Pending</option>
          </select>
          <label>Notes</label>
          <textarea id="biz-rec-notes" class="biz-input" rows="2" placeholder="Additional notes…"></textarea>
          <div class="biz-modal-actions">
            <button class="biz-btn-secondary" onclick="BizOps.closeModal('biz-record-modal')">Cancel</button>
            <button class="biz-btn-primary" onclick="BizOps.saveRecord()">Save Record</button>
          </div>
        </div>
      </div>`;
    _fetchRecords('all');
  }

  async function _fetchRecords(filter) {
    const list=document.getElementById('biz-records-list');
    if(!list||!_db){if(list)list.innerHTML=_noFirebase();return;}
    try{
      const snap=await _db.collection('biz_records').orderBy('name').get();
      let docs=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(filter!=='all')docs=docs.filter(d=>d.category===filter);
      if(!docs.length){list.innerHTML=`<p class="biz-empty">No records found.</p>`;return;}
      const today=new Date();
      list.innerHTML=`<table class="biz-table">
        <thead><tr><th>Record</th><th>Category</th><th>Reference</th><th>Expires</th><th>Status</th><th></th></tr></thead>
        <tbody>${docs.map(r=>{
          const exp=r.expiration?new Date(r.expiration):null;
          const expiring=exp&&(exp-today)<30*86400000&&exp>today;
          const expired=exp&&exp<today;
          return`<tr class="${expired?'biz-row-red':expiring?'biz-row-amber':''}">
            <td>${_esc(r.name||'—')}</td>
            <td>${_esc(r.category||'—')}</td>
            <td>${_esc(r.reference||'—')}</td>
            <td>${r.expiration||'N/A'}${expiring?' ⚠️':''}${expired?' 🔴 EXPIRED':''}</td>
            <td><span class="biz-badge biz-badge-${r.status||'active'}">${r.status||'active'}</span></td>
            <td><button class="biz-icon-btn" onclick="BizOps.deleteRecord('${r.id}')">🗑</button></td>
          </tr>`;
        }).join('')}</tbody></table>`;
    }catch(e){list.innerHTML=`<p class="biz-error">${e.message}</p>`;}
  }

  window.BizOps.filterRecords=(v)=>_fetchRecords(v);
  window.BizOps.openRecordModal=()=>document.getElementById('biz-record-modal').style.display='flex';
  window.BizOps.saveRecord=async()=>{
    const name=document.getElementById('biz-rec-name').value.trim();
    const category=document.getElementById('biz-rec-cat').value;
    const reference=document.getElementById('biz-rec-ref').value.trim();
    const expiration=document.getElementById('biz-rec-exp').value;
    const status=document.getElementById('biz-rec-status').value;
    const notes=document.getElementById('biz-rec-notes').value.trim();
    if(!name){_toast('Record name required.');return;}
    if(_db){
      await _db.collection('biz_records').add({name,category,reference,expiration,status,notes,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      await _auditLog('record_created',`${category}: ${name}`);
    }
    window.BizOps.closeModal('biz-record-modal');
    _fetchRecords(document.getElementById('biz-rec-filter')?.value||'all');
    _toast('Record saved.');
  };
  window.BizOps.deleteRecord=async(id)=>{
    if(!confirm('Delete?'))return;
    if(_db)await _db.collection('biz_records').doc(id).delete();
    _fetchRecords(document.getElementById('biz-rec-filter')?.value||'all');
    _toast('Deleted.');
  };

  /* ══════════════════════════════════════════════════════
     SECTION 5 — OPERATIONAL COMPLIANCE
  ══════════════════════════════════════════════════════ */
  function _renderCompliance() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    const checks = [
      { id:'privacy', label:'Privacy Policy published and current', domain:'Legal' },
      { id:'terms', label:'Terms of Service published and current', domain:'Legal' },
      { id:'payment', label:'Payment methods: CashApp + PayPal + Apple Pay only', domain:'Finance' },
      { id:'suppconf', label:'Supplier names not disclosed to customers', domain:'Operations' },
      { id:'blindship', label:'All orders ship blind (no supplier packaging)', domain:'Operations' },
      { id:'localdeliv', label:'Same-day delivery only for orders $50+ in Dallas', domain:'Operations' },
      { id:'employees', label:'Employee portal access requires Secret Keeper auth', domain:'HR' },
      { id:'audittrail', label:'All document signings create ESF audit records', domain:'Compliance' },
      { id:'firestore', label:'Firestore collections and rules configured', domain:'Tech' },
      { id:'swcache', label:'Service Worker cache version matches current build', domain:'Tech' },
      { id:'backupsnap', label:'Rollback snapshot created before last deployment', domain:'Operations' },
      { id:'changelog', label:'CHANGELOG.md updated with current version notes', domain:'Operations' },
    ];
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>🛡️ Operational Compliance</h3>
          <div id="biz-comp-score" class="biz-comp-score">—</div>
        </div>
        <p class="biz-sub-note">Check items off as you verify compliance. Status saves to Firestore.</p>
        <div id="biz-compliance-list" class="biz-comp-list">
          ${checks.map(c=>`
            <div class="biz-comp-item" id="biz-comp-item-${c.id}">
              <label class="biz-comp-check">
                <input type="checkbox" id="biz-chk-${c.id}" onchange="BizOps.saveComplianceCheck('${c.id}',this.checked)"/>
                <span class="biz-comp-label">${c.label}</span>
              </label>
              <span class="biz-comp-domain">${c.domain}</span>
            </div>`).join('')}
        </div>
      </div>`;
    _fetchComplianceState(checks);
  }

  async function _fetchComplianceState(checks) {
    if(!_db)return;
    try{
      const snap=await _db.collection('biz_compliance').get();
      const state={};
      snap.docs.forEach(d=>{state[d.id]=d.data().checked;});
      let checked=0;
      checks.forEach(c=>{
        const el=document.getElementById(`biz-chk-${c.id}`);
        if(el){el.checked=!!state[c.id];if(state[c.id])checked++;}
        const item=document.getElementById(`biz-comp-item-${c.id}`);
        if(item)item.classList.toggle('biz-comp-done',!!state[c.id]);
      });
      const score=Math.round((checked/checks.length)*100);
      const scoreEl=document.getElementById('biz-comp-score');
      if(scoreEl)scoreEl.innerHTML=`<span class="biz-score-num ${score>=80?'biz-green-text':score>=50?'biz-amber-text':'biz-red-text'}">${score}%</span> <span class="biz-score-lbl">Compliant</span>`;
    }catch(e){console.warn('Compliance fetch:',e);}
  }

  window.BizOps.saveComplianceCheck=async(id,checked)=>{
    const item=document.getElementById(`biz-comp-item-${id}`);
    if(item)item.classList.toggle('biz-comp-done',checked);
    if(_db){
      await _db.collection('biz_compliance').doc(id).set({checked,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      await _auditLog('compliance_check',`${id}: ${checked?'✅':'❌'}`);
    }
    const allChecks=document.querySelectorAll('.biz-comp-list input[type=checkbox]');
    const total=allChecks.length;
    const done=[...allChecks].filter(c=>c.checked).length;
    const score=Math.round((done/total)*100);
    const scoreEl=document.getElementById('biz-comp-score');
    if(scoreEl)scoreEl.innerHTML=`<span class="biz-score-num ${score>=80?'biz-green-text':score>=50?'biz-amber-text':'biz-red-text'}">${score}%</span> <span class="biz-score-lbl">Compliant</span>`;
  };

  /* ══════════════════════════════════════════════════════
     SECTION 6 — AUDIT LOG
  ══════════════════════════════════════════════════════ */
  function _renderAuditLog() {
    const body = document.getElementById('bizops-body');
    if (!body) return;
    body.innerHTML = `
      <div class="bizops-section">
        <div class="bizops-section-hdr">
          <h3>📜 Audit Log</h3>
          <button class="biz-btn-secondary" onclick="BizOps.clearOldAuditLogs()">Clear Old (30d+)</button>
        </div>
        <div id="biz-audit-list" class="biz-table-wrap"><div class="bizops-loading">Loading audit records…</div></div>
      </div>`;
    _fetchAuditLog();
  }

  async function _fetchAuditLog() {
    const list=document.getElementById('biz-audit-list');
    if(!list||!_db){if(list)list.innerHTML=_noFirebase();return;}
    try{
      const snap=await _db.collection('biz_audit_log').orderBy('timestamp','desc').limit(200).get();
      const docs=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(!docs.length){list.innerHTML='<p class="biz-empty">No audit records yet.</p>';return;}
      list.innerHTML=`<table class="biz-table">
        <thead><tr><th>Time</th><th>Action</th><th>Detail</th></tr></thead>
        <tbody>${docs.map(d=>`<tr>
          <td class="biz-mono">${_fmtDate(d.timestamp)}</td>
          <td>${_esc(d.action||'—')}</td>
          <td>${_esc(d.detail||'—')}</td>
        </tr>`).join('')}</tbody></table>`;
    }catch(e){list.innerHTML=`<p class="biz-error">${e.message}</p>`;}
  }

  window.BizOps.clearOldAuditLogs=async()=>{
    if(!_db||!confirm('Delete audit records older than 30 days?'))return;
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
    const snap=await _db.collection('biz_audit_log').where('timestamp','<',cutoff).get();
    const batch=_db.batch();
    snap.docs.forEach(d=>batch.delete(d.ref));
    await batch.commit();
    _fetchAuditLog();
    _toast(`${snap.size} old records removed.`);
  };

  /* ── Internal: Audit Writer ───────────────────────── */
  async function _auditLog(action, detail) {
    if (!_db) return;
    try {
      await _db.collection('biz_audit_log').add({ action, detail, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
    } catch(e) { console.warn('BizOps audit:', e); }
  }

  /* ── Shared Modal Close ───────────────────────────── */
  window.BizOps.closeModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  };

  /* ── Expose init ──────────────────────────────────── */
  window.BizOps.init = init;
  window.BizOps.loadSection = loadSection;

  /* ── Helpers ──────────────────────────────────────── */
  function _esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function _setText(id,v){ const el=document.getElementById(id);if(el)el.textContent=v; }
  function _fmtDate(ts){ if(!ts)return'—';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  function _noFirebase(){ return'<p class="biz-empty">Firestore not available in this session.</p>'; }
  function _toast(msg){ if(typeof showToast==='function'){showToast(msg);}else{const t=document.createElement('div');t.className='ds-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);} }

  /* ── Styles ───────────────────────────────────────── */
  function _styleInject() {
    if (document.getElementById('bizops-styles')) return;
    const s = document.createElement('style');
    s.id = 'bizops-styles';
    s.textContent = `
      .bizops-wrap{padding:24px;max-width:1200px;margin:0 auto;}
      .bizops-header{margin-bottom:20px;}
      .bizops-title{font-size:1.6rem;font-weight:700;color:#4a1060;margin:0 0 4px;}
      .bizops-sub{color:#888;font-size:.9rem;margin:0;}
      .bizops-nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;border-bottom:2px solid #f0e6f6;padding-bottom:16px;}
      .bizops-nav-btn{padding:8px 16px;border:1px solid #d4a800;border-radius:20px;background:#fff;color:#4a1060;font-size:.85rem;cursor:pointer;transition:all .2s;}
      .bizops-nav-btn:hover,.bizops-nav-btn.active{background:#4a1060;color:#fff;border-color:#4a1060;}
      .bizops-section{animation:fadeIn .3s ease;}
      .bizops-section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}
      .bizops-section-hdr h3{margin:0;font-size:1.2rem;color:#4a1060;}
      .bizops-loading{color:#888;padding:24px;text-align:center;font-style:italic;}
      .biz-btn-primary{background:#4a1060;color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:.85rem;font-weight:600;}
      .biz-btn-primary:hover{background:#6a1890;}
      .biz-btn-secondary{background:#f0e6f6;color:#4a1060;border:1px solid #d4a800;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.85rem;}
      .biz-btn-xs{padding:4px 10px;border:none;border-radius:4px;cursor:pointer;font-size:.78rem;background:#e8d5f5;color:#4a1060;}
      .biz-btn-xs.biz-green{background:#d4edda;color:#155724;}
      .biz-btn-xs.biz-red{background:#f8d7da;color:#721c24;}
      .biz-icon-btn{background:none;border:none;cursor:pointer;font-size:1rem;padding:2px 6px;}
      .biz-stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;}
      .biz-stat-card{background:#faf6ff;border:1px solid #e8d5f5;border-radius:10px;padding:16px;text-align:center;}
      .biz-stat-val{font-size:1.4rem;font-weight:700;color:#4a1060;}
      .biz-stat-lbl{font-size:.78rem;color:#888;margin-top:4px;}
      .biz-filter-row{margin-bottom:12px;}
      .biz-select{padding:6px 12px;border:1px solid #d4a800;border-radius:6px;background:#fff;color:#333;font-size:.85rem;}
      .biz-input{width:100%;padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:.9rem;box-sizing:border-box;margin-bottom:10px;font-family:inherit;}
      .biz-input:focus{outline:none;border-color:#4a1060;}
      .biz-table-wrap{overflow-x:auto;}
      .biz-table{width:100%;border-collapse:collapse;font-size:.88rem;}
      .biz-table thead tr{background:#4a1060;color:#fff;}
      .biz-table th{padding:10px 12px;text-align:left;font-weight:600;}
      .biz-table td{padding:9px 12px;border-bottom:1px solid #f0e6f6;}
      .biz-table tbody tr:hover{background:#faf6ff;}
      .biz-row-red td{background:#fff5f5;}
      .biz-row-amber td{background:#fffbf0;}
      .biz-pos{color:#155724;font-weight:600;}
      .biz-neg{color:#721c24;font-weight:600;}
      .biz-mono{font-family:monospace;font-size:.82rem;}
      .biz-empty{color:#888;padding:24px;text-align:center;font-style:italic;}
      .biz-error{color:#c00;padding:12px;}
      .biz-badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:.75rem;font-weight:600;}
      .biz-badge-income,.biz-badge-active,.biz-badge-approved{background:#d4edda;color:#155724;}
      .biz-badge-expense,.biz-badge-denied,.biz-badge-expired{background:#f8d7da;color:#721c24;}
      .biz-badge-pending,.biz-badge-draft{background:#fff3cd;color:#856404;}
      .biz-badge-refund,.biz-badge-retired{background:#e2e3e5;color:#383d41;}
      .biz-badge-commission{background:#cce5ff;color:#004085;}
      .biz-tab-pills{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
      .biz-pill{padding:6px 16px;border:1px solid #d4a800;border-radius:16px;background:#fff;color:#4a1060;font-size:.82rem;cursor:pointer;}
      .biz-pill.active{background:#4a1060;color:#fff;}
      .biz-action-cell{display:flex;gap:6px;align-items:center;}
      .biz-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;}
      .biz-modal-box{background:#fff;border-radius:12px;padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(74,16,96,.25);}
      .biz-modal-box h4{margin:0 0 18px;color:#4a1060;font-size:1.15rem;}
      .biz-modal-box label{display:block;font-size:.82rem;font-weight:600;color:#555;margin-bottom:4px;}
      .biz-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px;}
      .biz-card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
      .biz-policy-card{background:#faf6ff;border:1px solid #e8d5f5;border-radius:10px;padding:16px;}
      .biz-policy-card-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
      .biz-policy-name{font-weight:700;color:#4a1060;font-size:.95rem;}
      .biz-policy-cat{font-size:.78rem;color:#888;margin-bottom:8px;}
      .biz-policy-text{font-size:.84rem;color:#444;line-height:1.5;margin-bottom:12px;max-height:80px;overflow:hidden;}
      .biz-policy-actions{display:flex;gap:8px;}
      .biz-empty-card{background:#faf6ff;border:2px dashed #e8d5f5;border-radius:12px;padding:40px;text-align:center;color:#888;}
      .biz-sub-note{color:#888;font-size:.84rem;margin-bottom:16px;}
      .biz-comp-list{display:flex;flex-direction:column;gap:8px;}
      .biz-comp-item{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#faf6ff;border:1px solid #e8d5f5;border-radius:8px;transition:background .2s;}
      .biz-comp-item.biz-comp-done{background:#f0fff4;border-color:#c3e6cb;}
      .biz-comp-check{display:flex;align-items:center;gap:10px;cursor:pointer;flex:1;}
      .biz-comp-check input{width:18px;height:18px;cursor:pointer;accent-color:#4a1060;}
      .biz-comp-label{font-size:.9rem;color:#333;}
      .biz-comp-domain{font-size:.75rem;color:#888;background:#f0e6f6;padding:2px 10px;border-radius:10px;white-space:nowrap;margin-left:12px;}
      .biz-comp-score{font-size:1rem;text-align:right;}
      .biz-score-num{font-size:1.5rem;font-weight:700;}
      .biz-score-lbl{font-size:.8rem;color:#888;}
      .biz-green-text{color:#155724;}.biz-amber-text{color:#856404;}.biz-red-text{color:#721c24;}
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @media(max-width:600px){.bizops-nav-btn{font-size:.78rem;padding:6px 12px;}.biz-stats-row{grid-template-columns:repeat(2,1fr);}
        .biz-modal-box{padding:18px;margin:12px;}}
    `;
    document.head.appendChild(s);
  }

  return { init, loadSection };
})();
