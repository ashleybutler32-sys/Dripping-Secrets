// ===== DRIPPING SECRETS | auth.js =====
// Handles: Firebase auth, customer accounts, wishlist, order history, booking modals

// ===========================
// WISHLIST (localStorage-backed, Firestore-synced when logged in)
// ===========================

let currentUser = null;

function getLocalWishlist() {
  return JSON.parse(localStorage.getItem('ds_wishlist') || '[]');
}
function setLocalWishlist(arr) {
  localStorage.setItem('ds_wishlist', JSON.stringify(arr));
}
function isWishlisted(pid) {
  return getLocalWishlist().includes(pid);
}

async function toggleWishlist(pid) {
  const wl = getLocalWishlist();
  const idx = wl.indexOf(pid);
  const newList = idx > -1 ? wl.filter(id => id !== pid) : [...wl, pid];
  setLocalWishlist(newList);

  if (currentUser && FIREBASE_READY) {
    try {
      await firebase.firestore().collection('wishlists').doc(currentUser.uid)
        .set({ items: newList }, { merge: true });
    } catch(e) { /* silent */ }
  }

  refreshWishlistIcons(pid);
  updateWishlistBadge();
  return idx === -1;
}

function refreshWishlistIcons(pid) {
  const isWl = isWishlisted(pid);
  document.querySelectorAll(`.wishlist-btn[data-pid="${pid}"]`).forEach(btn => {
    btn.innerHTML = isWl ? '♥' : '♡';
    btn.classList.toggle('wishlisted', isWl);
  });
  const pmBtn = document.getElementById('pm-wishlist-btn');
  if (pmBtn && parseInt(pmBtn.dataset.pid) === pid) {
    pmBtn.textContent = isWl ? '♥ Saved' : '♡ Save';
    pmBtn.classList.toggle('wishlisted', isWl);
  }
}

function updateWishlistBadge() {
  const count = getLocalWishlist().length;
  const badge = document.getElementById('wishlist-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    badge.setAttribute('aria-live', 'polite');
    badge.setAttribute('aria-atomic', 'true');
  }
  const acctBtn = document.getElementById('account-btn');
  if (acctBtn) acctBtn.setAttribute('aria-label', count > 0 ? `My Account, ${count} wishlist item${count !== 1 ? 's' : ''}` : 'My Account');
}

// ===========================
// FIREBASE AUTH
// ===========================

function initAuth() {
  if (!FIREBASE_READY) return;

  // Explicitly lock auth session to LOCAL persistence.
  // This guarantees sign-in sessions survive browser restarts, service-worker
  // updates, and site deploys — customers stay logged in across all changes.
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(() => { /* fallback: continue without explicit persistence */ })
    .finally(() => {
      firebase.auth().onAuthStateChanged(async (user) => {
        currentUser = user;
        updateHeaderAuthUI();
        if (user) {
          try {
            const snap = await firebase.firestore().collection('wishlists').doc(user.uid).get();
            if (snap.exists) {
              const remote = snap.data().items || [];
              const local  = getLocalWishlist();
              const merged = [...new Set([...local, ...remote])];
              setLocalWishlist(merged);
              await firebase.firestore().collection('wishlists').doc(user.uid).set({ items: merged });
            }
          } catch(e) { /* silent */ }
          updateWishlistBadge();
          // Load cloud cart — signed-in users keep their cart across devices/sessions
          if (typeof loadCartFromCloud === 'function') loadCartFromCloud();
        }
      });
    });
}

function updateHeaderAuthUI() {
  const btn = document.getElementById('account-btn');
  if (!btn) return;
  if (currentUser) {
    btn.classList.add('logged-in');
    btn.title = `My Account — ${currentUser.email}`;
  } else {
    btn.classList.remove('logged-in');
    btn.title = 'Sign In / Create Account';
  }
}

// ===========================
// AUTH MODAL (Login / Sign Up)
// ===========================

function openAccountBtn() {
  if (currentUser) window.location.href = '/account.html';
  else openAuthModal('login');
}

function openAuthModal(mode) {
  if (!FIREBASE_READY) {
    showAuthNotReady(); return;
  }
  renderAuthModal(mode);
  document.getElementById('auth-overlay').classList.add('open');
  document.getElementById('auth-modal').classList.add('open');
}
function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
  document.getElementById('auth-overlay')?.classList.remove('open');
}

