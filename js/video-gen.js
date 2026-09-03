/**
 * DimiVideoGen — Premium TikTok promo video generator v2
 * Canvas + MediaRecorder API · No external dependencies
 * 9:16 vertical · 24s · Deep Plum / Rose Gold brand kit
 * NEW: AI Hero image support · Ken Burns · Glitch transitions · Particle effects · Animated text entrance
 */
const DimiVideoGen = (() => {
  const W = 1080, H = 1920;
  const PLUM      = '#4B1F5F';
  const PLUM_DARK = '#1E0830';
  const PLUM_MID  = '#2D1145';
  const ROSE      = '#B76E79';
  const WHITE     = '#FFFFFF';
  const CREAM     = '#F5E6F0';
  const BLACK     = '#0D0D0D';

  /* ── helpers ─────────────────────────────────────────────── */
  function _load(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => res(img); img.onerror = () => res(null);
      img.src = src;
    });
  }

  function _ease(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t; }
  function _clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
  function _enter(t, dur){ return _ease(_clamp(t/dur,0,1)); }
  function _fadeOut(t, start, dur){ return 1 - _ease(_clamp((t-start)/dur,0,1)); }

  function _grad(ctx, x1,y1,x2,y2, stops){
    const g = ctx.createLinearGradient(x1,y1,x2,y2);
    stops.forEach(([off,col]) => g.addColorStop(off,col));
    return g;
  }

  function _radGrad(ctx, cx,cy,r0,r1, stops){
    const g = ctx.createRadialGradient(cx,cy,r0,cx,cy,r1);
    stops.forEach(([off,col]) => g.addColorStop(off,col));
    return g;
  }

  function _roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  function _wrapLines(ctx, text, maxW){
    const words = String(text).split(' ');
    const lines = []; let line = '';
    for (const w of words){
      const test = line ? line+' '+w : w;
      if (ctx.measureText(test).width > maxW && line){ lines.push(line); line=w; }
      else line=test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function _drawText(ctx, text, x, y, maxW, lineH, opts={}){
    const { align='center', fill=WHITE, shadow=false } = opts;
    ctx.textAlign = align; ctx.fillStyle = fill;
    if (shadow){ ctx.shadowColor='rgba(0,0,0,.7)'; ctx.shadowBlur=24; }
    const lines = _wrapLines(ctx, text, maxW);
    const tot = lines.length * lineH;
    lines.forEach((l,i) => ctx.fillText(l, x, y - tot/2 + i*lineH + lineH*.7));
    ctx.shadowBlur = 0;
    return lines.length;
  }

  /* ── Particle system ─────────────────────────────────────── */
  let _particles = [];
  function _initParticles(n=28){
    _particles = Array.from({length:n}, (_,i) => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*1.8, vy: -1.2-Math.random()*2.5,
      size: 4+Math.random()*10, alpha: .2+Math.random()*.5,
      hue: Math.random()<.6 ? ROSE : CREAM, phase: Math.random()*Math.PI*2
    }));
  }
  function _drawParticles(ctx, t){
    _particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -20) { p.y = H+20; p.x = Math.random()*W; }
      if (p.x < -20) p.x = W+20;
      if (p.x > W+20) p.x = -20;
      ctx.save();
      ctx.globalAlpha = p.alpha * (.6 + .4*Math.sin(t*2.5+p.phase));
      ctx.fillStyle = p.hue;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size*(.8+.2*Math.sin(t*3+p.phase)), 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Glitch effect ───────────────────────────────────────── */
  function _glitch(ctx, t, strength=6){
    const glitchOn = Math.sin(t*17)*Math.cos(t*31) > 0.82;
    if (!glitchOn) return;
    ctx.save();
    const sliceH = 60+Math.random()*80;
    const sliceY = Math.random()*H;
    const shift  = (Math.random()-.5)*strength*2;
    const imgData = ctx.getImageData(0, sliceY, W, sliceH);
    ctx.putImageData(imgData, shift, sliceY);
    // RGB channel split
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(shift-strength, sliceY, W, sliceH);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(shift+strength, sliceY, W, sliceH);
    ctx.restore();
  }

  /* ── Scanlines overlay ───────────────────────────────────── */
  function _scanlines(ctx, alpha=0.04){
    ctx.save(); ctx.globalAlpha = alpha;
    for (let y=0; y<H; y+=4){ ctx.fillStyle='#000'; ctx.fillRect(0,y,W,2); }
    ctx.restore();
  }

  /* ── Ken Burns (zoom+pan) ────────────────────────────────── */
  function _drawKenBurns(ctx, img, t, duration, dirX=1, dirY=0){
    if (!img) return;
    const maxZoom = 1.12;
    const zoom = 1 + (maxZoom-1) * (t/duration);
    const dw = W*zoom, dh = H*zoom;
    const ox = -(dw-W)/2 + dirX*(dw-W)*.3*(t/duration);
    const oy = -(dh-H)/2 + dirY*(dh-H)*.3*(t/duration);
    ctx.drawImage(img, ox, oy, dw, dh);
  }

  /* ── Animated text banner ────────────────────────────────── */
  function _animBanner(ctx, text, y, t, delay=0, color=ROSE){
    const a = _enter(Math.max(0,t-delay), 0.45);
    if (a <= 0) return;
    const slideX = (1-a)*140;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(slideX, 0);
    // pill bg
    ctx.font = 'bold 72px Arial'; ctx.textAlign = 'center';
    const tw = ctx.measureText(text).width;
    const pH=100, pW=tw+120, pX=W/2-pW/2, pY=y-pH*.7;
    _roundRect(ctx,pX,pY,pW,pH,50);
    ctx.fillStyle = color; ctx.fill();
    // text
    ctx.fillStyle = WHITE;
    ctx.fillText(text, W/2, y);
    ctx.restore();
  }

  /* ── Chrome (bars + handle) ──────────────────────────────── */
  function _chrome(ctx, t=0){
    ctx.fillStyle = ROSE; ctx.fillRect(0,0,W,14);
    ctx.fillStyle = ROSE; ctx.fillRect(0,H-14,W,14);
    // animated rose gold shimmer on top bar
    const shimX = ((t*220)%W);
    const sg = ctx.createLinearGradient(shimX-120,0,shimX+120,0);
    sg.addColorStop(0,'rgba(255,255,255,0)'); sg.addColorStop(.5,'rgba(255,255,255,.35)'); sg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,14);
    // handle
    ctx.save(); ctx.globalAlpha=.5;
    ctx.font='bold 40px Arial'; ctx.textAlign='right'; ctx.fillStyle=ROSE;
    ctx.fillText('@DrippingSecrets', W-44, H-30);
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════════════
     SCENE 1 — Brand intro with particles (0–3.5s)
  ═══════════════════════════════════════════════════════════ */
  function _scene1(ctx, t, logoImg){
    ctx.fillStyle=_grad(ctx,0,0,W*.5,H,[[0,PLUM_DARK],[.5,PLUM_MID],[1,PLUM]]);
    ctx.fillRect(0,0,W,H);

    // Radial glow center
    ctx.fillStyle=_radGrad(ctx,W/2,H*.45,0,H*.6,[[0,'rgba(183,110,121,.28)'],[1,'rgba(183,110,121,0)']]);
    ctx.fillRect(0,0,W,H);

    // Orbiting dots
    ctx.save();
    for(let i=0;i<18;i++){
      const a=(i/18)*Math.PI*2+t*.5;
      const r=340+Math.sin(t*1.8+i)*60;
      ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*r, H/2+Math.sin(a)*r*.5, 7+Math.sin(t*3+i)*3, 0, Math.PI*2);
      ctx.fillStyle=ROSE; ctx.globalAlpha=.2+Math.sin(t*2.2+i)*.25; ctx.fill();
    }
    ctx.restore();

    _drawParticles(ctx, t);

    const a=_enter(t,1.2), scale=.72+a*.28;
    ctx.save(); ctx.globalAlpha=a; ctx.translate(W/2,H*.4); ctx.scale(scale,scale);
    if(logoImg){ const lw=580,lh=lw*(logoImg.height/logoImg.width); ctx.drawImage(logoImg,-lw/2,-lh/2,lw,lh); }
    else {
      ctx.font='bold 112px Arial'; ctx.textAlign='center';
      ctx.fillStyle=WHITE; ctx.shadowColor='rgba(0,0,0,.5)'; ctx.shadowBlur=24; ctx.fillText('DRIPPING',0,-40);
      ctx.fillStyle=ROSE; ctx.fillText('SECRETS',0,100);
    }
    ctx.restore();

    // Tagline
    const ta=_enter(Math.max(0,t-1.0),1.2);
    ctx.save(); ctx.globalAlpha=ta;
    ctx.font='italic 54px Georgia,serif'; ctx.textAlign='center'; ctx.fillStyle=CREAM;
    ctx.shadowColor='rgba(0,0,0,.5)'; ctx.shadowBlur=12;
    ctx.fillText('You deserve a secret this good.', W/2, H*.64);
    ctx.fillText('to help you keep her.', W/2, H*.68+58);
    ctx.restore();

    _scanlines(ctx);
    _chrome(ctx,t);
  }

  /* ══════════════════════════════════════════════════════════
     SCENE 1.5 — Glitch transition (3.0–3.8s)
  ═══════════════════════════════════════════════════════════ */
  function _sceneTransition(ctx, t){
    ctx.fillStyle=PLUM_DARK; ctx.fillRect(0,0,W,H);
    // Glitch bars
    const bars=8;
    for(let i=0;i<bars;i++){
      const by=Math.random()*H, bh=20+Math.random()*60;
      const shft=(Math.random()-.5)*120;
      ctx.fillStyle=i%2===0?ROSE:`rgba(75,31,95,.8)`;
      ctx.fillRect(shft,by,W,bh);
    }
    // White flash
    ctx.fillStyle=`rgba(255,255,255,${0.6-t*0.5})`;
    ctx.fillRect(0,0,W,H);
  }

  /* ══════════════════════════════════════════════════════════
     SCENE 2 — Hook text + animated entrance (3.8–9.5s)
  ═══════════════════════════════════════════════════════════ */
  function _scene2(ctx, t, hook, aiHeroImg){
    // If AI hero image is available, use it as background with Ken Burns
    if (aiHeroImg) {
      ctx.save();
      _drawKenBurns(ctx, aiHeroImg, t, 5.7, 1, 0.5);
      // Dark overlay for readability
      const ov=_grad(ctx,0,H*.3,0,H,[[0,'rgba(30,8,48,0)'],[.4,'rgba(30,8,48,.6)'],[1,'rgba(30,8,48,.95)']]);
      ctx.fillStyle=ov; ctx.fillRect(0,0,W,H);
      ctx.restore();
    } else {
      ctx.fillStyle=_grad(ctx,0,0,0,H,[[0,BLACK],[1,'#1A0820']]);
      ctx.fillRect(0,0,W,H);
      // Rose glow
      ctx.fillStyle=_radGrad(ctx,W/2,H*.42,0,800,[[0,'rgba(183,110,121,.24)'],[1,'rgba(183,110,121,0)']]);
      ctx.fillRect(0,0,W,H);
    }

    _drawParticles(ctx, t);

    // Hook slides in from right with overshoot
    const sl=_enter(t,.65);
    const ox=(1-sl)*420;
    ctx.save(); ctx.translate(ox,0);
    ctx.font='bold 96px Arial';
    const clean=hook.replace(/[\u{1F300}-\u{1FFFF}]/gu,'').replace(/[\u2600-\u27FF]/g,'').trim();
    ctx.shadowColor='rgba(0,0,0,.8)'; ctx.shadowBlur=30;
    _drawText(ctx, clean, W/2, H*.52, W-100, 118, {shadow:true});
    ctx.restore();

    // Animated underline bar
    const barA=_enter(Math.max(0,t-.4),.5);
    ctx.save(); ctx.globalAlpha=barA;
    const bw=600*barA, bx=(W-bw)/2;
    ctx.fillStyle=ROSE; ctx.fillRect(bx, H*.59, bw, 8);
    ctx.restore();

    // URL badge
    _animBanner(ctx, 'drippingsecrets.com', H*.74, t, 1.0, ROSE);

    // "Limited drops" hint
    const ha=_enter(Math.max(0,t-1.5),.6);
    ctx.save(); ctx.globalAlpha=ha*0.7;
    ctx.font='italic 50px Georgia,serif'; ctx.textAlign='center'; ctx.fillStyle=CREAM;
    ctx.fillText('"Same box twice? Not how we move."', W/2, H*.84);
    ctx.restore();

    _glitch(ctx, t, 8);
    _scanlines(ctx);
    _chrome(ctx,t);
  }

  /* ══════════════════════════════════════════════════════════
     SCENE 3 — Product spotlight with Ken Burns (9.5–17s)
  ═══════════════════════════════════════════════════════════ */
  function _scene3(ctx, t, productImg, aiHeroImg, product){
    const hero = aiHeroImg || productImg;
    ctx.fillStyle=_grad(ctx,0,0,W*.5,H,[[0,'#190825'],[.6,PLUM_MID],[1,PLUM]]);
    ctx.fillRect(0,0,W,H);

    const IS=W*.84, IX=(W-IS)/2, IY=H*.08;

    if(hero){
      ctx.save();
      _roundRect(ctx,IX,IY,IS,IS,72); ctx.clip();
      // Ken Burns on hero
      const zoom=1+_clamp(t/7,.0,.09);
      const dw=IS*zoom, dh=IS*zoom;
      ctx.drawImage(hero, IX-(dw-IS)/2, IY-(dh-IS)/2, dw, dh);
      ctx.restore();
      // Bottom gradient over image
      const ig=_grad(ctx,0,IY+IS*.5,0,IY+IS,[[0,'rgba(25,8,37,0)'],[1,'rgba(25,8,37,.98)']]);
      ctx.fillStyle=ig; ctx.fillRect(IX,IY,IS,IS);
      // Top rose glow
      ctx.fillStyle=_radGrad(ctx,W/2,IY,0,IS*.5,[[0,'rgba(183,110,121,.18)'],[1,'rgba(183,110,121,0)']]);
      ctx.fillRect(0,IY,W,IS*.5);
    } else {
      ctx.save();
      _roundRect(ctx,IX,IY,IS,IS,72); ctx.fillStyle='rgba(75,31,95,.5)'; ctx.fill();
      ctx.font='200px Arial'; ctx.textAlign='center'; ctx.fillText('🌹',W/2,IY+IS*.6);
      ctx.restore();
    }

    _drawParticles(ctx, t);

    // AI hero badge
    if (aiHeroImg) {
      const ba=_enter(t,.5);
      ctx.save(); ctx.globalAlpha=ba*.85;
      _roundRect(ctx,52,IY+20,280,56,28); ctx.fillStyle='rgba(183,110,121,.85)'; ctx.fill();
      ctx.font='bold 36px Arial'; ctx.textAlign='center'; ctx.fillStyle=WHITE;
      ctx.fillText('✨ AI Generated', 52+140, IY+56);
      ctx.restore();
    }

    const ba=_enter(t,.9);
    ctx.save(); ctx.globalAlpha=ba;

    // Product name (slide up)
    const nameY=H*.67+_clamp(1-ba,0,1)*100;
    ctx.font='bold 74px Arial'; ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,.7)'; ctx.shadowBlur=24;
    _drawText(ctx,(product.name||'Featured Product').substring(0,36), W/2, nameY, W-160, 88, {shadow:true});

    // Price badge
    const px=product.salePrice||product.price||39.99;
    const bw=340,bh=106,bx=W/2-bw/2,by=H*.74;
    _roundRect(ctx,bx,by,bw,bh,53); ctx.fillStyle=ROSE; ctx.fill();
    ctx.font='bold 78px Arial'; ctx.textAlign='center'; ctx.fillStyle=WHITE; ctx.shadowBlur=0;
    ctx.fillText(`$${Number(px).toFixed(2)}`, W/2, by+78);

    // Compare price if physical
    if(product.comparePrice && product.id>=1 && product.id<=13){
      ctx.font='52px Arial'; ctx.fillStyle=CREAM; ctx.globalAlpha=ba*.7;
      ctx.fillText(`Was $${Number(product.comparePrice).toFixed(2)}`, W/2, by+150);
      ctx.globalAlpha=ba;
    }

    // CTA button
    const cw=640,ch=118,cx=W/2-cw/2,cy=H*.85;
    _roundRect(ctx,cx,cy,cw,ch,59); ctx.fillStyle=WHITE; ctx.fill();
    ctx.font='bold 66px Arial'; ctx.textAlign='center'; ctx.fillStyle=PLUM;
    ctx.fillText('Shop Now →', W/2, cy+82);

    ctx.restore();
    _glitch(ctx, t, 5);
    _scanlines(ctx);
    _chrome(ctx,t);
  }

  /* ══════════════════════════════════════════════════════════
     SCENE 3.5 — Glitch transition (16.8–17.5s)
  ═══════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════
     SCENE 4 — Outro (17.5–24s)
  ═══════════════════════════════════════════════════════════ */
  function _scene4(ctx, t, caption){
    ctx.fillStyle=_grad(ctx,0,0,W*.4,H,[[0,PLUM],[.7,PLUM_MID],[1,PLUM_DARK]]);
    ctx.fillRect(0,0,W,H);

    // Pulsing rings
    ctx.save();
    for(let i=0;i<5;i++){
      const r=(150+i*190+(t*38))%950;
      ctx.beginPath(); ctx.arc(W/2,H*.36,r,0,Math.PI*2);
      ctx.strokeStyle=ROSE; ctx.globalAlpha=.06-i*.01; ctx.lineWidth=6; ctx.stroke();
    }
    ctx.restore();

    _drawParticles(ctx,t);

    const a=_enter(t,.9);
    ctx.save(); ctx.globalAlpha=a;

    // DS wordmark
    ctx.font='bold 98px Arial'; ctx.textAlign='center';
    ctx.fillStyle=WHITE; ctx.shadowColor='rgba(0,0,0,.5)'; ctx.shadowBlur=24;
    ctx.fillText('DRIPPING SECRETS', W/2, H*.14);
    ctx.font='italic 52px Georgia,serif'; ctx.fillStyle=ROSE; ctx.shadowBlur=0;
    ctx.fillText('"Same box twice? Not how we move."', W/2, H*.21);

    // Caption (animated text, strip hashtags)
    const clean=(caption||'').replace(/#\w+/g,'').replace(/\s{2,}/g,' ').trim().substring(0,160);
    ctx.font='54px Arial'; ctx.fillStyle=CREAM;
    _drawText(ctx, clean, W/2, H*.44, W-200, 80, {shadow:true});

    // URL pill
    const uw=720,uh=108,ux=W/2-uw/2,uy=H*.68;
    _roundRect(ctx,ux,uy,uw,uh,54); ctx.fillStyle=ROSE; ctx.fill();
    ctx.font='bold 60px Arial'; ctx.textAlign='center'; ctx.fillStyle=WHITE;
    ctx.fillText('drippingsecrets.com', W/2, uy+76);

    // Link in bio
    ctx.font='52px Arial'; ctx.fillStyle=CREAM;
    ctx.fillText('Link in bio 🔗', W/2, H*.83);

    // Flash sale tag if still active
    const now=new Date(), sale=new Date('2026-06-21');
    if(now<sale){
      _animBanner(ctx,'🔥 30% OFF SITEWIDE',H*.9,t,0.6,'#c0392b');
    }

    ctx.restore();
    _scanlines(ctx, .06);
    _chrome(ctx,t);
  }

  /* ── Master render ───────────────────────────────────────── */
  function _renderAt(ctx, t, assets){
    const { logoImg, productImg, aiHeroImg, product, hook, caption } = assets;
    ctx.clearRect(0,0,W,H);
    if      (t < 3.0)  _scene1(ctx, t, logoImg);
    else if (t < 3.8)  _sceneTransition(ctx, t-3.0);
    else if (t < 9.5)  _scene2(ctx, t-3.8, hook, aiHeroImg);
    else if (t < 17.5) _scene3(ctx, t-9.5, productImg, aiHeroImg, product);
    else               _scene4(ctx, t-17.5, caption);
  }

  /* ── Public: generate(concept, onProgress, conceptIndex) ── */
  async function generate(concept, onProgress, conceptIndex){
    const cb = onProgress || (() => {});
    cb(5, 'Loading assets…');
    _initParticles(28);

    // Pick a physical product that isn't sold out
    const phys=((window.PRODUCTS||[]).filter(p => p.id>=1 && p.id<=13 && !p.soldOut && p.image));
    const product=phys[Math.floor(Math.random()*phys.length)] || { name:'Rose Toy', price:39.99, image:'images/placeholder.jpg' };

    const hook=concept.hooks[Math.floor(Math.random()*concept.hooks.length)];

    // Check for AI hero image (set by genTikTokAIHero)
    const aiHeroUrl = conceptIndex !== undefined ? window['_ttAiHero_'+conceptIndex] : null;

    const [productImg, logoImg, aiHeroImg] = await Promise.all([
      _load(product.image),
      _load('images/logo.png'),
      aiHeroUrl ? _load(aiHeroUrl) : Promise.resolve(null)
    ]);

    cb(12, 'Starting recorder…');

    const canvas=document.createElement('canvas');
    canvas.width=W; canvas.height=H;
    const ctx=canvas.getContext('2d');

    const assets={ logoImg, productImg, aiHeroImg, product, hook, caption: concept.caption };

    const MIMES=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'];
    const mimeType=MIMES.find(m => { try{ return MediaRecorder.isTypeSupported(m); }catch(e){ return false; } }) || 'video/webm';

    const stream=canvas.captureStream(30);
    const recorder=new MediaRecorder(stream,{ mimeType, videoBitsPerSecond:7000000 });
    const chunks=[];
    recorder.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };

    const TOTAL=24; // seconds

    return new Promise(resolve=>{
      recorder.onstop=()=>{
        const blob=new Blob(chunks,{type:mimeType});
        const url=URL.createObjectURL(blob);
        const ext=mimeType.includes('mp4')?'mp4':'webm';
        cb(100,'Done!');
        resolve({ url, blob, mimeType, ext, product, hook });
      };

      recorder.start(200);
      let startTime=null;

      function tick(ts){
        if(!startTime) startTime=ts;
        const t=(ts-startTime)/1000;
        if(t>=TOTAL){ setTimeout(()=>recorder.stop(),400); cb(99,'Wrapping up…'); return; }
        const pct=Math.floor((t/TOTAL)*85)+12;
        cb(pct,`Rendering… ${Math.floor((t/TOTAL)*100)}%`);
        _renderAt(ctx,t,assets);
        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  return { generate };
})();
