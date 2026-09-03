// ===== DRIPPING SECRETS | cart.js | v9.74 =====

// ── Dimi Real-Time Alerts ──────────────────────────────────────
// Dimi real-time alert endpoint — routed through Tasklet webhook
const DS_ALERT_WEBHOOK = 'https://webhooks.tasklet.ai/v1/public/webhook/a_nhtea5mytd71g3pxm9rv?token=e89b8d15149c9c32d6fb6c1795fa425d';

function dimiAlert(event_type, data = {}) {
  if (!DS_ALERT_WEBHOOK || DS_ALERT_WEBHOOK === 'PASTE_WEBHOOK_URL_HERE') return;
  try {
    fetch(DS_ALERT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, ...data })
    }).catch(() => {}); // silent fail — never blocks the customer
  } catch(e) {}
}
// ──────────────────────────────────────────────────────────────

// ── Flash Sale ─────────────────────────────────────────────────
const FLASH_SALE = {
  active: false,
  endDate: new Date('2026-06-21T00:00:00'),   // expired June 20
  productDiscount: 0.30,                       // 30% off regular items
  boxDiscount:     0.10,                       // 10% off boxes & bundles
  label: 'Flash Sale'
};

function flashSaleIsLive() {
  return FLASH_SALE.active && new Date() < FLASH_SALE.endDate;
}

function isBoxItem(item) {
  const n = (item.name || '').toLowerCase();
  return n.includes('box') || n.includes('bundle') || n.includes('subscription');
}

function getFlashSaleDiscount() {
  if (!flashSaleIsLive()) return 0;
  return cart.reduce((total, item) => {
    const rate = isBoxItem(item) ? FLASH_SALE.boxDiscount : FLASH_SALE.productDiscount;
    return total + (item.price * item.qty * rate);
  }, 0);
}
// ──────────────────────────────────────────────────────────────

let cart = JSON.parse(localStorage.getItem('ds_cart') || '[]');

function saveCart() {
  localStorage.setItem('ds_cart', JSON.stringify(cart));
  if (typeof syncCartToCloud === 'function') syncCartToCloud();
}
function getCartCount()  { return cart.reduce((s,i) => s + i.qty, 0); }
function getCartSubtotal() { return cart.reduce((s,i) => s + i.price * i.qty, 0); }
function getCartTotal()  { return Math.max(0, getCartSubtotal() - getFlashSaleDiscount()) + _shippingCost; }
function hasLingerieInCart() {
  const lingerieCategories = ['lingerie','costume','costumes','apparel'];
  return cart.some(item => {
    const product = (window.PRODUCTS || []).find(p => p.id === item.id);
    return product && lingerieCategories.includes((product.category||'').toLowerCase());
  });
}
function hasDropshipInCart() {
  return cart.some(item => item.dropship === true || item.id >= 14);
}

// ===========================
// SHIPMENT GROUPS
// Returns array of { key, label, badge, eta, etaDays, items[] }
// Supplier names are intentionally hidden from customer-facing text.
// ===========================
function getShipmentGroups() {
  const groups = {};

  cart.forEach(item => {
    let key, label, badge, etaDays;

    const isDL       = item.id >= 14  && item.id <= 33;   // Dear Lover IDs 14–33
    const isCJ       = item.id >= 277 && item.id <= 314;  // CJDropshipping IDs 277–314
    const isTopDawg  = item.id >= 393 && item.id <= 492;  // TopDawg IDs 393–492
    const isLuxuryPlay = item.id >= 600 && item.id <= 699;  // Luxury Play IDs 600–699

    if (isCJ) {
      key = 'cj';
      label = 'Ships directly to you';
      badge = 'Direct Delivery';
      etaDays = [7, 15];
    } else if (isLuxuryPlay) {
      key = 'luxury_play';
      label = 'Ships directly to you · Premium international delivery';
      badge = 'Luxury Play';
      etaDays = [7, 10];
    } else if (isTopDawg) {
      key = 'topdawg';
      label = 'Ships directly to you';
      badge = 'US Direct';
      etaDays = [2, 5];
    } else if (isDL) {
      key = 'dl';
      label = 'Ships directly to you';
      badge = 'International Direct';
      etaDays = [10, 21];
    } else {
      key = 'physical';
      label = 'Ships from Dripping Secrets (DFW)';
      badge = 'In-House Order';
      etaDays = null; // UPS-driven, set dynamically
    }

    if (!groups[key]) groups[key] = { key, label, badge, etaDays, items: [] };
    groups[key].items.push(item);
  });

  return Object.values(groups);
}

function getBusinessDateRange(minDays, maxDays) {
  function addBiz(date, n) {
    let d = new Date(date);
    let added = 0;
    while (added < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  }
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const now = new Date();
  const early = addBiz(now, minDays);
  const late  = addBiz(now, maxDays);
  return `${fmt(early)} – ${fmt(late)}`;
}

const LOCAL_DELIVERY_MIN_ORDER = 50; // $50 minimum for same-day personal delivery

function isLocalDeliveryZip(zip) {
  if (!zip || zip.length < 5) return false;
  const settings = typeof getLocalDeliverySettings === 'function' ? getLocalDeliverySettings() : { enabled: true, zones: ['750','751','752','753','754','755','760','761','762','763'] };
  if (!settings.enabled) return false;
  const prefix = zip.substring(0, 3);
  return settings.zones.includes(prefix);
}

function isLocalDeliveryEligible(zip) {
  // Must be in DFW zone AND cart subtotal >= $50
  return isLocalDeliveryZip(zip) && getCartSubtotal() >= LOCAL_DELIVERY_MIN_ORDER;
}

function getLocalDeliveryFee() {
  const settings = typeof getLocalDeliverySettings === 'function' ? getLocalDeliverySettings() : { fee: 15 };
  return settings.fee || 15;
}

function getDeliveryDayOptions() {
  const days = [];
  const now  = new Date();
  const hour = now.getHours(); // CST approx
  // "Today" only if before 1pm
  if (hour < 13) {
    days.push({ value: 'today', label: 'Today, ' + now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) });
  }
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    // skip sundays
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    days.push({ value: 'day' + i, label: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) });
  }
  return days;
}

function renderTimeSlotPicker() {
  const dayOpts = getDeliveryDayOptions();
  const fee = getLocalDeliveryFee();
  const firstDay = dayOpts[0] ? dayOpts[0].value : 'day1';
  return `
    <div class="time-slot-wrap" id="time-slot-wrap">
      <p class="time-slot-intro">Pick your day and time window — I'll come to you!</p>
      <div class="time-slot-fee">Local delivery fee: <strong>+$${fee.toFixed(2)}</strong></div>
      <div class="time-slot-row">
        <label class="time-slot-label">Day</label>
        <div class="time-slot-options">
          ${dayOpts.map((d, i) => `
            <button class="slot-btn ${i===0?'active':''}" data-slot-day="${d.value}"
              onclick="selectDeliverySlot('${d.value}', _deliverySlot.time || 'afternoon')">${d.label}</button>
          `).join('')}
        </div>
      </div>
      <div class="time-slot-row">
        <label class="time-slot-label">Time</label>
        <div class="time-slot-options">
          <button class="slot-btn" data-slot-time="morning"  onclick="selectDeliverySlot(_deliverySlot.day || '${firstDay}', 'morning')">🌅 Morning (10am–12pm)</button>
          <button class="slot-btn active" data-slot-time="afternoon" onclick="selectDeliverySlot(_deliverySlot.day || '${firstDay}', 'afternoon')">☀️ Afternoon (1pm–4pm)</button>
          <button class="slot-btn" data-slot-time="evening"  onclick="selectDeliverySlot(_deliverySlot.day || '${firstDay}', 'evening')">🌆 Evening (5pm–8pm)</button>
        </div>
      </div>
      <p id="slot-confirm-msg" class="slot-confirm-msg" style="display:none;"></p>
    </div>`;
}

function selectDeliverySlot(day, time) {
  _deliverySlot = { day, time };
  // update day buttons
  document.querySelectorAll('[data-slot-day]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.slotDay === day);
  });
  // update time buttons
  document.querySelectorAll('[data-slot-time]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.slotTime === time);
  });
  // show confirmation line
  const dayOpts = getDeliveryDayOptions();
  const dayLabel = dayOpts.find(d => d.value === day)?.label || day;
  const timeLabels = { morning: '10am–12pm', afternoon: '1pm–4pm', evening: '5pm–8pm' };
  const msg = document.getElementById('slot-confirm-msg');
  if (msg) {
    msg.style.display = 'block';
    msg.textContent = `Slot confirmed: ${dayLabel} · ${timeLabels[time] || time}`;
  }
}

