/**
 * DSFlyerGen v3.0 — Dripping Secrets Social Flyer Generator
 * Platform 2.0 / Addendum A Visual Overhaul
 *
 * Brand: Deep Black · Rich Purple · Metallic Gold · Rose-Gold accent
 * NEW vs v2:
 *   — Gold metallic gradient text (primary accent, replaces rose/pink)
 *   — Purple glitter bg with sparkle particle field
 *   — DRIP10 promo badge (price-tag style, gold) replaces expired flash-sale bar
 *   — Social handles footer: IG · FB · TikTok · X
 *   — Phone number (469) 200-9118
 *   — Feature icon badges: Premium · Discreet Shipping · Secure · Confidence
 *   — Dancing Script font for luxury script elements
 *   — Gold ring on DS logo
 *   — Gold borders on product cards
 *   — Headline pool for variation when no headline supplied
 *   — "POV" bar removed; brand-appropriate CTA language only
 *   — LUXURY · DISCRETION · CONFIDENCE · CONNECTION footer pillar
 *
 * Platforms: twitter(1200×675) · fb-post(1200×628) · ig-feed(1080×1080)
 *            ig-story / ig-reel / fb-story / fb-reel (1080×1920)
 *
 * Public API (unchanged):
 *   DSFlyerGen.draw(platform, headline, caption)           → Promise<dataURL>
 *   DSFlyerGen.drawToCanvas(canvasEl, platform, hl, cap)   → Promise<void>
 */

