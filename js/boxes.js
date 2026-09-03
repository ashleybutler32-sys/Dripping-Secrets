// ===== DRIPPING SECRETS | boxes.js =====
// Build-Your-Own Box + Subscription Boxes

// ───────────────────────────────────────
// PRODUCT POOL (maps to DEFAULT_PRODUCTS)
// ───────────────────────────────────────
const BOX_PRODUCT_POOL = [
  // ── Physical inventory ──
  { id: 2,  name: 'The Piper',                                    price: 80,  cats: ['toys','premium'] },
  { id: 3,  name: 'Always-On Strap',                              price: 70,  cats: ['toys','couples'] },
  { id: 4,  name: 'The Goddess',                                  price: 75,  cats: ['toys','wellness'] },
  { id: 5,  name: 'Naughty Nurse Set',                            price: 45,  cats: ['accessories','couples','fun'] },
  { id: 6,  name: 'Light Show Dildo',                             price: 40,  cats: ['toys','fun'] },
  { id: 7,  name: 'Double Trouble',                               price: 30,  cats: ['toys','couples'] },
  { id: 8,  name: 'Roll the Sheets',                              price: 30,  cats: ['games','couples','fun'] },
  { id: 9,  name: 'Bound to Please',                              price: 30,  cats: ['accessories','bold'] },
  { id: 8,  name: 'Date Night Firecracker',                       price: 30,  cats: ['accessories','couples'] },
  { id: 9,  name: 'Pocket Body',                                  price: 30,  cats: ['accessories','bold'] },
  { id: 12, name: 'Lip Service',                                  price: 20,  cats: ['wellness','fun'] },
  { id: 13, name: 'Rose Charger',                                 price: 10,  cats: ['accessories','wellness'] },
  // ── STD Rose Dropship ──
  { id: 28, name: 'The Perfect Rose Clitoral Stimulator - Red',   price: 45,  cats: ['toys','roses','fun'], dropship: true },
  { id: 29, name: 'The Perfect Rose Clitoral Stimulator - Pink',  price: 45,  cats: ['toys','roses','fun'], dropship: true },
  { id: 30, name: 'The Double Tease Rose 10X Sucking & Licking',  price: 70,  cats: ['toys','roses','fun'], dropship: true },
  { id: 31, name: 'Bloomgasm Wild Rose 10X Suction - Purple',     price: 70,  cats: ['toys','roses','fun'], dropship: true },
  { id: 32, name: 'Bloomgasm Wild Rose 10X Silicone Stimulator',  price: 65,  cats: ['toys','roses','fun'], dropship: true },
  { id: 33, name: 'Bloomgasm Rose Duet Sucking & Vibrating',      price: 95,  cats: ['toys','roses','premium'], dropship: true },
  { id: 34, name: 'Regal Rose Licking Rose Vibrator',             price: 65,  cats: ['toys','roses','fun'], dropship: true },
  { id: 35, name: 'Glow Rose Glow-in-the-Dark Stimulator',        price: 65,  cats: ['toys','roses','fun'], dropship: true },
  { id: 36, name: 'Cyber Rose Sucking & Vibrating Stimulator',    price: 65,  cats: ['toys','roses','fun'], dropship: true },
  { id: 37, name: '10X Romping Rose Suction & Thrusting',         price: 85,  cats: ['toys','roses','premium'], dropship: true },
  { id: 38, name: '10X Fondle Massaging Rose Stimulator',         price: 80,  cats: ['toys','roses','fun'], dropship: true },
  { id: 39, name: 'Pulsing Petals Throbbing Rose - Pink',         price: 40,  cats: ['toys','roses','fun'], dropship: true },
  { id: 68, name: 'Black Rose Anal Plug - Small',                 price: 25,  cats: ['bold','anal'], dropship: true },
  { id: 72, name: 'Black Rose Anal Plug - Large',                 price: 30,  cats: ['bold','anal'], dropship: true },
  { id: 73, name: 'Black Rose Anal Plug - Medium',                price: 25,  cats: ['bold','anal'], dropship: true },
  { id: 75, name: 'Pink Rose Glass Anal Plug - Medium',           price: 40,  cats: ['bold','anal'], dropship: true },
  { id: 93, name: 'Rise of the Dragon Silicone Cock Ring',        price: 25,  cats: ['accessories','couples'], dropship: true },
  { id: 71, name: 'Fire Garden 3pc Rose Candle Set',              price: 30,  cats: ['wellness'], dropship: true },
  { id: 81, name: 'Burning Passion Rose Candle with Holder',      price: 60,  cats: ['wellness','fun'], dropship: true },
  { id: 59, name: 'Blossom Silicone Breathable Rose Gag',         price: 40,  cats: ['accessories','bold'], dropship: true },
  { id: 88, name: 'Cuffed Locking Bracelet & Key Necklace',       price: 55,  cats: ['accessories','bold'], dropship: true },
  { id: 114, name: "Trinity Vibes Super-Charged Bullet Vibe - Purple", price: 9.91, category: "Vibrators", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ab834-super-charged-bullet-vibe-bulk_175x175.jpg" },
  { id: 115, name: "Platinum Orgasmic Vibrating Cockring", price: 10.09, category: "Vibrators", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ac151-platinum-orgasmic-vibrating-cock-ring-bulk_2_175x175.jpg" },
  { id: 116, name: "Vibrating Double Cock and Ball Ring", price: 10.97, category: "Vibrators", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ad987-model_175x175.jpg" },
  { id: 117, name: "Trinity Silicone Cock Rings Clear", price: 11.76, category: "Vibrators", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/sp130-clear-bulk_175x175.jpg" },
  { id: 126, name: "Mini Realistic Tight Pussy Masturbator", price: 11.52, category: "Strokers", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ad986-bulk_175x175.jpg" },
  { id: 127, name: "Mollys Tight Ass Stroker", price: 18.61, category: "Strokers", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ad345-bulk_2_175x175.jpg" },
  { id: 128, name: "Lusty Lips See Through Masturbation Sleeve", price: 26.44, category: "Strokers", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ad582-angle_175x175.jpg" },
  { id: 129, name: "Hummingbird Masturbator Attachment", price: 39.84, category: "Strokers", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/26/AA467_STD-MAIN_175x175.jpg" },
  { id: 144, name: "Speed Snap Cock Ring", price: 14.19, category: "Bondage", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ae887-a-2400_175x175.jpg" },
  { id: 145, name: "Viper Nipple Suckers", price: 14.24, category: "Bondage", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ab213-model_3_175x175.jpg" },
  { id: 146, name: "Black Fleece Lined Blindfold", price: 14.96, category: "Bondage", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/26/AE924_Ai-Model_001_175x175.jpg" },
  { id: 147, name: "Magnus Mighty Magnetic Orbs", price: 18.46, category: "Bondage", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ad319-mann_175x175.jpg" },
  { id: 156, name: "Clear Gem Anal Plug- Small", price: 17.31, category: "Anal Play", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/af632-bulk-new_175x175.jpg" },
  { id: 157, name: "Pink Gem Anal Plug- Small", price: 17.31, category: "Anal Play", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/af631-new_177x175.jpg" },
  { id: 158, name: "Black Rose Anal Plug- Small", price: 18.06, category: "Anal Play", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/af635-new_175x175.jpg" },
  { id: 159, name: "Rainbow Prism Gem Anal Plug - Small", price: 19.01, category: "Anal Play", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/ag375-small-0063_137x175.jpg" },
  { id: 169, name: "Fire Hound Silicone Dildo - Small", price: 34.32, category: "Fantasy", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/24/AH414-Small_STD-MAIN_175x175.jpg" },
  { id: 170, name: "Wolf Ass Stroker", price: 56.59, category: "Fantasy", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/25/AH526_STD_MAIN_175x175.jpg" },
  { id: 171, name: "Hell-Hound Canine Penis Silicone Dildo", price: 56.94, category: "Fantasy", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/23/AG874-STD-MAIN_175x175.jpg" },
  { id: 172, name: "Cyclone Squishy Alien Vagina Stroker", price: 89.97, category: "Fantasy", img: "https://www.sextoydistributing.com/Merchant2/graphics/00000001/23/AH160_MAIN-STD_175x175.jpg" },

  // ── Lubes & Wellness ──
  { id: 177, name: 'Passion Water-Based Lubricant 2oz',            price: 13.99, cats: ['lube','wellness'], dropship: true },
  { id: 179, name: 'Passion Water-Based Lubricant 4oz',            price: 17.99, cats: ['lube','wellness'], dropship: true },
  { id: 186, name: 'Spearmint Clit Sensitizer',                    price: 25.99, cats: ['lube','toys','couples'], dropship: true },
  { id: 187, name: 'Strawberry Clit Sensitizer',                   price: 26.99, cats: ['lube','toys','couples'], dropship: true },
  { id: 188, name: 'Anal-Eze Gel',                                 price: 15.99, cats: ['lube','anal'], dropship: true },
  { id: 199, name: 'Charge Up G-Spot Gel',                         price: 19.99, cats: ['lube','toys','couples'], dropship: true },
  { id: 202, name: 'Fetish Drip Candles 3 Pack',                   price: 14.99, cats: ['wellness','bold'], dropship: true },
  { id: 204, name: 'Fever Hot Wax Candle',                         price: 14.99, cats: ['wellness','bold'], dropship: true },
  { id: 206, name: "Lover's Massage Candle - Vanilla",             price: 22.99, cats: ['wellness','couples'], dropship: true },

  // ── Games & Novelties ──
  { id: 212, name: 'Thunderstick Mini Vibrating Wand Keychain',    price: 10.99, cats: ['games','toys','fun'], dropship: true },
  { id: 215, name: 'Feather Tickler',                              price: 12.99, cats: ['games','fun','couples'], dropship: true },
  { id: 216, name: 'Frisky Feather Tickler',                       price: 12.99, cats: ['games','fun','couples'], dropship: true },
  { id: 229, name: 'BDSM Teddy Bear Keychain',                     price: 16.99, cats: ['games','fun','bold'], dropship: true },
  { id: 230, name: 'Happy Peckers Penis Pillow',                   price: 16.99, cats: ['games','fun'], dropship: true },

  // ── BDSM & Bondage ──
  { id: 241, name: 'Bondage Tape',                                 price: 12.99, cats: ['accessories','bold'], dropship: true },
  { id: 246, name: 'Fleece Lined Blindfold',                       price: 13.99, cats: ['accessories','bold','couples'], dropship: true },
  { id: 254, name: 'Furry Handcuffs',                              price: 17.99, cats: ['accessories','bold','couples'], dropship: true },
  { id: 259, name: 'Imprint Spanking Paddle',                      price: 19.99, cats: ['accessories','bold'], dropship: true },
  { id: 262, name: 'Padded Pillow Mouth Gag',                      price: 19.99, cats: ['accessories','bold'], dropship: true },
  { id: 263, name: '4 Cuff Hog Tie Restraint',                     price: 22.99, cats: ['accessories','bold'], dropship: true },
  { id: 237, name: 'Wild Sex 7 Piece Bondage Set',                 price: 79.99, cats: ['accessories','bold','premium'], dropship: true },

  // ── Costumes & Lingerie ──
  { id: 274, name: 'Crotchless Teddy',                             price: 26.99, cats: ['accessories','fashion','couples'], dropship: true },
  { id: 275, name: 'Fishnet Dress',                                price: 33.99, cats: ['accessories','fashion','couples'], dropship: true },
  { id: 276, name: 'Fishnet Open-Bust 3-Piece Set',                price: 38.99, cats: ['accessories','fashion','premium'], dropship: true }

];

const BOX_CATEGORIES = [
  { key: 'toys',        label: 'Toys & Vibes' },
  { key: 'roses',       label: '🌹 Rose Collection' },
  { key: 'couples',     label: 'Couples Fun' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'games',       label: 'Games' },
  { key: 'lube',        label: 'Lube & Oils' },
  { key: 'wellness',    label: 'Wellness' },
  { key: 'bold',        label: 'Bold & Daring' },
  { key: 'anal',        label: 'Anal Play' },
  { key: 'fun',         label: '✨ Playful & Fun' },
];

const BOX_TIERS = [
  { id: 'box50',  label: '$50 Box',   budget: 50,  icon: '', tagline: 'The Perfect Start', desc: 'A mystery mix of 2–3 hand-picked items curated just for your vibe. Great for first-timers or treating yourself.' },
  { id: 'box100', label: '$100 Box',  budget: 100, icon: '', tagline: 'The Sweet Spot',    desc: '3–5 items, one of each category you love. The box that delivers without holding back.' },
  { id: 'box150', label: '$150+ Box', budget: 150, icon: '', tagline: 'The Full Drip',     desc: '5–7 premium items across every category. This is the box for the ones who go all the way.' },
];

// ─────────────────────────────
// BUILD-YOUR-OWN BOX STATE
// ─────────────────────────────
let _boxStep       = 1;
let _boxTierId     = null;
let _boxCategories = [];
let _boxResult     = [];

function openBuildABox() {
  _boxStep       = 1;
  _boxTierId     = null;
  _boxCategories = [];
  _boxResult     = [];
  _renderBoxModal();
  document.getElementById('box-modal-overlay').classList.add('open');
  document.getElementById('box-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBuildABox() {
  document.getElementById('box-modal-overlay').classList.remove('open');
  document.getElementById('box-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function _renderBoxModal() {
  const modal = document.getElementById('box-modal');
  if (_boxStep === 1) {
    modal.innerHTML = `
      <div class="box-modal-inner">
        <button class="booking-close" onclick="closeBuildABox()">✕</button>
        <img src="images/logo.png" style="height:42px;display:block;margin:0 auto 18px;">
        <p class="section-eyebrow" style="text-align:center;margin-bottom:6px;">Build Your Box</p>
        <h2 class="booking-title" style="text-align:center;">Step 1 — Choose Your Budget</h2>
        <p class="booking-sub" style="text-align:center;">What's your vibe for tonight's investment?</p>
        <div class="box-tier-grid">
          ${BOX_TIERS.map(t => `
            <div class="box-tier-card ${_boxTierId===t.id?'selected':''}" onclick="selectBoxTier('${t.id}')">
              <div class="box-tier-icon">${t.icon}</div>
              <div class="box-tier-label">${t.label}</div>
              <div class="box-tier-tagline">${t.tagline}</div>
              <p class="box-tier-desc">${t.desc}</p>
            </div>`).join('')}
        </div>
        <button class="btn-primary booking-submit-btn" onclick="boxStep1Next()" ${_boxTierId?'':'disabled'}>
          Next: Pick Your Vibe →
        </button>
      </div>`;
  } else if (_boxStep === 2) {
    modal.innerHTML = `
      <div class="box-modal-inner">
        <button class="booking-close" onclick="closeBuildABox()">✕</button>
        <img src="images/logo.png" style="height:42px;display:block;margin:0 auto 18px;">
        <p class="section-eyebrow" style="text-align:center;margin-bottom:6px;">Build Your Box</p>
        <h2 class="booking-title" style="text-align:center;">Step 2 — Pick Up to 2 Vibes</h2>
        <p class="booking-sub" style="text-align:center;">We'll build the rest around what you choose. Leave it blank and we'll surprise you completely. </p>
        <div class="box-cat-grid">
          ${BOX_CATEGORIES.map(c => `
            <button class="box-cat-btn ${_boxCategories.includes(c.key)?'selected':''}"
              onclick="toggleBoxCat('${c.key}')">${c.label}</button>`).join('')}
        </div>
        <p class="booking-footer-note" style="margin-top:12px;">Selected: ${_boxCategories.length}/2</p>
        <div style="display:flex;gap:12px;margin-top:18px;">
          <button class="btn-ghost" style="flex:1" onclick="boxStepBack()">← Back</button>
          <button class="btn-primary" style="flex:2" onclick="boxStep2Next()">
            Curate My Box ✨
          </button>
        </div>
      </div>`;
  } else if (_boxStep === 3) {
    const tier = BOX_TIERS.find(t => t.id === _boxTierId);
    const total = _boxResult.reduce((s, p) => s + p.price, 0);
    modal.innerHTML = `
      <div class="box-modal-inner">
        <button class="booking-close" onclick="closeBuildABox()">✕</button>
        <img src="images/logo.png" style="height:42px;display:block;margin:0 auto 18px;">
        <p class="section-eyebrow" style="text-align:center;margin-bottom:6px;">Your Box is Ready</p>
        <h2 class="booking-title" style="text-align:center;">${tier.icon} ${tier.tagline}</h2>
        <p class="booking-sub" style="text-align:center;">Your Secret Keepers curated this just for you. Every item picked with your vibe in mind.</p>
        <div class="box-result-list">
          ${_boxResult.map(p => `
            <div class="box-result-item">
              <span class="box-result-name">✦ ${p.name}</span>
              <span class="box-result-price">$${p.price}</span>
            </div>`).join('')}
          <div class="box-result-total">
            <span>Box Total</span>
            <span style="color:var(--accent-purple);font-weight:700;">$${tier.budget}${tier.budget===150?'+':''}</span>
          </div>
        </div>
        <p class="booking-footer-note">Retail value up to $${total}. Yours for $${tier.budget}${tier.budget===150?'+':''}.</p>
        <div style="display:flex;gap:12px;margin-top:18px;">
          <button class="btn-ghost" style="flex:1" onclick="boxStep2Next()">↻ Reshuffle</button>
          <button class="btn-primary" style="flex:2" onclick="addBoxToCart()">Add Box to Cart</button>
        </div>
      </div>`;
  }
}

function selectBoxTier(tierId) {
  _boxTierId = tierId;
  _renderBoxModal();
}

function boxStep1Next() {
  if (!_boxTierId) return;
  _boxStep = 2;
  _renderBoxModal();
}

function toggleBoxCat(cat) {
  if (_boxCategories.includes(cat)) {
    _boxCategories = _boxCategories.filter(c => c !== cat);
  } else {
    if (_boxCategories.length >= 2) {
      _boxCategories.shift();
    }
    _boxCategories.push(cat);
  }
  _renderBoxModal();
}

function boxStep2Next() {
  _boxResult = _curateBox(_boxTierId, _boxCategories);
  _boxStep = 3;
  _renderBoxModal();
}

function boxStepBack() {
  _boxStep = Math.max(1, _boxStep - 1);
  _renderBoxModal();
}

function _curateBox(tierId, cats) {
  const tier    = BOX_TIERS.find(t => t.id === tierId);
  const budget  = tier.budget;
  let pool      = [...BOX_PRODUCT_POOL];

  // Shuffle pool for randomness
  pool.sort(() => Math.random() - 0.5);

  // Get purchased IDs from Firebase/localStorage to avoid repeats
  let purchased = [];
  try {
    const hist = JSON.parse(localStorage.getItem('ds_order_history') || '[]');
    hist.forEach(o => { if (o.items) o.items.forEach(i => purchased.push(i.id)); });
  } catch(e) {}
  pool = pool.filter(p => !purchased.includes(p.id));
  if (!pool.length) pool = [...BOX_PRODUCT_POOL].sort(() => Math.random() - 0.5);

  // Prioritize preferred categories
  let preferred = cats.length
    ? pool.filter(p => p.cats.some(c => cats.includes(c)))
    : [];
  let other = pool.filter(p => !preferred.includes(p));

  // Merge: preferred first, then others
  const orderedPool = [...preferred, ...other];

  // Greedy fill within budget
  const selected = [];
  let spent = 0;

  // Determine target count by tier
  const targetMin = tier.id === 'box50' ? 2 : tier.id === 'box100' ? 3 : 5;

  // Per-item retail price ceiling — prevents one expensive item from eating the box
  // Ensures at least targetMin items can fit and Ashley keeps margin
  const itemCeil = tier.id === 'box50' ? 30 : tier.id === 'box100' ? 44 : 50;
  const cappedPool = orderedPool.filter(p => (p.price || 0) <= itemCeil);
  const fillPool = cappedPool.length >= targetMin ? cappedPool : orderedPool; // fallback if pool too thin

  for (const p of fillPool) {
    if (spent + p.price <= budget || (selected.length < targetMin && spent + p.price <= budget * 1.15)) {
      selected.push(p);
      spent += p.price;
    }
    if (selected.length >= (tier.id === 'box50' ? 3 : tier.id === 'box100' ? 5 : 7)) break;
  }

  return selected;
}

function addBoxToCart() {
  const tier = BOX_TIERS.find(t => t.id === _boxTierId);
  const names = _boxResult.map(p => p.name).join(', ');
  const item = {
    id: 800 + BOX_TIERS.indexOf(tier),
    boxId: _boxTierId,
    name: `${tier.icon} ${tier.label} — ${tier.tagline}`,
    subItems: names,
    price: tier.budget,
    qty: 1,
    image: 'images/logo.png',
    isBox: true
  };
  if (typeof cart !== 'undefined') {
    const existing = cart.find(x => x.boxId === _boxTierId);
    if (existing) { existing.qty++; }
    else { cart.push(item); }
    if (typeof saveCart === 'function') saveCart();
    if (typeof renderCartDrawer === 'function') renderCartDrawer();
    if (typeof updateCartBadge === 'function') updateCartBadge();
  }
  closeBuildABox();
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = `${tier.icon} ${tier.tagline} box added to cart!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2800);
}

// ─────────────────────────────
// SUBSCRIPTION BOXES
// ─────────────────────────────
const SUBSCRIPTION_BOXES = [
  {
    id: 'sub-tease',
    icon: '',
    name: 'Secret Tease Box',
    tagline: 'Lace, luxury, and a little surprise.',
    desc: 'Monthly delivery of lingerie, a massage oil, and a rotating surprise accessory hand-picked by your Secret Keepers. Perfect for solo confidence or setting the mood.',
    includes: ['Lingerie piece', 'Massage oil or serum', 'Surprise accessory'],
    price: 39,
    comparePrice: 70,
    badge: 'Most Popular',
    color: '#8b5cf6'
  },
  {
    id: 'sub-couple',
    icon: '',
    name: 'Couples Reconnect Box',
    tagline: 'For the duo ready to turn things up.',
    desc: "A monthly box built to bring you closer. One toy, one game, one lubricant, plus a date-night challenge card. Different every month — that's the promise.",
    includes: ['Couples toy or accessory', 'Date-night game', 'Lubricant', 'Challenge card'],
    price: 49,
    comparePrice: 95,
    badge: 'Best Value',
    color: '#ec4899'
  },
  {
    id: 'sub-self',
    icon: '🌿',
    name: 'Self-Love Box',
    tagline: 'Your body. Your ritual. Your rules.',
    desc: 'Monthly self-care for the one who puts herself first. Includes a pleasure toy, a bath or skincare product, a wellness item, and a self-care guide. No guilt. All good.',
    includes: ['Pleasure toy', 'Bath or skincare product', 'Wellness item', 'Self-care guide'],
    price: 44,
    comparePrice: 85,
    badge: null,
    color: '#a78bfa'
  }
];

function renderSubscriptionBoxes() {
  const grid = document.getElementById('subscription-grid');
  if (!grid) return;
  grid.innerHTML = SUBSCRIPTION_BOXES.map(s => `
    <div class="sub-box-card">
      ${s.badge ? `<div class="sub-box-badge">${s.badge}</div>` : ''}
      <div class="sub-box-icon">${s.icon}</div>
      <h3 class="sub-box-name">${s.name}</h3>
      <p class="sub-box-tagline">${s.tagline}</p>
      <p class="sub-box-desc">${s.desc}</p>
      <ul class="sub-box-includes">
        ${s.includes.map(i => `<li>✦ ${i}</li>`).join('')}
      </ul>
      <div class="sub-box-pricing">
        <span class="sub-compare">$${s.comparePrice}+ value</span>
        <span class="sub-price">$${s.price}<span class="sub-per">/mo</span></span>
      </div>
      <button class="btn-primary sub-box-btn" onclick="openSubscribeModal('${s.id}')">
        Subscribe Now
      </button>
      <p class="sub-box-note">Cancel anytime · Ships monthly · No repeats guaranteed</p>
    </div>`).join('');
}

function openSubscribeModal(subId) {
  const s = SUBSCRIPTION_BOXES.find(b => b.id === subId);
  if (!s) return;
  const modal   = document.getElementById('box-modal');
  const overlay = document.getElementById('box-modal-overlay');
  modal.innerHTML = `
    <div class="box-modal-inner">
      <button class="booking-close" onclick="closeBuildABox()">✕</button>
      <img src="images/logo.png" style="height:42px;display:block;margin:0 auto 18px;">
      <p class="section-eyebrow" style="text-align:center;margin-bottom:6px;">Monthly Subscription</p>
      <h2 class="booking-title" style="text-align:center;">${s.icon} ${s.name}</h2>
      <p class="booking-sub" style="text-align:center;">${s.tagline}</p>
      <ul class="sub-box-includes" style="margin:18px auto;max-width:320px;">
        ${s.includes.map(i => `<li>✦ ${i}</li>`).join('')}
      </ul>
      <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px 20px;margin-bottom:20px;text-align:center;">
        <p style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;">Your monthly investment</p>
        <div>
          <span style="text-decoration:line-through;color:rgba(255,255,255,0.3);margin-right:8px;">$${s.comparePrice}+ retail value</span>
          <span style="font-size:1.8rem;font-weight:700;color:var(--accent-purple);">$${s.price}<span style="font-size:1rem;">/mo</span></span>
        </div>
      </div>
      <div class="bk-field-group">
        <label class="bk-field-label">Your Name <span style="color:var(--accent-purple)">*</span></label>
        <input type="text" id="sub-name" class="bk-input" placeholder="First & last name" required>
      </div>
      <div class="bk-field-group">
        <label class="bk-field-label">Email Address <span style="color:var(--accent-purple)">*</span></label>
        <input type="email" id="sub-email" class="bk-input" placeholder="your@email.com" required>
      </div>
      <div class="bk-field-group">
        <label class="bk-field-label">Shipping Address <span style="color:var(--accent-purple)">*</span></label>
        <input type="text" id="sub-address" class="bk-input" placeholder="Street address, city, state, ZIP" required>
      </div>
      <div style="background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);border-radius:10px;padding:14px 16px;margin:14px 0;font-size:0.82rem;color:rgba(255,255,255,0.7);">
        💳 <strong>Billing:</strong> Your Secret Keeper will reach out to confirm your first payment of <strong>$${s.price}</strong> via CashApp, Chime, or Apple Pay within 24 hours. Automatic monthly billing activates soon — you'll be notified before the switch.
      </div>
      <button class="btn-primary booking-submit-btn" onclick="submitSubscription('${s.id}')">
        Lock In My Subscription
      </button>
      <p class="booking-footer-note">No repeats. Cancel any time. New secrets every month.</p>
    </div>`;
  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function submitSubscription(subId) {
  const s    = SUBSCRIPTION_BOXES.find(b => b.id === subId);
  const name = document.getElementById('sub-name')?.value.trim();
  const email= document.getElementById('sub-email')?.value.trim();
  const addr = document.getElementById('sub-address')?.value.trim();
  if (!name || !email || !addr) { alert('Please fill in all fields.'); return; }
  // Save to localStorage
  const subs = JSON.parse(localStorage.getItem('ds_subscriptions') || '[]');
  subs.push({ subId, name, email, address: addr, date: new Date().toISOString(), status: 'pending' });
  localStorage.setItem('ds_subscriptions', JSON.stringify(subs));
  // mailto
  const body = `New Subscription Request%0A%0ABox: ${s.name}%0APrice: $${s.price}/mo%0A%0AName: ${name}%0AEmail: ${email}%0AAddress: ${addr}%0A%0APlease confirm payment to activate.`;
  window.location.href = `mailto:Assistant.Manager@DrippingSecrets.com?subject=New Subscription — ${encodeURIComponent(s.name)}&body=${body}`;
  // Confirmation screen
  const modal = document.getElementById('box-modal');
  modal.innerHTML = `
    <div class="box-modal-inner" style="text-align:center;">
      <div style="font-size:3rem;margin-bottom:16px;">${s.icon}</div>
      <h2 class="booking-title">You're On the List!</h2>
      <p class="booking-sub">Your Secret Keeper will be in touch within 24 hours to confirm your first payment and get your box started.<br><br>Welcome to the family. </p>
      <button class="btn-primary" style="margin-top:24px;width:100%;" onclick="closeBuildABox()">Close</button>
    </div>`;
}

// ============================================================
// ===== BUNDLES DATA =====
// ============================================================
const BUNDLES_DATA = [
  {
    id: 'bundle-rose-garden',
    tag: '🌹 Best Seller',
    icon: '🌹',
    name: 'Rose Garden Bundle',
    description: 'Our best-selling rose toy + your choice of lube. The combo that started it all.',
    fixedItems: [],
    choices: [
      { key: 'rose', label: 'Your Rose Toy', category: 'roses' },
      { key: 'toy', label: 'Your Insertable Toy', category: 'toys' }
    ],
    compareValue: 95,
    bundlePrice: 68
  },
  {
    id: 'bundle-date-night',
    tag: 'Fan Favorite',
    icon: '',
    name: 'Date Night Bundle',
    description: 'Set the mood right. Pick your toy, a fun game, and get extras included.',
    fixedItems: ['Intimate Cleansing Wipes 30-Pack'],
    choices: [
      { key: 'toy', label: 'Your Toy', category: 'toys' },
      { key: 'game', label: 'Your Game', category: 'games' }
    ],
    compareValue: 110,
    bundlePrice: 79
  },
  {
    id: 'bundle-couples',
    tag: 'For Two',
    icon: '',
    name: "Couple's Connection Bundle",
    description: 'Everything you two need for a night in. Pick your couples toy + a little bondage extra.',
    fixedItems: [],
    choices: [
      { key: 'couples', label: 'Your Couples Toy', category: 'couples' },
      { key: 'bondage', label: 'Your Bondage Add-On', category: 'bondage' }
    ],
    compareValue: 120,
    bundlePrice: 85
  },
  {
    id: 'bundle-fantasy',
    tag: 'Role Play',
    icon: '',
    name: 'Fantasy Night Bundle',
    description: 'Dress the part. Pick your costume and a toy to match the vibe.',
    fixedItems: [],
    choices: [
      { key: 'costume', label: 'Your Costume', category: 'costumes' },
      { key: 'toy', label: 'Your Toy', category: 'toys' }
    ],
    compareValue: 105,
    bundlePrice: 72
  },
  {
    id: 'bundle-starter',
    tag: '✨ Great Start',
    icon: '✨',
    name: 'Starter Secrets Bundle',
    description: "New to the secrets? We gotchu. Toy + lube + protection — everything you need.",
    fixedItems: [],
    choices: [
      { key: 'toy', label: 'Your Toy', category: 'toys' },
      { key: 'lube', label: 'Your Lube', category: 'lube' },
      { key: 'condom', label: 'Your Condoms', category: 'condoms' }
    ],
    compareValue: 75,
    bundlePrice: 52
  },
  {
    id: 'bundle-solo',
    tag: 'Solo Play',
    icon: '',
    name: 'Solo Pleasure Bundle',
    description: "It's a solo night and that's OK. Pick your vibe, your lube, and your accessory.",
    fixedItems: [],
    choices: [
      { key: 'stroker', label: 'Your Stroker or Toy', category: 'strokers' },
      { key: 'lube', label: 'Your Lube', category: 'lube' },
      { key: 'acc', label: 'Your Accessory', category: 'accessories' }
    ],
    compareValue: 85,
    bundlePrice: 58
  }
];

// ============================================================
// ===== OPEN BUNDLE MODAL =====
// ============================================================
function openBundleModal(bundleId) {
  const b = BUNDLES_DATA.find(x => x.id === bundleId);
  if (!b) return;
  const modal   = document.getElementById('booking-modal');
  const overlay = document.getElementById('booking-overlay');
  if (!modal || !overlay) return;

  const allProds = typeof getProducts === 'function' ? getProducts() : [];

  // Per-slot price ceiling: each chosen item's retail price must stay within
  // a sensible fraction of the bundle price so Ashley keeps margin on every order.
  // Formula: bundlePrice / numChoices * 1.35  (leaves ~35% for profit + other slots)
  const perSlotMax = Math.floor(b.bundlePrice / Math.max(b.choices.length, 1) * 1.35);

  const choiceHTML = b.choices.map(c => {
    let slotProds = allProds.filter(p => p.category === c.category && p.inStock !== false && (p.price || 0) <= perSlotMax);
    // Fallback: if too few options after cap, relax to bundlePrice * 0.9
    if (slotProds.length < 2) slotProds = allProds.filter(p => p.category === c.category && p.inStock !== false && (p.price || 0) <= b.bundlePrice * 0.9);
    const opts = slotProds
      .map(p => `<option value="${p.id}">$${(p.price||0).toFixed(2)} — ${p.name}</option>`)
      .join('');
    return `
      <div class="booking-field" style="margin-bottom:14px;">
        <label style="display:block;font-size:0.82rem;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:#a855f7;margin-bottom:6px;">${c.label}</label>
        <select id="bundle-${c.key}" class="booking-input" style="width:100%;background:#1a0d2e;border:1px solid rgba(168,85,247,0.3);color:#fff;padding:10px 14px;border-radius:8px;font-size:0.92rem;">
          <option value="">— Choose ${c.label} —</option>
          ${opts}
        </select>
      </div>`;
  }).join('');

  modal.innerHTML = `
    <button class="modal-close" onclick="closeBookingModal()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer;">✕</button>
    <div class="box-modal-inner" style="padding:32px 24px;">
      <div style="font-size:3rem;margin-bottom:8px;text-align:center;">${b.icon}</div>
      <h2 class="booking-title" style="text-align:center;margin-bottom:8px;">${b.name}</h2>
      <p class="booking-sub" style="text-align:center;margin-bottom:20px;color:rgba(255,255,255,0.7);">${b.description}</p>
      ${b.fixedItems.length ? `<p style="font-size:0.85rem;color:#a855f7;margin-bottom:16px;text-align:center;">Includes: ${b.fixedItems.join(' + ')}</p>` : ''}
      ${choiceHTML}
      <div style="text-align:center;margin:20px 0;">
        <span style="text-decoration:line-through;color:rgba(255,255,255,0.4);font-size:0.9rem;margin-right:8px;">Up to $${b.compareValue} value</span>
        <span style="font-size:1.6rem;color:#a855f7;font-weight:700;">$${b.bundlePrice}</span>
      </div>
      <button class="btn-primary" style="width:100%;padding:14px;" onclick="addBundleToCart('${b.id}')">Add Bundle to Cart 🛒</button>
    </div>`;

  overlay.classList.add('open');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ============================================================
// ===== SERVICES DATA =====
// ============================================================
var SERVICES = [
  {
    id: 'secrets-party',
    name: 'Host a Secrets Party',
    tagline: 'Your place. Your vibe. Our secrets.',
    description: 'We bring the full Secrets Party experience to you — products, games, fun, and a Secret Keeper to guide it all. Perfect for bachelorettes, GNOs, couples nights, and more.',
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>',
    cta: 'Book a Secrets Party',
    price: 'Starting at $150',
    action: "window.location.href='/booking.html'"
  },
  {
    id: 'wellness-consult',
    name: 'Private Shopping Session',
    tagline: 'Real talk about pleasure. No judgment.',
    description: 'One-on-one session with a Secret Keeper to explore your desires, get personalized product recommendations, and build confidence in your intimacy journey. Virtual or in-person.',
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    cta: 'Book a Consultation',
    price: 'Starting at $75',
    action: "window.location.href='/booking.html?type=consult'"
  },
  {
    id: 'private-shopping',
    name: 'Private Shopping Session',
    tagline: 'A curated haul, just for you.',
    description: 'Let your Secret Keeper walk you through the full catalog — virtually or in person. Get personalized picks based on your budget, interests, and vibe. Free with $75+ order.',
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    cta: 'Book a Session',
    price: 'Free with $75+ order',
    action: "openBookingModal('private-shopping')"
  },
  {
    id: 'couples-experience',
    name: "Couples' Night In",
    tagline: 'For two. For tonight.',
    description: 'A curated package of games, toys, and conversation starters for the perfect date night in. Add a virtual Secret Keeper session for the full experience.',
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    cta: "Plan Your Night",
    price: 'Starting at $100',
    action: "openBookingModal('couples-experience')"
  },
  {
    id: 'gift-curation',
    name: 'Gift Curation',
    tagline: "The gift they'll never forget.",
    description: "Tell us about your person — we'll curate a personalized gift set or box that hits just right. Anonymous gifting available. Nationwide shipping.",
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    cta: 'Curate a Gift',
    price: 'Starting at $50',
    action: "openBookingModal('gift-curation')"
  },
  {
    id: 'subscription-box',
    name: 'Monthly Subscription Box',
    tagline: 'New secrets, every month.',
    description: "Subscribe to a monthly box and receive curated products matched to your pleasure profile. No repeats, no guessing — just the drip, on repeat.",
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    cta: 'Subscribe Now',
    price: 'From $49/mo',
    action: "location.href='/boxes.html'"
  }
];