function renderShipmentBreakdown(upsEtaDate) {
  const groups = getShipmentGroups();
  if (groups.length <= 1 && groups[0]?.key === 'physical') return ''; // single physical shipment — UPS handles it

  const count = groups.length;
  const cards = groups.map(g => {
    let etaLine;
    if (g.key === 'physical') {
      etaLine = upsEtaDate ? `Est. arrival: <strong>${upsEtaDate}</strong>` : 'Est. arrival: <strong>based on shipping speed selected above</strong>';
    } else {
      etaLine = `Est. arrival: <strong>${getBusinessDateRange(g.etaDays[0], g.etaDays[1])}</strong>`;
    }

    const itemList = g.items.map(i =>
      `<li>${i.name}${i.size ? ` (${i.size})` : ''} × ${i.qty}</li>`
    ).join('');

    return `
      <div class="ship-group-card">
        <div class="ship-group-header">
          <span class="ship-group-badge">${g.badge}</span>
          <span class="ship-group-label">${g.label}</span>
        </div>
        <p class="ship-group-eta">${etaLine}</p>
        <ul class="ship-group-items">${itemList}</ul>
      </div>`;
  }).join('');

  return `
    <div class="shipment-breakdown">
      <p class="ship-breakdown-title">Your order ships in <strong>${count} package${count > 1 ? 's' : ''}</strong></p>
      ${cards}
      ${count > 1 ? '<p class="ship-breakdown-note">Items may arrive on different days — each package has its own tracking number.</p>' : ''}
    </div>`;
}

// ===========================
// CART MANAGEMENT
// ===========================

function addToCart(productId, selectedSize) {
  const products = typeof getProducts === 'function' ? getProducts() : window.PRODUCTS;
  const product  = products.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  // For sized items, use id+size as unique key so S and M are separate cart entries
  const cartKey = selectedSize ? `${productId}-${selectedSize}` : `${productId}`;
  const existing = cart.find(i => i.cartKey === cartKey);
  const cartQty  = existing ? existing.qty : 0;

  // Enforce on-hand quantity limit (null = unlimited/dropship)
  if (product.qty !== null && product.qty !== undefined && cartQty >= product.qty) {
    showStockLimitToast(product.name, product.qty);
    return;
  }

  if (existing) existing.qty++;
  else cart.push({ cartKey, id: product.id, name: product.name, size: selectedSize || null, price: product.price, image: product.image, qty: 1, maxQty: product.qty, dropship: product.dropship || false });

  saveCart();
  renderCartDrawer();
  openCart();
  showAddedFeedback(productId);
}

function removeFromCart(cartKey) {
  cart = cart.filter(i => (i.cartKey || i.id) !== cartKey);
  saveCart();
  renderCartDrawer();
}

function updateQty(cartKey, delta) {
  const item = cart.find(i => (i.cartKey || i.id) === cartKey);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(cartKey); return; }
  // Enforce max qty when increasing
  if (delta > 0 && item.maxQty !== null && item.maxQty !== undefined && newQty > item.maxQty) {
    showStockLimitToast(item.name, item.maxQty);
    return;
  }
  item.qty = newQty;
  saveCart(); renderCartDrawer();
}

function showStockLimitToast(name, max) {
  const existing = document.getElementById('stock-limit-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'stock-limit-toast';
  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#7b2d8b;color:#fff;padding:12px 20px;border-radius:10px;font-size:.9rem;z-index:9999;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.4);';
  toast.innerHTML = `Only ${max} available — that's all we've got right now!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function showAddedFeedback(productId) {
  // feedback on product card wishlist/atc buttons if visible
  document.querySelectorAll(`[data-id="${productId}"] .pc-atc-btn`).forEach(btn => {
    btn.textContent = '✓ Added!';
    btn.style.background = '#2ecc71';
    setTimeout(() => { btn.textContent = 'Add to Cart'; btn.style.background = ''; }, 1500);
  });
}

function renderCartDrawer() {
  const body    = document.getElementById('cart-items');
  const badge   = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total');
  const count   = getCartCount();
  const sub     = getCartSubtotal();

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
    badge.setAttribute('aria-live', 'polite');
    badge.setAttribute('aria-atomic', 'true');
  }
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) cartBtn.setAttribute('aria-label', count > 0 ? `Open cart, ${count} item${count !== 1 ? 's' : ''}` : 'Open cart');
  if (totalEl) totalEl.textContent = `$${sub.toFixed(2)}`;

  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty"><p>Your bag is empty</p><p class="cart-empty-sub">Go explore something dripping good.</p></div>`;
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}${item.size ? ` <span style="font-size:.75rem;opacity:.7;">(${item.size})</span>` : ''}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-qty-controls">
          <button onclick="updateQty('${item.cartKey || item.id}', -1)" aria-label="Decrease quantity of ${item.name}">−</button>
          <span aria-live="polite" aria-label="Quantity ${item.qty}">${item.qty}</span>
          <button onclick="updateQty('${item.cartKey || item.id}', 1)" aria-label="Increase quantity of ${item.name}">+</button>
          <button class="cart-remove" onclick="removeFromCart('${item.cartKey || item.id}')" aria-label="Remove item">✕</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===========================
// UPS SHIPPING
// ===========================

let _shippingCost     = 0;
let _selectedShipping = null;
let _deliveryMethod   = 'shipping';
let _customerZip      = '';
let _deliverySlot     = { day: null, time: null };

function getBusinessDate(days) {
  const date = new Date();
  let added  = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const d = date.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Zone-based adjustment from DFW (origin ~75001)
// Returns a multiplier based on customer zip prefix distance from TX
function getZoneMultiplier(zip) {
  if (!zip || zip.length < 3) return 1;
  const prefix = parseInt(zip.substring(0, 3));
  // TX/OK/NM/AR/LA — same region
  if ((prefix >= 700 && prefix <= 799)) return 1;
  // Southeast / Midwest
  if ((prefix >= 300 && prefix <= 399) || (prefix >= 400 && prefix <= 499) ||
      (prefix >= 600 && prefix <= 699) || (prefix >= 500 && prefix <= 599)) return 1.15;
  // Northeast / Mid-Atlantic
  if ((prefix >= 100 && prefix <= 299)) return 1.3;
  // Mountain / Pacific
  if ((prefix >= 800 && prefix <= 999)) return 1.2;
  return 1;
}

const UPS_TIERS = [
  {
    id: 'ground',
    label: 'UPS Ground',
    days: (zip) => {
      const p = zip ? parseInt(zip.substring(0,3)) : 750;
      if (p >= 750 && p <= 761) return 2;   // DFW local
      if (p >= 700 && p <= 799) return 3;   // TX/OK/LA/AR/NM
      if ((p>=300&&p<=399)||(p>=400&&p<=499)||(p>=500&&p<=599)||(p>=600&&p<=699)) return 4; // SE/Midwest
      if (p >= 100 && p <= 299) return 5;   // Northeast/Mid-Atlantic
      if (p >= 800 && p <= 999) return 6;   // Mountain/Pacific
      return 5;
    },
    desc: '2–6 business days',
    calcPrice: (sub, zip) => sub >= 100 ? 0 : +(12.99 * getZoneMultiplier(zip)).toFixed(2)
  },
  {
    id: 'select',
    label: 'UPS 3-Day Select',
    days: (zip) => {
      const p = zip ? parseInt(zip.substring(0,3)) : 750;
      return (p >= 750 && p <= 761) ? 2 : 3; // DFW = 2 days, elsewhere = 3
    },
    desc: '2–3 business days',
    calcPrice: (sub, zip) => +(22.99 * getZoneMultiplier(zip)).toFixed(2)
  },
  {
    id: 'second',
    label: 'UPS 2nd Day Air',
    days: () => 2,
    desc: '2 business days',
    calcPrice: (sub, zip) => +(34.99 * getZoneMultiplier(zip)).toFixed(2)
  },
  {
    id: 'next',
    label: 'UPS Next Day Air Saver',
    days: () => 1,
    desc: 'Next business day',
    calcPrice: (sub, zip) => +(54.99 * getZoneMultiplier(zip)).toFixed(2)
  }
];

function renderUPSTiers(subtotal, zip) {
  // Free shipping sitewide — shipping is baked into product prices.
  // UPS Ground ETA is still shown for transparency.
  const z        = zip || _customerZip || '';
  const ground   = UPS_TIERS[0];
  const days     = typeof ground.days === 'function' ? ground.days(z) : ground.days;
  const delivery = getBusinessDate(days);
  return `<div class="ups-options">
    <label class="ups-opt ups-opt--free-selected">
      <div class="ups-opt-body">
        <span class="ups-name">Standard Shipping</span>
        <span class="ups-eta">Est. delivery: <strong>${delivery}</strong></span>
      </div>
      <span class="ups-cost ups-free">FREE</span>
    </label>
    ${hasLingerieInCart() ? '<p class="ups-disclaimer" style="color:#c084fc;margin-top:6px;">👗 Lingerie & costume items ship in 7–14 business days.</p>' : ''}
  </div>
`;
}

function pickShippingTier(id, price) {
  _selectedShipping = id;
  _shippingCost     = price;
  updateCoTotals();
  updateShipmentBreakdown();
}

function updateShipmentBreakdown() {
  const wrap = document.getElementById('shipment-breakdown-wrap');
  if (!wrap) return;
  const tier = UPS_TIERS.find(t => t.id === _selectedShipping) || UPS_TIERS[0];
  const days = typeof tier.days === 'function' ? tier.days(_customerZip) : tier.days;
  const eta  = getBusinessDate(days);
  wrap.innerHTML = renderShipmentBreakdown(eta);
}

function onZipChange() {
  const zipEl = document.getElementById('co-zip');
  if (!zipEl) return;
  _customerZip = zipEl.value.trim();

  // Toggle local delivery option visibility based on zip proximity
  const localOpt = document.querySelector('.delivery-opt--local');
  const localBadge = document.getElementById('local-delivery-badge');
  const isLocal = isLocalDeliveryEligible(_customerZip);
  const inZone  = isLocalDeliveryZip(_customerZip);
  const sub     = getCartSubtotal();
  if (localOpt) {
    localOpt.style.opacity  = isLocal ? '1' : '0.35';
    localOpt.style.pointerEvents = isLocal ? 'auto' : 'none';
    const hint = localOpt.querySelector('.local-avail-hint');
    if (hint) {
      if (isLocal) hint.textContent = '✅ Available — same-day personal delivery!';
      else if (inZone && sub < LOCAL_DELIVERY_MIN_ORDER) hint.textContent = `Add $${(LOCAL_DELIVERY_MIN_ORDER - sub).toFixed(2)} more to unlock same-day delivery!`;
      else hint.textContent = 'Not available at your zip — ships UPS instead.';
    }
  }
  // If they typed a zip while on local delivery and it's out of range, switch back to shipping
  if (_deliveryMethod === 'delivery' && _customerZip.length === 5 && !isLocal) {
    document.querySelector('input[name="delivery"][value="shipping"]').checked = true;
    onDeliveryMethodChange('shipping');
    return;
  }

  // Re-render UPS tiers with updated zip
  if (_deliveryMethod === 'shipping') {
    const wrap = document.getElementById('shipping-tiers-wrap');
    if (wrap) {
      wrap.innerHTML = renderUPSTiers(getCartSubtotal(), _customerZip);
      _shippingCost = 0;
      _selectedShipping = 'ground';
      updateCoTotals();
    }
    updateShipmentBreakdown();
  }
}

function updateCoTotals() {
  const sub      = getCartSubtotal();
  const discount = getFlashSaleDiscount();
  const total    = Math.max(0, sub - discount) + _shippingCost;

  const shippingRow  = document.getElementById('co-shipping-row');
  const discountRow  = document.getElementById('co-discount-row');
  const totalEl      = document.getElementById('co-grand-total');

  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = '';
      discountRow.innerHTML = `<span>${FLASH_SALE.label} (${isBoxItem(cart[0]) ? '10' : '30'}% off)</span><span style="color:#c084fc;">-$${discount.toFixed(2)}</span>`;
    } else {
      discountRow.style.display = 'none';
    }
  }
  if (shippingRow) {
    shippingRow.innerHTML = `
      <span>Shipping</span>
      <span class="${_shippingCost === 0 ? 'free-tag' : ''}">${_shippingCost === 0 ? 'FREE' : `$${_shippingCost.toFixed(2)}`}</span>`;
  }
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  const selBtn = document.querySelector('.pay-method-btn.selected');
  if (selBtn) selectPayMethod(selBtn.dataset.method, total);
}