function showAuthNotReady() {
  // Accounts are live — redirect to portal
  window.location.href = '/account.html';
}

function renderAuthModal(mode) {
  const modal = document.getElementById('auth-modal');
  let html = '';
  if (mode === 'login') {
    html = `
    <div class="auth-inner">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      <img src="images/logos/ds-circle-logo-official.png" alt="DS" style="height:44px;display:block;margin:0 auto 20px;">
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-sub">Sign in to your account.</p>
      <div class="auth-fields">
        <input type="email" id="auth-email" placeholder="Email Address" autocomplete="email">
        <input type="password" id="auth-password" placeholder="Password" autocomplete="current-password"
          onkeydown="if(event.key==='Enter') signIn()">
      </div>
      <div id="auth-error" class="auth-error" style="display:none;"></div>
      <button class="btn-primary auth-submit-btn" onclick="signIn()">Sign In</button>
      <p class="auth-switch" style="margin-top:8px;"><a href="#" onclick="renderAuthModal('forgot');return false;" style="color:#B76E79;font-size:0.85rem;">Forgot password?</a></p>
      <p class="auth-switch">No account yet? <a href="#" onclick="renderAuthModal('signup');return false;">Create one</a></p>
    </div>`;
  } else if (mode === 'forgot') {
    html = `
    <div class="auth-inner">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      <img src="images/logos/ds-circle-logo-official.png" alt="DS" style="height:44px;display:block;margin:0 auto 20px;">
      <h2 class="auth-title">Reset Password</h2>
      <p class="auth-sub">Enter your email and we'll send a reset link.</p>
      <div class="auth-fields">
        <input type="email" id="auth-email" placeholder="Email Address" autocomplete="email"
          onkeydown="if(event.key==='Enter') sendPasswordReset()">
      </div>
      <div id="auth-error" class="auth-error" style="display:none;"></div>
      <button class="btn-primary auth-submit-btn" onclick="sendPasswordReset()">Send Reset Link</button>
      <p class="auth-switch"><a href="#" onclick="renderAuthModal('login');return false;">Back to Sign In</a></p>
    </div>`;
  } else {
    html = `
    <div class="auth-inner">
      <button class="auth-close" onclick="closeAuthModal()">✕</button>
      <img src="images/logos/ds-circle-logo-official.png" alt="DS" style="height:44px;display:block;margin:0 auto 20px;">
      <h2 class="auth-title">Join the Secrets</h2>
      <p class="auth-sub">Free account — save wishlists & track orders.</p>
      <div class="auth-fields">
        <input type="text" id="auth-name" placeholder="Your Name" autocomplete="name">
        <input type="email" id="auth-email" placeholder="Email Address" autocomplete="email">
        <input type="password" id="auth-password" placeholder="Password (min 6 characters)" autocomplete="new-password"
          onkeydown="if(event.key==='Enter') signUp()">
      </div>
      <div id="auth-error" class="auth-error" style="display:none;"></div>
      <button class="btn-primary auth-submit-btn" onclick="signUp()">Create Account</button>
      <p class="auth-switch">Already have an account? <a href="#" onclick="renderAuthModal('login');return false;">Sign in</a></p>
    </div>`;
  }
  modal.innerHTML = html;
}

async function sendPasswordReset() {
  const email = document.getElementById('auth-email')?.value.trim();
  if (!email) { showAuthErr('Please enter your email address.'); return; }
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    const modal = document.getElementById('auth-modal');
    modal.innerHTML = `
      <div class="auth-inner" style="text-align:center;">
        <button class="auth-close" onclick="closeAuthModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" alt="DS" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="auth-title" style="color:#B76E79;">Password reset email sent.</h2>
        <p class="auth-sub">Please check your inbox.<br><span style="font-size:.8rem;color:var(--muted,#888)">Check your spam folder if you don't see it.</span></p>
        <button class="btn-primary auth-submit-btn" onclick="renderAuthModal('login')">Back to Sign In</button>
      </div>`;
  } catch(e) {
    showAuthErr(friendlyFirebaseError(e.code));
  }
}

async function signIn() {
  const email = document.getElementById('auth-email')?.value.trim();
  const pass  = document.getElementById('auth-password')?.value;
  if (!email || !pass) { showAuthErr('Please fill in all fields.'); return; }
  const btn = document.querySelector('.auth-submit-btn');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pass);
    closeAuthModal();
  } catch(e) {
    showAuthErr(friendlyFirebaseError(e.code));
    btn.textContent = 'Sign In'; btn.disabled = false;
  }
}

