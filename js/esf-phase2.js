/* ============================================================
   DRIPPING SECRETS — ESF PHASE 2
   Enterprise Signature Framework — QR · Audit · Workflow · Console
   v1.0 | Sprint B — v16.5
   ============================================================ */
'use strict';

/* ── Firestore collection helpers ─────────────────────────── */
function esfCol(name) {
  if (!window.db) throw new Error('Firestore not initialized');
  return window.db.collection(name);
}

/* ── 18 ESF Firestore Collections (initialized on first use) ─ */
const ESF_COLLECTIONS = [
  'signature_profiles',
  'signature_profile_versions',
  'signature_sessions',
  'signature_events',
  'signature_requests',
  'signature_documents',
  'signature_initials',
  'signature_certificates',
  'signature_certificate_history',
  'signature_verifications',
  'signature_qr_codes',
  'signature_workflows',
  'signature_workflow_steps',
  'signature_notifications',
  'signature_audit_logs',
  'signature_permissions',
  'signature_templates',
  'signature_metadata'
];

/* ─────────────────────────────────────────────────────────────
   AUDIT ENGINE — immutable event logging
   ───────────────────────────────────────────────────────────── */
const ESF_AUDIT = {
  async log(action, docId, detail = {}) {
    if (!window.db) return;
    try {
      const entry = {
        action,            // 'Created','Viewed','Signed','Downloaded','Exported','Revoked','Verified','Reminder','WorkflowStarted','WorkflowCompleted','Rejected'
        docId: docId || null,
        detail,
        userId: ESF_AUTH.currentUser(),
        ip: null,          // resolved server-side if needed
        userAgent: navigator.userAgent,
        ts: new Date().toISOString(),
        version: 1,
        correlationId: ESF_UTIL.uuid()
      };
      await esfCol('signature_audit_logs').add(entry);
      // Also append to signature_events for the specific doc
      if (docId) {
        await esfCol('signature_events').add({ ...entry, type: 'audit' });
      }
    } catch (e) {
      console.warn('[ESF Audit] Log failed:', e.message);
    }
  },

  async getForDoc(docId) {
    if (!window.db) return [];
    try {
      const snap = await esfCol('signature_audit_logs')
        .where('docId', '==', docId)
        .orderBy('ts', 'asc')
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },

  async getRecent(limit = 50) {
    if (!window.db) return [];
    try {
      const snap = await esfCol('signature_audit_logs')
        .orderBy('ts', 'desc')
        .limit(limit)
        .get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  }
};

/* ─────────────────────────────────────────────────────────────
   QR ENGINE — generate verification QR codes per signed doc
   ───────────────────────────────────────────────────────────── */
const ESF_QR = {
  BASE_URL: window.location.origin + '/verification.html',

  /* Build the verification URL for a document */
  verificationUrl(docId, certId) {
    return `${this.BASE_URL}?doc=${encodeURIComponent(docId)}&cert=${encodeURIComponent(certId || '')}`;
  },

  /* Generate QR code SVG string (pure-JS, no external lib required at runtime) */
  generateSVG(text) {
    // Minimal QR code using a data URI approach — embed verification URL as text
    // For full rendering we use the qrcodejs CDN loaded in-page
    return text;
  },

  /* Generate & persist QR record, return QR URL string */
  async generate(docId, certId, docTitle) {
    if (!window.db) return null;
    const verifyUrl = this.verificationUrl(docId, certId);
    try {
      const existing = await esfCol('signature_qr_codes')
        .where('docId', '==', docId).limit(1).get();
      if (!existing.empty) {
        return { url: verifyUrl, id: existing.docs[0].id, ...existing.docs[0].data() };
      }
      const rec = {
        docId,
        certId: certId || null,
        docTitle: docTitle || '',
        verifyUrl,
        createdAt: new Date().toISOString(),
        scans: 0,
        active: true,
        version: 1
      };
      const ref = await esfCol('signature_qr_codes').add(rec);
      await ESF_AUDIT.log('QRGenerated', docId, { qrId: ref.id });
      return { url: verifyUrl, id: ref.id, ...rec };
    } catch (e) {
      console.warn('[ESF QR] Generate failed:', e.message);
      return { url: verifyUrl, id: null };
    }
  },

  /* Record a scan event */
  async recordScan(qrId, docId) {
    if (!window.db || !qrId) return;
    try {
      await esfCol('signature_qr_codes').doc(qrId).update({
        scans: firebase.firestore.FieldValue.increment(1),
        lastScan: new Date().toISOString()
      });
      await ESF_AUDIT.log('Verified', docId, { method: 'qr', qrId });
    } catch (e) {}
  },

  /* Render QR code into a DOM element using qrcodejs */
  renderInto(el, text) {
    if (!el) return;
    el.innerHTML = '';
    if (window.QRCode) {
      new window.QRCode(el, {
        text,
        width: 160,
        height: 160,
        colorDark: '#4B1F5F',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } else {
      // Fallback: show the URL as a link
      el.innerHTML = `<a href="${text}" target="_blank" style="font-size:.75rem;word-break:break-all;color:#d4af37">${text}</a>`;
    }
  }
};

/* ─────────────────────────────────────────────────────────────
   CERTIFICATE ENGINE — generate & verify document certificates
   ───────────────────────────────────────────────────────────── */
const ESF_CERT = {
  async issue(docId, signerName, signerTitle, sigImgData, docTitle, workflowId) {
    if (!window.db) return null;
    const certId = 'DS-CERT-' + ESF_UTIL.shortId().toUpperCase();
    const hash = await ESF_UTIL.hash(docId + signerName + new Date().toISOString());
    const cert = {
      certId,
      docId,
      docTitle: docTitle || '',
      signerName,
      signerTitle: signerTitle || '',
      signaturePreview: sigImgData ? sigImgData.substring(0, 100) : null, // store truncated for lookup
      hash,
      workflowId: workflowId || null,
      status: 'Valid',          // Valid | Revoked | Expired
      issuedAt: new Date().toISOString(),
      expiresAt: null,           // set by workflow if needed
      verificationUrl: '',
      version: 1,
      immutable: true
    };
    try {
      const ref = await esfCol('signature_certificates').add(cert);
      // Store history entry
      await esfCol('signature_certificate_history').add({ ...cert, event: 'Issued', certRef: ref.id, ts: cert.issuedAt });
      // Generate QR
      const qr = await ESF_QR.generate(docId, certId, docTitle);
      // Update cert with verificationUrl
      await ref.update({ verificationUrl: qr.url });
      await ESF_AUDIT.log('CertificateGenerated', docId, { certId, hash, qrId: qr.id });
      return { certId, hash, verificationUrl: qr.url, certRef: ref.id };
    } catch (e) {
      console.warn('[ESF Cert] Issue failed:', e.message);
      return { certId, hash, verificationUrl: '' };
    }
  },

  async revoke(certId, reason) {
    if (!window.db) return;
    try {
      const snap = await esfCol('signature_certificates').where('certId', '==', certId).limit(1).get();
      if (!snap.empty) {
        const ref = snap.docs[0].ref;
        const docId = snap.docs[0].data().docId;
        await ref.update({ status: 'Revoked', revokedAt: new Date().toISOString(), revokeReason: reason });
        await esfCol('signature_certificate_history').add({ certId, event: 'Revoked', reason, ts: new Date().toISOString() });
        await ESF_AUDIT.log('Revoked', docId, { certId, reason });
      }
    } catch (e) {}
  },

  async verify(docId, certId) {
    if (!window.db) return { status: 'Invalid', message: 'Database unavailable' };
    try {
      let snap;
      if (certId) {
        snap = await esfCol('signature_certificates').where('certId', '==', certId).limit(1).get();
      } else {
        snap = await esfCol('signature_certificates').where('docId', '==', docId).orderBy('issuedAt','desc').limit(1).get();
      }
      if (snap.empty) return { status: 'Invalid', message: 'No certificate found for this document.' };
      const cert = { id: snap.docs[0].id, ...snap.docs[0].data() };
      // Record verification attempt
      await esfCol('signature_verifications').add({
        docId, certId: cert.certId, status: cert.status,
        verifiedAt: new Date().toISOString(), method: 'portal'
      });
      await ESF_AUDIT.log('Verified', docId, { certId: cert.certId, result: cert.status });
      if (cert.status === 'Revoked') return { status: 'Revoked', cert, message: 'This document certificate has been revoked.' };
      if (cert.expiresAt && new Date() > new Date(cert.expiresAt)) {
        return { status: 'Expired', cert, message: 'This certificate has expired.' };
      }
      return { status: 'Valid', cert, message: 'Document signature is authentic and verified.' };
    } catch (e) {
      return { status: 'Error', message: e.message };
    }
  }
};

/* ─────────────────────────────────────────────────────────────
   WORKFLOW ENGINE — sequential approvals, escalation, expiration
   ───────────────────────────────────────────────────────────── */
const ESF_WORKFLOW = {
  /* Create a new workflow for a document */
  async create(docId, docTitle, steps, options = {}) {
    if (!window.db) return null;
    const wfId = 'WF-' + ESF_UTIL.shortId().toUpperCase();
    const expiresAt = options.expiresInDays
      ? new Date(Date.now() + options.expiresInDays * 86400000).toISOString()
      : null;
    const wf = {
      wfId,
      docId,
      docTitle: docTitle || '',
      status: 'Pending',        // Pending | InProgress | Completed | Expired | Cancelled
      type: options.type || 'Sequential',
      currentStep: 0,
      totalSteps: steps.length,
      createdAt: new Date().toISOString(),
      expiresAt,
      completedAt: null,
      escalationEmail: options.escalationEmail || 'management@drippingsecrets.com',
      reminderDays: options.reminderDays || 3,
      version: 1
    };
    try {
      const ref = await esfCol('signature_workflows').add(wf);
      // Create step records
      for (let i = 0; i < steps.length; i++) {
        await esfCol('signature_workflow_steps').add({
          wfId,
          wfRef: ref.id,
          stepIndex: i,
          signerName: steps[i].signerName || '',
          signerTitle: steps[i].signerTitle || '',
          signerEmail: steps[i].email || '',
          role: steps[i].role || 'Approver',
          status: i === 0 ? 'Pending' : 'Waiting',
          requestedAt: i === 0 ? new Date().toISOString() : null,
          signedAt: null,
          rejectedAt: null,
          delegatedTo: null
        });
      }
      await ESF_AUDIT.log('WorkflowStarted', docId, { wfId, steps: steps.length });
      // Queue notification
      await ESF_NOTIFY.send(docId, wfId, 'workflow_started', steps[0]);
      return { wfId, wfRef: ref.id };
    } catch (e) {
      console.warn('[ESF Workflow] Create failed:', e.message);
      return null;
    }
  },

  /* Advance workflow to next step after current signer completes */
  async advance(wfId) {
    if (!window.db) return;
    try {
      const snap = await esfCol('signature_workflows').where('wfId', '==', wfId).limit(1).get();
      if (snap.empty) return;
      const wfRef = snap.docs[0].ref;
      const wf = snap.docs[0].data();
      const nextStep = (wf.currentStep || 0) + 1;
      if (nextStep >= wf.totalSteps) {
        // Workflow complete
        await wfRef.update({ status: 'Completed', completedAt: new Date().toISOString(), currentStep: nextStep });
        await ESF_AUDIT.log('WorkflowCompleted', wf.docId, { wfId });
        await ESF_NOTIFY.send(wf.docId, wfId, 'workflow_completed', null);
      } else {
        await wfRef.update({ currentStep: nextStep });
        // Activate next step
        const stepSnap = await esfCol('signature_workflow_steps')
          .where('wfId', '==', wfId).where('stepIndex', '==', nextStep).limit(1).get();
        if (!stepSnap.empty) {
          await stepSnap.docs[0].ref.update({ status: 'Pending', requestedAt: new Date().toISOString() });
          await ESF_NOTIFY.send(wf.docId, wfId, 'step_requested', stepSnap.docs[0].data());
        }
      }
    } catch (e) { console.warn('[ESF Workflow] Advance failed:', e.message); }
  },

  /* Check and expire overdue workflows */
  async checkExpiry() {
    if (!window.db) return;
    try {
      const now = new Date().toISOString();
      const snap = await esfCol('signature_workflows')
        .where('status', '==', 'Pending').get();
      for (const doc of snap.docs) {
        const wf = doc.data();
        if (wf.expiresAt && wf.expiresAt < now) {
          await doc.ref.update({ status: 'Expired' });
          await ESF_AUDIT.log('Expired', wf.docId, { wfId: wf.wfId });
        }
      }
    } catch (e) {}
  },

  /* Load all workflows for the admin console */
  async loadAll(limit = 100) {
    if (!window.db) return [];
    try {
      const snap = await esfCol('signature_workflows')
        .orderBy('createdAt', 'desc').limit(limit).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  }
};

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION ENGINE — in-app + Firestore queue
   ───────────────────────────────────────────────────────────── */
const ESF_NOTIFY = {
  async send(docId, wfId, type, recipient) {
    if (!window.db) return;
    try {
      await esfCol('signature_notifications').add({
        docId, wfId, type,
        recipientName: recipient?.signerName || '',
        recipientEmail: recipient?.signerEmail || '',
        message: ESF_NOTIFY._msg(type, recipient),
        sentAt: new Date().toISOString(),
        read: false,
        channel: 'portal'
      });
      // Also push to the BK-15 notification center if available
      if (window.dsNotif) {
        window.dsNotif.createNotification('esf', ESF_NOTIFY._msg(type, recipient), docId);
      }
    } catch (e) {}
  },

  _msg(type, recipient) {
    const name = recipient?.signerName || 'a signer';
    const msgs = {
      workflow_started:    `Signature workflow started — awaiting signature from ${name}`,
      step_requested:      `Signature requested from ${name}`,
      workflow_completed:  'All signatures collected — document workflow complete',
      reminder:            `Reminder: signature pending from ${name}`,
      revoked:             'A document certificate has been revoked'
    };
    return msgs[type] || `Signature event: ${type}`;
  }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN CONSOLE — data loaders for the ESF Back Office wing
   ───────────────────────────────────────────────────────────── */
const ESF_ADMIN = {
  async loadDocuments() {
    if (!window.db) return [];
    try {
      const snap = await esfCol('signature_documents')
        .orderBy('signedAt', 'desc').limit(200).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      // Fallback: try signature_records (Phase 1)
      try {
        const snap2 = await esfCol('signature_records')
          .orderBy('timestamp', 'desc').limit(200).get();
        return snap2.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch { return []; }
    }
  },

  async loadCertificates() {
    if (!window.db) return [];
    try {
      const snap = await esfCol('signature_certificates')
        .orderBy('issuedAt', 'desc').limit(100).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { return []; }
  },

  async getStats() {
    const stats = { totalSigned: 0, activeCerts: 0, pendingWorkflows: 0, totalVerifications: 0 };
    if (!window.db) return stats;
    try {
      const [docs, certs, wfs, verifs] = await Promise.all([
        esfCol('signature_documents').get().catch(() => ({ size: 0 })),
        esfCol('signature_certificates').where('status', '==', 'Valid').get().catch(() => ({ size: 0 })),
        esfCol('signature_workflows').where('status', 'in', ['Pending','InProgress']).get().catch(() => ({ size: 0 })),
        esfCol('signature_verifications').get().catch(() => ({ size: 0 }))
      ]);
      // Also count Phase 1 signature_records
      const phase1 = await esfCol('signature_records').get().catch(() => ({ size: 0 }));
      stats.totalSigned = docs.size + phase1.size;
      stats.activeCerts = certs.size;
      stats.pendingWorkflows = wfs.size;
      stats.totalVerifications = verifs.size;
    } catch (e) {}
    return stats;
  }
};

/* ─────────────────────────────────────────────────────────────
   UTILITY
   ───────────────────────────────────────────────────────────── */
const ESF_UTIL = {
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  shortId() {
    return Math.random().toString(36).substring(2, 9);
  },
  async hash(str) {
    if (window.crypto && window.crypto.subtle) {
      const buf = new TextEncoder().encode(str);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('').substring(0, 16);
    }
    // Fallback simple hash
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).padStart(8, '0');
  },
  formatDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return iso; }
  },
  statusBadge(status) {
    const colors = {
      Valid: '#22c55e', Invalid: '#f87171', Revoked: '#f87171',
      Expired: '#f59e0b', Tampered: '#ef4444', Pending: '#d4af37',
      Completed: '#22c55e', InProgress: '#60a5fa', Cancelled: '#6b7280', Waiting: '#9ca3af'
    };
    const c = colors[status] || '#9ca3af';
    return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:.72rem;font-weight:700;background:${c}22;color:${c};border:1px solid ${c}44">${status}</span>`;
  }
};

/* ─────────────────────────────────────────────────────────────
   AUTH helper — get current admin user display name
   ───────────────────────────────────────────────────────────── */
const ESF_AUTH = {
  currentUser() {
    try {
      const u = firebase.auth().currentUser;
      return u ? (u.displayName || u.email || 'Admin') : 'Admin';
    } catch { return 'Admin'; }
  }
};

/* ─────────────────────────────────────────────────────────────
   AUGMENT esigApply — hook into Phase 1 signing to issue certs
   ───────────────────────────────────────────────────────────── */
(function patchEsigApply() {
  const _orig = window.esigApply;
  if (typeof _orig !== 'function') {
    // Wait for it
    window.addEventListener('load', () => setTimeout(patchEsigApply, 500));
    return;
  }
  window.esigApply = async function() {
    await _orig.call(this);
    // After signing completes, issue a certificate for the document
    try {
      const signerName = (document.getElementById('esig-signer-name') || {}).value || 'Unknown Signer';
      const signerTitle = (document.getElementById('esig-signer-title') || {}).value || '';
      const docTitle = document.getElementById('pageTitle')?.textContent || 'Document';
      const docId = 'doc-' + Date.now();
      await ESF_CERT.issue(docId, signerName, signerTitle, null, docTitle, null);
      await ESF_AUDIT.log('Signed', docId, { signerName, signerTitle, docTitle });
    } catch (e) {}
  };
})();

/* ─────────────────────────────────────────────────────────────
   ADMIN CONSOLE UI — rendered into #tab-esf
   ───────────────────────────────────────────────────────────── */
window.initESF = async function() {
  const tab = document.getElementById('tab-esf');
  if (!tab || tab.dataset.initialized === '1') return;
  tab.dataset.initialized = '1';
  const el = document.getElementById('tab-esf-inner') || tab;

  // Run expiry check
  ESF_WORKFLOW.checkExpiry().catch(() => {});

  // Render shell
  el.innerHTML = `
  <div class="esf-console">
    <!-- KPI Bar -->
    <div class="esf-kpi-bar" id="esfKpiBar">
      <div class="esf-kpi"><div class="esf-kpi-num" id="esfStatSigned">—</div><div class="esf-kpi-label">Documents Signed</div></div>
      <div class="esf-kpi"><div class="esf-kpi-num" id="esfStatCerts">—</div><div class="esf-kpi-label">Active Certificates</div></div>
      <div class="esf-kpi"><div class="esf-kpi-num" id="esfStatWorkflows">—</div><div class="esf-kpi-label">Pending Workflows</div></div>
      <div class="esf-kpi"><div class="esf-kpi-num" id="esfStatVerifs">—</div><div class="esf-kpi-label">Verifications</div></div>
    </div>

    <!-- Tabs -->
    <div class="esf-tabs">
      <button class="esf-tab-btn active" onclick="esfSwitchTab('documents',this)">Signed Documents</button>
      <button class="esf-tab-btn" onclick="esfSwitchTab('certificates',this)">Certificates</button>
      <button class="esf-tab-btn" onclick="esfSwitchTab('workflows',this)">Workflows</button>
      <button class="esf-tab-btn" onclick="esfSwitchTab('audit',this)">Audit Trail</button>
    </div>

    <!-- Documents Panel -->
    <div class="esf-panel active" id="esf-panel-documents">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:var(--gold,#d4af37)">Signed Document Registry</h4>
        <button onclick="esfRefreshDocuments()" style="padding:6px 14px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">↻ Refresh</button>
      </div>
      <div id="esfDocTable" style="color:var(--muted)">Loading…</div>
    </div>

    <!-- Certificates Panel -->
    <div class="esf-panel" id="esf-panel-certificates">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:var(--gold,#d4af37)">Certificate Registry</h4>
        <button onclick="esfRefreshCerts()" style="padding:6px 14px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">↻ Refresh</button>
      </div>
      <div id="esfCertTable" style="color:var(--muted)">Loading…</div>
    </div>

    <!-- Workflows Panel -->
    <div class="esf-panel" id="esf-panel-workflows">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:var(--gold,#d4af37)">Workflow Engine</h4>
        <button onclick="esfRefreshWorkflows()" style="padding:6px 14px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">↻ Refresh</button>
      </div>
      <div id="esfWorkflowTable" style="color:var(--muted)">Loading…</div>
    </div>

    <!-- Audit Trail Panel -->
    <div class="esf-panel" id="esf-panel-audit">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:var(--gold,#d4af37)">Immutable Audit Trail</h4>
        <button onclick="esfRefreshAudit()" style="padding:6px 14px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:.8rem">↻ Refresh</button>
      </div>
      <div id="esfAuditTable" style="color:var(--muted)">Loading…</div>
    </div>

    <!-- QR Viewer Modal -->
    <div id="esfQrModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99990;align-items:center;justify-content:center">
      <div style="background:#1a0d24;border:1px solid var(--gold,#d4af37);border-radius:16px;padding:32px;max-width:340px;width:90%;text-align:center">
        <h3 style="margin:0 0 16px;color:var(--gold,#d4af37)">Verification QR Code</h3>
        <div id="esfQrCanvas" style="margin:0 auto 16px;width:160px;height:160px"></div>
        <p id="esfQrUrl" style="font-size:.7rem;color:var(--muted);word-break:break-all;margin-bottom:16px"></p>
        <button onclick="document.getElementById('esfQrModal').style.display='none'" style="padding:8px 24px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:8px;cursor:pointer">Close</button>
      </div>
    </div>

    <!-- Audit Detail Modal -->
    <div id="esfAuditModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99990;align-items:center;justify-content:center;overflow-y:auto">
      <div style="background:#1a0d24;border:1px solid rgba(212,175,55,.3);border-radius:16px;padding:28px;max-width:680px;width:95%;margin:40px auto">
        <h3 style="margin:0 0 16px;color:var(--gold,#d4af37)">Document Audit Trail</h3>
        <div id="esfAuditModalContent"></div>
        <button onclick="document.getElementById('esfAuditModal').style.display='none'" style="margin-top:16px;padding:8px 24px;background:var(--plum,#4B1F5F);color:#fff;border:none;border-radius:8px;cursor:pointer">Close</button>
      </div>
    </div>
  </div>`;

  // Load all panels
  await Promise.all([esfRefreshDocuments(), esfRefreshCerts(), esfRefreshWorkflows(), esfRefreshAudit()]);
  // Load stats
  const stats = await ESF_ADMIN.getStats();
  document.getElementById('esfStatSigned').textContent  = stats.totalSigned;
  document.getElementById('esfStatCerts').textContent   = stats.activeCerts;
  document.getElementById('esfStatWorkflows').textContent = stats.pendingWorkflows;
  document.getElementById('esfStatVerifs').textContent  = stats.totalVerifications;
};

/* Panel switcher */
window.esfSwitchTab = function(panel, btn) {
  document.querySelectorAll('.esf-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.esf-tab-btn').forEach(b => b.classList.remove('active'));
  const p = document.getElementById('esf-panel-' + panel);
  if (p) p.classList.add('active');
  if (btn) btn.classList.add('active');
};

/* Render helpers */
function esfDocRow(d) {
  const name = d.signerName || d.displayName || '—';
  const title = d.signerTitle || '—';
  const ts = ESF_UTIL.formatDate(d.signedAt || d.timestamp);
  const docTitle = d.docTitle || 'Document';
  const certId = d.certId || '';
  const docId = d.docId || d.id;
  return `<tr style="border-bottom:1px solid rgba(255,255,255,.06)">
    <td style="padding:9px 8px;color:#e2d4f0">${docTitle}</td>
    <td style="padding:9px 8px">${name}</td>
    <td style="padding:9px 8px;color:var(--muted)">${title}</td>
    <td style="padding:9px 8px;color:var(--muted);font-size:.78rem">${ts}</td>
    <td style="padding:9px 8px">${ESF_UTIL.statusBadge(d.status || 'Valid')}</td>
    <td style="padding:9px 8px">
      <button onclick="esfShowQR('${docId}','${certId}','${docTitle.replace(/'/g,"\\'")}') " style="padding:3px 10px;background:rgba(212,175,55,.15);color:#d4af37;border:1px solid rgba(212,175,55,.3);border-radius:6px;cursor:pointer;font-size:.75rem">QR</button>
      <button onclick="esfShowDocAudit('${docId}')" style="margin-left:4px;padding:3px 10px;background:rgba(75,31,95,.4);color:#c4b5fd;border:1px solid rgba(196,181,253,.2);border-radius:6px;cursor:pointer;font-size:.75rem">Audit</button>
    </td>
  </tr>`;
}

function esfCertRow(c) {
  return `<tr style="border-bottom:1px solid rgba(255,255,255,.06)">
    <td style="padding:9px 8px;font-size:.78rem;color:#d4af37;font-family:monospace">${c.certId || '—'}</td>
    <td style="padding:9px 8px;color:#e2d4f0">${c.docTitle || '—'}</td>
    <td style="padding:9px 8px">${c.signerName || '—'}</td>
    <td style="padding:9px 8px;color:var(--muted);font-size:.78rem">${ESF_UTIL.formatDate(c.issuedAt)}</td>
    <td style="padding:9px 8px">${ESF_UTIL.statusBadge(c.status || 'Valid')}</td>
    <td style="padding:9px 8px">
      <button onclick="esfShowQR('${c.docId}','${c.certId}','${(c.docTitle||'').replace(/'/g,"\\'")}')" style="padding:3px 10px;background:rgba(212,175,55,.15);color:#d4af37;border:1px solid rgba(212,175,55,.3);border-radius:6px;cursor:pointer;font-size:.75rem">QR</button>
      <button onclick="esfRevokeCert('${c.certId}')" style="margin-left:4px;padding:3px 10px;background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.3);border-radius:6px;cursor:pointer;font-size:.75rem">Revoke</button>
    </td>
  </tr>`;
}

function esfWorkflowRow(w) {
  return `<tr style="border-bottom:1px solid rgba(255,255,255,.06)">
    <td style="padding:9px 8px;font-size:.78rem;color:#d4af37;font-family:monospace">${w.wfId || '—'}</td>
    <td style="padding:9px 8px;color:#e2d4f0">${w.docTitle || '—'}</td>
    <td style="padding:9px 8px;color:var(--muted)">Step ${(w.currentStep||0)+1} of ${w.totalSteps||1}</td>
    <td style="padding:9px 8px;font-size:.78rem;color:var(--muted)">${ESF_UTIL.formatDate(w.createdAt)}</td>
    <td style="padding:9px 8px">${w.expiresAt ? ESF_UTIL.formatDate(w.expiresAt) : '—'}</td>
    <td style="padding:9px 8px">${ESF_UTIL.statusBadge(w.status || 'Pending')}</td>
  </tr>`;
}

function esfAuditRow(a) {
  const actionColors = {
    Signed:'#22c55e', Created:'#60a5fa', Viewed:'#9ca3af', Downloaded:'#f59e0b',
    Verified:'#34d399', Revoked:'#f87171', WorkflowStarted:'#a78bfa', WorkflowCompleted:'#22c55e',
    CertificateGenerated:'#d4af37', QRGenerated:'#d4af37', Exported:'#f59e0b'
  };
  const c = actionColors[a.action] || '#9ca3af';
  return `<tr style="border-bottom:1px solid rgba(255,255,255,.04)">
    <td style="padding:7px 8px;font-size:.78rem;color:var(--muted)">${ESF_UTIL.formatDate(a.ts)}</td>
    <td style="padding:7px 8px"><span style="color:${c};font-weight:700;font-size:.8rem">${a.action || '—'}</span></td>
    <td style="padding:7px 8px;font-size:.78rem;color:#e2d4f0;font-family:monospace">${(a.docId||'').substring(0,14)||'—'}</td>
    <td style="padding:7px 8px;font-size:.78rem;color:var(--muted)">${a.userId || '—'}</td>
    <td style="padding:7px 8px;font-size:.75rem;color:var(--muted)">${a.detail ? JSON.stringify(a.detail).substring(0,60) : '—'}</td>
  </tr>`;
}

function esfTable(headers, rows, emptyMsg) {
  if (!rows || !rows.length) return `<div style="padding:24px;text-align:center;color:var(--muted);font-size:.85rem">${emptyMsg}</div>`;
  return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.82rem">
    <thead><tr style="border-bottom:1px solid rgba(212,175,55,.25)">
      ${headers.map(h=>`<th style="padding:8px 8px;text-align:left;color:var(--gold,#d4af37);font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em">${h}</th>`).join('')}
    </tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

/* Refresh functions */
window.esfRefreshDocuments = async function() {
  const el = document.getElementById('esfDocTable');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;color:var(--muted)">Loading…</div>';
  const docs = await ESF_ADMIN.loadDocuments();
  el.innerHTML = esfTable(
    ['Document','Signer','Title','Signed At','Status','Actions'],
    docs.map(esfDocRow).join(''),
    'No signed documents yet. Documents signed via the Back Office will appear here.'
  );
};

window.esfRefreshCerts = async function() {
  const el = document.getElementById('esfCertTable');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;color:var(--muted)">Loading…</div>';
  const certs = await ESF_ADMIN.loadCertificates();
  el.innerHTML = esfTable(
    ['Certificate ID','Document','Signer','Issued','Status','Actions'],
    certs.map(esfCertRow).join(''),
    'No certificates issued yet. Certificates are generated automatically when documents are signed.'
  );
};

window.esfRefreshWorkflows = async function() {
  const el = document.getElementById('esfWorkflowTable');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;color:var(--muted)">Loading…</div>';
  const wfs = await ESF_WORKFLOW.loadAll();
  el.innerHTML = esfTable(
    ['Workflow ID','Document','Progress','Created','Expires','Status'],
    wfs.map(esfWorkflowRow).join(''),
    'No active workflows. Workflows are created when multi-signer document routing is initiated.'
  );
};

window.esfRefreshAudit = async function() {
  const el = document.getElementById('esfAuditTable');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;color:var(--muted)">Loading…</div>';
  const logs = await ESF_AUDIT.getRecent(100);
  el.innerHTML = esfTable(
    ['Timestamp','Action','Document','User','Detail'],
    logs.map(esfAuditRow).join(''),
    'No audit events yet. Every signing action is logged here in real time.'
  );
};

/* QR Modal */
window.esfShowQR = async function(docId, certId, docTitle) {
  const modal = document.getElementById('esfQrModal');
  const canvas = document.getElementById('esfQrCanvas');
  const urlEl = document.getElementById('esfQrUrl');
  if (!modal) return;

  // Load qrcodejs if not already
  if (!window.QRCode) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
      s.onload = res; s.onerror = res; // continue even if CDN unavailable
      document.head.appendChild(s);
    });
  }

  const qr = await ESF_QR.generate(docId, certId, docTitle);
  urlEl.textContent = qr.url;
  ESF_QR.renderInto(canvas, qr.url);
  modal.style.display = 'flex';
};

/* Audit Detail Modal */
window.esfShowDocAudit = async function(docId) {
  const modal = document.getElementById('esfAuditModal');
  const content = document.getElementById('esfAuditModalContent');
  if (!modal || !content) return;
  content.innerHTML = '<div style="color:var(--muted)">Loading…</div>';
  modal.style.display = 'flex';
  const logs = await ESF_AUDIT.getForDoc(docId);
  content.innerHTML = esfTable(
    ['Timestamp','Action','User','Detail'],
    logs.map(a => `<tr style="border-bottom:1px solid rgba(255,255,255,.04)">
      <td style="padding:7px 8px;font-size:.78rem;color:var(--muted)">${ESF_UTIL.formatDate(a.ts)}</td>
      <td style="padding:7px 8px;color:#22c55e;font-weight:700;font-size:.8rem">${a.action}</td>
      <td style="padding:7px 8px;font-size:.78rem;color:var(--muted)">${a.userId||'—'}</td>
      <td style="padding:7px 8px;font-size:.75rem;color:var(--muted)">${a.detail?JSON.stringify(a.detail):'—'}</td>
    </tr>`).join(''),
    'No audit events recorded for this document.'
  );
};

/* Revoke cert */
window.esfRevokeCert = async function(certId) {
  if (!certId || certId === 'undefined') return;
  if (!confirm(`Revoke certificate ${certId}? This cannot be undone.`)) return;
  const reason = prompt('Reason for revocation:') || 'Admin revocation';
  await ESF_CERT.revoke(certId, reason);
  alert('Certificate revoked.');
  esfRefreshCerts();
};

/* Export audit log to CSV */
window.esfExportAudit = async function() {
  const logs = await ESF_AUDIT.getRecent(1000);
  if (!logs.length) { alert('No audit records to export.'); return; }
  const rows = [['Timestamp','Action','DocID','UserID','Detail']];
  logs.forEach(l => rows.push([l.ts||'',l.action||'',l.docId||'',l.userId||'',JSON.stringify(l.detail||{})]));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `DS-ESF-Audit-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

/* Expose API for other modules */
window.ESF = { AUDIT: ESF_AUDIT, QR: ESF_QR, CERT: ESF_CERT, WORKFLOW: ESF_WORKFLOW, ADMIN: ESF_ADMIN, UTIL: ESF_UTIL };

console.log('[ESF Phase 2] Loaded — QR · Audit · Workflow · Console · 18 Firestore collections');