function onDeliveryMethodChange(val) {
  _deliveryMethod = val;
  const shippingTiers = document.getElementById('shipping-tiers-wrap');
  const addrInput     = document.getElementById('co-address');
  const cityInput     = document.getElementById('co-city');
  const stateInput    = document.getElementById('co-state');
  const zipInput      = document.getElementById('co-zip');
  const addrNote      = document.getElementById('co-address-note');

  if (val === 'shipping') {
    if (shippingTiers) shippingTiers.style.display = 'block';
    if (addrInput)  addrInput.required = true;
    if (zipInput)   zipInput.required = true;
    if (addrNote)   addrNote.textContent = 'Enter your ZIP for an estimated delivery date.';
    _shippingCost = 0;
    _selectedShipping = 'ground';
    const slotWrap = document.getElementById('time-slot-outer');
    if (slotWrap) slotWrap.style.display = 'none';
  } else if (val === 'delivery') {
    if (shippingTiers) shippingTiers.style.display = 'none';
    if (addrInput)  addrInput.required = true;
    if (zipInput)   zipInput.required = false;
    if (addrNote)   addrNote.textContent = "Enter your address — I'll come to you!";
    _shippingCost = getLocalDeliveryFee();
    _selectedShipping = 'local-delivery';
    // Show time slot picker
    const slotWrap = document.getElementById('time-slot-outer');
    if (slotWrap) { slotWrap.style.display = 'block'; slotWrap.innerHTML = renderTimeSlotPicker(); }
    // Init default slot
    const dayOpts = getDeliveryDayOptions();
    if (dayOpts.length) _deliverySlot = { day: dayOpts[0].value, time: 'afternoon' };
  } else {
    // pickup
    if (shippingTiers) shippingTiers.style.display = 'none';
    if (addrInput)  addrInput.required = false;
    if (zipInput)   { zipInput.required = false; }
    if (addrNote)   addrNote.textContent = 'Address optional for local pickup.';
    _shippingCost = 0; _selectedShipping = null;
    const slotWrapP = document.getElementById('time-slot-outer');
    if (slotWrapP) slotWrapP.style.display = 'none';
  }
  updateCoTotals();
}

// ===========================
// CHECKOUT MODAL
// ===========================

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  _shippingCost     = 0;
  _selectedShipping = 'ground';
  _deliveryMethod   = 'shipping';
  renderCheckoutModal();
  document.getElementById('checkout-modal').classList.add('open');
  document.getElementById('checkout-overlay').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.getElementById('checkout-overlay').classList.remove('open');
}

function generateOrderNumber() {
  return 'DS-' + Date.now().toString(36).toUpperCase().slice(-7);
}

// ===========================
// BUILD PAYMENT METHODS
// ===========================
function buildPaymentMethods() {
  // CashApp + PayPal + Apple Pay — Venmo removed (not an approved payment method)
  const saved = typeof getPaymentMethods === 'function' ? getPaymentMethods() : {};
  const allowed = ['cashapp', 'paypal'];
  const out = [];
  allowed.forEach(id => {
    const m = saved[id];
    if (m && m.enabled !== false) out.push({ id, label: m.label || id, handle: m.handle || '' });
  });
  return out;
}