async function signUp() {
  const name  = document.getElementById('auth-name')?.value.trim();
  const email = document.getElementById('auth-email')?.value.trim();
  const pass  = document.getElementById('auth-password')?.value;
  if (!name||!email||!pass) { showAuthErr('Please fill in all fields.'); return; }
  if (pass.length < 6)     { showAuthErr('Password must be at least 6 characters.'); return; }
  const btn = document.querySelector('.auth-submit-btn');
  btn.textContent = 'Creating account…'; btn.disabled = true;
  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    await firebase.firestore().collection('users').doc(cred.user.uid).set({
      name, email, createdAt: firebase.firestore.FieldValue.serverTimestamp(), marketingOptIn: true
    });
    // Subscribe new customer to Brevo marketing list (fire and forget — never blocks signup)
    fetch('/.netlify/functions/brevo-sync', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, action: 'subscribe' })
    }).catch(() => {});
    closeAuthModal();
  } catch(e) {
    showAuthErr(friendlyFirebaseError(e.code));
    btn.textContent = 'Create Account'; btn.disabled = false;
  }
}

function showAuthErr(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function friendlyFirebaseError(code) {
  return ({
    'auth/wrong-password':          'Incorrect password. Try again.',
    'auth/invalid-credential':      'Incorrect email or password. Try again.',
    'auth/user-not-found':          'No account found with that email.',
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/network-request-failed':  'Network error — check your connection.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment and try again.',
    'auth/user-disabled':           'This account has been disabled. Contact support.',
    'auth/unauthorized-domain':     'Sign-in is temporarily unavailable from this browser. Please try again or contact support.',
  })[code] || 'Something went wrong. Please try again.';
}

async function signOut() {
  if (FIREBASE_READY) await firebase.auth().signOut();
  currentUser = null;
  updateHeaderAuthUI();
  closeAccountModal();
}

// ===========================
// ACCOUNT DASHBOARD MODAL
// ===========================

async function openAccountModal() {
  const modal   = document.getElementById('account-modal');
  const overlay = document.getElementById('account-overlay');
  if (!modal) return;

  const wl = getLocalWishlist();
  const prods = typeof getProducts === 'function' ? getProducts() : (window.DEFAULT_PRODUCTS || []);
  const wlProds = prods.filter(p => wl.includes(p.id));

  let orders = [];
  let notifEnabled   = true;
  let marketingOptIn = true;
  if (currentUser && FIREBASE_READY) {
    try {
      const snap = await firebase.firestore()
        .collection('users').doc(currentUser.uid)
        .collection('orders').orderBy('createdAt','desc').limit(20).get();
      orders = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch(e) {
      // fallback: try legacy path
      try {
        const snap2 = await firebase.firestore()
          .collection('orders').doc(currentUser.uid)
          .collection('history').orderBy('createdAt','desc').limit(20).get();
        orders = snap2.docs.map(d => ({ ...d.data(), id: d.id }));
      } catch(e2) { /* silent */ }
    }
    // Load notification preferences
    try {
      const userDoc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        const ud = userDoc.data();
        if (ud.shippingNotify !== undefined) notifEnabled   = ud.shippingNotify;
        if (ud.marketingOptIn !== undefined) marketingOptIn = ud.marketingOptIn;
      }
    } catch(e) { /* silent */ }
  }

  modal.innerHTML = `
    <div class="acct-inner">
      <button class="acct-close" onclick="closeAccountModal()">✕</button>
      <div class="acct-header">
        <img src="images/logos/ds-circle-logo-official.png" style="height:38px;">
        <div>
          <p class="acct-name">${currentUser?.displayName || 'My Account'}</p>
          <p class="acct-email">${currentUser?.email || ''}</p>
        </div>
      </div>

      <div class="acct-tabs">
        <button class="acct-tab active" onclick="switchAcctTab('wishlist',this)">♡ Saved (${wlProds.length})</button>
        <button class="acct-tab" onclick="switchAcctTab('orders',this)">Orders (${orders.length})</button>
        <button class="acct-tab" onclick="switchAcctTab('settings',this)" aria-label="Settings"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg></button>
      </div>

      <div id="acct-tab-wishlist" class="acct-tab-content">
        ${wlProds.length === 0
          ? `<div class="acct-empty"><p>Your wishlist is empty</p><p class="acct-empty-sub">Tap ♡ on any product to save it here.</p></div>`
          : `<div class="acct-wl-grid">${wlProds.map(p => `
              <div class="acct-wl-item" onclick="closeAccountModal();openProductModal(${p.id})">
                <img src="${p.image}" alt="${p.name}" class="acct-wl-img">
                <div class="acct-wl-info">
                  <p class="acct-wl-name">${p.name}</p>
                  <p class="acct-wl-price">$${p.price.toFixed(2)}</p>
                </div>
                <button class="acct-wl-remove" onclick="event.stopPropagation();toggleWishlist(${p.id}).then(()=>openAccountModal())">✕</button>
              </div>`).join('')}
            </div>`}
      </div>

      <div id="acct-tab-orders" class="acct-tab-content" style="display:none;">
        ${orders.length === 0
          ? `<div class="acct-empty"><p>No orders yet</p><p class="acct-empty-sub">Your confirmed orders will appear here.</p></div>`
          : orders.map(o => `
            <div class="acct-order">
              <div class="acct-order-row">
                <span class="acct-order-num">${o.orderId || o.id}</span>
                <span class="acct-order-badge status-${(o.status||'pending').toLowerCase()}">${o.status||'Pending'}</span>
              </div>
              <p class="acct-order-meta">${o.createdAt?.toDate?.().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})||'Recent'} · Total: <strong>$${(o.total||0).toFixed(2)}</strong></p>
              ${o.items ? `<p class="acct-order-items">${o.items.map(i=>i.name+(i.qty>1?` ×${i.qty}`:'')).join(', ')}</p>` : ''}
              ${o.trackingNumber
                ? `<div class="acct-tracking"><span class="acct-tracking-label">Tracking:</span>
                   <a href="https://www.ups.com/track?tracknum=${o.trackingNumber}" target="_blank" rel="noopener" class="acct-tracking-link">${o.trackingNumber} — Track Package →</a></div>`
                : (o.status !== 'fulfilled' ? `<p style="font-size:.78rem;color:rgba(255,255,255,.35);margin-top:4px;">Tracking will appear here once your order ships.</p>` : '')}
            </div>`).join('')}
      </div>

      <div id="acct-tab-settings" class="acct-tab-content" style="display:none;">
        <div class="acct-setting-row">
          <div>
            <p class="acct-setting-label">Shipping Notifications</p>
            <p class="acct-setting-sub">Get an email when your order ships with your tracking number.</p>
          </div>
          <label class="acct-toggle">
            <input type="checkbox" id="notif-toggle" ${notifEnabled ? 'checked' : ''}
              onchange="updateNotifPref(this.checked)">
            <span class="acct-toggle-slider"></span>
          </label>
        </div>
        <div class="acct-setting-row" style="margin-top:12px;">
          <div>
            <p class="acct-setting-label">Marketing &amp; Promotions</p>
            <p class="acct-setting-sub">New drops, exclusive deals, and members-only offers straight to your inbox.</p>
          </div>
          <label class="acct-toggle">
            <input type="checkbox" id="marketing-toggle" ${marketingOptIn ? 'checked' : ''}
              onchange="updateMarketingPref(this.checked)">
            <span class="acct-toggle-slider"></span>
          </label>
        </div>
      </div>

      <button class="btn-ghost acct-signout" onclick="signOut()">Sign Out</button>
    </div>
  `;

  overlay.classList.add('open');
  modal.classList.add('open');
}

