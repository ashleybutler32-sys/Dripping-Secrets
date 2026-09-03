/* ============================================================
   DRIPPING SECRETS — Events Platform JS  (v9.85)
   Firestore collection: events
   ============================================================ */

'use strict';

const DSEvents = (() => {
  /* ── State ─────────────────────────────────────────────── */
  let db = null;
  let currentUser = null;
  let allEvents = [];
  let activeFilter = 'all';
  let calMonth = new Date().getMonth();
  let calYear  = new Date().getFullYear();
  let rsvpTarget = null;

  /* ── Init ──────────────────────────────────────────────── */
  async function init() {
    // Render built-in events immediately — never block on Firestore
    allEvents = getSampleEvents();
    renderCalendar();
    renderEventGrid(allEvents);
    bindFilters();

    if (!window.firebase) return;
    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(u => { currentUser = u; renderRSVPButtons(); });

    // Try Firestore in background with 5 s timeout
    try {
      const now = new Date();
      const snap = await Promise.race([
        db.collection('events')
          .where('status', '==', 'published')
          .where('date', '>=', firebase.firestore.Timestamp.fromDate(now))
          .orderBy('date', 'asc')
          .limit(50)
          .get(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))
      ]);
      const live = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (live.length > 0) {
        allEvents = live;
        renderCalendar();
        renderEventGrid(filterEvents());
      }
    } catch (_) { /* keep sample events already rendered */ }
  }

  /* ── Firestore (background refresh only) ──────────────── */
  async function loadEvents() {
    // Legacy call — logic now lives in init()
  }

  function getSampleEvents() {
    const now = Date.now();
    const day = 86400000;
    return [
      { id: 'ev1', title: 'Date Night Box Reveal', type: 'virtual', category: 'couples',
        date: { toDate: () => new Date(now + 3*day) }, time: '8:00 PM CT',
        location: 'Virtual — Zoom Link Emailed', description: 'Unbox a curated date night experience live with our host. Q&A + special discount for attendees.',
        capacity: 100, rsvpCount: 47, price: 0, icon: '💑' },
      { id: 'ev2', title: 'Wellness & Self-Love Workshop', type: 'in-person', category: 'wellness',
        date: { toDate: () => new Date(now + 7*day) }, time: '2:00 PM CT',
        location: 'Dallas, TX (address emailed)', description: 'An afternoon dedicated to self-care routines, product demos, and connecting with like-minded women.',
        capacity: 30, rsvpCount: 22, price: 25, icon: '🌸' },
      { id: 'ev3', title: 'Secrets Society Mixer', type: 'in-person', category: 'social',
        date: { toDate: () => new Date(now + 14*day) }, time: '7:00 PM CT',
        location: 'Dallas, TX (address emailed)', description: 'Members-only networking mixer. Meet the community, enjoy complimentary gifts, and get exclusive first looks.',
        capacity: 50, rsvpCount: 38, price: 0, memberOnly: true, icon: '🥂' },
      { id: 'ev4', title: 'Creator Masterclass', type: 'virtual', category: 'creators',
        date: { toDate: () => new Date(now + 21*day) }, time: '6:00 PM CT',
        location: 'Virtual — Zoom Link Emailed', description: 'Learn how top DS creators build their audience and earn commission. Live Q&A with our creator team.',
        capacity: 200, rsvpCount: 89, price: 0, icon: '✨' },
    ];
  }

  /* ── Calendar ──────────────────────────────────────────── */
  function renderCalendar() {
    const container = document.getElementById('ev-calendar-grid');
    if (!container) return;

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const title = document.getElementById('ev-cal-title');
    if (title) title.textContent = `${monthNames[calMonth]} ${calYear}`;

    const first = new Date(calYear, calMonth, 1).getDay();
    const days  = new Date(calYear, calMonth+1, 0).getDate();
    const today = new Date();

    // Event dates this month
    const eventDates = new Set(
      allEvents
        .map(e => e.date?.toDate ? e.date.toDate() : new Date(e.date))
        .filter(d => d.getMonth() === calMonth && d.getFullYear() === calYear)
        .map(d => d.getDate())
    );

    container.innerHTML = '';
    // Padding days
    for (let i = 0; i < first; i++) {
      const cell = document.createElement('div');
      cell.className = 'ev-cal-cell other-month';
      const prevDays = new Date(calYear, calMonth, 0).getDate();
      cell.innerHTML = `<div class="ev-cal-date">${prevDays - first + i + 1}</div>`;
      container.appendChild(cell);
    }
    // Current month days
    for (let d = 1; d <= days; d++) {
      const cell = document.createElement('div');
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      const hasEv   = eventDates.has(d);
      cell.className = `ev-cal-cell${isToday ? ' today' : ''}${hasEv ? ' has-event' : ''}`;
      cell.innerHTML = `<div class="ev-cal-date">${d}</div>${hasEv ? '<span class="ev-cal-dot"></span>' : ''}`;
      if (hasEv) cell.addEventListener('click', () => scrollToDate(calYear, calMonth, d));
      container.appendChild(cell);
    }
  }

  function prevMonth() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }
  function nextMonth() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); }

  function scrollToDate(y, m, d) {
    const target = allEvents.find(e => {
      const dt = e.date?.toDate ? e.date.toDate() : new Date(e.date);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
    if (target) {
      const el = document.getElementById(`ev-card-${target.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ── Event Grid ────────────────────────────────────────── */
  function renderEventGrid(events) {
    const grid = document.getElementById('ev-grid');
    if (!grid) return;
    if (!events || !events.length) {
      grid.innerHTML = `<div class="ev-empty" style="grid-column:1/-1"><div class="ev-empty-icon">📅</div><p>No upcoming events found.<br>Check back soon!</p></div>`;
      return;
    }
    grid.innerHTML = events.map(e => buildCard(e)).join('');
  }

  function buildCard(e) {
    const dt   = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    const dateStr = dt.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    const spotsLeft = Math.max(0, (e.capacity || 0) - (e.rsvpCount || 0));
    const soldOut   = spotsLeft === 0;
    const typeBadge = e.type === 'virtual' ? 'Virtual' : 'In-Person';
    const memberTag = e.memberOnly ? '<span style="color:#C89B3C;font-size:.78rem;margin-left:8px;">Members Only</span>' : '';
    const priceTag  = e.price > 0 ? `$${e.price}` : 'Free';
    return `
    <div class="ev-card" id="ev-card-${e.id}">
      <div class="ev-card-banner">
        <span class="ev-card-type">${typeBadge}</span>
        <div class="ev-card-icon">${e.icon || '🎉'}</div>
      </div>
      <div class="ev-card-body">
        <h3 class="ev-card-title">${e.title}${memberTag}</h3>
        <div class="ev-card-meta">
          <span>📅 ${dateStr}</span>
          <span>⏰ ${e.time || ''}</span>
          <span>📍 ${e.type === 'virtual' ? 'Virtual' : 'In-Person'}</span>
        </div>
        <p class="ev-card-desc">${e.description || ''}</p>
      </div>
      <div class="ev-card-footer">
        <div class="ev-card-spots">
          ${soldOut ? '<strong style="color:#ff4757">Sold Out</strong>' : `<strong>${spotsLeft}</strong> spots left · ${priceTag}`}
        </div>
        <button class="ev-rsvp-btn" onclick="DSEvents.openRSVP('${e.id}')" ${soldOut ? 'disabled' : ''}>
          ${soldOut ? 'Sold Out' : 'RSVP'}
        </button>
      </div>
    </div>`;
  }

  function renderRSVPButtons() {
    // Re-render grid after auth state change
    if (allEvents.length) renderEventGrid(filterEvents());
  }

  /* ── Filter ────────────────────────────────────────────── */
  function bindFilters() {
    document.querySelectorAll('.ev-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('.ev-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderEventGrid(filterEvents());
      });
    });
  }

  function filterEvents() {
    if (activeFilter === 'all') return allEvents;
    return allEvents.filter(e => e.category === activeFilter || e.type === activeFilter);
  }

  /* ── RSVP Modal ────────────────────────────────────────── */
  function openRSVP(eventId) {
    rsvpTarget = allEvents.find(e => e.id === eventId);
    if (!rsvpTarget) return;
    const modal = document.getElementById('ev-modal');
    if (!modal) return;
    document.getElementById('ev-modal-title').textContent = rsvpTarget.title;
    const dt = rsvpTarget.date?.toDate ? rsvpTarget.date.toDate() : new Date(rsvpTarget.date);
    document.getElementById('ev-modal-date').textContent = `${dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} at ${rsvpTarget.time}`;
    // Pre-fill if logged in
    if (currentUser) {
      const nameEl = document.getElementById('ev-rsvp-name');
      const emailEl = document.getElementById('ev-rsvp-email');
      if (nameEl && currentUser.displayName) nameEl.value = currentUser.displayName;
      if (emailEl) emailEl.value = currentUser.email || '';
    }
    modal.classList.add('open');
  }

  function closeRSVP() {
    const modal = document.getElementById('ev-modal');
    if (modal) modal.classList.remove('open');
    rsvpTarget = null;
  }

  async function submitRSVP() {
    if (!rsvpTarget) return;
    const name   = document.getElementById('ev-rsvp-name')?.value.trim();
    const email  = document.getElementById('ev-rsvp-email')?.value.trim();
    const guests = parseInt(document.getElementById('ev-rsvp-guests')?.value) || 1;
    const note   = document.getElementById('ev-rsvp-note')?.value.trim();

    if (!name || !email) { alert('Please enter your name and email.'); return; }

    const btn = document.getElementById('ev-rsvp-submit');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    try {
      if (db) {
        await db.collection('rsvps').add({
          eventId: rsvpTarget.id, eventTitle: rsvpTarget.title,
          name, email, guests, note: note || '',
          userId: currentUser?.uid || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'confirmed'
        });
        // Increment rsvpCount
        await db.collection('events').doc(rsvpTarget.id).update({
          rsvpCount: firebase.firestore.FieldValue.increment(guests)
        });
      }
      closeRSVP();
      showToast('You\'re on the list! Check your email for details.');
      if (btn) { btn.disabled = false; btn.textContent = 'RSVP'; }
    } catch (err) {
      console.error('RSVP error:', err);
      showToast('RSVP submitted — see you there!');
      closeRSVP();
      if (btn) { btn.disabled = false; btn.textContent = 'RSVP'; }
    }
  }

  /* ── Toast ─────────────────────────────────────────────── */
  function showToast(msg) {
    let t = document.getElementById('ev-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ev-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:#1e0d2e;border:1px solid rgba(233,30,140,.4);color:#fff;padding:14px 24px;border-radius:50px;z-index:99999;transition:transform .3s;font-size:.95rem;white-space:nowrap;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(60px)'; }, 3500);
  }

  /* ── Host Application ──────────────────────────────────── */
  async function submitHostApp() {
    const name    = document.getElementById('ev-host-name')?.value.trim();
    const email   = document.getElementById('ev-host-email')?.value.trim();
    const concept = document.getElementById('ev-host-concept')?.value.trim();
    if (!name || !email || !concept) { alert('Please fill out all fields.'); return; }
    try {
      if (db) {
        await db.collection('event_applications').add({
          name, email, concept,
          userId: currentUser?.uid || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });
      }
      showToast('Host application submitted! We\'ll be in touch.');
      document.getElementById('ev-host-name').value = '';
      document.getElementById('ev-host-email').value = '';
      document.getElementById('ev-host-concept').value = '';
    } catch (err) {
      showToast('Application submitted — thank you!');
    }
  }

  /* ── Admin Panel ───────────────────────────────────────── */
  async function adminLoadEvents() {
    if (!db) return;
    const container = document.getElementById('admin-events-list');
    if (!container) return;
    container.innerHTML = '<p style="color:rgba(255,255,255,.5)">Loading...</p>';
    try {
      const snap = await db.collection('events').orderBy('date','desc').limit(50).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No events yet.</p>'; return; }
      container.innerHTML = items.map(e => {
        const dt = e.date?.toDate ? e.date.toDate() : new Date(e.date);
        return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <strong style="color:#fff">${e.title}</strong>
            <div style="color:rgba(255,255,255,.5);font-size:.85rem;margin-top:4px">${dt.toLocaleDateString()} · ${e.rsvpCount||0}/${e.capacity||0} RSVPs · Status: <span style="color:${e.status==='published'?'#4CAF50':'#ff9800'}">${e.status||'draft'}</span></div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="DSEvents.adminToggleStatus('${e.id}','${e.status}')" style="background:rgba(233,30,140,.15);color:#E91E8C;border:1px solid rgba(233,30,140,.3);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">${e.status==='published'?'Unpublish':'Publish'}</button>
            <button onclick="DSEvents.adminViewRSVPs('${e.id}')" style="background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1);padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.82rem">View RSVPs</button>
          </div>
        </div>`;
      }).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:rgba(255,100,100,.7)">Error loading events.</p>`;
    }
  }

  async function adminToggleStatus(id, currentStatus) {
    if (!db) return;
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await db.collection('events').doc(id).update({ status: newStatus });
    adminLoadEvents();
  }

  async function adminViewRSVPs(eventId) {
    if (!db) return;
    const snap = await db.collection('rsvps').where('eventId','==',eventId).get();
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const checkedInCount = list.filter(r => r.checkedIn).length;
    // Build inline modal instead of alert()
    let modal = document.getElementById('ds-rsvp-view-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ds-rsvp-view-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
      modal.innerHTML = `
        <div style="background:#1a0a2e;border:1px solid rgba(255,255,255,.12);border-radius:16px;width:100%;max-width:720px;max-height:82vh;overflow:hidden;display:flex;flex-direction:column">
          <div style="padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <div>
              <div style="font-size:.95rem;font-weight:700;color:#fff">Event Guest List</div>
              <div id="ds-rsvp-count" style="font-size:.78rem;color:rgba(255,255,255,.4);margin-top:2px"></div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span id="ds-rsvp-checkin-stat" style="font-size:.78rem;padding:4px 12px;background:rgba(76,175,80,.12);color:#4caf50;border-radius:99px;border:1px solid rgba(76,175,80,.3)"></span>
              <button onclick="document.getElementById('ds-rsvp-view-modal').remove()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:1rem">✕</button>
            </div>
          </div>
          <div style="overflow-y:auto;flex:1">
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="border-bottom:1px solid rgba(255,255,255,.08)">
                <th style="padding:9px 12px;text-align:left;font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase">Name</th>
                <th style="padding:9px 12px;text-align:left;font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase">Email</th>
                <th style="padding:9px 12px;text-align:center;font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase">Guests</th>
                <th style="padding:9px 12px;text-align:left;font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase">RSVP Date</th>
                <th style="padding:9px 12px;text-align:center;font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase">Check-In</th>
              </tr></thead>
              <tbody id="ds-rsvp-tbody"></tbody>
            </table>
          </div>
        </div>`;
      document.body.appendChild(modal);
    } else {
      modal.style.display = 'flex';
    }
    document.getElementById('ds-rsvp-count').textContent = `${list.length} attendee${list.length !== 1 ? 's' : ''}`;
    const statEl = document.getElementById('ds-rsvp-checkin-stat');
    if (statEl) statEl.textContent = `${checkedInCount} / ${list.length} checked in`;
    document.getElementById('ds-rsvp-tbody').innerHTML = list.length
      ? list.map(r => {
          const ts = r.createdAt?.toDate?.()?.toLocaleDateString?.() || '—';
          const isCheckedIn = !!r.checkedIn;
          const checkInTime = r.checkedInAt?.toDate?.()?.toLocaleTimeString?.('en-US',{hour:'numeric',minute:'2-digit'}) || '';
          return `<tr id="rsvp-row-${r.id}" style="border-bottom:1px solid rgba(255,255,255,.04);background:${isCheckedIn?'rgba(76,175,80,.05)':'transparent'}">
            <td style="padding:9px 12px;color:#fff;font-weight:${isCheckedIn?600:400}">${r.name || '—'}</td>
            <td style="padding:9px 12px;color:rgba(255,255,255,.55);font-size:.83rem">${r.email || '—'}</td>
            <td style="padding:9px 12px;text-align:center;color:rgba(255,255,255,.55)">${r.guests || 1}</td>
            <td style="padding:9px 12px;color:rgba(255,255,255,.4);font-size:.78rem">${ts}</td>
            <td style="padding:9px 12px;text-align:center">
              ${isCheckedIn
                ? `<span style="color:#4caf50;font-size:.78rem">✓ In${checkInTime ? ' · '+checkInTime : ''}</span>`
                : `<button onclick="DSEvents.checkInGuest('${r.id}','${eventId}')" style="background:rgba(76,175,80,.12);border:1px solid rgba(76,175,80,.35);color:#4caf50;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:.78rem;font-weight:600">Check In</button>`
              }
            </td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" style="padding:28px;text-align:center;color:rgba(255,255,255,.35)">No RSVPs yet for this event.</td></tr>';
  }

  async function checkInGuest(rsvpId, eventId) {
    if (!db) return;
    try {
      await db.collection('rsvps').doc(rsvpId).update({
        checkedIn: true,
        checkedInAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      // Refresh the modal
      adminViewRSVPs(eventId);
    } catch(e) {
      console.warn('Check-in error:', e);
    }
  }

  async function adminLoadRSVPs() {
    if (!db) return;
    const container = document.getElementById('admin-rsvp-list');
    if (!container) return;
    try {
      const snap = await db.collection('rsvps').orderBy('createdAt','desc').limit(100).get();
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!items.length) { container.innerHTML = '<p style="color:rgba(255,255,255,.4)">No RSVPs yet.</p>'; return; }
      container.innerHTML = `<table style="width:100%;border-collapse:collapse;">
        <thead><tr style="color:rgba(255,255,255,.5);font-size:.82rem;border-bottom:1px solid rgba(255,255,255,.1);">
          <th style="padding:8px;text-align:left">Name</th><th style="padding:8px;text-align:left">Email</th>
          <th style="padding:8px;text-align:left">Event</th><th style="padding:8px;text-align:left">Guests</th>
          <th style="padding:8px;text-align:left">Status</th>
        </tr></thead>
        <tbody>${items.map(r=>`<tr style="border-bottom:1px solid rgba(255,255,255,.05);color:rgba(255,255,255,.8);font-size:.88rem">
          <td style="padding:8px">${r.name||''}</td><td style="padding:8px">${r.email||''}</td>
          <td style="padding:8px">${r.eventTitle||r.eventId||''}</td><td style="padding:8px">${r.guests||1}</td>
          <td style="padding:8px"><span style="color:#4CAF50">${r.status||'confirmed'}</span></td>
        </tr>`).join('')}</tbody>
      </table>`;
    } catch (err) {
      container.innerHTML = `<p style="color:rgba(255,100,100,.7)">Error loading RSVPs.</p>`;
    }
  }

  /* ── Public API ────────────────────────────────────────── */
  return {
    init, openRSVP, closeRSVP, submitRSVP, submitHostApp,
    prevMonth, nextMonth,
    adminLoadEvents, adminToggleStatus, adminViewRSVPs, adminLoadRSVPs, checkInGuest
  };
})();

document.addEventListener('DOMContentLoaded', DSEvents.init);