// ===========================
// CHECKOUT MODAL
// ===========================
function renderCheckoutModal() {
  const sub      = getCartSubtotal();
  const orderNum = generateOrderNumber();
  _currentOrderNum = orderNum;
  const modal    = document.getElementById('checkout-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="checkout-inner">
      <button class="checkout-close" onclick="closeCheckout()">✕</button>
      <div class="checkout-logo"><img src="images/logo.png" style="height:44px;" alt="Dripping Secrets"></div>
      <h2 class="checkout-title">Complete Your Order</h2>
      <p class="checkout-order-num">Order #${orderNum}</p>

      <!-- Order Summary -->
      <div class="checkout-summary">
        ${cart.map(item => `
          <div class="checkout-item">
            <span>${item.name}${item.size ? ` (${item.size})` : ''} × ${item.qty}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
          </div>`).join('')}
        <div class="checkout-item">
          <span>Subtotal</span><span>$${sub.toFixed(2)}</span>
        </div>
        ${flashSaleIsLive() ? `
        <div class="checkout-item" id="co-discount-row" style="color:#c084fc;">
          <span>Flash Sale Discount</span>
          <span>-$${getFlashSaleDiscount().toFixed(2)}</span>
        </div>` : '<div id="co-discount-row" style="display:none;"></div>'}
        <div class="checkout-item" id="co-shipping-row">
          <span>Shipping</span>
          <span class="${_shippingCost===0?'free-tag':''}">
            ${_shippingCost===0?'FREE':'$'+_shippingCost.toFixed(2)}
          </span>
        </div>
        <div class="checkout-item total-row">
          <span>Total</span>
          <span id="co-grand-total">$${getCartTotal().toFixed(2)}</span>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="checkout-section">
        <h3>Your Info</h3>
        <div class="checkout-fields">
          <input type="text"  id="co-name"    placeholder="Full Name *" aria-label="Full Name" required>
          <input type="email" id="co-email"   placeholder="Email Address *" aria-label="Email Address" required>
          <input type="tel"   id="co-phone"   placeholder="Phone Number" aria-label="Phone Number">
          <input type="text"  id="co-address" placeholder="Street Address *" aria-label="Street Address" required>
          <div style="display:flex;gap:10px;">
            <input type="text" id="co-city"  placeholder="City *" aria-label="City" required style="flex:2;">
            <input type="text" id="co-state" placeholder="State *" aria-label="State" required style="flex:1;">
            <input type="text" id="co-zip"   placeholder="ZIP *"   required style="flex:1;" maxlength="5"
              oninput="this.value=this.value.replace(/\\D/g,'')" onblur="onZipChange()">
          </div>
          <p id="co-address-note" style="font-size:0.75rem;color:rgba(255,255,255,0.35);margin-top:-4px;">
            Enter your ZIP to get accurate UPS shipping rates and delivery estimates.
          </p>
        </div>
      </div>

      <!-- Delivery Method -->
      <div class="checkout-section">
        <h3>Delivery Method</h3>
        <div class="delivery-options">
          <label class="delivery-opt">
            <input type="radio" name="delivery" value="shipping" checked onchange="onDeliveryMethodChange('shipping')">
            <span>Nationwide Shipping (UPS)</span>
          </label>
          <label class="delivery-opt delivery-opt--local">
            <input type="radio" name="delivery" value="delivery" onchange="onDeliveryMethodChange('delivery')">
            <span>Local Delivery — DFW Metro<br>
              <small class="local-avail-hint" style="font-size:0.72rem;opacity:0.7;">Enter ZIP above to check availability</small>
            </span>
          </label>
          <label class="delivery-opt">
            <input type="radio" name="delivery" value="pickup" onchange="onDeliveryMethodChange('pickup')">
            <span>Local Pickup — DFW Metro</span>
          </label>
        </div>
        <div id="shipping-tiers-wrap" style="margin-top:14px;">
          ${renderUPSTiers(sub, '')}
        </div>
        <div id="time-slot-outer" style="display:none;margin-top:14px;"></div>
        <div id="shipment-breakdown-wrap" style="margin-top:12px;">
          ${renderShipmentBreakdown(getBusinessDate(UPS_TIERS[0].days(_customerZip || '')))}
        </div>
      </div>

      <!-- Promo Code -->
      <div class="checkout-section">
        <h3>Promo Code</h3>
        <div style="display:flex;gap:10px;">
          <input type="text" id="co-promo" placeholder="Enter promo code"
            style="flex:1;background:var(--dark-3);border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius-sm);padding:11px 16px;font-family:var(--font-sans);font-size:0.9rem;color:var(--white);">
          <button class="btn-ghost" style="padding:11px 20px;font-size:0.8rem;" onclick="applyPromo()">Apply</button>
        </div>
        <p id="promo-result" style="font-size:0.8rem;margin-top:8px;display:none;"></p>
      </div>

      <!-- Payment -->
      <div class="checkout-section">
        <h3>How would you like to pay?</h3>
        <p style="font-size:0.78rem;color:#a78bfa;margin:-6px 0 14px;opacity:0.85;">
          Instant payment — CashApp opens with the exact amount pre-filled, or pay right here via PayPal or Apple Pay.
        </p>
        <div class="payment-method-picker">
          <button class="pay-method-btn pay-method-btn--branded" data-method="cashapp"
            onclick="selectPayMethod('cashapp')"
            style="background:#00D632;border-color:#00b82b;color:#000;">
            <span class="pay-logo-wrap">${PAY_LOGOS.cashapp}</span>
            <span class="pay-method-label">Cash App</span>
          </button>
          <button class="pay-method-btn pay-method-btn--branded" data-method="paypal"
            onclick="selectPayMethod('paypal')"
            style="background:linear-gradient(135deg,#003087,#009cde);border-color:#003087;color:#fff;">
            <span class="pay-logo-wrap">${PAY_LOGOS.paypal}</span>
            <span class="pay-method-label">PayPal · Apple Pay</span>
          </button>
        </div>
        <!-- Pay-details box for CashApp info -->
        <div id="pay-details" class="pay-details-box" style="display:none;"></div>
        <!-- PayPal SDK renders here -->
        <div id="paypal-buttons-container" style="display:none;margin-top:14px;"></div>
        <!-- CashApp submit button -->
        <button class="btn-primary checkout-submit-btn" id="checkout-submit-btn"
          style="display:none;margin-top:14px;width:100%;"
          onclick="submitOrder('${orderNum}')">
          Confirm Order &amp; Pay
        </button>
        <p id="co-error-msg" style="color:#e74c3c;font-size:0.85rem;text-align:center;margin-top:8px;display:none;"></p>
        <p class="checkout-fine-print">
          Orders confirmed automatically after payment.
          Questions? <a href="mailto:Assistant.Manager@DrippingSecrets.com">Contact us</a>.
        </p>
      </div>
    </div>
  `;
  // Prefill from Firebase when signed in
  setTimeout(() => { if (typeof prefillCheckoutFromFirebase === 'function') prefillCheckoutFromFirebase(); }, 80);
}

// ─── PayPal Live Client ID ───────────────────────────────────────
const PAYPAL_CLIENT_ID = 'AdhzOkxWfdTe_nlYIALptqsPUbrv8_foAK7M6hXm3obHkTJRfOWLgCKSZJqkmbP9HNdMYVB1H1rprvp3';
let _currentOrderNum   = null;
let _paypalSDKLoaded   = false;

// ——— Brand logo SVGs (inline, no external deps) ———
const PAY_LOGOS = {
  cashapp:  `<svg width="22" height="22" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="10" fill="#00D632"/><path d="M30.5 10l-2.2 2.2c-1.2-.5-2.6-.8-4.3-.8-5.8 0-9.8 3.6-9.8 8.2 0 3.2 1.8 5.5 5.4 7l2.6 1.1c2.4 1 3.2 2 3.2 3.4 0 1.6-1.5 2.8-3.8 2.8-2 0-3.8-.7-5.4-1.9l-2.2 2.2c1.5 1.4 3.5 2.3 5.6 2.6L17.5 38h3.2l2.1-2.1c6-.3 10-3.8 10-8.6 0-3.4-1.9-5.8-5.7-7.3l-2.7-1c-2.2-.9-2.9-1.8-2.9-3.1 0-1.4 1.3-2.5 3.5-2.5 1.7 0 3.2.6 4.5 1.6l2.2-2.2c-1.3-1.2-2.9-2-4.7-2.3L30.5 10h-3.1z" fill="white"/></svg>`,
  applepay: `<svg width="44" height="22" viewBox="0 0 80 34" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="34" rx="6" fill="#000"/><path d="M18.5 8.5c.8-1 1.3-2.4 1.2-3.8-1.2.1-2.6.8-3.4 1.8-.7.9-1.4 2.3-1.2 3.6 1.3.1 2.6-.6 3.4-1.6z" fill="white"/><path d="M18.5 10.4c-1.9-.1-3.5 1.1-4.4 1.1-.9 0-2.3-1-3.8-1-2 0-3.8 1.1-4.8 2.9-2 3.6-.5 8.9 1.4 11.8 1 1.4 2.1 3 3.6 3 1.4-.1 2-.9 3.6-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.6-1.4 3.5-2.8.4-.6.7-1.2 1-1.9-2.6-1-4.3-3.5-4.3-6.3 0-2.5 1.3-4.7 3.3-5.9-.7-1-1.9-1.9-3.3-1.9z" fill="white"/><path d="M35.5 7h3.3l7.2 18.5h-3L41.1 22H34l-1.9 3.5h-3L35.5 7zm5 12.8l-3-8.3-3 8.3h6z" fill="white"/><path d="M47 11.5h2.7v2c.9-1.4 2.3-2.3 4.1-2.3 3.2 0 5.5 2.5 5.5 6.2s-2.3 6.3-5.5 6.3c-1.7 0-3.1-.8-4-2.1v5.7H47V11.5zm6.1 9.7c2 0 3.4-1.6 3.4-3.8s-1.4-3.8-3.4-3.8-3.4 1.6-3.4 3.8 1.4 3.8 3.4 3.8z" fill="white"/><path d="M61 11.5h2.7v2c.9-1.4 2.3-2.3 4.1-2.3 3.2 0 5.5 2.5 5.5 6.2s-2.3 6.3-5.5 6.3c-1.7 0-3.1-.8-4-2.1v5.7H61V11.5zm6.1 9.7c2 0 3.4-1.6 3.4-3.8s-1.4-3.8-3.4-3.8-3.4 1.6-3.4 3.8 1.4 3.8 3.4 3.8z" fill="white"/></svg>`,
  paypal:   `<svg width="70" height="20" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4h10c5 0 8 2.5 7 7.5-1 5-5 7.5-10 7.5H18l-1.5 9H11L14 4z" fill="#009cde"/><path d="M19 4h10c5 0 8 2.5 7 7.5-1 5-5 7.5-10 7.5H23l-1.5 9H16L19 4z" fill="#012169" opacity="0.6"/><text x="36" y="22" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="white">PayPal</text></svg>`,
};

const PAY_BRAND_COLORS = {
  cashapp:  { bg: '#00D632', text: '#000', border: '#00b82b' },
  applepay: { bg: '#1a1a1a', text: '#fff', border: '#333' },

  paypal:   { bg: 'linear-gradient(135deg,#003087,#009cde)', text: '#fff', border: '#003087' },
};

// ─── PayPal SDK loader ────────────────────────────────────────────
function loadPayPalSDK(onReady) {
  if (_paypalSDKLoaded && window.paypal) { onReady(); return; }
  if (document.getElementById('paypal-js-sdk')) {
    const iv = setInterval(() => {
      if (window.paypal) { clearInterval(iv); _paypalSDKLoaded = true; onReady(); }
    }, 100);
    return;
  }
  const s = document.createElement('script');
  s.id  = 'paypal-js-sdk';
  s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&components=buttons&enable-funding=applepay&intent=capture`;
  s.onload  = () => { _paypalSDKLoaded = true; onReady(); };
  s.onerror = () => {
    const c = document.getElementById('paypal-buttons-container');
    if (c) c.innerHTML = '<p style="color:#f87171;font-size:.85rem;text-align:center;">Could not load PayPal. Refresh and try again.</p>';
  };
  document.head.appendChild(s);
}

// ─── Checkout helpers ──────────────────────────────────────────────
function getCheckoutTotal() {
  return Math.max(0, getCartSubtotal() + _shippingCost - _appliedDiscount);
}

function validateCheckoutForm() {
  const name  = document.getElementById('co-name')?.value.trim();
  const email = document.getElementById('co-email')?.value.trim();
  const addr  = document.getElementById('co-address');
  if (!name)  { showCoError('Please enter your full name.'); return false; }
  if (!email) { showCoError('Please enter your email address.'); return false; }
  if (addr?.required && !addr.value.trim()) { showCoError('Please enter your shipping address.'); return false; }
  const selBtn = document.querySelector('.pay-method-btn.selected');
  if (!selBtn) { showCoError('Please select a payment method.'); return false; }
  return true;
}

function buildOrderData(orderNum, method) {
  const name    = document.getElementById('co-name')?.value.trim()    || '';
  const email   = document.getElementById('co-email')?.value.trim()   || '';
  const phone   = document.getElementById('co-phone')?.value.trim()   || '';
  const address = document.getElementById('co-address')?.value.trim() || '';
  const city    = document.getElementById('co-city')?.value.trim()    || '';
  const state   = document.getElementById('co-state')?.value.trim()   || '';
  const zip     = document.getElementById('co-zip')?.value.trim()     || '';
  const total   = getCheckoutTotal();
  return {
    orderId:        orderNum,
    items:          cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size || null })),
    subtotal:       getCartSubtotal(),
    shipping:       _shippingCost,
    discount:       _appliedDiscount,
    total,
    paymentMethod:  method,
    deliveryMethod: _deliveryMethod,
    shippingTier:   _selectedShipping,
    deliverySlot:   _deliveryMethod === 'delivery' ? _deliverySlot : null,
    address, city, state, zip, phone,
    customerName:   name,
    customerEmail:  email,
    status:         'pending',
    date:           new Date().toISOString(),
    trackingNumber: null,
    shippingNotify: true,
    shipmentGroups: getShipmentGroups().map(g => ({
      source: g.key, label: g.label, badge: g.badge, etaDays: g.etaDays,
      items:  g.items.map(i => ({ id: i.id, name: i.name, qty: i.qty, size: i.size || null }))
    }))
  };
}

async function persistOrder(orderData) {
  // localStorage
  const existing = JSON.parse(localStorage.getItem('ds_orders') || '[]');
  existing.push({
    id: orderData.orderId,
    customer: { name: orderData.customerName, email: orderData.customerEmail, phone: orderData.phone,
                address: orderData.address, city: orderData.city, state: orderData.state, zip: orderData.zip },
    items: orderData.items, total: orderData.total,
    paymentMethod: orderData.paymentMethod, transactionId: orderData.transactionId || null,
    delivery: orderData.deliveryMethod + (orderData.shippingTier ? ` (${orderData.shippingTier})` : ''),
    status: orderData.status, date: orderData.date, shipmentGroups: orderData.shipmentGroups
  });
  localStorage.setItem('ds_orders', JSON.stringify(existing));
  // Firestore — await write before sending confirmation email so template vars are populated
  if (typeof saveOrderToFirestore === 'function') await saveOrderToFirestore(orderData);
  // Email — fires only after Firestore write completes
  if (typeof sendOrderConfirmationEmail === 'function') sendOrderConfirmationEmail(orderData);
  // Dimi alert
  dimiAlert('new_order', {
    customer_name:  orderData.customerName || 'Customer',
    items:          orderData.items.map(i => `${i.name} x${i.qty}`).join(', '),
    total:          orderData.total.toFixed(2),
    payment_method: orderData.paymentMethod + (orderData.transactionId ? ` (txn: ${orderData.transactionId})` : ''),
  });
  // Low-stock alerts
  if (typeof PRODUCTS !== 'undefined') {
    orderData.items.forEach(cartItem => {
      const p = PRODUCTS.find(x => x.id === cartItem.id);
      if (!p || p.dropship || p.qty === null || p.qty === undefined) return;
      const remaining = p.qty - cartItem.qty;
      if (remaining <= 0)  dimiAlert('out_of_stock', { product_name: p.name });
      else if (remaining <= 3) dimiAlert('low_stock', { product_name: p.name, qty_remaining: remaining });
    });
  }
}

function finalizePaidOrder(orderData) {
  persistOrder(orderData);
  if (typeof showOrderReceipt === 'function') showOrderReceipt(orderData);
  if (!window.currentUser && typeof showRegistrationNudge === 'function') {
    setTimeout(() => showRegistrationNudge(orderData.customerName, orderData.customerEmail), 2200);
  }
  // Auto-route to supplier for verified payments (PayPal/Apple Pay)
  if (orderData.status === 'paid') {
    routeSupplierOrder(orderData).catch(err => console.warn('[DS] Supplier routing error:', err.message));
  }
}

// ─── Supplier Order Routing ────────────────────────────────────────────────────
// Determines supplier from order items and calls the routing Netlify function.
// Called automatically for verified PayPal/Apple Pay payments.
// CashApp orders (pending_cashapp) are routed manually from Back Office.
async function routeSupplierOrder(orderData) {
  try {
    const allProducts = typeof getProducts === 'function' ? getProducts() : (window.PRODUCTS || []);
    const WAT_PRODS   = typeof WAT_PRODUCTS !== 'undefined' ? WAT_PRODUCTS : [];

    // Group items by supplier
    const supplierGroups = {};
    (orderData.items || []).forEach(cartItem => {
      let prod = allProducts.find(p => p.id === cartItem.id);
      if (!prod) prod = WAT_PRODS.find(p => p.id === cartItem.id);

      let supplierKey = 'none';
      if (prod) {
        if (prod.supplier === 'luxury_play') supplierKey = '1on1';
        else if (prod.supplier === 'cnv')    supplierKey = 'cnv';
        else if (prod.supplier === 'myawd')  supplierKey = 'myawd';
        else if (prod.supplier === 'wat')    supplierKey = 'wat';
        else if (prod.dropship === false)    supplierKey = 'none';
        else if (prod.supplier === 'cj')     supplierKey = 'cj'; // CJ manual via their portal
      }
      if (!supplierGroups[supplierKey]) supplierGroups[supplierKey] = [];
      supplierGroups[supplierKey].push({ ...cartItem, sku: prod?.sku || prod?.model || '' });
    });

    // Route each supplier group
    for (const [supplierKey, items] of Object.entries(supplierGroups)) {
      if (supplierKey === 'none' || supplierKey === 'cj') continue; // skip DS-held and CJ (manual)

      const payload = {
        ...orderData,
        supplierKey,
        items,
        routedAt: new Date().toISOString()
      };

      const res = await fetch('/.netlify/functions/route-supplier-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const result = await res.json();
      console.log(`[DS] Supplier route (${supplierKey}):`, result.routed ? 'sent' : result.reason);
    }
  } catch (err) {
    console.warn('[DS] routeSupplierOrder failed:', err.message);
  }
}

// ─── Render PayPal SDK buttons ─────────────────────────────────────
function renderPayPalButtons(orderNum) {
  const container = document.getElementById('paypal-buttons-container');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;color:#a78bfa;font-size:.85rem;padding:8px 0;">Loading payment options…</p>';

  loadPayPalSDK(() => {
    if (!window.paypal) return;
    container.innerHTML = '';
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay', height: 48 },
      onClick: (data, actions) => {
        if (!validateCheckoutForm()) return actions.reject();
        return actions.resolve();
      },
      createOrder: async () => {
        const total = getCheckoutTotal();
        try {
          const res = await fetch('/.netlify/functions/create-paypal-order', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ amount: total.toFixed(2), orderNum })
          });
          const data = await res.json();
          if (!data.id) throw new Error(data.error || 'Order creation failed');
          return data.id;
        } catch (err) {
          showCoError('Payment setup failed. Please try again or use CashApp.');
          throw err;
        }
      },
      onApprove: async (data) => {
        try {
          const res = await fetch('/.netlify/functions/capture-paypal-order', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ paypalOrderId: data.orderID, orderNum })
          });
          const capture = await res.json();
          if (!capture.success) throw new Error(capture.message || 'Payment capture failed');

          const orderData         = buildOrderData(orderNum, 'paypal');
          orderData.status        = 'paid';
          orderData.transactionId = capture.transactionId;
          orderData.payerEmail    = capture.payerEmail || '';
          finalizePaidOrder(orderData);
        } catch (err) {
          showCoError('Payment verification failed. Please contact us at management@drippingsecrets.com.');
          throw err;
        }
      },
      onError: () => showCoError('Payment failed. Please try again or choose CashApp.'),
      onCancel: () => showCoError('Payment cancelled — try again or switch to CashApp.'),
    }).render('#paypal-buttons-container');
  });
}

// ===========================
// PAYMENT METHODS
// ===========================

function selectPayMethod(methodId) {
  document.querySelectorAll('.pay-method-btn').forEach(b => b.classList.remove('selected'));
  const btn = document.querySelector(`.pay-method-btn[data-method="${methodId}"]`);
  if (btn) btn.classList.add('selected');

  const box         = document.getElementById('pay-details');
  const ppContainer = document.getElementById('paypal-buttons-container');
  const submitBtn   = document.getElementById('checkout-submit-btn');
  const errEl       = document.getElementById('co-error-msg');
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
  if (!box)  return;

  box.style.display = 'block';

  // ── PayPal: SDK handles PayPal + Apple Pay in one button cluster — Venmo removed ──
  if (methodId === 'paypal') {
    if (ppContainer) ppContainer.style.display = 'block';
    if (submitBtn)   submitBtn.style.display   = 'none';
    box.innerHTML = '<p style="font-size:.8rem;color:#a78bfa;text-align:center;padding:6px 0 10px;">Choose PayPal or Apple Pay below:</p>';
    renderPayPalButtons(_currentOrderNum);
    return;
  }

  // ── CashApp: deep link — auto-shows receipt when user returns to tab ──
  if (methodId === 'cashapp') {
    if (ppContainer) ppContainer.style.display = 'none';
    const t = getCheckoutTotal();
    if (submitBtn) {
      submitBtn.style.display    = 'block';
      submitBtn.textContent      = `Pay $${t.toFixed(2)} on CashApp →`;
      submitBtn.style.background = '#00D632';
      submitBtn.style.color      = '#000';
      submitBtn.style.border     = 'none';
    }
    box.innerHTML = `
      <div class="pay-instructions pay-cashapp-box">
        <p class="pay-amount-due">$${t.toFixed(2)}</p>
        <p style="font-size:.82rem;opacity:.8;margin:4px 0 10px;">
          Tap the button — CashApp opens with the exact amount pre-filled to <strong>$flawwless23</strong>.<br>
          Come right back and your order confirmation appears automatically.
        </p>
        <div class="pay-cashapp-tip">
          ${PAY_LOGOS.cashapp}
          <span>No copy-paste, no handles to remember.</span>
        </div>
      </div>`;
    return;
  }
}

// ===========================
// PROMO CODES
// ===========================

let _appliedDiscount = 0;

// ===========================
// PROMO CODES (hardcoded, undeletable)
// ===========================
function getPromoCodes() {
  // System codes (always active)
  const system = [
    { code: 'ADMIN',  type: 'admin',   active: true,  label: 'Admin cost price' },
    { code: 'FAM30',  type: 'percent', active: true,  value: 30, label: '30% off order total' },
    { code: 'DRIP10', type: 'percent', active: true,  value: 10, label: '10% off your order' }
  ];
  // Merge admin-created codes from localStorage (created via Back Office → Promo Codes)
  try {
    const custom = JSON.parse(localStorage.getItem('ds_promo_codes') || '[]');
    const now = new Date();
    const activeCustom = custom
      .filter(c => c.code && (!c.expiry || new Date(c.expiry) > now))
      .map(c => ({ code: c.code.toUpperCase(), type: c.type, active: true,
                   value: c.value, label: c.type === 'free_shipping' ? 'Free shipping' : (c.value ? c.value + (c.type === 'percent' ? '% off' : ' off') : '') }));
    return [...system, ...activeCustom];
  } catch(e) { return system; }
}

function applyPromo() {
  const code    = document.getElementById('co-promo')?.value.trim().toUpperCase();
  const resultEl = document.getElementById('promo-result');
  const codes    = typeof getPromoCodes === 'function' ? getPromoCodes() : [];

  const match = codes.find(c => c.code.toUpperCase() === code && c.active);
  if (!match) {
    resultEl.textContent = '❌ Invalid or expired promo code.';
    resultEl.style.color = '#e74c3c';
    resultEl.style.display = 'block';
    _appliedDiscount = 0;
    return;
  }

  const sub = getCartSubtotal();
  let discount = 0;
  if (match.type === 'admin') {
    // ADMIN: discount down to cost price per item
    const cart  = typeof getCart === 'function' ? getCart() : [];
    const prods = typeof getProducts === 'function' ? getProducts() : (window.PRODUCTS || []);
    cart.forEach(item => {
      const p = prods.find(x => x.id === item.id);
      if (!p) return;
      // cost = stored cost field OR ~40% of sale price (proxy for all suppliers)
      const costPrice = p.cost != null ? p.cost : parseFloat((p.price * 0.40).toFixed(2));
      discount += parseFloat(((p.price - costPrice) * item.qty).toFixed(2));
    });
    discount = parseFloat(Math.min(discount, sub).toFixed(2));
  } else if (match.type === 'percent') {
    discount = parseFloat((sub * match.value / 100).toFixed(2));
  } else if (match.type === 'free_shipping') {
    // Free shipping — zero out shipping cost
    _appliedDiscount = 0;
    _freeShipping = true;
    const shippingEl = document.getElementById('co-shipping-cost');
    if (shippingEl) shippingEl.textContent = 'FREE';
    if (resultEl) {
      resultEl.textContent = `✓ "${match.code}" applied — Free shipping!`;
      resultEl.style.color = '#2ecc71';
      resultEl.style.display = 'block';
    }
    const totalEl = document.getElementById('co-grand-total');
    if (totalEl) {
      const sub = getCartSubtotal();
      totalEl.textContent = '$' + Math.max(0, sub - (_appliedDiscount || 0)).toFixed(2);
    }
    return; // early return — no discount$ row needed
  } else {
    discount = parseFloat(match.value);
  }

  _appliedDiscount = discount;
  resultEl.textContent = `✓ "${match.code}" applied — $${discount.toFixed(2)} off!`;
  resultEl.style.color = '#2ecc71';
  resultEl.style.display = 'block';

  // Add discount row to summary
  const existingDiscount = document.getElementById('co-discount-row');
  if (existingDiscount) existingDiscount.remove();
  const totalRow = document.querySelector('.total-row');
  if (totalRow) {
    const discRow = document.createElement('div');
    discRow.className = 'checkout-item';
    discRow.id = 'co-discount-row';
    discRow.innerHTML = `<span>Promo (${match.code})</span><span style="color:#2ecc71;">−$${discount.toFixed(2)}</span>`;
    totalRow.parentNode.insertBefore(discRow, totalRow);
  }

  const newTotal = Math.max(0, sub + _shippingCost - _appliedDiscount);
  const totalEl  = document.getElementById('co-grand-total');
  if (totalEl) totalEl.textContent = `$${newTotal.toFixed(2)}`;
}

// ===========================
// ORDER SUBMISSION
// ===========================

function submitOrder(orderNum) {
  if (!validateCheckoutForm()) return;

  const selBtn = document.querySelector('.pay-method-btn.selected');
  if (!selBtn) { showCoError('Please select a payment method.'); return; }

  const method = selBtn.dataset.method;

  // PayPal/Apple Pay handled by PayPal SDK — shouldn't reach here
  if (method === 'paypal') {
    showCoError('Use the PayPal button above to complete your payment.'); return;
  }

  const total     = Math.max(0, getCartSubtotal() + _shippingCost - _appliedDiscount);
  const orderData = buildOrderData(orderNum, method);

  // ── CashApp: save order, open deep link, auto-show receipt on return ──
  if (method === 'cashapp') {
    orderData.status = 'pending_cashapp';
    persistOrder(orderData);

    const cashappUrl = `https://cash.app/$flawwless23/${total.toFixed(2)}`;

    // When user returns to tab, auto-advance to receipt — no button click needed
    const handleReturn = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', handleReturn);
        window.removeEventListener('focus', handleReturn);
        if (typeof showOrderReceipt === 'function') showOrderReceipt(orderData);
        const name  = orderData.customerName;
        const email = orderData.customerEmail;
        if (!window.currentUser && typeof showRegistrationNudge === 'function') {
          setTimeout(() => showRegistrationNudge(name, email), 2200);
        }
      }
    };
    document.addEventListener('visibilitychange', handleReturn);
    window.addEventListener('focus', handleReturn);

    // Disable submit button so they don't double-tap
    const submitBtn = document.getElementById('checkout-submit-btn');
    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Opening CashApp…';
    }

    window.open(cashappUrl, '_blank', 'noopener');
    return;
  }
}