const DSFlyerGen = (() => {

  /* ─────────────────────────────────────────────────────────────
     Brand palette
  ───────────────────────────────────────────────────────────── */
  const C = {
    black:    '#060008',
    darkBg:   '#0D0010',
    plum:     '#2A0845',
    plumMid:  '#3D1260',
    purple:   '#5B2D8E',
    purpleLt: '#9058C8',
    gold:     '#C8A84B',
    goldLt:   '#EFD97A',
    goldDark: '#8B6514',
    white:    '#FFFFFF',
    cream:    '#F2E4C0',
    muted:    '#9980AA',
    roseGold: '#C4807A',   // accent only — no longer primary
  };

  /* ─────────────────────────────────────────────────────────────
     Brand content constants
  ───────────────────────────────────────────────────────────── */
  const PHONE         = '(469) 200-9118';
  const SITE_URL      = 'www.drippingsecrets.com';
  const BRAND_TAGLINE = 'You deserve a secret this good.';
  const BRAND_PILLARS = 'LUXURY  ·  DISCRETION  ·  CONFIDENCE  ·  CONNECTION';

  const SOCIAL_ACCOUNTS = [
    { abbr: 'IG', handle: '@dripping.secrets',           color: '#CC44AA' },
    { abbr: 'FB', handle: '@Dripping Secrets',           color: '#4488DD' },
    { abbr: 'TT', handle: '@drippingsecretsbyashleyb',   color: '#EE3355' },
    { abbr: 'X',  handle: 'DrippingSecrts',              color: '#AAAAAA' },
  ];

  const HEADLINE_POOL = [
    ['YOUR PLEASURE.', 'YOUR SECRETS.'],
    ["IT'S A DRIP", 'KIND OF DAY.'],
    ['SHOP BOLD.', 'DRIP DAILY.'],
    ['SECRETS ARE', 'BETTER HERE.'],
    ['INDULGE.', 'EMPOWER. REPEAT.'],
    ['TREAT YOURSELF.', 'TODAY.'],
  ];

  /* ─────────────────────────────────────────────────────────────
     Platform sizes
  ───────────────────────────────────────────────────────────── */
  const SIZES = {
    'twitter':  { w: 1200, h: 675,  layout: 'wide'   },
    'fb-post':  { w: 1200, h: 628,  layout: 'wide'   },
    'ig-feed':  { w: 1080, h: 1080, layout: 'square' },
    'ig-story': { w: 1080, h: 1920, layout: 'tall'   },
    'ig-reel':  { w: 1080, h: 1920, layout: 'tall'   },
    'fb-story': { w: 1080, h: 1920, layout: 'tall'   },
    'fb-reel':  { w: 1080, h: 1920, layout: 'tall'   },
  };

  /* ─────────────────────────────────────────────────────────────
     Fonts
  ───────────────────────────────────────────────────────────── */
  let _fontsLoaded = false;
  async function _ensureFonts() {
    if (_fontsLoaded) return;
    try {
      const link    = document.createElement('link');
      link.rel      = 'stylesheet';
      link.href     = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;600;700&family=Dancing+Script:wght@700&display=swap';
      document.head.appendChild(link);
      await document.fonts.ready;
      _fontsLoaded  = true;
    } catch (_) {}
  }

  const F = {
    hl:     (sz) => `900 ${sz}px 'Playfair Display', Georgia, serif`,
    italic: (sz) => `italic 700 ${sz}px 'Playfair Display', Georgia, serif`,
    script: (sz) => `700 ${sz}px 'Dancing Script', cursive`,
    bold:   (sz) => `700 ${sz}px 'Inter', Arial, sans-serif`,
    reg:    (sz) => `400 ${sz}px 'Inter', Arial, sans-serif`,
  };

  /* ─────────────────────────────────────────────────────────────
     Utilities
  ───────────────────────────────────────────────────────────── */
  function _loadImg(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const img      = new Image();
      img.crossOrigin = 'anonymous';
      img.onload     = () => res(img);
      img.onerror    = () => res(null);
      img.src        = src;
    });
  }

  function _rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);   ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);   ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
    ctx.lineTo(x, y + r);       ctx.quadraticCurveTo(x,     y,     x + r, y);
    ctx.closePath();
  }

  function _wrap(ctx, text, maxW) {
    const words = String(text).split(' ');
    const lines = [];
    let   cur   = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  /* seeded LCG */
  function _rng(seed) {
    let s = (seed | 0) || 1;
    return () => { s = (Math.imul(1664525, s) + 1013904223) | 0; return (s >>> 0) / 4294967296; };
  }

  function _pickHeadline() {
    return HEADLINE_POOL[Math.floor(Math.random() * HEADLINE_POOL.length)];
  }

  /* ─────────────────────────────────────────────────────────────
     Gradient builders
  ───────────────────────────────────────────────────────────── */
  function _goldGrad(ctx, yTop, h) {
    const g = ctx.createLinearGradient(0, yTop, 0, yTop + h);
    g.addColorStop(0,    '#F8EF88');
    g.addColorStop(0.25, '#EDD050');
    g.addColorStop(0.55, '#C89028');
    g.addColorStop(0.85, '#A07010');
    g.addColorStop(1,    '#C89028');
    return g;
  }

  function _purpleGrad(ctx, yTop, h) {
    const g = ctx.createLinearGradient(0, yTop, 0, yTop + h);
    g.addColorStop(0,   '#D898FF');
    g.addColorStop(0.3, '#9040E8');
    g.addColorStop(0.7, '#6020B8');
    g.addColorStop(1,   '#4010A0');
    return g;
  }

  /* ─────────────────────────────────────────────────────────────
     4-point sparkle star
  ───────────────────────────────────────────────────────────── */
  function _sparkle(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a   = (i * Math.PI) / 4 - Math.PI / 8;
      const rad = i % 2 === 0 ? r : r * 0.32;
      const px  = cx + Math.cos(a) * rad;
      const py  = cy + Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     Background: purple-black luxury glitter
  ───────────────────────────────────────────────────────────── */
  function _bg(ctx, W, H) {
    /* base radial gradient */
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.25, 0, W * 0.5, H * 0.6, W * 0.9);
    bg.addColorStop(0,   '#1C0038');
    bg.addColorStop(0.5, '#0E001C');
    bg.addColorStop(1,   C.black);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* purple ambient glow blobs */
    [[W * 0.15, H * 0.12, W * 0.45],
     [W * 0.85, H * 0.55, W * 0.38],
     [W * 0.5,  H * 0.88, W * 0.3 ]].forEach(([gx, gy, gr]) => {
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, 'rgba(90,30,160,0.28)');
      g.addColorStop(1, 'rgba(90,30,160,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    /* glitter micro-dots */
    const rand = _rng(W + H);
    ctx.save();
    for (let i = 0; i < 180; i++) {
      const x  = rand() * W;
      const y  = rand() * H;
      const r  = 0.4 + rand() * 2.2;
      const a  = 0.15 + rand() * 0.75;
      const gc = rand() > 0.55 ? C.goldLt : '#CC88FF';
      ctx.globalAlpha = a;
      ctx.fillStyle   = gc;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* sparkle stars */
    const rand2 = _rng(W * H + 7);
    ctx.save();
    for (let i = 0; i < 32; i++) {
      const x  = rand2() * W;
      const y  = rand2() * H;
      const r  = 3 + rand2() * 8;
      const a  = 0.25 + rand2() * 0.6;
      ctx.globalAlpha = a;
      _sparkle(ctx, x, y, r, rand2() > 0.5 ? C.goldLt : '#DDB0FF');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     Gold separator line
  ───────────────────────────────────────────────────────────── */
  function _sep(ctx, cx, y, w) {
    ctx.save();
    ctx.shadowColor = 'rgba(220,170,50,0.55)';
    ctx.shadowBlur  = 8;
    const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
    g.addColorStop(0,   'rgba(200,168,75,0)');
    g.addColorStop(0.5, C.goldLt);
    g.addColorStop(1,   'rgba(200,168,75,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, y);
    ctx.lineTo(cx + w / 2, y);
    ctx.stroke();
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     DS Logo with metallic gold ring
  ───────────────────────────────────────────────────────────── */
  function _logo(ctx, logoImg, cx, cy, size) {
    const r = size / 2;

    /* outer gold glow ring */
    ctx.save();
    ctx.shadowColor = 'rgba(220,170,50,0.85)';
    ctx.shadowBlur  = 24;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    const ring = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    ring.addColorStop(0,   '#F8EF80');
    ring.addColorStop(0.3, '#C89028');
    ring.addColorStop(0.7, '#EDD050');
    ring.addColorStop(1,   '#C89028');
    ctx.strokeStyle = ring;
    ctx.lineWidth   = 5;
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.restore();

    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      /* cover-fit: treat logo as square */
      const d  = size;
      const iW = logoImg.width;
      const iH = logoImg.height;
      const s  = Math.min(iW, iH);
      const sx = (iW - s) / 2;
      const sy = (iH - s) / 2;
      ctx.drawImage(logoImg, sx, sy, s, s, cx - r, cy - r, d, d);
      ctx.restore();
    } else {
      /* text fallback */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = C.plum;
      ctx.fill();
      ctx.font           = F.hl(size * 0.44);
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'middle';
      ctx.fillStyle      = _goldGrad(ctx, cy - r, size);
      ctx.fillText('DS', cx, cy);
      ctx.textBaseline   = 'alphabetic';
      ctx.restore();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     DRIP10 promo badge — gold price-tag style
  ───────────────────────────────────────────────────────────── */
  function _drip10(ctx, cx, cy, bW, bH) {
    const r      = 16;
    const notchR = bH * 0.22;
    const rectX  = cx - bW / 2 + notchR * 2 + 4;
    const rectW  = bW - notchR * 2 - 4;
    const notchX = cx - bW / 2 + notchR + 4;

    ctx.save();
    ctx.shadowColor = 'rgba(200,160,30,0.85)';
    ctx.shadowBlur  = 30;

    /* gold body */
    const gold = ctx.createLinearGradient(rectX, cy - bH / 2, rectX + rectW, cy + bH / 2);
    gold.addColorStop(0,   '#F8EF80');
    gold.addColorStop(0.3, '#DBBC40');
    gold.addColorStop(0.65,'#A87818');
    gold.addColorStop(1,   '#C8A030');
    _rr(ctx, rectX, cy - bH / 2, rectW, bH, r);
    ctx.fillStyle = gold;
    ctx.fill();

    /* gold border */
    _rr(ctx, rectX, cy - bH / 2, rectW, bH, r);
    ctx.strokeStyle = '#F8EF80';
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    /* notch hole */
    ctx.beginPath();
    ctx.arc(notchX, cy, notchR, 0, Math.PI * 2);
    ctx.fillStyle   = C.black;
    ctx.fill();
    ctx.strokeStyle = C.goldLt;
    ctx.lineWidth   = 2;
    ctx.stroke();

    /* divider */
    const divX = rectX + rectW * 0.44;
    ctx.beginPath();
    ctx.moveTo(divX, cy - bH * 0.33);
    ctx.lineTo(divX, cy + bH * 0.33);
    ctx.strokeStyle = 'rgba(45,8,69,0.45)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    /* left: "10% OFF" */
    const leftCX = rectX + (divX - rectX) / 2;
    ctx.font      = `900 ${bH * 0.52}px 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = C.plum;
    ctx.fillText('10%', leftCX, cy + bH * 0.08);

    ctx.font      = `700 ${bH * 0.21}px 'Inter', Arial, sans-serif`;
    ctx.fillText('OFF YOUR ORDER', leftCX, cy + bH * 0.37);

    /* right: "USE CODE: DRIP10" */
    const rightCX = divX + (rectX + rectW - divX) / 2;
    ctx.font      = `600 ${bH * 0.16}px 'Inter', Arial, sans-serif`;
    ctx.fillStyle = C.plum;
    ctx.fillText('USE CODE:', rightCX, cy - bH * 0.1);

    ctx.font      = `900 ${bH * 0.3}px 'Playfair Display', Georgia, serif`;
    ctx.fillText('DRIP10', rightCX, cy + bH * 0.22);

    ctx.font      = `600 ${bH * 0.14}px 'Inter', Arial, sans-serif`;
    ctx.fillStyle = `rgba(42,8,69,0.75)`;
    ctx.fillText('LIMITED TIME ONLY!', rightCX, cy + bH * 0.42);

    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     Feature icon tiles (2×2 or 1×4)
  ───────────────────────────────────────────────────────────── */
  function _drawFeatIcon(ctx, cx, cy, r, type) {
    ctx.save();
    ctx.strokeStyle = C.gold;
    ctx.fillStyle   = C.gold;
    ctx.lineWidth   = 2;
    if (type === 'diamond') {
      ctx.beginPath();
      ctx.moveTo(cx,         cy - r * 0.55);
      ctx.lineTo(cx + r * 0.45, cy);
      ctx.lineTo(cx,         cy + r * 0.55);
      ctx.lineTo(cx - r * 0.45, cy);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'box') {
      const b = r * 0.55;
      _rr(ctx, cx - b, cy - b, b * 2, b * 2, 4);
      ctx.stroke();
    } else if (type === 'lock') {
      const bH = r * 0.58;
      const bW = r * 0.65;
      _rr(ctx, cx - bW / 2, cy - bH * 0.15, bW, bH * 0.8, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy - bH * 0.05, bW * 0.33, Math.PI, 0);
      ctx.stroke();
    } else if (type === 'heart') {
      const s = r * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.9);
      ctx.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 1.5, cy - s * 0.8, cx, cy - s * 0.35);
      ctx.bezierCurveTo(cx + s * 1.5, cy - s * 0.8, cx + s * 1.3, cy + s * 0.1, cx, cy + s * 0.9);
      ctx.fill();
    }
    ctx.restore();
  }

  function _features(ctx, cx, cy, gridW, cellH) {
    const items = [
      { type: 'diamond', l1: 'PREMIUM',    l2: 'QUALITY'           },
      { type: 'box',     l1: 'DISCREET',   l2: 'SHIPPING'          },
      { type: 'lock',    l1: 'SECURE',     l2: '& PRIVATE'         },
      { type: 'heart',   l1: 'CONFIDENCE', l2: 'IN EVERY ORDER'    },
    ];
    const colW  = gridW / 4;
    const iconR = cellH * 0.26;

    items.forEach((item, i) => {
      const x = cx - gridW / 2 + i * colW + colW / 2;
      const y = cy;

      /* gold circle ring */
      ctx.save();
      ctx.shadowColor = 'rgba(200,168,75,0.5)';
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.arc(x, y - cellH * 0.12, iconR, 0, Math.PI * 2);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.restore();

      _drawFeatIcon(ctx, x, y - cellH * 0.12, iconR * 0.65, item.type);

      ctx.font      = F.bold(cellH * 0.17);
      ctx.textAlign = 'center';
      ctx.fillStyle = C.white;
      ctx.fillText(item.l1, x, y + cellH * 0.22);
      ctx.font      = F.reg(cellH * 0.15);
      ctx.fillStyle = C.muted;
      ctx.fillText(item.l2, x, y + cellH * 0.4);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     URL search bar
  ───────────────────────────────────────────────────────────── */
  function _urlBar(ctx, cx, cy, bW, bH) {
    _rr(ctx, cx - bW / 2, cy - bH / 2, bW, bH, bH / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    _rr(ctx, cx - bW / 2, cy - bH / 2, bW, bH, bH / 2);
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.4)';
    ctx.shadowBlur  = 8;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();
    ctx.font      = F.bold(bH * 0.45);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.white;
    ctx.fillText('🔍  ' + SITE_URL, cx, cy + bH * 0.34);
  }

  /* ─────────────────────────────────────────────────────────────
     Social handles row
  ───────────────────────────────────────────────────────────── */
  function _socialRow(ctx, cx, cy, rowW, iconR, handleSz) {
    const colW = rowW / SOCIAL_ACCOUNTS.length;

    SOCIAL_ACCOUNTS.forEach((acct, i) => {
      const x = cx - rowW / 2 + i * colW + colW / 2;

      /* icon ring */
      ctx.save();
      ctx.shadowColor = acct.color + '88';
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(x, cy, iconR, 0, Math.PI * 2);
      ctx.strokeStyle = acct.color;
      ctx.lineWidth   = 1.8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.font           = F.bold(iconR * 0.85);
      ctx.textAlign      = 'center';
      ctx.textBaseline   = 'middle';
      ctx.fillStyle      = acct.color;
      ctx.fillText(acct.abbr, x, cy);
      ctx.textBaseline   = 'alphabetic';

      /* handle — truncate if needed */
      ctx.font         = F.reg(handleSz);
      ctx.textAlign    = 'center';
      ctx.fillStyle    = C.muted;
      const maxW       = colW - 8;
      let   handle     = acct.handle;
      while (ctx.measureText(handle).width > maxW && handle.length > 6) handle = handle.slice(0, -1);
      if (handle !== acct.handle) handle += '…';
      ctx.fillText(handle, x, cy + iconR + handleSz + 4);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     Product card — gold border edition
  ───────────────────────────────────────────────────────────── */
  function _card(ctx, x, y, w, h, img, name, price, r = 18) {
    /* glass body */
    _rr(ctx, x, y, w, h, r);
    ctx.fillStyle = 'rgba(20,0,35,0.88)';
    ctx.fill();

    /* gold glow border */
    _rr(ctx, x, y, w, h, r);
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.55)';
    ctx.shadowBlur  = 14;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.shadowBlur  = 0;
    ctx.restore();

    const imgH = h * 0.58;
    const pad  = 8;

    if (img) {
      ctx.save();
      _rr(ctx, x + pad, y + pad, w - pad * 2, imgH - pad, r - 4);
      ctx.clip();
      const iAR = img.width / img.height;
      const cAR = (w - pad * 2) / (imgH - pad);
      let sx, sy, sw, sh;
      if (iAR > cAR) { sh = img.height; sw = sh * cAR; sx = (img.width - sw) / 2; sy = 0; }
      else            { sw = img.width; sh = sw / cAR;  sx = 0; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, x + pad, y + pad, w - pad * 2, imgH - pad);
      ctx.restore();
    } else {
      _rr(ctx, x + pad, y + pad, w - pad * 2, imgH - pad, r - 4);
      ctx.fillStyle = C.plum;
      ctx.fill();
    }

    /* name */
    const fs     = Math.max(14, w * 0.067);
    ctx.font      = F.bold(fs);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.white;
    const nl      = _wrap(ctx, name, w - 20)[0] || name;
    ctx.fillText(nl, x + w / 2, y + imgH + fs + 6);

    /* price pill — gold */
    const pH = Math.max(26, h * 0.11);
    const pW = w * 0.64;
    const pX = x + (w - pW) / 2;
    const pY = y + h - pH - 8;
    _rr(ctx, pX, pY, pW, pH, pH / 2);
    const pg = ctx.createLinearGradient(pX, pY, pX + pW, pY + pH);
    pg.addColorStop(0, '#C8A030');
    pg.addColorStop(1, '#A07020');
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.font      = F.bold(Math.max(13, pH * 0.52));
    ctx.textAlign = 'center';
    ctx.fillStyle = C.black;
    ctx.fillText(`$${parseFloat(price || 0).toFixed(2)}`, x + w / 2, pY + pH * 0.71);
  }

  /* ─────────────────────────────────────────────────────────────
     Safe product filter
  ───────────────────────────────────────────────────────────── */
  function _safeProducts(n = 3) {
    const bCats  = ['machines','dildos','anal','strap','masturbators'];
    const bWords = ['dildo','machine','thrusting','suction cup','double ended',
                    'anal','masturbat','sex doll','cock ring','strap-on'];
    const pool   = (window.PRODUCTS || []).filter(p => {
      if (!p || p.soldOut || p.outOfStock) return false;
      const nm = (p.name     || '').toLowerCase();
      const ca = (p.category || '').toLowerCase();
      if (bCats.some(c  => ca.includes(c)))  return false;
      if (bWords.some(k => nm.includes(k))) return false;
      return true;
    });
    return pool.slice().sort(() => Math.random() - 0.5).slice(0, n);
  }

  function _imgPath(p) { return p?.image || null; }

  /* ═══════════════════════════════════════════════════════════════
     TALL LAYOUT — Stories & Reels (1080×1920)
  ═══════════════════════════════════════════════════════════════ */
  async function _tall(ctx, W, H, headline, caption, logoImg, products, prodImgs) {

    _bg(ctx, W, H);

    /* top gold accent bar */
    ctx.fillStyle = _goldGrad(ctx, 0, 8);
    ctx.fillRect(0, 0, W, 8);

    /* DS logo */
    _logo(ctx, logoImg, W / 2, 196, 196);

    /* script brand name */
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.75)';
    ctx.shadowBlur  = 18;
    ctx.font        = F.script(56);
    ctx.textAlign   = 'center';
    ctx.fillStyle   = _goldGrad(ctx, 306, 62);
    ctx.fillText('Dripping Secrets', W / 2, 368);
    ctx.restore();

    _sep(ctx, W / 2, 394, 380);

    /* headline */
    const defaultLines = _pickHeadline();
    const hlLines = headline
      ? headline.split(/\n/).map(s => s.trim()).filter(Boolean)
      : defaultLines;

    const hlSizes = [118, 98, 78];
    let   hlY     = 440;

    hlLines.slice(0, 3).forEach((line, i) => {
      const sz = hlSizes[i] || 66;
      ctx.save();
      ctx.font        = F.hl(sz);
      ctx.textAlign   = 'center';
      ctx.shadowColor = i % 2 === 0 ? 'rgba(200,168,75,0.9)' : 'rgba(140,50,255,0.9)';
      ctx.shadowBlur  = 30;
      ctx.fillStyle   = i % 2 === 0
        ? _goldGrad(ctx,   hlY - sz, sz * 1.2)
        : _purpleGrad(ctx, hlY - sz, sz * 1.2);
      ctx.fillText(line, W / 2, hlY);
      ctx.restore();
      hlY += sz + 10;
    });

    /* caption sub-text */
    if (caption) {
      ctx.font      = F.reg(36);
      ctx.textAlign = 'center';
      ctx.fillStyle = C.cream;
      _wrap(ctx, caption, W - 120).slice(0, 2).forEach((l, j) => {
        ctx.fillText(l, W / 2, hlY + 28 + j * 50);
      });
      hlY += 140;
    } else {
      hlY += 36;
    }

    /* "Our Promise." script accent */
    ctx.save();
    ctx.font        = F.script(50);
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(200,168,75,0.5)';
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = _goldGrad(ctx, hlY + 2, 56);
    ctx.fillText('Our Promise.', W / 2, hlY + 54);
    ctx.restore();

    _sep(ctx, W / 2, hlY + 80, 310);

    /* feature icons */
    const featY = hlY + 118;
    _features(ctx, W / 2, featY, W - 80, 140);

    /* DRIP10 badge */
    const badgeY = featY + 190;
    _drip10(ctx, W / 2, badgeY, 730, 148);

    /* SHOP NOW CTA */
    const ctaY = badgeY + 116;
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.95)';
    ctx.shadowBlur  = 36;
    ctx.font        = F.hl(84);
    ctx.textAlign   = 'center';
    ctx.fillStyle   = _goldGrad(ctx, ctaY - 84, 100);
    ctx.fillText('SHOP NOW →', W / 2, ctaY);
    ctx.restore();

    /* URL bar */
    _urlBar(ctx, W / 2, ctaY + 64, 740, 66);

    /* CONNECT WITH US */
    const connY = ctaY + 164;
    ctx.font      = F.bold(26);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    ctx.fillText('— CONNECT WITH US —', W / 2, connY);

    /* social handles row */
    _socialRow(ctx, W / 2, connY + 52, W - 80, 34, 20);

    /* bottom footer */
    const footY = connY + 164;
    _sep(ctx, W / 2, footY, W - 60);

    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.6)';
    ctx.shadowBlur  = 10;
    ctx.font        = F.bold(28);
    ctx.textAlign   = 'center';
    ctx.fillStyle   = _goldGrad(ctx, footY + 16, 30);
    ctx.fillText('📞 ' + PHONE, W / 2, footY + 46);
    ctx.restore();

    ctx.font      = F.reg(22);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    ctx.fillText(BRAND_PILLARS, W / 2, footY + 82);

    ctx.font      = F.italic(26);
    ctx.fillStyle = C.cream;
    ctx.fillText(BRAND_TAGLINE, W / 2, footY + 118);

    /* bottom gold border */
    ctx.fillStyle = _goldGrad(ctx, H - 8, 8);
    ctx.fillRect(0, H - 8, W, 8);
  }

  /* ═══════════════════════════════════════════════════════════════
     SQUARE LAYOUT — IG Feed (1080×1080)
  ═══════════════════════════════════════════════════════════════ */
  async function _square(ctx, W, H, headline, caption, logoImg, products, prodImgs) {

    _bg(ctx, W, H);

    /* top gold border */
    ctx.fillStyle = _goldGrad(ctx, 0, 6);
    ctx.fillRect(0, 0, W, 6);

    /* DS logo */
    _logo(ctx, logoImg, W / 2, 140, 150);

    /* script name */
    ctx.save();
    ctx.font        = F.script(46);
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(200,168,75,0.65)';
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = _goldGrad(ctx, 227, 52);
    ctx.fillText('Dripping Secrets', W / 2, 279);
    ctx.restore();

    _sep(ctx, W / 2, 300, 320);

    /* headline */
    const defaultLines = _pickHeadline();
    const hlLines = headline
      ? headline.split(/\n/).map(s => s.trim()).filter(Boolean)
      : defaultLines;

    const hlSizes = [90, 76, 60];
    let   hlY     = 345;

    hlLines.slice(0, 3).forEach((line, i) => {
      const sz = hlSizes[i] || 54;
      ctx.save();
      ctx.font        = F.hl(sz);
      ctx.textAlign   = 'center';
      ctx.shadowColor = i % 2 === 0 ? 'rgba(200,168,75,0.9)' : 'rgba(140,50,255,0.9)';
      ctx.shadowBlur  = 22;
      ctx.fillStyle   = i % 2 === 0
        ? _goldGrad(ctx,   hlY - sz, sz * 1.2)
        : _purpleGrad(ctx, hlY - sz, sz * 1.2);
      ctx.fillText(line, W / 2, hlY);
      ctx.restore();
      hlY += sz + 8;
    });

    /* caption */
    if (caption) {
      ctx.font      = F.reg(30);
      ctx.textAlign = 'center';
      ctx.fillStyle = C.cream;
      _wrap(ctx, caption, W - 120).slice(0, 2).forEach((l, j) => {
        ctx.fillText(l, W / 2, hlY + 22 + j * 42);
      });
      hlY += 106;
    } else {
      hlY += 18;
    }

    /* product cards — 3 across */
    const cW    = 325;
    const cH    = 298;
    const gap   = 14;
    const totW  = 3 * cW + 2 * gap;
    const startX = (W - totW) / 2;
    const cardY  = Math.max(hlY + 16, 560);

    products.slice(0, 3).forEach((p, i) => {
      _card(
        ctx, startX + i * (cW + gap), cardY, cW, cH,
        prodImgs[i], p.name || 'Featured', p.salePrice || p.price || 29.99
      );
    });

    /* DRIP10 badge */
    const badgeTop = cardY + cH + 14;
    _drip10(ctx, W / 2, badgeTop + 55, 580, 104);

    /* URL */
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.75)';
    ctx.shadowBlur  = 14;
    ctx.font        = F.bold(30);
    ctx.textAlign   = 'center';
    ctx.fillStyle   = _goldGrad(ctx, badgeTop + 178, 34);
    ctx.fillText(SITE_URL, W / 2, badgeTop + 194);
    ctx.restore();

    /* social handles — compact 4-col */
    const socialY = badgeTop + 230;
    _socialRow(ctx, W / 2, socialY, W - 80, 24, 16);

    /* brand pillars footer */
    ctx.font      = F.reg(18);
    ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    ctx.fillText(BRAND_PILLARS, W / 2, socialY + 68);

    /* bottom gold border */
    ctx.fillStyle = _goldGrad(ctx, H - 6, 6);
    ctx.fillRect(0, H - 6, W, 6);
  }

  /* ═══════════════════════════════════════════════════════════════
     WIDE LAYOUT — Twitter & FB Post  (v4.0 — editorial bleed)
     Philosophy: Product image bleeds full-height on the right,
     softly fading into the dark background with a gradient mask.
     Type gets the left 55% with generous breathing room.
     No hard card borders. No crowded splits. Room to breathe.
  ═══════════════════════════════════════════════════════════════ */
  async function _wide(ctx, W, H, headline, caption, logoImg, products, prodImgs) {

    /* ── Full-canvas luxury background ── */
    _bg(ctx, W, H);

    /* ── Gold top + bottom accent bars ── */
    ctx.fillStyle = _goldGrad(ctx, 0, 5);   ctx.fillRect(0, 0, W, 5);
    ctx.fillStyle = _goldGrad(ctx, H - 5, 5); ctx.fillRect(0, H - 5, W, 5);

    /* ─────────────────────────────────────────────────────────
       PRODUCT IMAGE — Right 50%, blended into bg with gradient
    ───────────────────────────────────────────────────────────── */
    if (prodImgs[0]) {
      const imgX    = Math.round(W * 0.44); // start at 44% of width
      const imgW    = W - imgX;
      const imgH    = H;

      /* draw image cropped to right zone */
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, 0, imgW, imgH);
      ctx.clip();

      const img = prodImgs[0];
      const iAR = img.width / img.height;
      const zAR = imgW / imgH;
      let sx, sy, sw, sh;
      if (iAR > zAR) { sh = img.height; sw = sh * zAR; sx = (img.width - sw) / 2; sy = 0; }
      else            { sw = img.width;  sh = sw / zAR; sx = 0; sy = (img.height - sh) / 2; }
      ctx.globalAlpha = 0.88;
      ctx.drawImage(img, sx, sy, sw, sh, imgX, 0, imgW, imgH);
      ctx.globalAlpha = 1;
      ctx.restore();

      /* left-edge gradient fade: bg color → transparent, so image blends smoothly */
      const fadeW = Math.round(W * 0.26);
      const fade  = ctx.createLinearGradient(imgX, 0, imgX + fadeW, 0);
      /* pull BG color from _bg — it starts very dark purple/black */
      fade.addColorStop(0, 'rgba(8,2,20,1)');
      fade.addColorStop(0.55, 'rgba(8,2,20,0.55)');
      fade.addColorStop(1, 'rgba(8,2,20,0)');
      ctx.fillStyle = fade;
      ctx.fillRect(imgX, 0, fadeW, H);

      /* right-edge vignette */
      const rv = ctx.createLinearGradient(W - Math.round(W * 0.07), 0, W, 0);
      rv.addColorStop(0, 'rgba(8,2,20,0)');
      rv.addColorStop(1, 'rgba(8,2,20,0.72)');
      ctx.fillStyle = rv;
      ctx.fillRect(W - Math.round(W * 0.07), 0, Math.round(W * 0.07), H);

      /* price ribbon — bottom-right, elegant */
      const p       = products[0];
      const pprice  = parseFloat(p?.salePrice || p?.price || 0).toFixed(2);
      if (pprice > 0) {
        const ribH  = Math.round(H * 0.085);
        const ribW  = Math.round(W * 0.18);
        const ribX  = W - ribW - 18;
        const ribY  = H - ribH - 18;
        _rr(ctx, ribX, ribY, ribW, ribH, ribH / 2);
        const rg = ctx.createLinearGradient(ribX, ribY, ribX + ribW, ribY + ribH);
        rg.addColorStop(0, '#D4AA40'); rg.addColorStop(1, '#A07020');
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.font      = F.bold(Math.max(16, ribH * 0.5));
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1a0a2e';
        ctx.fillText('$' + pprice, ribX + ribW / 2, ribY + ribH * 0.72);
      }
    }

    /* ─────────────────────────────────────────────────────────
       SPARKLES — scattered across canvas, favour left side
    ───────────────────────────────────────────────────────────── */
    const rs = _rng(H * 5);
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const sx2 = rs() * W * 0.65;
      const sy2 = rs() * H;
      const sr  = 1.5 + rs() * 6;
      ctx.globalAlpha = 0.12 + rs() * 0.3;
      _sparkle(ctx, sx2, sy2, sr, rs() > 0.5 ? C.goldLt : '#DDB0FF');
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    /* ─────────────────────────────────────────────────────────
       LEFT TEXT ZONE — generous padding, no crowding
       Vertical rhythm:
         tPad          → logo (height ~logoSz)
         logoSz + gap  → separator
         sep + gap     → headline block (auto-sized, 2 lines max)
         hl + gap      → caption (1 line)
         below cap     → tagline italic
         pinned bottom → DRIP10 badge
         very bottom   → URL · phone
    ───────────────────────────────────────────────────────────── */
    const tPad   = Math.round(W * 0.034);  // left/right pad for text
    const textW  = Math.round(W * 0.51);   // text column width
    const availW = textW - tPad;

    /* ── Logo top-left ── */
    const logoSz = Math.round(H * 0.15);
    _logo(ctx, logoImg, tPad + logoSz / 2, Math.round(H * 0.085), logoSz);

    /* ── Separator ── */
    const sepY = Math.round(H * 0.085) + logoSz / 2 + 18;
    _sep(ctx, tPad + availW / 2, sepY, availW * 0.72);

    /* ── Headline (2 lines max, large as possible) ── */
    const defaultLines = _pickHeadline();
    const hlLines = headline
      ? headline.split(/\n/).map(s => s.trim()).filter(Boolean)
      : defaultLines;

    /* available vertical space for headline: from sepY+gap to 62% of H */
    const hlTop     = sepY + 22;
    const hlBotLimit = H * 0.62;
    const hlSlots   = Math.min(hlLines.length, 2);
    const hlSlotH   = (hlBotLimit - hlTop) / (hlSlots + 0.4);
    const maxHlSz   = Math.min(hlSlotH * 0.84, H * 0.16);
    const minHlSz   = H * 0.048;
    let   hlY       = hlTop;

    hlLines.slice(0, 2).forEach((line, i) => {
      let sz = maxHlSz;
      ctx.font = F.hl(sz);
      while (ctx.measureText(line).width > availW && sz > minHlSz) {
        sz -= 1.5;
        ctx.font = F.hl(sz);
      }
      ctx.save();
      ctx.textAlign   = 'left';
      ctx.shadowColor = i % 2 === 0 ? 'rgba(200,168,75,0.95)' : 'rgba(160,80,255,0.9)';
      ctx.shadowBlur  = 28;
      ctx.fillStyle   = i % 2 === 0
        ? _goldGrad(ctx,   hlY - sz, sz * 1.2)
        : _purpleGrad(ctx, hlY - sz, sz * 1.2);
      ctx.fillText(line, tPad, hlY);
      ctx.restore();
      hlY += sz * 1.12;
    });

    /* ── Caption (1 line only, keeps breathing room) ── */
    hlY += 14;
    if (caption) {
      ctx.font      = F.reg(H * 0.038);
      ctx.textAlign = 'left';
      ctx.fillStyle = C.cream;
      const capLine = _wrap(ctx, caption, availW)[0] || caption;
      ctx.fillText(capLine, tPad, hlY);
      hlY += H * 0.055;
    }

    /* ── Tagline italic ── */
    ctx.font      = F.italic(H * 0.028);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(242,228,192,0.45)';
    ctx.fillText(BRAND_TAGLINE, tPad, hlY + 10);

    /* ── DRIP10 badge — anchored at 78% height ── */
    const badgeW  = Math.min(availW * 0.88, 400);
    const badgeHt = Math.round(H * 0.19);
    const badgeCY = H * 0.825;
    _drip10(ctx, tPad + badgeW / 2, badgeCY, badgeW, badgeHt);

    /* ── Bottom row: URL · phone ── */
    const urlSz = H * 0.036;
    ctx.font        = F.bold(urlSz);
    ctx.textAlign   = 'left';
    ctx.save();
    ctx.shadowColor = 'rgba(200,168,75,0.65)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = _goldGrad(ctx, H - urlSz * 2, urlSz * 1.1);
    ctx.fillText(SITE_URL, tPad, H - 20);
    ctx.restore();
    ctx.font = F.bold(urlSz);
    const urlW = ctx.measureText(SITE_URL).width;
    ctx.font      = F.reg(H * 0.029);
    ctx.fillStyle = C.muted;
    ctx.fillText('  ·  ' + PHONE, tPad + urlW, H - 20);
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER CORE
  ═══════════════════════════════════════════════════════════════ */
  async function _render(canvasEl, platform, headline, caption) {
    await _ensureFonts();

    const cfg = SIZES[platform] || SIZES['ig-feed'];
    const { w: W, h: H, layout } = cfg;
    canvasEl.width  = W;
    canvasEl.height = H;
    const ctx       = canvasEl.getContext('2d');

    const products = _safeProducts(3);
    const logoSrc  = 'images/logo.png';

    const [logoImg, ...prodImgs] = await Promise.all([
      _loadImg(logoSrc),
      ...products.map(p => _loadImg(_imgPath(p))),
    ]);

    const hl  = (headline || '').trim();
    const cap = (caption  || '').trim();

    if      (layout === 'tall')   await _tall  (ctx, W, H, hl, cap, logoImg, products, prodImgs);
    else if (layout === 'square') await _square(ctx, W, H, hl, cap, logoImg, products, prodImgs);
    else                          await _wide  (ctx, W, H, hl, cap, logoImg, products, prodImgs);
  }

  /* ─────────────────────────────────────────────────────────────
     Public API
  ───────────────────────────────────────────────────────────── */
  async function draw(platform, headline, caption) {
    const canvas = document.createElement('canvas');
    await _render(canvas, platform, headline, caption);
    return canvas.toDataURL('image/png');
  }

  async function drawToCanvas(canvasEl, platform, headline, caption) {
    await _render(canvasEl, platform, headline, caption);
  }

  return { draw, drawToCanvas };

})();