function closeAccountModal() {
  document.getElementById('account-modal')?.classList.remove('open');
  document.getElementById('account-overlay')?.classList.remove('open');
}

function switchAcctTab(tab, btn) {
  document.querySelectorAll('.acct-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.acct-tab-content').forEach(c => c.style.display = 'none');
  btn.classList.add('active');
  document.getElementById(`acct-tab-${tab}`).style.display = 'block';
}

// ===========================
// SAVE ORDER TO FIRESTORE
// ===========================

async function saveOrderToFirestore(orderData) {
  if (!FIREBASE_READY) return;
  try {
    const payload = {
      ...orderData,
      uid:       currentUser?.uid || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    // Save to global orders collection — admin panel reads from here
    await firebase.firestore()
      .collection('orders').doc(orderData.orderId)
      .set(payload);
    // Also save to user subcollection if signed in
    if (currentUser) {
      await firebase.firestore()
        .collection('users').doc(currentUser.uid)
        .collection('orders').doc(orderData.orderId)
        .set(payload);
    }
  } catch(e) { /* silent */ }
}

// ===========================
// CLOUD CART SYNC
// ===========================

async function syncCartToCloud() {
  if (!currentUser || !FIREBASE_READY) return;
  try {
    const cartData = JSON.parse(localStorage.getItem('ds_cart') || '[]');
    await firebase.firestore().collection('users').doc(currentUser.uid)
      .set({ cart: cartData }, { merge: true });
  } catch(e) { /* silent */ }
}

async function loadCartFromCloud() {
  if (!currentUser || !FIREBASE_READY) return;
  try {
    const doc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
    if (!doc.exists) return;
    const cloudCart = doc.data().cart;
    if (!cloudCart || !cloudCart.length) return;
    // Merge cloud cart with local (cloud wins on conflicts, keep unique items)
    const local = JSON.parse(localStorage.getItem('ds_cart') || '[]');
    const merged = [...cloudCart];
    local.forEach(li => {
      const exists = merged.find(ci => ci.cartKey === li.cartKey || ci.id === li.id);
      if (!exists) merged.push(li);
    });
    localStorage.setItem('ds_cart', JSON.stringify(merged));
    if (typeof cart !== 'undefined') {
      // Update the in-memory cart array and re-render
      cart.length = 0;
      merged.forEach(i => cart.push(i));
      if (typeof renderCartDrawer === 'function') renderCartDrawer();
    }
  } catch(e) { /* silent */ }
}


async function updateNotifPref(enabled) {
  if (!currentUser || !FIREBASE_READY) return;
  try {
    await firebase.firestore().collection('users').doc(currentUser.uid)
      .set({ shippingNotify: enabled }, { merge: true });
  } catch(e) { /* silent */ }
}

async function updateMarketingPref(enabled) {
  if (!currentUser || !FIREBASE_READY) return;
  try {
    await firebase.firestore().collection('users').doc(currentUser.uid)
      .set({ marketingOptIn: enabled }, { merge: true });
    // Sync to Brevo (fire and forget — never blocks UI)
    fetch('/.netlify/functions/brevo-sync', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email:  currentUser.email,
        name:   currentUser.displayName || '',
        action: enabled ? 'subscribe' : 'unsubscribe'
      })
    }).catch(() => {});
  } catch(e) { /* silent */ }
}
// ===========================
// BOOKING MODALS
// ===========================