function showCoError(msg) {
  let el = document.getElementById('co-error-msg');
  if (!el) {
    el = document.createElement('p');
    el.id = 'co-error-msg';
    el.style.cssText = 'color:#e74c3c;font-size:0.85rem;text-align:center;margin-bottom:12px;';
    document.querySelector('.checkout-submit-btn')?.insertAdjacentElement('beforebegin', el);
  }
  el.textContent = msg;
}


// ===========================
// CHECKOUT PREFILL
// ===========================

function prefillCheckoutFromFirebase() {
  const user = window.currentUser;
  if (!user) return;
  const nameEl  = document.getElementById('co-name');
  const emailEl = document.getElementById('co-email');
  if (nameEl  && !nameEl.value  && user.displayName) nameEl.value  = user.displayName;
  if (emailEl && !emailEl.value && user.email)       emailEl.value = user.email;
  if (window.FIREBASE_READY) {
    firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
      if (!doc.exists) return;
      const d = doc.data();
      const f = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
      f('co-phone', d.phone);
      // Support both flat fields and shippingAddress nested object (saved from account portal)
      const sa = d.shippingAddress || {};
      f('co-address', sa.address || d.address);
      f('co-city',    sa.city    || d.city);
      f('co-state',   sa.state   || d.state);
      const zip = sa.zip || d.zip;
      if (zip) { f('co-zip', zip); onZipChange(); }
    }).catch(() => {});
  }
}

