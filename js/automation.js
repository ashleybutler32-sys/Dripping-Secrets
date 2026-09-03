/* ============================================================
   DRIPPING SECRETS — BK-18 Automation & Workflow Engine
   js/automation.js  |  v16.7  |  2026-07-07
   Governs: workflow orchestration, rule execution, trigger
   evaluation, scheduling, automation audit trail.
   No external BPM/orchestration frameworks — Firebase only.
   ============================================================ */

'use strict';

// ── Constants ──────────────────────────────────────────────
const DS_AUTO_VERSION = '1.0.0';

const TRIGGER_TYPES = {
  order_placed:       { label: 'New Order Placed',         icon: '🛍️' },
  order_cancelled:    { label: 'Order Cancelled',           icon: '❌' },
  low_stock:          { label: 'Low Stock Alert',           icon: '📦' },
  out_of_stock:       { label: 'Out of Stock',              icon: '🚫' },
  new_customer:       { label: 'New Customer Registered',   icon: '👤' },
  document_signed:    { label: 'Document Signed',           icon: '✍️' },
  sk_request:         { label: 'SK Request Submitted',      icon: '📋' },
  scheduled_daily:    { label: 'Scheduled — Daily',         icon: '🕐' },
  scheduled_weekly:   { label: 'Scheduled — Weekly',        icon: '📅' },
  scheduled_monthly:  { label: 'Scheduled — Monthly',       icon: '🗓️' },
  manual:             { label: 'Manual Trigger',            icon: '▶️' },
};

const CONDITION_FIELDS = {
  order_total:    { label: 'Order Total ($)',     type: 'number' },
  product_name:   { label: 'Product Name',        type: 'text'   },
  stock_qty:      { label: 'Stock Quantity',      type: 'number' },
  customer_email: { label: 'Customer Email',      type: 'text'   },
  sk_name:        { label: 'SK Name',             type: 'text'   },
  any:            { label: '(No condition)',       type: 'none'   },
};

const CONDITION_OPS = ['equals', 'not equals', 'contains', 'greater than', 'less than'];

const ACTION_TYPES = {
  send_notification: { label: 'Send In-App Notification',  icon: '🔔' },
  send_email:        { label: 'Send Email Alert',           icon: '📧' },
  post_announcement: { label: 'Post Announcement',          icon: '📢' },
  flag_order:        { label: 'Flag Order for Review',      icon: '🚩' },
  stock_alert:       { label: 'Trigger Stock Alert',        icon: '📦' },
  log_event:         { label: 'Log Event to Audit Trail',   icon: '📝' },
};

// ── State ──────────────────────────────────────────────────
let _autoInit   = false;
let _autoRules  = [];
let _autoLogs   = [];
let _listeners  = [];

// ── Firestore Helpers ──────────────────────────────────────
function autoDb() {
  return window.db || (window.firebase?.apps?.length ? firebase.firestore() : null);
}

function autoCol(name) {
  const db = autoDb();
  if (!db) return null;
  return db.collection(name);
}