function openBookingModal(type) {
  const modal   = document.getElementById('booking-modal');
  const overlay = document.getElementById('booking-overlay');
  if (!modal) return;
  const today = new Date().toISOString().split('T')[0];

  // ── Private Shopping Session with Dimi (FREE) ──────────────────────
  if (type === 'private-shopping') {
    modal.innerHTML = `
      <div class="booking-inner">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="booking-title">Private Shopping Session</h2>
        <div class="booking-info-block">
          <p class="booking-info-heading">Shop 1-on-1 with Dimi — Complimentary</p>
          <p class="booking-info-body">Let Dimi walk you through the entire store — toy by toy, bag by bag — in a private, pressure-free video or phone session. No purchase required. Think personal shopper meets sassy best friend. This one's on us.</p>
          <div class="booking-fee-badge" style="background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.3);color:#4ade80;">✅ Completely FREE — no payment, no catch</div>
        </div>
        <div class="booking-fields">
          <input type="text"  id="bk-name"  placeholder="Your Name *" required>
          <input type="email" id="bk-email" placeholder="Email Address *" required>
          <input type="tel"   id="bk-phone" placeholder="Phone Number">
          <div class="bk-field-group">
            <label class="bk-field-label">Preferred date<span class="bk-field-hint"> — we'll confirm a time that works</span></label>
            <input type="date" id="bk-date" min="${today}">
          </div>
          <select id="bk-format">
            <option value="">How would you like to connect?</option>
            <option>Phone Call</option>
            <option>Video Call (Zoom / FaceTime)</option>
            <option>Text Session (we shop via DMs)</option>
          </select>
          <textarea id="bk-notes" placeholder="What are you shopping for? Occasion, vibe, budget — spill it!" rows="3"></textarea>
        </div>
        <button class="btn-primary booking-submit-btn" onclick="submitBooking('private-shopping')">Book My Free Session ✨</button>
        <p class="booking-footer-note">Dimi will reach out within 24 hours to confirm.</p>
      </div>`;
    overlay.classList.add('open'); modal.classList.add('open'); return;
  }

  // ── Couples Experience ──────────────────────────────────────────────
  if (type === 'couples-experience') {
    modal.innerHTML = `
      <div class="booking-inner">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="booking-title">Couples Experience</h2>
        <div class="booking-info-block">
          <p class="booking-info-heading">A curated experience for two</p>
          <p class="booking-info-body">Whether you're newly together or years deep, a Couples Experience session gives you and your partner a private, judgment-free space to explore new ways to connect — guided by a Secret Keeper. Product guidance, intimacy conversation, or just figuring out what you're both curious about. We keep it real and we keep it fun.</p>
          <div class="booking-fee-badge">$75 per couples session — payment collected before session begins</div>
        </div>
        <div class="booking-fields">
          <input type="text"  id="bk-name"  placeholder="Your Name(s) *" required>
          <input type="email" id="bk-email" placeholder="Email Address *" required>
          <input type="tel"   id="bk-phone" placeholder="Phone Number">
          <div class="bk-field-group">
            <label class="bk-field-label">Requested date</label>
            <input type="date" id="bk-date" min="${today}">
          </div>
          <select id="bk-format">
            <option value="">Session format</option>
            <option>Phone Call</option>
            <option>Video Call (Zoom / FaceTime)</option>
            <option>In-Person — DFW Metro</option>
          </select>
          <textarea id="bk-notes" placeholder="Tell us a little about you two — what you're hoping to explore or improve. No judgment, ever." rows="3"></textarea>
        </div>
        <button class="btn-primary booking-submit-btn" onclick="submitBooking('couples-experience')">Request Our Session </button>
        <p class="booking-footer-note">A Secret Keeper will confirm your slot within 24 hours.</p>
      </div>`;
    overlay.classList.add('open'); modal.classList.add('open'); return;
  }

  // ── Gift Curation ───────────────────────────────────────────────────
  if (type === 'gift-curation') {
    modal.innerHTML = `
      <div class="booking-inner">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="booking-title">Gift Curation Session</h2>
        <div class="booking-info-block">
          <p class="booking-info-heading">The perfect gift — we'll find it</p>
          <p class="booking-info-body">Buying intimate gifts is tricky. We make it easy. Tell us about the person you're shopping for — their vibe, your budget, the occasion — and a Secret Keeper will hand-select a gift set that actually lands. Discretely packaged, thoughtfully curated.</p>
          <div class="booking-fee-badge">✨ FREE service — you just pay for the products</div>
        </div>
        <div class="booking-fields">
          <input type="text"  id="bk-name"  placeholder="Your Name *" required>
          <input type="email" id="bk-email" placeholder="Email Address *" required>
          <input type="tel"   id="bk-phone" placeholder="Phone Number">
          <input type="text"  id="bk-budget" placeholder="Budget (e.g. Under $75)">
          <textarea id="bk-notes" placeholder="Tell us about the lucky person — their style, anything they've mentioned loving or wanting, the occasion. The more detail, the better the gift." rows="4"></textarea>
        </div>
        <button class="btn-primary booking-submit-btn" onclick="submitBooking('gift-curation')">Start My Curation </button>
        <p class="booking-footer-note">A Secret Keeper will reach out within 24 hours with options.</p>
      </div>`;
    overlay.classList.add('open'); modal.classList.add('open'); return;
  }

  // ── Secret Party ────────────────────────────────────────────────────
  const isParty = type === 'party';
  if (isParty) {
    modal.innerHTML = `
      <div class="booking-inner">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="booking-title">Book a Secret Party</h2>
        <p class="booking-sub">Tell us about your event and a Secret Keeper will reach out within 24 hours with everything you need to know.</p>
        <div class="booking-fields">
          <input type="text"  id="bk-name"  placeholder="Your Name *" required>
          <input type="email" id="bk-email" placeholder="Email Address *" required>
          <input type="tel"   id="bk-phone" placeholder="Phone Number">
          <div class="bk-field-group">
            <label class="bk-field-label">When do our secrets need to flow? <span class="bk-field-hint"> — expected event/party date</span></label>
            <input type="date" id="bk-date" min="${today}">
          </div>
          <input type="text" id="bk-loc" placeholder="Party Location (city / neighborhood)">
          <div class="bk-field-group" style="margin-top:14px;">
            <label class="bk-field-label">Ship party goodies to the host?</label>
            <p style="font-size:0.78rem;color:#a78bfa;margin:2px 0 10px;">When you book, we ship a curated welcome package to the host's door. Drop the address below!</p>
            <input type="text" id="bk-ship-addr" placeholder="Shipping Address">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
              <input type="text" id="bk-ship-city" placeholder="City">
              <input type="text" id="bk-ship-state" placeholder="State">
            </div>
            <input type="text" id="bk-ship-zip" placeholder="ZIP Code" style="margin-top:8px;">
          </div>
          <select id="bk-guests">
            <option value="">Estimated Guest Count</option>
            <option>Under 10</option>
            <option>10–20</option>
            <option>20–40</option>
            <option>40+</option>
          </select>
          <div class="bk-field-group">
            <label class="bk-field-label">Tell us your vision for the party… ✨</label>
            <textarea id="bk-notes" placeholder="Theme, vibe, must-haves, special requests — spill it all. A Secret Keeper will give you a whisper back with how we make it happen. 🖤" rows="4"></textarea>
          </div>
        </div>
        <button class="btn-primary booking-submit-btn" onclick="submitBooking('party')">
          Send My Vision
        </button>
        <p class="booking-footer-note">A Secret Keeper will respond within 24 hours.</p>
      </div>`;
  } else {
    modal.innerHTML = `
      <div class="booking-inner">
        <button class="booking-close" onclick="closeBookingModal()">✕</button>
        <img src="images/logos/ds-circle-logo-official.png" style="height:44px;display:block;margin:0 auto 20px;">
        <h2 class="booking-title">✨ Book a Private Shopping Session</h2>

        <div class="booking-info-block">
          <p class="booking-info-heading">What is a Private Shopping Session?</p>
          <p class="booking-info-body">
            Our sessions are a safe, judgment-free space for real conversations about bodies, intimacy, and wellness.
            We offer <strong>Coming of Age sessions</strong> — with a parent or guardian's initiation and full consent —
            where young people (preteen and up) learn about their bodies, the changes they're experiencing, the urges
            that come with them, and healthy, age-appropriate options. Think of it as Sex Ed with a PhD. Not literally,
            but yeah.
          </p>
          <p class="booking-info-body" style="margin-top:10px;">
            Consultations are also available for adults seeking in-depth product guidance, serious event planning,
            or any conversation that needs more than a quick chat — whether that's a phone call, video session,
            or meeting for coffee in DFW.
          </p>
          <div class="booking-fee-badge">$50 per session — payment collected before your consultation begins</div>
        </div>

        <div class="booking-fields">
          <input type="text"  id="bk-name"  placeholder="Your Name *" required>
          <input type="email" id="bk-email" placeholder="Email Address *" required>
          <input type="tel"   id="bk-phone" placeholder="Phone Number">
          <div class="bk-field-group">
            <label class="bk-field-label">Requested consultation date<span class="bk-field-hint"> — your preferred or expected date</span></label>
            <input type="date" id="bk-date" min="${today}">
          </div>
          <div class="bk-field-group">
            <label class="bk-field-label">Preferred time</label>
            <select id="bk-time">
              <option value="">Select a time window</option>
              <option>Morning (9am – 12pm)</option>
              <option>Early Afternoon (12pm – 3pm)</option>
              <option>Late Afternoon (3pm – 6pm)</option>
              <option>Evening (6pm – 9pm)</option>
            </select>
          </div>
          <select id="bk-format">
            <option value="">Session Type</option>
            <option>Phone Call (30+ min deep dive)</option>
            <option>Video Call (Zoom / FaceTime)</option>
            <option>In-Person — Coffee / Drinks (DFW Metro)</option>
            <option>Event Planning Session (phone or video)</option>
            <option>Coming of Age Session (parent-initiated, in-person)</option>
          </select>
          <textarea id="bk-notes" placeholder="What would you like to cover? The more you share, the better we can prepare your session." rows="3"></textarea>
        </div>
        <button class="btn-primary booking-submit-btn" onclick="submitBooking('consult')">
          Request My Session ✨
        </button>
        <p class="booking-footer-note">A Secret Keeper will confirm your time slot within 24 hours. Payment link sent before session.</p>
      </div>`;
  }

  overlay.classList.add('open');
  modal.classList.add('open');
}