// ===========================
// RECEIPT & CONFIRMATION
// ===========================

// getPaymentHandle alias → use _pmHandle(methodId, amount)

function _pmHandle(methodId, amount) {
  if (methodId === 'cashapp')  return `Cash App — $${amount} sent to $flawwless23`;
  if (methodId === 'paypal')   return 'PayPal — payment confirmed';
  // venmo removed — not an approved payment method
  if (methodId === 'applepay') return 'Apple Pay — payment confirmed';
  return methodId;
}

function buildReceiptEtaText(group, zip, shippingTier) {
  if (group.source === 'physical') {
    const t = UPS_TIERS.find(t => t.id === shippingTier) || UPS_TIERS[0];
    const days = typeof t.days === 'function' ? t.days(zip || '') : (t.days || 5);
    return {
      eta:  `Est. arrival: ${getBusinessDate(days)}`,
      note: `${t.label} · ships from our DFW location`
    };
  } else if (group.source === 'dl') {
    return {
      eta:  `Est. arrival: ${getBusinessDateRange(10, 21)}`,
      note: '10–21 business days · ships directly to you'
    };
  } else if (group.source === 'cj') {
    return {
      eta:  `Est. arrival: ${getBusinessDateRange(7, 15)}`,
      note: '7–15 business days · ships directly to you'
    };
  } else if (group.source === 'luxury_play') {
    return {
      eta:  `Est. arrival: ${getBusinessDateRange(7, 10)}`,
      note: '7–10 business days · premium international delivery · ships directly to you'
    };
  } else if (group.source === 'topdawg') {
    return {
      eta:  `Est. arrival: ${getBusinessDateRange(2, 5)}`,
      note: '2–5 business days · US-based supplier · ships directly to you'
    };
  }
  return { eta: 'Estimated arrival: varies', note: 'Processing time may vary' };
}