async function autoLog(entry) {
  try {
    const col = autoCol('automation_logs');
    if (!col) return;
    await col.add({
      ...entry,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.warn('[DS-AUTO] log error', e);
  }
}

// ── Rule CRUD ──────────────────────────────────────────────
async function autoLoadRules() {
  const col = autoCol('automation_rules');
  if (!col) { _autoRules = []; return; }
  const snap = await col.orderBy('createdAt', 'desc').get();
  _autoRules = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function autoSaveRule(rule) {
  const col = autoCol('automation_rules');
  if (!col) return null;
  const payload = {
    ...rule,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (rule.id) {
    await col.doc(rule.id).set(payload, { merge: true });
    return rule.id;
  } else {
    payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    const ref = await col.add(payload);
    return ref.id;
  }
}

async function autoDeleteRule(id) {
  const col = autoCol('automation_rules');
  if (!col) return;
  await col.doc(id).delete();
}

async function autoToggleRule(id, enabled) {
  const col = autoCol('automation_rules');
  if (!col) return;
  await col.doc(id).update({ enabled, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

// ── Action Executor ────────────────────────────────────────
async function autoExecuteAction(rule, contextData = {}) {
  const { action, actionConfig } = rule;
  try {
    switch (action) {
      case 'send_notification': {
        const col = autoCol('notifications');
        if (col) {
          await col.add({
            title: actionConfig.notifTitle || 'Automation Alert',
            message: actionConfig.notifBody || `Rule "${rule.name}" fired.`,
            type: 'automation',
            read: false,
            ts: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      case 'send_email': {
        if (window.emailjs) {
          await emailjs.send('service_kkp11nt', 'template_nbiinbo', {
            to_email: actionConfig.emailTo || 'management@drippingsecrets.com',
            subject: actionConfig.emailSubject || `DS Automation: ${rule.name}`,
            message: actionConfig.emailBody || `Automation rule "${rule.name}" triggered.\n\nContext: ${JSON.stringify(contextData, null, 2)}`,
          });
        }
        break;
      }
      case 'post_announcement': {
        const col = autoCol('sk_announcements');
        if (col) {
          await col.add({
            title: actionConfig.announcTitle || `Automation: ${rule.name}`,
            body: actionConfig.announcBody || `Rule "${rule.name}" fired at ${new Date().toLocaleString()}.`,
            priority: actionConfig.announcPriority || 'normal',
            pinned: false,
            author: 'System Automation',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      case 'flag_order': {
        if (contextData.orderId) {
          const col = autoCol('orders');
          if (col) {
            await col.doc(contextData.orderId).update({
              flagged: true,
              flagReason: actionConfig.flagReason || `Flagged by automation rule: ${rule.name}`,
              flaggedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }
      case 'stock_alert': {
        const col = autoCol('notifications');
        if (col) {
          await col.add({
            title: '⚠️ Stock Alert',
            message: actionConfig.stockMsg || `Stock alert triggered by rule "${rule.name}".`,
            type: 'stock',
            read: false,
            ts: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;
      }
      case 'log_event': {
        // Just falls through to the audit log below
        break;
      }
    }

    await autoLog({
      ruleId:   rule.id,
      ruleName: rule.name,
      trigger:  rule.trigger,
      action:   rule.action,
      status:   'success',
      context:  contextData,
    });

  } catch (err) {
    console.error('[DS-AUTO] action execute error', err);
    await autoLog({
      ruleId:   rule.id,
      ruleName: rule.name,
      trigger:  rule.trigger,
      action:   rule.action,
      status:   'error',
      error:    err.message,
      context:  contextData,
    });
  }
}

// ── Condition Evaluator ────────────────────────────────────
function autoEvalCondition(rule, contextData) {
  const { conditionField, conditionOp, conditionValue } = rule;
  if (!conditionField || conditionField === 'any') return true;

  const actual = String(contextData[conditionField] ?? '').toLowerCase();
  const expected = String(conditionValue ?? '').toLowerCase();

  switch (conditionOp) {
    case 'equals':       return actual === expected;
    case 'not equals':   return actual !== expected;
    case 'contains':     return actual.includes(expected);
    case 'greater than': return parseFloat(actual) > parseFloat(expected);
    case 'less than':    return parseFloat(actual) < parseFloat(expected);
    default:             return true;
  }
}

// ── Public Trigger Dispatcher ──────────────────────────────
window.dsAutoFireTrigger = async function(triggerType, contextData = {}) {
  if (!_autoInit) return;
  const activeRules = _autoRules.filter(r => r.enabled && r.trigger === triggerType);
  for (const rule of activeRules) {
    if (autoEvalCondition(rule, contextData)) {
      await autoExecuteAction(rule, contextData);
    }
  }
};

// ── Scheduler (Simulated Daily/Weekly/Monthly) ─────────────
function autoStartScheduler() {
  // Fires on page load — checks if scheduled rules are due
  const now = new Date();
  const col = autoCol('automation_schedule_state');
  if (!col) return;

  ['scheduled_daily', 'scheduled_weekly', 'scheduled_monthly'].forEach(async type => {
    const activeRules = _autoRules.filter(r => r.enabled && r.trigger === type);
    if (!activeRules.length) return;

    const stateRef = col.doc(type);
    const stateSnap = await stateRef.get();
    const last = stateSnap.exists ? stateSnap.data().lastFired?.toDate?.() : null;

    let isDue = false;
    if (!last) {
      isDue = true;
    } else {
      const hoursSince = (now - last) / 36e5;
      if (type === 'scheduled_daily'   && hoursSince >= 20) isDue = true;
      if (type === 'scheduled_weekly'  && hoursSince >= 160) isDue = true;
      if (type === 'scheduled_monthly' && hoursSince >= 700) isDue = true;
    }

    if (isDue) {
      for (const rule of activeRules) {
        await autoExecuteAction(rule, { scheduledAt: now.toISOString() });
      }
      await stateRef.set({ lastFired: firebase.firestore.FieldValue.serverTimestamp() });
    }
  });
}

// ── Log Loader ─────────────────────────────────────────────
async function autoLoadLogs(limit = 50) {
  const col = autoCol('automation_logs');
  if (!col) { _autoLogs = []; return; }
  const snap = await col.orderBy('ts', 'desc').limit(limit).get();
  _autoLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── UI Helpers ─────────────────────────────────────────────
function autoTs(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function autoStatusPill(status) {
  const map = { success: '#10b981', error: '#ef4444', running: '#f59e0b', skipped: '#6b7280' };
  const color = map[status] || '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:.72rem;font-weight:600;background:${color}22;color:${color}">${status}</span>`;
}

// ── Rule Form Modal ────────────────────────────────────────
function autoOpenRuleModal(existingRule = null) {
  const isEdit = !!existingRule;
  const r = existingRule || {};

  const triggerOpts = Object.entries(TRIGGER_TYPES).map(([k, v]) =>
    `<option value="${k}" ${r.trigger === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`
  ).join('');

  const condFieldOpts = Object.entries(CONDITION_FIELDS).map(([k, v]) =>
    `<option value="${k}" ${r.conditionField === k ? 'selected' : ''}>${v.label}</option>`
  ).join('');

  const condOpOpts = CONDITION_OPS.map(op =>
    `<option value="${op}" ${r.conditionOp === op ? 'selected' : ''}>${op}</option>`
  ).join('');

  const actionOpts = Object.entries(ACTION_TYPES).map(([k, v]) =>
    `<option value="${k}" ${r.action === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`
  ).join('');

  const modal = document.createElement('div');
  modal.id = 'auto-rule-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px`;
  modal.innerHTML = `
    <div style="background:#1a0a2e;border:1px solid #7c3aed;border-radius:12px;padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto">
      <h3 style="color:#f5d060;margin:0 0 20px;font-size:1.1rem">${isEdit ? '✏️ Edit Automation Rule' : '➕ New Automation Rule'}</h3>

      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Rule Name</label>
      <input id="auto-f-name" value="${r.name || ''}" placeholder="e.g. Low Stock Notification" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:14px">

      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Trigger</label>
      <select id="auto-f-trigger" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:14px">
        ${triggerOpts}
      </select>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div>
          <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Condition Field</label>
          <select id="auto-f-cfield" style="width:100%;padding:8px 6px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.82rem">${condFieldOpts}</select>
        </div>
        <div>
          <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Operator</label>
          <select id="auto-f-cop" style="width:100%;padding:8px 6px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.82rem">${condOpOpts}</select>
        </div>
        <div>
          <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Value</label>
          <input id="auto-f-cval" value="${r.conditionValue || ''}" placeholder="e.g. 5" style="width:100%;padding:8px 6px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.82rem;box-sizing:border-box">
        </div>
      </div>

      <label style="color:#d8b4fe;font-size:.82rem;display:block;margin-bottom:4px">Action</label>
      <select id="auto-f-action" onchange="autoUpdateActionConfig()" style="width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.9rem;box-sizing:border-box;margin-bottom:14px">
        ${actionOpts}
      </select>

      <div id="auto-f-action-config" style="margin-bottom:14px"></div>

      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px">
        <button onclick="document.getElementById('auto-rule-modal')?.remove()" style="padding:8px 18px;background:transparent;border:1px solid #6b7280;border-radius:6px;color:#9ca3af;cursor:pointer">Cancel</button>
        <button onclick="autoTestRule()" style="padding:8px 18px;background:#1e3a5f;border:1px solid #3b82f6;border-radius:6px;color:#93c5fd;cursor:pointer">▶ Test</button>
        <button onclick="autoSubmitRule('${r.id || ''}')" style="padding:8px 22px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border:none;border-radius:6px;color:#fff;cursor:pointer;font-weight:600">${isEdit ? 'Save Changes' : 'Create Rule'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  window.autoUpdateActionConfig();
}

window.autoUpdateActionConfig = function() {
  const action = document.getElementById('auto-f-action')?.value;
  const container = document.getElementById('auto-f-action-config');
  if (!container) return;

  const fieldStyle = `width:100%;padding:8px 10px;background:#2d1b4e;border:1px solid #4c1d95;border-radius:6px;color:#f3f4f6;font-size:.85rem;box-sizing:border-box;margin-bottom:8px`;
  const labelStyle = `color:#d8b4fe;font-size:.8rem;display:block;margin-bottom:3px`;

  let html = '';
  switch (action) {
    case 'send_notification':
      html = `
        <label style="${labelStyle}">Notification Title</label>
        <input id="cfg-notifTitle" placeholder="Alert title" style="${fieldStyle}">
        <label style="${labelStyle}">Notification Body</label>
        <input id="cfg-notifBody" placeholder="Message body" style="${fieldStyle}">
      `;
      break;
    case 'send_email':
      html = `
        <label style="${labelStyle}">Recipient Email</label>
        <input id="cfg-emailTo" value="management@drippingsecrets.com" style="${fieldStyle}">
        <label style="${labelStyle}">Subject</label>
        <input id="cfg-emailSubject" placeholder="Email subject" style="${fieldStyle}">
        <label style="${labelStyle}">Body</label>
        <textarea id="cfg-emailBody" placeholder="Email body..." rows="3" style="${fieldStyle}"></textarea>
      `;
      break;
    case 'post_announcement':
      html = `
        <label style="${labelStyle}">Announcement Title</label>
        <input id="cfg-announcTitle" placeholder="Announcement title" style="${fieldStyle}">
        <label style="${labelStyle}">Body</label>
        <textarea id="cfg-announcBody" placeholder="Announcement content..." rows="2" style="${fieldStyle}"></textarea>
        <label style="${labelStyle}">Priority</label>
        <select id="cfg-announcPriority" style="${fieldStyle}">
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </select>
      `;
      break;
    case 'flag_order':
      html = `
        <label style="${labelStyle}">Flag Reason</label>
        <input id="cfg-flagReason" placeholder="Reason for flagging..." style="${fieldStyle}">
      `;
      break;
    case 'stock_alert':
      html = `
        <label style="${labelStyle}">Alert Message</label>
        <input id="cfg-stockMsg" placeholder="Stock alert message..." style="${fieldStyle}">
      `;
      break;
    case 'log_event':
      html = `<p style="color:#a78bfa;font-size:.82rem;margin:0">Event will be recorded in the Automation Audit Trail automatically.</p>`;
      break;
  }
  container.innerHTML = html;
};

function autoGatherActionConfig() {
  const action = document.getElementById('auto-f-action')?.value;
  const config = {};
  const get = id => document.getElementById(id)?.value || '';
  switch (action) {
    case 'send_notification': config.notifTitle = get('cfg-notifTitle'); config.notifBody = get('cfg-notifBody'); break;
    case 'send_email':        config.emailTo = get('cfg-emailTo'); config.emailSubject = get('cfg-emailSubject'); config.emailBody = get('cfg-emailBody'); break;
    case 'post_announcement': config.announcTitle = get('cfg-announcTitle'); config.announcBody = get('cfg-announcBody'); config.announcPriority = get('cfg-announcPriority'); break;
    case 'flag_order':        config.flagReason = get('cfg-flagReason'); break;
    case 'stock_alert':       config.stockMsg = get('cfg-stockMsg'); break;
  }
  return config;
}

window.autoTestRule = async function() {
  const name    = document.getElementById('auto-f-name')?.value || 'Test Rule';
  const trigger = document.getElementById('auto-f-trigger')?.value;
  const action  = document.getElementById('auto-f-action')?.value;
  const actionConfig = autoGatherActionConfig();
  const mockRule = { id: 'test', name, trigger, action, actionConfig, conditionField: 'any' };
  await autoExecuteAction(mockRule, { test: true });
  alert('✅ Test run complete — check Automation Log for result.');
};

window.autoSubmitRule = async function(existingId) {
  const name         = document.getElementById('auto-f-name')?.value?.trim();
  const trigger      = document.getElementById('auto-f-trigger')?.value;
  const condField    = document.getElementById('auto-f-cfield')?.value;
  const condOp       = document.getElementById('auto-f-cop')?.value;
  const condVal      = document.getElementById('auto-f-cval')?.value?.trim();
  const action       = document.getElementById('auto-f-action')?.value;
  const actionConfig = autoGatherActionConfig();

  if (!name) { alert('Rule name is required.'); return; }

  const rule = {
    name, trigger,
    conditionField: condField, conditionOp: condOp, conditionValue: condVal,
    action, actionConfig,
    enabled: true,
  };
  if (existingId) rule.id = existingId;

  await autoSaveRule(rule);
  document.getElementById('auto-rule-modal')?.remove();
  await autoLoadRules();
  autoRenderRules();
  autoRenderLog();
};

// ── Render Rules ───────────────────────────────────────────
function autoRenderRules() {
  const container = document.getElementById('auto-rules-list');
  if (!container) return;

  if (!_autoRules.length) {
    container.innerHTML = `<div style="text-align:center;color:#6b7280;padding:40px;font-size:.9rem">No automation rules yet. Create one to get started.</div>`;
    return;
  }

  container.innerHTML = _autoRules.map(r => {
    const trig = TRIGGER_TYPES[r.trigger] || { label: r.trigger, icon: '⚡' };
    const act  = ACTION_TYPES[r.action]  || { label: r.action, icon: '▶️' };
    const cond = r.conditionField && r.conditionField !== 'any'
      ? `<span style="color:#a78bfa;font-size:.78rem">${r.conditionField} ${r.conditionOp} "${r.conditionValue}"</span>`
      : `<span style="color:#6b7280;font-size:.78rem">No condition</span>`;
    const toggleColor = r.enabled ? '#10b981' : '#6b7280';
    const toggleLabel = r.enabled ? 'Enabled' : 'Disabled';

    return `
      <div style="background:#1a0a2e;border:1px solid ${r.enabled ? '#4c1d95' : '#374151'};border-radius:10px;padding:16px;display:flex;gap:14px;align-items:flex-start">
        <div style="font-size:1.4rem;margin-top:2px">${trig.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;color:#f3f4f6;font-size:.95rem;margin-bottom:4px">${r.name}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px">
            <span style="background:#2d1b4e;color:#d8b4fe;font-size:.75rem;padding:2px 8px;border-radius:20px">${trig.label}</span>
            <span style="color:#6b7280;font-size:.75rem">→</span>
            <span style="background:#1a2e1a;color:#86efac;font-size:.75rem;padding:2px 8px;border-radius:20px">${act.icon} ${act.label}</span>
          </div>
          ${cond}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;flex-shrink:0">
          <span style="background:${toggleColor}22;color:${toggleColor};font-size:.72rem;padding:2px 8px;border-radius:20px;font-weight:600">${toggleLabel}</span>
          <div style="display:flex;gap:6px">
            <button onclick="autoToggleRuleUI('${r.id}',${!r.enabled})" style="padding:4px 10px;background:transparent;border:1px solid #4c1d95;border-radius:4px;color:#a78bfa;font-size:.75rem;cursor:pointer">${r.enabled ? 'Disable' : 'Enable'}</button>
            <button onclick="autoOpenRuleModal(${JSON.stringify(r).replace(/"/g, '&quot;')})" style="padding:4px 10px;background:transparent;border:1px solid #3b82f6;border-radius:4px;color:#93c5fd;font-size:.75rem;cursor:pointer">Edit</button>
            <button onclick="autoDeleteRuleUI('${r.id}')" style="padding:4px 10px;background:transparent;border:1px solid #ef4444;border-radius:4px;color:#fca5a5;font-size:.75rem;cursor:pointer">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.autoToggleRuleUI = async function(id, enabled) {
  await autoToggleRule(id, enabled);
  await autoLoadRules();
  autoRenderRules();
};

window.autoDeleteRuleUI = async function(id) {
  if (!confirm('Delete this automation rule?')) return;
  await autoDeleteRule(id);
  await autoLoadRules();
  autoRenderRules();
};

// ── Render Log ─────────────────────────────────────────────
function autoRenderLog() {
  const container = document.getElementById('auto-log-list');
  if (!container) return;

  if (!_autoLogs.length) {
    container.innerHTML = `<div style="text-align:center;color:#6b7280;padding:40px;font-size:.9rem">No automation activity yet.</div>`;
    return;
  }

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:.82rem">
      <thead>
        <tr style="border-bottom:1px solid #4c1d95">
          <th style="text-align:left;padding:8px 10px;color:#a78bfa;font-weight:600">Time</th>
          <th style="text-align:left;padding:8px 10px;color:#a78bfa;font-weight:600">Rule</th>
          <th style="text-align:left;padding:8px 10px;color:#a78bfa;font-weight:600">Trigger</th>
          <th style="text-align:left;padding:8px 10px;color:#a78bfa;font-weight:600">Action</th>
          <th style="text-align:left;padding:8px 10px;color:#a78bfa;font-weight:600">Status</th>
        </tr>
      </thead>
      <tbody>
        ${_autoLogs.map((l, i) => `
          <tr style="border-bottom:1px solid #2d1b4e;background:${i % 2 === 0 ? 'transparent' : '#150826'}">
            <td style="padding:8px 10px;color:#9ca3af">${autoTs(l.ts)}</td>
            <td style="padding:8px 10px;color:#f3f4f6;font-weight:500">${l.ruleName || '—'}</td>
            <td style="padding:8px 10px;color:#d8b4fe">${TRIGGER_TYPES[l.trigger]?.label || l.trigger || '—'}</td>
            <td style="padding:8px 10px;color:#86efac">${ACTION_TYPES[l.action]?.label || l.action || '—'}</td>
            <td style="padding:8px 10px">${autoStatusPill(l.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── Main Init ──────────────────────────────────────────────
window.initAutomation = async function() {
  if (_autoInit) {
    autoRenderRules();
    autoRenderLog();
    return;
  }

  const container = document.getElementById('auto-inner');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h2 style="color:#f5d060;font-size:1.25rem;font-weight:700;margin:0">Automation Engine</h2>
        <p style="color:#9ca3af;font-size:.85rem;margin:4px 0 0">Build rules that automatically respond to platform events</p>
      </div>
      <button onclick="autoOpenRuleModal()" style="padding:9px 18px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border:none;border-radius:8px;color:#fff;font-weight:600;cursor:pointer;font-size:.9rem">+ New Rule</button>
    </div>

    <!-- Stats Row -->
    <div id="auto-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px"></div>

    <!-- Rules Section -->
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px;margin-bottom:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0">⚡ Automation Rules</h3>
        <button onclick="autoRefresh()" style="padding:5px 12px;background:transparent;border:1px solid #4c1d95;border-radius:6px;color:#a78bfa;font-size:.8rem;cursor:pointer">↻ Refresh</button>
      </div>
      <div id="auto-rules-list" style="display:flex;flex-direction:column;gap:10px">
        <div style="text-align:center;color:#6b7280;padding:30px;font-size:.9rem">Loading rules…</div>
      </div>
    </div>

    <!-- Log Section -->
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:12px;padding:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="color:#d8b4fe;font-size:.95rem;font-weight:600;margin:0">📝 Automation Audit Trail</h3>
        <button onclick="autoClearLog()" style="padding:5px 12px;background:transparent;border:1px solid #6b7280;border-radius:6px;color:#9ca3af;font-size:.8rem;cursor:pointer">Clear Log</button>
      </div>
      <div id="auto-log-list">
        <div style="text-align:center;color:#6b7280;padding:30px;font-size:.9rem">Loading log…</div>
      </div>
    </div>
  `;

  await autoLoadRules();
  await autoLoadLogs();
  autoRenderStats();
  autoRenderRules();
  autoRenderLog();
  autoStartScheduler();
  _autoInit = true;
};

function autoRenderStats() {
  const el = document.getElementById('auto-stats');
  if (!el) return;
  const total   = _autoRules.length;
  const active  = _autoRules.filter(r => r.enabled).length;
  const success = _autoLogs.filter(l => l.status === 'success').length;
  const errors  = _autoLogs.filter(l => l.status === 'error').length;

  const card = (val, label, color) => `
    <div style="background:#120823;border:1px solid #2d1b4e;border-radius:10px;padding:16px;text-align:center">
      <div style="font-size:1.6rem;font-weight:700;color:${color}">${val}</div>
      <div style="color:#9ca3af;font-size:.78rem;margin-top:4px">${label}</div>
    </div>
  `;
  el.innerHTML = [
    card(total,   'Total Rules',     '#f5d060'),
    card(active,  'Active Rules',    '#10b981'),
    card(success, 'Successful Runs', '#60a5fa'),
    card(errors,  'Errors',          '#f87171'),
  ].join('');
}

window.autoRefresh = async function() {
  await autoLoadRules();
  await autoLoadLogs();
  autoRenderStats();
  autoRenderRules();
  autoRenderLog();
};

window.autoClearLog = async function() {
  if (!confirm('Clear automation log? This cannot be undone.')) return;
  const col = autoCol('automation_logs');
  if (!col) return;
  const snap = await col.limit(200).get();
  const batch = autoDb().batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  _autoLogs = [];
  autoRenderLog();
};