function closeBookingModal() {
  document.getElementById('booking-modal')?.classList.remove('open');
  document.getElementById('booking-overlay')?.classList.remove('open');
}

function submitBooking(type) {
  const name  = document.getElementById('bk-name')?.value.trim();
  const email = document.getElementById('bk-email')?.value.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }

  const phone   = document.getElementById('bk-phone')?.value.trim() || 'Not provided';
  const date    = document.getElementById('bk-date')?.value || 'Flexible';
  const notes   = document.getElementById('bk-notes')?.value.trim() || 'None';
  const isParty = type === 'party';
  let extra = '';

  if (type === 'gift-curation') {
    const budget = document.getElementById('bk-budget')?.value.trim() || 'Not specified';
    extra = `Budget: ${budget}\n`;
  } else if (type === 'private-shopping' || type === 'couples-experience') {
    const fmt = document.getElementById('bk-format')?.value || 'TBD';
    extra = `Session Format: ${fmt}\n`;
  } else if (type === 'consult') {
    const time   = document.getElementById('bk-time')?.value   || 'TBD';
    const format = document.getElementById('bk-format')?.value || 'TBD';
    extra = `Preferred Time: ${time}\nSession Type: ${format}\n`;
  }

  if (isParty) {
    const _sA = document.getElementById('bk-ship-addr')?.value.trim() || '';
    const _sC = document.getElementById('bk-ship-city')?.value.trim() || '';
    const _sS = document.getElementById('bk-ship-state')?.value.trim() || '';
    const _sZ = document.getElementById('bk-ship-zip')?.value.trim() || '';
    const hostShip = _sA ? `${_sA}, ${_sC}, ${_sS} ${_sZ}`.trim() : 'Not provided';
    extra = `Location: ${document.getElementById('bk-loc')?.value||'TBD'}\nGuests: ${document.getElementById('bk-guests')?.value||'TBD'}\nHost Ship-To: ${hostShip}\n`;
  } else {
    const time   = document.getElementById('bk-time')?.value   || 'TBD';
    const format = document.getElementById('bk-format')?.value || 'TBD';
    extra = `Preferred Time: ${time}\nSession Type: ${format}\n`;
  }

  const typeLabels = { party: 'Secret Party Request', consult: 'Private Shopping Session Request', 'private-shopping': 'Private Shopping Session', 'couples-experience': 'Couples Experience Request', 'gift-curation': 'Gift Curation Request' };
  const subject = `${typeLabels[type] || 'Booking Request'} — ${name}`;
  const body    = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\n${extra}Notes: ${notes}`;
  window.location.href = `mailto:Assistant.Manager@DrippingSecrets.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Dimi real-time booking alert
  if (typeof dimiAlert === 'function') {
    if (isParty) {
      dimiAlert('new_booking', {
        customer_name: name,
        contact: email + (phone !== 'Not provided' ? ` / ${phone}` : ''),
        event_date: date,
        party_size: document.getElementById('bk-guests')?.value || 'TBD',
        host_shipping: hostShip || 'Not provided',
        notes: notes
      });
    }
  }

  const typeEmojis = { party:'🎉', consult:'✨', 'private-shopping':'', 'couples-experience':'', 'gift-curation':'' };
  const typeNames  = { party:'party request', consult:'consultation request', 'private-shopping':'private shopping request', 'couples-experience':'couples session request', 'gift-curation':'gift curation request' };
  const needsPayment = (type === 'consult' || type === 'couples-experience');
  document.getElementById('booking-modal').innerHTML = `
    <div class="booking-inner" style="text-align:center;">
      <button class="booking-close" onclick="closeBookingModal()">✕</button>
      <div style="font-size:3.5rem;margin-bottom:1rem;">${typeEmojis[type]||'✨'}</div>
      <h2 class="booking-title">Request Sent!</h2>
      <p style="color:rgba(255,255,255,0.65);margin-top:1rem;line-height:1.7;">
        Your ${typeNames[type]||'request'} is on its way.<br>
        A Secret Keeper will reach out to <strong>${email}</strong> within 24 hours.
        ${needsPayment ? '<br><br>Payment instructions will be sent before your session.' : ''}
      </p>
      <button class="btn-primary" style="margin-top:2rem;" onclick="closeBookingModal()">Close</button>
    </div>`;
}

// ===========================
// INIT
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  updateWishlistBadge();
});