function buildReceiptHTML(orderData) {
  const isLocal  = orderData.deliveryMethod === 'delivery';
  const isPickup = orderData.deliveryMethod === 'pickup';
  const groups   = orderData.shipmentGroups || [];
  const amt      = orderData.total.toFixed(2);
  const payHandle = _pmHandle(orderData.paymentMethod, amt);
  const dateStr   = new Date(orderData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const shippingTier = UPS_TIERS.find(t => t.id === orderData.shippingTier);

  // Items
  const itemsRows = orderData.items.map(i => `
    <div class="rcpt-row">
      <span class="rcpt-item-name">${i.name}${i.size ? ` <em>(${i.size})</em>` : ''}</span>
      <span class="rcpt-item-qty">× ${i.qty}</span>
      <span class="rcpt-item-price">$${(i.price * i.qty).toFixed(2)}</span>
    </div>`).join('');

  // Shipping label
  let shipLabel;
  if (isLocal) {
    const slot = orderData.deliverySlot || {};
    const dayOpts = typeof getDeliveryDayOptions === 'function' ? getDeliveryDayOptions() : [];
    const dayLabel = (dayOpts.find(d => d.value === slot.day) || {}).label || slot.day || '—';
    const timeMap  = { morning: '10am–12pm', afternoon: '1pm–4pm', evening: '5pm–8pm' };
    shipLabel = `Local Delivery — ${dayLabel}, ${timeMap[slot.time] || slot.time || ''}`;
  } else if (isPickup) {
    shipLabel = 'Local Pickup (DFW Metro)';
  } else {
    shipLabel = shippingTier ? shippingTier.label : 'Shipping';
  }

  const hasDiscount = orderData.discount > 0;
  const summaryHTML = `
    <div class="rcpt-summary">
      ${itemsRows}
      <div class="rcpt-divider"></div>
      <div class="rcpt-row rcpt-sub">
        <span>Subtotal</span><span></span>
        <span>$${orderData.subtotal.toFixed(2)}</span>
      </div>
      ${hasDiscount ? `
      <div class="rcpt-row rcpt-discount">
        <span>Flash Sale Savings</span><span></span>
        <span>−$${orderData.discount.toFixed(2)}</span>
      </div>` : ''}
      <div class="rcpt-row">
        <span>${shipLabel}</span><span></span>
        <span class="${orderData.shipping === 0 ? 'rcpt-free' : ''}">${orderData.shipping === 0 ? 'FREE' : '$' + orderData.shipping.toFixed(2)}</span>
      </div>
      <div class="rcpt-divider"></div>
      <div class="rcpt-row rcpt-total">
        <span>TOTAL</span><span></span>
        <span>$${orderData.total.toFixed(2)}</span>
      </div>
    </div>`;

  // ETA packages
  let etaHTML = '';
  if (!isPickup && !isLocal && groups.length > 0) {
    const pkgCards = groups.map(g => {
      const { eta, note } = buildReceiptEtaText(g, orderData.zip, orderData.shippingTier);
      const itemNames = g.items.map(i => `${i.name}${i.size ? ` (${i.size})` : ''} × ${i.qty}`).join(', ');
      return `
        <div class="rcpt-package">
          <div class="rcpt-pkg-badge">${g.badge || ''} ${g.label || 'Package'}</div>
          <div class="rcpt-pkg-items">${itemNames}</div>
          <div class="rcpt-pkg-eta">${eta}</div>
          <div class="rcpt-pkg-note">${note}</div>
        </div>`;
    }).join('');
    const pkgCount = groups.length;
    etaHTML = `
      <div class="rcpt-section">
        <div class="rcpt-section-title">ESTIMATED DELIVERY</div>
        ${pkgCount > 1 ? `<p class="rcpt-multi-note">Ships in <strong>${pkgCount} packages</strong> — items may arrive on different days, each with its own tracking.</p>` : ''}
        ${pkgCards}
      </div>`;
  } else if (isPickup) {
    etaHTML = `
      <div class="rcpt-section">
        <div class="rcpt-section-title">LOCAL PICKUP</div>
        <p class="rcpt-address">DFW Metro — we'll reach out to coordinate your pickup.</p>
      </div>`;
  } else if (isLocal) {
    const slot = orderData.deliverySlot || {};
    const dayOpts = typeof getDeliveryDayOptions === 'function' ? getDeliveryDayOptions() : [];
    const dayLabel = (dayOpts.find(d => d.value === slot.day) || {}).label || slot.day || '—';
    const timeMap = { morning: '10am–12pm', afternoon: '1pm–4pm', evening: '5pm–8pm' };
    etaHTML = `
      <div class="rcpt-section">
        <div class="rcpt-section-title">LOCAL DELIVERY</div>
        <p class="rcpt-address">Requested for <strong>${dayLabel}</strong> · <strong>${timeMap[slot.time] || slot.time || '—'}</strong><br>
        You'll get a confirmation once Ashley approves your delivery window.</p>
      </div>`;
  }

  // Address
  const addrLines = [orderData.customerName, orderData.address,
    [orderData.city, orderData.state, orderData.zip].filter(Boolean).join(', ')
  ].filter(Boolean).join('<br>');
  const addrHTML = `
    <div class="rcpt-section">
      <div class="rcpt-section-title">📍 ${isLocal ? 'DELIVERY' : 'SHIPPING'} ADDRESS</div>
      <p class="rcpt-address">${addrLines || 'N/A'}</p>
    </div>`;

  // Payment
  const isPP = ['paypal','applepay'].includes(orderData.paymentMethod);
  const payHTML = `
    <div class="rcpt-section">
      <div class="rcpt-section-title">PAYMENT</div>
      <p class="rcpt-pay-method">${payHandle}</p>
      <p class="rcpt-pay-note">${isPP
        ? 'Payment confirmed. Your order is being prepared!'
        : 'Your Cash App payment is on its way \u2014 your order is saved and you\u2019ll receive a confirmation email shortly.'}</p>
    </div>`;

  return `
    <div class="order-receipt">
      <div class="rcpt-header">
        <div class="rcpt-check">✓</div>
        <h2>Order Confirmed!</h2>
        <p class="rcpt-order-meta">Order <strong>#${orderData.orderId}</strong> &nbsp;·&nbsp; ${dateStr}</p>
      </div>
      <div class="rcpt-section">
        <div class="rcpt-section-title">ITEMS ORDERED</div>
        ${summaryHTML}
      </div>
      ${addrHTML}
      ${etaHTML}
      ${payHTML}
      <p class="rcpt-footer-note">
        A confirmation email was sent to <strong>${orderData.customerEmail || 'you'}</strong>.<br>
        Questions? <a href="mailto:Assistant.Manager@DrippingSecrets.com" style="color:#c084fc;">Assistant.Manager@DrippingSecrets.com</a>
      </p>
      <button class="btn-primary rcpt-done-btn" onclick="closeCheckout()">Done — Close</button>
    </div>`;
}

function buildReceiptEmailText(orderData) {
  const shippingTier = UPS_TIERS.find(t => t.id === orderData.shippingTier);
  const isLocal  = orderData.deliveryMethod === 'delivery';
  const isPickup = orderData.deliveryMethod === 'pickup';
  const amt = orderData.total.toFixed(2);
  const payHandle = _pmHandle(orderData.paymentMethod, amt);
  const groups = orderData.shipmentGroups || [];
  const DATE = new Date(orderData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const SEP  = '─'.repeat(50);

  const pad  = (s, n) => String(s).slice(0, n).padEnd(n, ' ');
  const padL = (s, n) => String(s).padStart(n, ' ');

  const lines = [];
  lines.push(`ORDER SUMMARY  —  Order #${orderData.orderId}`);
  lines.push(`Date: ${DATE}`);
  lines.push('');
  lines.push('ITEMS ORDERED');
  lines.push(SEP);
  orderData.items.forEach(i => {
    const name  = `${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`;
    const price = `$${(i.price * i.qty).toFixed(2)}`;
    lines.push(pad(name, 38) + padL(price, 10));
  });
  lines.push('');
  lines.push(pad('Subtotal:', 38) + padL(`$${orderData.subtotal.toFixed(2)}`, 10));
  if (orderData.discount > 0) {
    lines.push(pad('Flash Sale Savings:', 38) + padL(`-$${orderData.discount.toFixed(2)}`, 10));
  }
  const sLabel = isLocal ? 'Local Delivery' : isPickup ? 'Local Pickup' : (shippingTier ? shippingTier.label : 'Shipping');
  const sAmt   = orderData.shipping === 0 ? 'FREE' : `$${orderData.shipping.toFixed(2)}`;
  lines.push(pad(`${sLabel}:`, 38) + padL(sAmt, 10));
  lines.push(SEP);
  lines.push(pad('TOTAL:', 38) + padL(`$${orderData.total.toFixed(2)}`, 10));
  lines.push('');

  // Address
  lines.push(isLocal ? 'DELIVERY ADDRESS' : isPickup ? 'PICKUP CONTACT' : 'SHIPPING TO');
  lines.push(SEP);
  if (orderData.customerName) lines.push(orderData.customerName);
  if (orderData.address) lines.push(orderData.address);
  const cityLine = [orderData.city, orderData.state, orderData.zip].filter(Boolean).join(', ');
  if (cityLine) lines.push(cityLine);
  if (orderData.phone) lines.push(`Phone: ${orderData.phone}`);
  lines.push('');

  // Delivery ETA
  if (!isPickup && !isLocal && groups.length > 0) {
    lines.push('ESTIMATED DELIVERY');
    lines.push(SEP);
    if (groups.length > 1) {
      lines.push(`Your order ships in ${groups.length} packages — items may arrive on different days.`);
      lines.push('');
    }
    groups.forEach(g => {
      const { eta, note } = buildReceiptEtaText(g, orderData.zip, orderData.shippingTier);
      lines.push(`${g.badge || ''}  ${g.label || 'Package'}`);
      g.items.forEach(i => lines.push(`   • ${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`));
      lines.push(`   ${eta}`);
      lines.push(`   ${note}`);
      lines.push('');
    });
  } else if (isPickup) {
    lines.push('PICKUP');
    lines.push(SEP);
    lines.push('DFW Metro — we will contact you to arrange pickup.');
    lines.push('');
  } else if (isLocal) {
    const slot = orderData.deliverySlot || {};
    const dayOpts = typeof getDeliveryDayOptions === 'function' ? getDeliveryDayOptions() : [];
    const dayLabel = (dayOpts.find(d => d.value === slot.day) || {}).label || slot.day || '—';
    const timeMap = { morning: '10am–12pm', afternoon: '1pm–4pm', evening: '5pm–8pm' };
    lines.push('LOCAL DELIVERY');
    lines.push(SEP);
    lines.push(`Requested: ${dayLabel}, ${timeMap[slot.time] || slot.time || '—'}`);
    lines.push('Confirmation sent once delivery is approved.');
    lines.push('');
  }

  // Payment
  lines.push('PAYMENT');
  lines.push(SEP);
  lines.push(payHandle);
  lines.push('');
  lines.push('Thank you for shopping with Dripping Secrets!');
  lines.push('Questions? Email: Assistant.Manager@DrippingSecrets.com');

  return lines.join('\n');
}

function showOrderReceipt(orderData) {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;
  modal.innerHTML = `
    <div class="checkout-inner">
      <button class="checkout-close" onclick="closeCheckout()">✕</button>
      <div class="checkout-logo"><img src="images/logo.png" style="height:44px;"></div>
      ${buildReceiptHTML(orderData)}
    </div>`;
  modal.scrollTop = 0;
  // Trigger Dimi Actor success → celebrate sequence
  document.dispatchEvent(new CustomEvent('dimi:success'));
}

// ===========================
// EMAILJS ORDER CONFIRMATION
// ===========================

function sendOrderConfirmationEmail(orderData) {
  if (typeof emailjs === 'undefined') return;
  if (!orderData.customerEmail) return;
  const SVC = 'service_kkp11nt';
  const TPL = 'template_nbiinbo';
  const receiptText = buildReceiptEmailText(orderData);
  emailjs.send(SVC, TPL, {
    to_email:       orderData.customerEmail,
    to_name:        orderData.customerName || 'Secret Keeper',
    order_number:   orderData.orderId,
    order_items:    receiptText,
    order_total:    `$${orderData.total.toFixed(2)}`,
    payment_method: _pmHandle(orderData.paymentMethod, orderData.total.toFixed(2)),
    shipping_addr:  [orderData.address, orderData.city, orderData.state, orderData.zip].filter(Boolean).join(', ') || 'N/A',
    from_name:      'Dripping Secrets',
    reply_to:       'orders@drippingsecrets.com'
  }).catch(() => {});
}

// ===========================
// POST-CHECKOUT REG NUDGE
// ===========================

function showRegistrationNudge(name, email) {
  if (window.currentUser) return;
  if (document.getElementById('reg-nudge-overlay')) return;
  const safeName  = (name  || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const safeEmail = (email || '').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  const overlay = document.createElement('div');
  overlay.id = 'reg-nudge-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:12000;display:flex;align-items:flex-end;justify-content:center;padding:20px;animation:fadeIn .3s ease;';
  overlay.innerHTML = `
    <div style="background:#1a1a1a;border:1px solid rgba(123,47,190,.5);border-radius:20px 20px 14px 14px;padding:28px 24px 24px;max-width:440px;width:100%;text-align:center;position:relative;">
      <button onclick="document.getElementById('reg-nudge-overlay').remove()"
        style="position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,.35);font-size:1.1rem;cursor:pointer;line-height:1;">✕</button>
      <div style="margin-bottom:10px;"><svg width="36" height="36" viewBox="0 0 24 24" fill="#B76E79" aria-hidden="true"><path d="M20 4H4c-1.11 0-2 .89-2 2v3.01c0 .72.43 1.34 1 1.72V20c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-9.28c.57-.38 1-.99 1-1.71V6c0-1.11-.89-2-2-2zm-5 10H9v-2h6v2zm5-7H4V6h16v1.01z"/></svg></div>
      <h3 style="font-family:'Playfair Display',serif;color:#fff;margin-bottom:8px;font-size:1.15rem;">Track your order anytime</h3>
      <p style="color:rgba(255,255,255,.6);font-size:.87rem;line-height:1.65;margin-bottom:18px;">
        Create a free account to track your order, see your history, and keep your wishlist safe. Your info is already filled in — just add a password.
      </p>
      <input type="password" id="reg-nudge-pw" placeholder="Create a password"
        style="width:100%;background:#242424;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:12px 16px;color:#fff;font-size:.93rem;margin-bottom:12px;font-family:'Inter',sans-serif;outline:none;">
      <button onclick="createAccountFromNudge('${safeName}','${safeEmail}',this)"
        style="width:100%;background:linear-gradient(135deg,#7B2FBE,#9B59D2);border:none;border-radius:50px;padding:13px;color:#fff;font-weight:600;font-size:.93rem;cursor:pointer;font-family:'Inter',sans-serif;">
        Yes, Save My Order History
      </button>
      <p style="margin-top:12px;font-size:.78rem;color:rgba(255,255,255,.3);cursor:pointer;"
        onclick="document.getElementById('reg-nudge-overlay').remove()">No thanks, I'll skip for now</p>
    </div>`;
  document.body.appendChild(overlay);
}

function createAccountFromNudge(name, email, btn) {
  const pw = document.getElementById('reg-nudge-pw')?.value?.trim();
  if (!pw || pw.length < 6) { alert('Password must be at least 6 characters.'); return; }
  if (!email) { alert('No email found — please sign up from the account button.'); return; }
  btn.textContent = 'Creating account…'; btn.disabled = true;
  firebase.auth().createUserWithEmailAndPassword(email, pw)
    .then(cred => {
      if (name) return cred.user.updateProfile({ displayName: name });
    })
    .then(() => {
      document.getElementById('reg-nudge-overlay')?.remove();
    })
    .catch(err => {
      btn.textContent = 'Yes, Save My Order History'; btn.disabled = false;
      const msgs = {
        'auth/email-already-in-use': 'An account with that email already exists. Sign in from the 👤 button!',
        'auth/weak-password': 'Password needs to be at least 6 characters.',
      };
      alert(msgs[err.code] || err.message);
    });
}

// ===========================
// INIT
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  renderCartDrawer();
});
