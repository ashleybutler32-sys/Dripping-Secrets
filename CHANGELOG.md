# Dripping Secrets — Changelog

## [v22.0] — Candidate Concierge + Careers Launch
**Date:** 2026-07-22
**Files changed:** `careers.html` (new), `js/jobs.js` (new), `admin.html`, `CHANGELOG.md`
**SW Cache:** `ds-v22.0`

### Added
- **`careers.html`** — Full luxury public-facing careers page at `drippingsecrets.com/careers`. Black/plum/gold cinematic design matching brand flyers. All 8 positions pre-loaded. Positions only appear when status is set to "Open" in Back Office. Application form submits directly to Firestore `candidates` collection.
- **`js/jobs.js`** — Central job data file. All 8 positions with full descriptions, responsibilities, qualifications, taglines, and categories. All default to `status: 'draft'` until activated.
- **Jobs Board panel** in Candidate Concierge tab — 8 position cards with Open / Draft / Close toggle buttons. Status saved to Firestore `jobs` collection. "View Careers Page" link to preview live.
- **Updated role dropdowns** — All 3 role dropdowns in Candidate Concierge (filter, add modal, edit modal) now use the real 8 job titles instead of placeholder roles.
- **`careers-assets/`** — All 7 job flyers + 55 strategy/posting/toolkit docs filed into site tree for reference.

### 8 Positions
Administrative & Customer Support Assistant · Administrative & Operations Coordinator · Content Creator & Social Media Coordinator · Customer Experience Specialist · Lifestyle Concierge · Order Fulfillment & Inventory Associate · Professional Social Companion · VIP Event Host & Brand Ambassador

### Activation
All positions start as **Draft**. To publish: Back Office → Candidate Concierge → Jobs Board → click **✓ Open** on any position. It will immediately appear on `careers.html`.

---

## [v21.0] — Expression Suite + Full Asset Library v2.0
**Date:** 2026-07-21
**SW Cache:** `ds-v21.0`

### Expression Suite — 117 Brand Assets Loaded
- Ingested the official **Dripping Secrets Expression Suite™** (Production Master, Phase 5 certified)
- **117 individual assets** extracted and organized into `images/expression-suite/`
- **20 Ashley stickers** — Neutral, Soft Smile, Big Smile, Laughing, Playful, Side Eye, Sassy, Confident, Boss Mode, Flirty, Thoughtful, Focused, Surprised, Excited, Unbothered, Skeptical, Over It, Amused, Determined, Loving It
- **20 Dimi stickers** — Welcome, One Moment, I've Got You, Allow Me, Happy to Help, My Pleasure, Working on It, Processing, Order Confirmed, Payment Received, Almost Ready, You're All Set, VIP Service, Thank You, Come Back Soon, How Can I Help, Noted, Let's Make It Amazing, Enjoy Your Order, We Appreciate You
- **25 Badges** — DS Approved, VIP Member, Best Seller, Luxury Pick, Editor's Pick, Top Rated, Exclusive, Limited Edition, Members Only, New Arrival, Just Dropped, Highly Recommended, Customer Favorite, Verified, Loved by Bosses, Quality Guaranteed, Premium Quality, 100% Authentic, Trusted Brand, Award Winning, Boss Choice, Drippin' Approved, Elite Status, Priority Access, Forever Favorite
- **40 Icons** — Primary Brand (DS Monogram, Crown, Dripping Lips, Diamond, Boss Necklace, Handcuffs, High Heel, Lipstick, Heart Gem, Signature Script), Lifestyle (Shop, Unboxing, VIP Access, Members Only, Exclusive, Pleasure, Confidence, Indulgence, Connection, Escape), Navigation & UI (Home, Store, Account, Favorites, Cart, Search, Menu, Play, Lock, Notifications), Decorative & Texture (Purple Glitter, Gold Foil, Black Leather, Satin Purple, Gold Chain, Smoke, Paint Drip, Splatter, Sparkle, Silk Fabric)
- **10 Full production sheets** — Ashley Expression, Dimi Expression & Concierge, Badge Collection, Brand Icon, Seasonal Mega, Typography Collection, Shopping & Product x2, Community & Business, Lifestyle
- **Asset manifest JSON** at `images/expression-suite/asset-manifest.json`

### Executive Asset Library — Complete Rebuild (v2.0)
- Rebuilt from the ground up to handle 117+ assets
- **Category filter pills** — All · Brand · Ashley · Dimi · Badges · Icons · Sheets · Social; live count per pill; active state highlighted
- **Live asset count bar** — shows filtered total with category label
- **Responsive grid** — `auto-fill minmax(155px,1fr)`; lazy-loaded thumbnails; hover zoom on images
- **Per-card actions** — ↓ Save (direct download) + View button (full-size preview modal)
- **Preview modal** — click thumbnail or View button; full-size image; download from modal; ✕ to close; backdrop click to dismiss
- **Search** — live filter by name and tags across all categories
- **Tab wired** — `switchTab('asset-library')` now calls `initAssetLibrary()`; manifest fetched once and cached in memory
- **Fallback** — graceful fallback to static assets if manifest fetch fails

### Technical
- `admin.html` — Asset Library tab HTML rebuilt; Asset Library JS block replaced with v2.0 engine; `switchTab` wired to `initAssetLibrary`
- `images/expression-suite/` — 6 subfolders (ashley, dimi, badges, icons, sheets, brand) + asset-manifest.json
- SW cache bumped to `ds-v21.0`

## [v20.0] — Executive Office Presence + Asset Library
**Date:** 2026-07-21
**SW Cache:** `ds-v20.0`

### Dimi Executive Presence (Dashboard)
- Persistent Dimi panel added to the top of the Back Office Dashboard — above all stats
- **Auto-briefing:** Fires automatically on every login; gathers live Firestore stats (pending orders, revenue, low stock, open tickets) and delivers a concise executive briefing before Ashley touches a button
- **Briefing is live business-aware:** uses `dimi-chat` admin mode with injected context (pending orders, revenue, low stock, etc.); graceful fallback if no data yet
- **Refresh button (↺):** Re-pulls a fresh briefing on demand at any time
- **Quick chips:** Summarize Today · Asset Library · Prepare a Report · Social Engine · Full Office →; navigation chips route directly without waiting for AI
- **Command input:** Full delegatable command line — type anything; smart navigation shortcuts route to the right tab instantly; full AI responses for everything else
- **Design:** luxury dark gradient panel, plum/gold palette, Dimi avatar (dimi-ai-research.jpeg), does NOT change any existing Back Office layout

### Executive Asset Library (New Tab)
- New nav item + full tab: **Asset Library** (appears after Social Engine in sidebar)
- **Organized sections:** Logos & Brand Marks · Approved Social Content · Growing the Library (placeholder cards for Sticker Library, Photography, Video, Product Assets, Packaging, Templates)
- **Asset cards:** thumbnail preview, name, description, download button
- **Search:** live filter across all assets by name, description, and tags
- **Current assets loaded:** 8 brand marks (official logo, v1/v2/v3, academy seal, official poster, v1/v2 posters) + 2 approved social content items (Wellness Wednesday IG/FB + TikTok)
- Quick action shortcut from Dashboard quick-actions row

### Technical
- Asset images copied to `images/logos/` and `images/social/` in site tree
- SW cache bumped to `ds-v20.0`
- Page title bug fixed: `content-studio` tab now shows "Social Engine" (not internal ID)
- `admin.html` updated: nav, dashboard, tabTitles, switchTab, initAdmin, JS engine block

## [v19.0] — Social Engine v2.0 + Dimi Architectural Directive
**Date:** 2026-07-21
**SW Cache:** `ds-v19.0`

### Social Engine v2.0 (Full Rebuild — DS-CONTENT-001)
- Complete replacement of Content Studio with Social Engine AI Content Department
- **Weekly Themed Calendar:** Mon=Luxury Monday, Tue=Treat Yourself, Wed=Wellness Wednesday, Thu=Desire Thursday, Fri=Freaky Friday, Sat=Sensual Saturday, Sun=Self-Care Sunday — calendar strip visible at all times
- **Product Awareness:** Social Engine reads live product catalog; Dimi selects daily featured product based on theme; featured product displayed in Dimi's brief panel
- **Three-Panel Layout:** Dimi Creative Director (left) · Content Studio (center) · Approval Queue (right)
- **Dimi Creative Director Panel:** Proactive theme brief, featured product spotlight, 4 daily content recommendations, in-panel chat
- **Approval Queue Panel:** Daily content queue per platform with Approve / Reject / Reschedule; platform connection status; scheduled post times (IG 7 PM, TK 8 PM, FB 6 PM, X 12 PM, PIN 8 PM, YT 3 PM)
- **Platform Connections:** OAuth scaffold for all 6 platforms; "Connect" button → guided token entry; auto-post when connected; graceful manual fallback when not
- **Content Generation:** Routes through `dimi-chat.js` (OpenAI) in `content_studio` mode returning JSON: caption, hashtags, image_prompt, content_suggestion, post_time_recommendation
- **Generate Full Day Queue:** One-click builds IG + TK + FB queue with theme-aware content
- **Approve All:** One-click approves entire day's queue
- **Asset Library:** Preserved; cards include theme tag, status, platform dots, slide-in detail panel

### Dimi Architectural Directive (Independence)
- Dimi is now a platform-level AI service, independent of any single execution provider
- Chat and conversation: routes through `/.netlify/functions/dimi-chat` (Netlify → OpenAI); keyword fallback always available
- Generation tasks (image/video): interchangeable execution providers via `DimiProviders` registry in `content-studio.js`
- `DimiProviders.checkHealth()` pings provider before generation; graceful fallback if unavailable
- Tasklet = one interchangeable provider; platform remains fully operational if Tasklet is down
- `window.ContentStudio = SocialEngine` backward compat alias preserved

### dimi-chat.js Overhaul
- Added `content_studio` mode with JSON response format (OpenAI `response_format: json_object`)
- Added `CONTENT_STUDIO_SYSTEM_PROMPT` — luxury brand intelligence, quality gate, weekly theme calendar
- **Retired phrase scrubbed from all system prompts** (x2): "Curated by a Secret Keeper to help you keep her." → "You deserve a secret this good."
- Updated ADMIN_SYSTEM_PROMPT: 1on1Wholesale replaces all old suppliers; Venmo removed from payments; correct email (management@drippingsecrets.com / orders@drippingsecrets.com); removed expired flash sale; removed old supplier fulfillment (STD/CJ/Dear Lover/TopDawg); updated founder name Ashley Butler
- Updated CUSTOMER_SYSTEM_PROMPT: correct tagline, payment methods (no Venmo), correct contact email, updated shipping (7–10 biz days)

### New Netlify Function
- `social-publish.js` — Auto-publish scaffold for all 6 platforms (Instagram Graph API, Facebook Graph API, TikTok Content Posting API, X API v2, Pinterest API v5); activates when OAuth tokens connected; graceful manual fallback on any failure

### Other
- `dimi.js` header updated with Architectural Directive notation
- SW cache bumped: `ds-v18.3a` → `ds-v19.0`
- Nav item renamed: "Content Studio" → "Social Engine"

## [v18.3] — 1on1Wholesale Live Stock Sync
**Date:** 2026-07-14
**SW Cache:** `ds-v18.3`

### New
- `netlify/functions/sync-1on1-stock.js` — Netlify Function that fetches the 1on1Wholesale stock CSV feed and writes live `inStock` / `stockLevel` to Firestore for all 106 Luxury Play products
- `netlify/functions/1on1-sku-map.json` — generated SKU → DS product ID map (80 unique 1on1 SKUs → 106 DS products, 21 SKUs with color/style variants)
- Back Office Fulfillment Hub — "Luxury Play Stock Sync" panel with live stats and manual "Sync Now" button
- `products.js` — `sku` field injected into all 106 luxury_play products (extracted from image filenames)

### Requires (Netlify env var)
- `ONEONE_STOCK_FEED_URL` — right-click "View stock feed (CSV)" in your 1on1Wholesale portal → Copy Link → paste as Netlify env var

### Notes
- GET `/sync-1on1-stock` → returns last sync result from Firestore
- POST `/sync-1on1-stock` → runs full sync immediately
- 1on1 API key (for order status feed) saved separately — not yet wired; see queue item

---

## [v18.2] — DS-DOS Firebase Backend (Formal Scoping Sprint)
**Date:** 2026-07-14
**SW Cache:** `ds-v18.2`

### DS-DOS Firebase Backend
- **Firebase Admin SDK** — `firebase-admin-helper.js` shared module added to Netlify Functions
  - Initialized from `FIREBASE_SERVICE_ACCOUNT` Netlify env var (secret JSON string)
  - Exports: `getAdminDb()`, `updateOrderStatus(orderId, data)`, `appendRoutingLog(entry)`
  - Warm-instance safe (guards against re-initialization)
- **`netlify/functions/package.json`** — added; declares `firebase-admin ^12.0.0` dependency

### Order Status Lifecycle (5 Stages — Now Server-Written)
- `pending_cashapp` — CashApp order placed, awaiting Ashley confirmation
- `payment_confirmed` — PayPal/Apple Pay captured server-side
- `routed_to_supplier` — Supplier routing email confirmed sent
- `routing_failed` — Routing attempt failed (alert sent to management)
- `ds_fulfilled` — DS-held inventory; no supplier routing needed
- **`capture-paypal-order.js`** updated: after successful PayPal capture, writes `payment_confirmed` + transactionId + payerEmail to Firestore `orders/{orderNum}` via Admin SDK
- **`cart.js`** updated: now passes `orderNum` to capture function so server can identify the Firestore document
- **`route-supplier-order.js`** updated: after email sent, writes `routed_to_supplier` to Firestore; on failure writes `routing_failed`

### CashApp Queue → Firestore (No More localStorage Dependency)
- `loadCashAppQueue()` now queries Firestore `orders` collection with `.where('status', '==', 'pending_cashapp')` as primary source; localStorage fallback if Firestore unavailable
- `confirmCashAppOrder()` now reads order from Firestore, updates status via `fsUpdate()`, sends routing request
- `dismissCashAppOrder()` now updates Firestore `orders/{orderId}` directly

### Order Routing Log → Firestore
- `route-supplier-order.js` writes every routing event to `order_routing_log` Firestore collection (server-authoritative)
- `loadRoutingLog()` now reads from Firestore `order_routing_log` as primary source; merges with any local cache entries; localStorage fallback if Firestore unavailable

### Firestore Security Rules
- `firestore.rules` — 193-line production-ready security rules file added to project root
  - All 16 active Firestore collections covered with appropriate read/write rules
  - Deny-all catch-all for any undeclared collections
  - Admin SDK (Netlify Functions) bypasses all rules — full server-side access preserved
  - Guest checkout supported via anonymous auth create-only on `orders`

### Bug Fix
- **Rewards timestamp bug fixed** — `new Date().toISOString` (was saving function reference) corrected to `new Date().toISOString()` in loyalty points history array

---

## [v18.1] — Server-Side Payments, Supplier Auto-Routing, Academy Full KC Coverage
**Date:** 2026-07-14
**SW Cache:** `ds-v18.1`

### Payments — Server-Side Upgrade
- **PayPal server-side integration** — `create-paypal-order.js` + `capture-paypal-order.js` Netlify Functions
  - PayPal order creation now happens server-side; browser never touches secret key
  - Capture verified server-side before any order is finalized — eliminates client-side spoofing risk
  - PAYPAL_SECRET stored in Netlify environment variables only
- **CashApp Option B** — CashApp orders save as `pending_cashapp` (unchanged); Back Office Fulfillment Hub now shows a "CashApp Pending Payment Confirmation" queue; Ashley confirms payment → supplier routing fires
- Apple Pay continues to flow through PayPal SDK (now upgraded to server-side capture)

### Supplier Auto-Routing
- **`route-supplier-order.js`** Netlify Function — routes verified orders to supplier via Brevo transactional email
  - Formatted order email includes: customer address, itemized order, payment confirmation, mandatory discreet packing instructions
  - CC: management@drippingsecrets.com on every routed order
  - Supplier routing table configurable in one place (no code changes needed for supplier email updates)
  - Duplicate guard + failure alert system (auto-emails management if routing fails)
  - Unrouted orders (unknown supplier key) → alert fires to management
- **`cart.js` — `routeSupplierOrder()`** — fires automatically after confirmed PayPal/Apple Pay payment
  - Groups order items by supplier, routes each group separately
  - `luxury_play` → 1on1Wholesale; `cnv/myawd/wat` → respective suppliers; `cj` stays manual (portal required); `none/ds` → skipped
- **Back Office Fulfillment Hub — enhanced:**
  - CashApp Pending Payment Confirmation queue (orders visible, one-click Confirm & Route)
  - Auto-Routed Orders Log (PayPal/Apple Pay + CashApp confirmed orders)
  - Alert box updated to reflect new automated routing

### Back Office
- **Hero tagline wired in sidebar** — "Behind every secret is a boss who planned it." (APPROVED, gold italic, under "Back Office" branding)

### Academy — Full KC Coverage (COL-04 through COL-10)
- **~90 new Knowledge Checks added** across all remaining Learning Paths
  - COL-04 Customer Experience: 9 new KCs (C-016–C-020)
  - COL-05 Events & Hosting: 14 new KCs (C-021–C-025)
  - COL-06 Marketing & Content: 12 new KCs (C-027–C-030)
  - COL-07 Finance & Compliance: 12 new KCs (C-032–C-035)
  - COL-08 Technology & Platforms: 12 new KCs (C-037–C-040)
  - COL-09 Leadership & Culture: 12 new KCs (C-042–C-045)
  - COL-10 Product Knowledge: 15 new KCs (C-047–C-051)
- All 10 Learning Paths now have full KC coverage — Academy spec DSAPB-ACADEMY-003 fully satisfied on knowledge check dimension

**Files Changed:** `netlify/functions/create-paypal-order.js` (new), `netlify/functions/capture-paypal-order.js` (new), `netlify/functions/route-supplier-order.js` (new), `js/cart.js`, `admin.html`, `academy.html`, `sw.js`, `CHANGELOG.md`

**Netlify Env Vars Required:**
- `PAYPAL_SECRET` — PayPal Live Secret Key (already provided)
- `BREVO_API_KEY` — already required by brevo-sync.js (confirm it is set in Netlify)

---

## [v18.0] — Phase 5: Premium UX, Luxury Product Drawer, COL-03 Sprint
**Date:** 2026-07-09
**SW Cache:** `ds-v18.0`

### Academy — Phase 5 Upgrades
- **Dashboard widgets row** — personalized stats row above "Continue Learning": XP total, streak, badge count, and level tile; all real-time from Firestore progress data
- **Level-up overlay** — cinematic full-screen level celebration fires when an SK crosses an XP tier; includes level number, tier title (Foundation → Legendary), and auto-dismiss after 3s
- **Cert unlock overlay** — fires when a Learning Path cert is earned; gold confetti burst, cert name, "View Certificate" CTA, links directly to the Certs tab
- **Phase 5 engine** (`js/phase5.js`) wired into Academy; `css/phase5.css` loaded in Academy and storefront

### Academy — COL-03 Sprint (Operations & Fulfillment)
- **12 Knowledge Checks added** — All COL-03 lessons fully covered (was 3 of 15):
  - C-011: L-011-02 (Shipping Carriers), L-011-03 (Local Delivery)
  - C-012: L-012-02 (Document Studio), L-012-03 (Reporting)
  - C-013: L-013-01 (Firebase), L-013-02 (EmailJS), L-013-03 (PWA)
  - C-014: L-014-01 (Quality Standards), L-014-02 (Privacy), L-014-03 (Compliance docs)
  - C-015: L-015-02 (Scenario Practice), L-015-03 (Cert Exam threshold)
- Full Learning Paths 1–3 now have complete KC coverage

### Storefront — Luxury Product Drawer
- **Product modal → luxury side drawer** — right-sliding full-height panel replaces centered modal
  - Gallery with thumbnail strip (multi-image support)
  - Badge + tagline display, compare pricing with savings callout
  - Availability badge + low-stock warning (≤ 3 units)
  - Size selector grid with validation before add-to-cart
  - Qty stepper, Add to Cart, Wishlist toggle
  - Shipping note (7–10 days note auto-injects for Luxury Play)
  - "You May Also Like" related products row (same category, max 4)
  - Click-outside overlay closes drawer
- Legacy function names preserved: `openProductModal`, `closeProductModal`, `switchPmImage`, `pmQtyChange`, `selectPmSize`, `pmAddToCart` — all callers unaffected
- Pre-existing `WAT_PRODUCTS` array missing closing `];` fixed (caused JS syntax error in v17.9f)
- Pre-existing extra `,;` trailing syntax artifact cleaned

**Files Changed:** `academy.html`, `js/products.js`, `js/phase5.js` (new), `css/phase5.css` (new), `index.html`, `sw.js`, `CHANGELOG.md`

---

## [v17.9f] — Academy Auth Fix + COL-02 Sprint + Catalog Cleanup
**Date:** 2026-07-09
**SW Cache:** `ds-v17.9f`

### Critical Fixes
- **Academy login bypass restored** — `launchAcademy()` now sets `ds_acad_auth` in sessionStorage BEFORE navigating, making the bypass immune to Service Worker query-param stripping. Belt + suspenders approach: sessionStorage + `?auth=sk` URL param both work.
- **Dead code bug fixed** — `<script src="/js/academy-004.js">` had 3,821 chars of live functions (`updateHeroStats`, `acadScrollToContinue`, `acadScrollToPaths`, `heroQuickAsk`, `acadDimiSend`) trapped inside the tag as inline code — browsers silently ignore inline code inside `<script src="">` tags. Dimi chat panel was non-functional as a result. All 5 functions extracted to their own `<script>` block.

### Academy — Sprint 2 (COL-02: Commerce & Sales)
- **16 Knowledge Checks added** — All 16 COL-02 lessons now have KC questions (was 5 of 16 — only the first lesson per course was covered)
- COL-02 includes: Sales Fundamentals, Payment & Checkout Mastery, Upselling & Loyalty, Order Management, Supplier & Inventory Rules (C-006–C-010)

### Storefront — Catalog Cleanup
- **Nixed suppliers purged from live catalog** — DL_PRODUCTS (Dear Lover, 8,805 chars) and TOPDAWG_PRODUCTS (TopDawg, 56,294 chars) were both included in DROPSHIP_PRODUCTS → ALL_PRODUCTS and actively serving products on the live site. Both arrays cleared and removed from assembly.
- **30 new Luxury Play products added** — IDs 901–930; brands include Loving Joy, Svakom, LELO, Sky, Mina, ElectraStim, SilexD, Adrien Lastic, Nauti, Toosh. Luxury Play catalog: 86 → 114 unique products.

### Back Office
- **Fulfillment guide supplier cleanup** (carried forward from v17.9e) — How-to guide, fulfillment cards, product dropdown, and Today's Checklist updated to reflect active suppliers only.

**Files Changed:** `academy.html`, `js/products.js`, `admin.html`, `sw.js`, `CHANGELOG.md`

---

## [v17.9e] — Academy Experience Upgrade + Full Badge System
**Date:** 2026-07-09
**SW Cache:** ds-v17.9e (bumped)

### Academy — Progress Persistence Fix
- Progress now stored in localStorage with stable per-device ID (`ds_sk_stable_id`)
- Firestore sync uses stable ID (not anonymous Firebase UID which resets each session)
- Progress survives logout/login cycles

### Academy — Images & Logo Fixes
- Fixed broken cert panel icon paths — replaced emoji with branded SVG icons
- Replaced all emoji placeholders in cert panel with DS purple/gold SVG icons

### Academy — Zero Emoji Placeholders
- All remaining rose emoji (`&#127801;`, `🌹`) fully purged from academy.html
- Streak fire icon replaced with branded SVG flame
- Path card icons replaced with numbered branded badges
- Badge grid — all 2-letter abbreviation placeholders replaced with luxury shields

### Academy — Full DS Badge System (44 Badges)
- Replaced 12-badge placeholder set with full 44-badge official DS Academy Badge System
- Badge categories: Core Achievement, Skill & Subject, Special Recognition, Progress & Milestone, Streak, Points & Reward
- Four tiers: Foundation (bronze), Empowered (silver), Elite (gold), Legendary (purple/gold)
- Luxury shield design: gradient fill, tier color border, SVG icon per badge, tier glow on earned
- "My Badges" wall on Academy dashboard with category filter tabs (All / Core / Skill / Special / Levels / Streak / XP)
- Compact badge grid in right panel shows first 12 badges + earned count
- Tier-aware badge toast notifications on earning
- Tagline: "ACHIEVE. LEVEL UP. LEAD." — "YOU EARN IT. YOU WEAR IT. YOU INSPIRE."

### Academy — Dimi Live Chat (Right Panel)
- Full interactive Dimi chat panel in Academy right panel
- Connected to `/.netlify/functions/dimi-chat` with Academy instructor/tutor mode
- System context: Dimi presents as AI Instructor & Mentor for Dripping Secrets Academy
- Typing indicator, message history, enter-to-send

### Academy — Cinematic Hero Banner
- Full luxury hero banner: plum/gold palette, DS logo, brand wordmark
- Tagline: "Knowledge is power. Legacy is purpose."
- Hero stats (lessons/courses/paths) populated dynamically from progress
- Dimi quote area in hero

### Governing Specs Absorbed
- Dripping Secrets Academy.docx (LES-001)
- Dripping Secrets Academy - LES-001.docx
- Dripping Secrets Platform - Phase 5.docx
- DS Academy Badge System (Jul 9, 2026 image — all 44 badges locked)

## [v17.9d] — Brand Polish & Dimi Presence Fix
**Date:** 2026-07-09
**SW Cache:** ds-v17.9d (bumped)

### Visual & Brand
- Age gate completely redesigned: luxury dark plum/gold cinematic aesthetic, removed rainbow pride bar and all community badge labels (LGBTQ+/Kink/BDSM/ENM copy scrubbed), tagline "You deserve a secret this good." as headline, DS logo with gold glow, pill-shaped CTA buttons
- Nav header elevated to luxury standard: gold accent rule at bottom, gold glow underline on hover, logo gold drop-shadow, improved scrolled state with deeper glow, refined link typography
- Logo path normalized to `ds-circle-logo-official.png` in all three index.html references (nav, about section, footer) — was incorrectly pointing to `logo.png`

### Dimi Presence
- Broken Dimi portrait path fixed in `dimi.js`: `images/dimi/` → `images/adls/` (that folder never existed, causing invisible Dimi chat avatar everywhere)
- Rose emoji `🌹` removed from `dimi.js` customer chat reply
- Rose emoji `🌹` replaced with Dimi holographic head image in academy Overview and Reflection phase avatar divs (`academy-004.js`)
- Rose emoji `🌹` removed from two Dimi message bank strings in `academy-004.js`
- New asset: `images/adls/dimi-head-hologram.png` — cropped from official Dimi Digital Concierge brand sheet

### Content
- Social drop subagent: retired "Curated by a Secret Keeper to help you keep her." tagline → updated to "You deserve a secret this good." and removed `🌹 featured 2x per week` directive

---

## [v17.9c] — Academy Phase-Stepper Stability Pass
**Date:** 2026-07-09
**SW Cache:** ds-v17.9c (bumped)

### Fixes
- Phase-stepper engine (academy-004.js) stabilized — auto-advance timers corrected for Overview (5s) and Video (25s) phases
- Reading phase scroll-detection threshold tuned
- Knowledge check pass/fail feedback refined; XP toast timing corrected
- Reflection submit handler cleaned up
- SW cache bumped to `ds-v17.9c`

**Files Modified:** `js/academy-004.js`, `sw.js`

---

## [v17.9b] — Academy Phase-Stepper Engine (DSAPB-ACADEMY-004 Part 2)
**Date:** 2026-07-09
**SW Cache:** ds-v17.9b (bumped)

### Features
- Phase-stepper CSS (academy-004.css) fleshed out — full-screen dedicated phase environments with CSS slide transitions
- Horizontal phase stepper UI at lesson top (Overview → Video → Reading → Knowledge Check → Reflection → Complete)
- Complete phase: XP celebration overlay, "Next Lesson →" / "Start Exam →" button logic
- System auto-advance enforced — no manual "Mark Complete" button
- SW cache bumped to `ds-v17.9b`

**Files Modified:** `css/academy-004.css`, `js/academy-004.js`, `sw.js`

---

## [v17.9a] — Academy Phase-Stepper Init (DSAPB-ACADEMY-004 Part 1)
**Date:** 2026-07-08
**SW Cache:** ds-v17.9a (bumped)

### Features
- DSAPB-ACADEMY-004 phase-stepper architecture scaffolded
- `academy-004.js` and `academy-004.css` created as non-destructive enhancement layer on top of Sprint 1 academy.html
- Phase enum: Overview, Video, Reading, KnowledgeCheck, Reflection, Complete
- Initial lesson hero and learning objectives injection working
- SW cache bumped to `ds-v17.9a`

**Files Modified:** `css/academy-004.css` (new), `js/academy-004.js` (new), `academy.html`, `sw.js`

---

## [v17.9] — DS-UI-002 + DSAPB-ACADEMY-004 + DS-CONTENT-001
**Date:** 2026-07-08
**SW Cache:** bumped

### DS-UI-002 — Back Office Visual Consistency Upgrade
- New `css/admin-ui-002.css` — comprehensive luxury CSS layer applied globally across all Back Office tabs
- Upgraded CSS variables: richer background (#07050f + radial gradients), glass morphism cards, purple glow borders
- Sidebar: gradient background, premium nav item hover/active states with glow, gold section labels
- Topbar: glass backdrop-filter, gradient page title, upgraded action buttons
- Cards/panels: glass morphism (backdrop-filter), border glow on hover, animated top accent stripe
- Stat cards: lift on hover, per-color accent stripe, premium typography
- Tables: gold column headers, alternating row hover, rounded overflow containers
- Forms/inputs: glass treatment, purple focus ring with glow
- Buttons: enhanced gradient primary, glass secondary, per-type colored danger/success
- Status badges: premium pill shapes with per-status glow colors
- Modals: glass morphism overlay, gold-to-pink gradient heading
- Tab panel entrance: smooth fade+slide animation on every tab switch
- Empty state utility class: `.ds-empty-state` with icon + title + body
- Loading shimmer: `.ds-loading` animated gradient skeleton
- Custom scrollbars: thin purple-tinted throughout
- Responsive tweaks for mobile

### Legal Vault — Full Implementation
- Added `id="tab-legalvault"` panel — was previously missing (caused blank screen)
- PIN-lock screen: animated glow icon, vault PIN input (matches Settings → Vault PIN), session-persisted unlock
- Unlocked vault: 9 pre-seeded governance documents across HR, Legal, Finance, Policy categories
- Category filter tabs, document card grid with icons/tags/dates/notes
- Document upload (PDF/DOC/DOCX) with FileReader → localStorage persistence
- `initLegalVault()` function now implemented (was only called, never defined)
- Lock/unlock button; PIN validated against `ds_vault_pin` localStorage (default: SecretKeeper2024)

### DSAPB-ACADEMY-004 — Academy Experience Upgrade
- New `css/academy-004.css` — rich lesson experience styles
- New `js/academy-004.js` — non-destructive enhancement engine (patches existing functions)
- **Lesson hero**: replaces flat title bar with cinematic hero panel — breadcrumb (path › course), reading time, XP value, lesson position pill, gradient title
- **Learning objectives**: auto-injects "What You'll Learn" panel before lesson body with 3 objectives per lesson
- **XP celebration**: floating overlay animation on every lesson completion — gold "+10 XP" with motivational message
- **Lesson transitions**: smooth opacity+translate fade when navigating between lessons
- **Knowledge check upgrade**: glass morphism panel, premium badge, luxury option buttons, animated correct/wrong feedback
- **Lesson nav buttons**: full luxury treatment — primary gradient, hover lift, disabled states
- **Progress dots**: gold current dot, purple completed dots with glow
- **Callout boxes**: `<callout type="tip|important|example|gold">` custom element support — injects styled callout cards
- **Video container**: premium rounded frame with shadow and border
- **All patches are non-destructive**: wraps existing `renderLesson()`, `acadMarkLessonComplete()`, `acadNavLesson()` — original logic unchanged

### DS-CONTENT-001 — Content Studio (carried from v17.8 build)
- `id="tab-content-studio"` panel added to admin.html
- `js/content-studio.js` — full Content Studio engine
- `content-library.json` — asset library seed file
- Content Studio nav item added to sidebar (below Document Studio)

---

## [v17.7g] — Academy Sprint 1 Final Stabilization
**Date:** 2026-07-08
**SW Cache:** ds-v17.7g (bumped)

### Fixes
- Final TAP pass on Academy Sprint 1; all three audits clean before v17.9 sprint
- Minor DS-UI-002 sidebar and topbar contrast tweaks
- SW cache bumped to `ds-v17.7g`

**Files Modified:** `admin.html`, `academy.html`, `sw.js`

---

## [v17.7f] — Trendsi Scrub + Tagline + Dimi Fixes
**Date:** 2026-07-08
**SW Cache:** ds-v17.7f (bumped)

### Fixes
- Trendsi scrubbed from `netlify/functions/dimi-chat.js`
- Retired tagline fully purged from `dimi-social-drop.md` subagent; replaced with "You deserve a secret this good."
- Dimi image path audit — confirmed `images/dimi/` as canonical path in dimi.js
- SW cache bumped to `ds-v17.7f`

**Files Modified:** `netlify/functions/dimi-chat.js`, `js/dimi.js`

---

## [v17.7e] — DS-CONTENT-001 Content Studio Scaffold
**Date:** 2026-07-08
**SW Cache:** ds-v17.7e (bumped)

### Features
- Content Studio sidebar tab added to admin.html (below Document Studio)
- `js/content-studio.js` initial engine scaffolded — Dimi as Creative Director
- `content-library.json` seed file created
- SW cache bumped to `ds-v17.7e`

**Files Modified:** `admin.html`, `js/content-studio.js` (new), `content-library.json` (new), `sw.js`

---

## [v17.7d] — Back Office Legal Vault + DS-UI-002 Layer
**Date:** 2026-07-08
**SW Cache:** ds-v17.7d (bumped)

### Features
- Legal Vault tab fully implemented (was stubbed — caused blank screen)
- PIN-lock screen, 9 pre-seeded governance documents, category filter, upload support
- `css/admin-ui-002.css` luxury CSS upgrade layer applied globally across Back Office
- SW cache bumped to `ds-v17.7d`

**Files Modified:** `admin.html`, `css/admin-ui-002.css` (new), `sw.js`

---

## [v17.7c] — Academy Sprint 1 Bug Fixes
**Date:** 2026-07-08
**SW Cache:** ds-v17.7c (bumped)

### Fixes
- Academy auth passthrough (`academy.html?auth=sk`) — `checkAcadAuth()` strips param, proceeds to LMS without sign-in
- Firestore progress read/write stabilized for anonymous UID edge cases
- "College of" display references fully removed from front-facing UI (Learning Path standard enforced)
- Exam pass threshold (70%) and certificate unlock logic verified
- SW cache bumped to `ds-v17.7c`

**Files Modified:** `academy.html`, `sw.js`

---

## [v17.7] — Academy LMS Rebuild (Sprint 1)
**Date:** 2026-07-08
**SW Cache:** `ds-v17.7-1783477965`

### New Features
- **Full Enterprise LMS** — complete rebuild of `academy.html`
  - 3-panel luxury layout: Left nav, center lesson player, right Dimi/progress
  - Deep black / rich purple gradient / metallic gold glassmorphism UI
  - All 10 Learning Paths, 52 courses, 161 lessons — pre-filled and ready
- **Individual SK Progress Tracking** — Firestore-backed per-employee UID; auth passthrough from SK Office (`ds_admin_auth`)
- **Quiz Engine** — 25+ knowledge checks embedded in lessons
- **Exam Engine** — 5-question final exam per Learning Path (10 sets); 70% pass threshold; automatic certificate unlock
- **XP & Badge System** — 12 badges (placeholder; expanded to 44 in v17.9e), XP levels 1–10, streak tracking
- **Dimi as AI Tutor** — contextual tips per Learning Path in right panel
- **Toast Notifications** — XP gains, badges, exam results
- **Progress Dashboard** — hero stats, continue-learning card, path progress rings
- **Certificates Panel** — locked/unlocked per path in right panel

### Fixes
- Removed all "College of" references — "Learning Path" enforced throughout
- Trendsi scrubbed from exam question options
- Venmo scrubbed from all quiz/lesson content
- "DS" abbreviation confined to JS lesson body strings only

**Files Changed:** `academy.html` (full rebuild — 147 KB), `sw.js`

---

## [v17.6] — Ask Dimi Tab + Customers Fix
**Date:** 2026-07-08
**SW Cache:** `ds-v17.6-1783471937`
**Modified:** `admin.html`, `sw.js`, `CHANGELOG.md`

### Root Causes Fixed
- **Ask Dimi tab:** `<div id="tab-askdimi">` was completely absent from the HTML — nav button and CSS existed but no tab body; additionally `doInitGreeting`, `doInitLearning`, `initFlyerTemplates`, `initFlyerLibCount`, `checkDimiAiStatus`, `_updateSSSocialStatus` were all undefined causing `switchTab('askdimi')` to throw ReferenceError
- **Customers tab:** Firebase `auth().currentUser` was `null` when admin accessed via sessionStorage auth only — Firestore security rules require Firebase auth; Customers query returned empty silently

### Fixes Applied
1. **Added `tab-askdimi` HTML** — full Dimi Back Office workspace: greeting section, Ask Dimi chat interface, Social Studio with 4 flyer templates, post history
2. **Defined all missing functions** — `doInitGreeting`, `doInitLearning`, `initFlyerTemplates`, `initFlyerLibCount`, `checkDimiAiStatus`, `dimiBOSend`, `dimiBORender`, `_updateSSSocialStatus`, `_renderSocialHistory`
3. **Firebase anonymous auth** — added `firebase.auth().signInAnonymously()` in both `doLogin()` and the page-load sessionStorage auth check so Firestore queries work immediately after admin login

---

## [v17.5.1] — Tab Nesting Fix (Back Office)
**Date:** 2026-07-08
**SW Cache:** `ds-v17.5.1-1783470770`
**Modified:** `admin.html`, `sw.js`, `CHANGELOG.md`

### Root Cause Found (Live Audit)
- `tab-rewards` (line 2161) was never closed — ALL tabs appended after it (subscriptions, SKOS, CG, candidate-concierge, automation, ops, bizops, integrations, platform-gov, customer-support, communications, **academy**) were nested inside `tab-rewards`
- When `tab-rewards` was hidden (`display:none`), all child tabs were invisible regardless of their own `active` class
- 21 tabs were affected; additionally some tabs had inline `style="display:none"` overriding CSS `.active { display:block }`

### Fixes Applied
1. **Tab reparenting fix (DOMContentLoaded):** JS snippet moves any `.tab-content` div that is not a direct child of `.content` to the correct parent — fixes all 21 affected tabs at once
2. **`switchTab` inline-style fix:** Added `el.style.display = ''` when activating a tab to clear any stale inline display style

---

## [v17.5] — Academy Audit + Products Tab Fix
**SW Cache:** `ds-v17.5-1783469139`

### Back Office — Products Tab
- Added missing `<script src="js/products.js">` tag — products were silently failing to load
- Implemented `renderProductsAdmin()` — full searchable, filterable product grid pulling from `getProducts()`
- Fixed `oninput="filterProducts"` and `onchange="filterProducts"` missing `()` — filter buttons were inert
- `switchTab('products')` now calls `renderProductsAdmin()` with `.catch()` fallback so tab loads even if Firestore sync fails

### Academy — Comprehensive Audit & Bug Fixes
- **Canvas cert header:** `"D S   A C A D E M Y"` → `"DRIPPING SECRETS ACADEMY"` (DS abbreviation rule)
- **DS monogram removed from cert canvas:** Three `ctx.fillText('DS', ...)` calls removed from cert/canvas fallback emblem sections (rule: no DS abbreviation in documents or display)
- **`ctx.fill;` → `ctx.fill()`:** Fixed 4 instances of missing parentheses causing canvas shapes to never render (micro-dots, corner diamonds, emblem fill, secondary canvas)
- **`rng` → `rng()`:** Fixed 4 instances where the RNG function was referenced as a value instead of called — all micro-dot positions/alpha/color were broken
- **`firebase.auth.currentUser` → `firebase.auth().currentUser`:** Fixed in `acadDownloadCert` and `acadShowGradCert` — currentUser was always `undefined`
- **`acadGetProgress` undefined:** Removed dead reference in `acadDownloadCert` that would have thrown a ReferenceError on call
- **Stats bar now dynamic:** `acad-stat-courses` and `acad-stat-lessons` populated from `ACAD_COURSES` on tab load (no longer hardcoded HTML values)
- All 6 courses × 29 lessons: declared counts match actual `lessons_data` arrays — verified correct
- All Academy functions globally exposed: `acadLoadProgress`, `acadSwitchView`, `acadOpenCourse`, `acadCloseViewer`, `acadOpenLesson`, `acadMarkComplete`, `acadLessonNav`, `acadIssueCert`

---

## [v17.4] — 2026-07-07

### Critical: Back Office Firestore Fix — Everything Now Loads

#### Root Cause
`firebase-config.js` initializes Firebase but never sets `window.db`. In `admin.html`, the Firestore instance was assigned as:
```js
db = firebase.firestore;   // ← class reference, not an instance
```
Missing `()` meant `db` was the Firestore *class*, not a live database connection. Every `if (window.db)` guard across the entire Back Office evaluated to false. Products, orders, academy, Dimi's Office, team — all returned empty silently.

#### Fix
```js
db = firebase.firestore();   // ← now a real instance
window.db = db;              // ← exposed as window.db for all guard checks
```
Both the local `db` variable (used by `fsGet`/`fsUpdate`) and `window.db` (used by every tab loader) are now properly initialized.

**SW Cache:** `ds-v17.4-1783463000`

---

## [v17.3] — 2026-07-07

### Critical Back Office Fix + Visual Fixes

#### Back Office — Root Cause Fixed: All Tabs/Buttons Now Work
- **Root cause found:** ~1,500 lines of core admin JavaScript (`switchTab`, `tabTitles`, `initAdmin`, `loadOrders`, `loadParties`, `loadCustomers`, `loadTeam`, and 20+ other functions) were sitting completely **outside any `<script>` tag**. The browser treated them as raw HTML text — never executed. This is why all Back Office tabs and buttons appeared to do nothing.
- **Fix:** Inserted the missing `<script>` opening tag at the correct insertion point (before the Certificate Generator block), allowing the closing `</script>` at the end of the section to properly wrap the entire admin function library.
- **Bonus fixes caught during syntax scan:**
  - `document.fonts.ready.then() => ...` → `then(() => ...)` (malformed arrow function in cert loader)
  - `const rng =  => {...}` → `const rng = () => {...}` (missing parens on RNG arrow function)
  - `a.createdAt?.toDate?. ||` → `.toDate?.() ||` (two instances — missing invocation parens)
  - `updatePartyStatus('' + p.id + '' , ...)` → properly escaped `\'` quotes (two instances)
- **`renderCustomersTable` reconstructed:** Function had employee table code corrupted into its customer rendering template literal, causing nested template literal mismatches. Replaced with clean string-concatenation version (no template literal nesting).
- **`loadTeam` added:** Called by `switchTab('team')` at line 2564 but never defined. Implemented to load from `employees` Firestore collection and render the full team table with deactivate buttons.
- All 13 inline script blocks pass Node.js `--check` syntax validation ✅

#### Age Gate — Logo Updated
- **Fixed:** 18+ disclaimer overlay was showing old `logo.png`
- Updated to official `ds-circle-logo-official.png`

#### Dimi Actor — Character Hidden Sitewide
- **Fixed:** SVG character avatar was appearing from behind the Dimi chat panel on click
- Permanently hidden via `display: none !important` in `dimi-actor.css`

**SW Cache:** `ds-v17.3-1783462000`

---

## [v17.2] — 2026-07-07

### Visual Fixes

#### Age Gate — Logo Updated
- **Fixed:** 18+ disclaimer (age gate overlay) was showing old/original `logo.png`
- Updated to official `ds-circle-logo-official.png` — consistent with brand standard
- Logo file copied to `/images/ds-circle-logo-official.png`

#### Dimi Actor — Character Hidden Sitewide
- **Fixed:** SVG character avatar ("little guy") was appearing from behind the Dimi chat panel when chat was opened, creating an awkward visual overlap
- Permanently hidden via `display: none !important` in `dimi-actor.css` — affects all 30+ pages that load the actor
- JS actor engine (`dimi-actor.js`) preserved and intact for future use; only the visual stage is suppressed

**SW Cache:** `ds-v17.2-1783460500`

---

## [v17.1] — 2026-07-07

### Bug Fixes & Name Correction

#### Back Office — Critical JS Syntax Fixes
- **Fixed:** Two `.catch() => {` syntax errors in `admin.html` that were crashing the entire admin script and breaking all Back Office tab/button navigation
- **Fixed:** Two `setTimeout() => ...` syntax errors in cert download functions
- **Fixed:** Multiple `ctx.beginPath;` / `ctx.stroke;` / `ctx.closePath;` canvas method calls missing `()` in cert canvas generator — these were no-ops causing incomplete cert rendering

#### Academy Name — Sitewide Correction
- **Renamed:** "Boss Academy" → "Dripping Secrets Academy" across all files: `admin.html`, `academy.html`, `js/adls.js`
- All display labels, tab titles, nav items, option values, canvas strings, and comments updated
- `DRIPPING SECRETS ACADEMY` applied to uppercase cert value references

#### Academy Certificate Seal — Updated
- New official Dripping Secrets Academy seal variant deployed to `/images/ds-academy-seal-variant.png`
- ADLS academy seal (`/images/adls/adls-academy-seal.png`) updated to new variant
- Canvas cert generator now renders the actual seal image (with drawn fallback)
- Seal preloaded on Academy tab initialization

#### Age Gate Note
- Age gate code confirmed correct — 30-day localStorage persistence is working as designed; new visitors always see the 18+ disclaimer; returning visitors with valid token skip it by design

#### SW Cache
- Bumped to `ds-v17.1-1783459722`

---

## [v17.0] — 2026-07-07

### Master Blueprint COMPLETE — Sprints E, F, G (10/10 Sprints Live)

#### Sprint E — Sprint 4: Business Operations (`js/bizops.js`)
- **Finance Records** — income/expense/refund/commission tracking; totals dashboard; Firestore `biz_finance_records`
- **Approval Queue** — operational approval requests (refunds, payments, exceptions); approve/deny workflow; Firestore `biz_approvals`
- **Policy Center** — create/edit/retire business policies by category; 5 default policies (seed button); Firestore `biz_policies`
- **Business Records** — contracts, licenses, permits, registrations; expiration tracking with 30-day warnings; Firestore `biz_records`
- **Operational Compliance** — 12-point checklist tied to DS platform rules; % score; state persisted to Firestore `biz_compliance`
- **Audit Log** — all BizOps actions logged to `biz_audit_log`; clear old records utility
- **Nav:** 💼 Business Ops tab in Back Office

#### Sprint F — Sprint 7: Enterprise Integration Services (`js/integrations.js`)
- **Integration Registry** — all 8 approved integrations documented (Firebase Auth, Firestore, SW/PWA, EmailJS, Netlify, 1on1Wholesale, Tasklet Webhooks, ElevenLabs blacklisted)
- **Health Monitor** — live ping of 10 integration endpoints; color-coded score; Firestore audit on every run
- **Interface Governance** — 9 enforced interface contracts (payment channels, supplier confidentiality, auth boundaries, ESF signing, automation cross-trigger, etc.)
- **Request Log** — manual and system request/response logging; filter by integration; Firestore `integration_logs`
- **Integration Audit** — full audit trail in Firestore `integration_audit`; clear old records utility
- **Nav:** 🔌 Integration Hub tab in Back Office

#### Sprint G — Sprint 10: Platform Governance Capstone (`js/platform-governance.js`)
- **Blueprint Status** — 10/10 sprints displayed with version, domain, BK ref, dependencies; completion banner; 100% complete
- **Dependency Map** — visual layered dependency matrix (Foundation → Operations → Automation → Integration → Monitoring → Capstone)
- **Shared Controls** — 10 cross-system governance controls validated live (authorization, audit evidence, no-drift, portal boundaries, supplier confidentiality, payment enforcement, etc.)
- **Global Audit** — single-pane cross-system audit view; switch between any domain's Firestore audit collection
- **No-Drift Certification** — platform governance certificate with 10-point checklist; document precedence ladder (per Sprint 10 spec)
- **Nav:** 🏛️ Platform Governance tab in Back Office

**SW Cache:** `ds-v17.0-[timestamp]` | **New files:** `js/bizops.js`, `js/integrations.js`, `js/platform-governance.js`

---

## [v16.7] — 2026-07-07

### Sprint D — BK-18 Automation Engine + BK-19 Production Ops

#### BK-18 — Automation Engine (`js/automation.js`)
- New Back Office wing: **Automation Engine** (nav: ⚡ Automation Engine)
- Rule builder: define trigger → condition → action automation rules
- 11 trigger types: new order, order cancel, low stock, out of stock, new customer, document signed, SK request, daily/weekly/monthly schedule, manual
- 5 condition evaluators: equals, not equals, contains, greater than, less than
- 6 action types: in-app notification, email alert (EmailJS), SK announcement, flag order, stock alert, audit log
- Rule CRUD: create, edit, enable/disable, delete, test-fire
- Firestore-backed: `automation_rules`, `automation_logs`, `automation_schedule_state`
- Scheduler: auto-evaluates daily/weekly/monthly rules on page load
- Public trigger dispatcher: `window.dsAutoFireTrigger(type, context)` for cross-engine integration
- Audit Trail: full execution log with status, rule name, trigger, action, timestamp

#### BK-19 — Production Operations (`js/ops.js`)
- New Back Office wing: **Production Ops** (nav: 🛡️ Production Ops)
- System Health panel: Firebase/Firestore connectivity, Service Worker status, Admin Auth, Cache version
- Page Performance metrics: DNS, connect, TTFB, DOM ready, full page load (color-coded bars)
- Operational Readiness checklist: 10-point automated platform check with % readiness score
- Incident Log: create/resolve/delete incidents with severity (low/medium/high/critical), Firestore-backed
- Error Capture: global JS error + unhandled promise rejection listener → Firestore `ops_error_logs`
- Release History: full v15.0–v16.7 history with cache versions and change summaries
- Firestore collections: `ops_incidents`, `ops_error_logs`, `ops_health_pings`

#### Platform
- New nav section: **Platform Ops** in Back Office sidebar
- SW Cache bumped to `ds-v16.7-1783442218`
- Script tags: `js/automation.js`, `js/ops.js`
- Tab IDs: `tab-automation`, `tab-ops`
- switchTab hooks: `initAutomation()`, `initOps()`

---

## [v16.6] — 2026-07-07

### Sprint C — BK-17 Employee Operations
- **SK Office fully operational** — all 8 wings now Firestore-backed via `js/skos.js`:
  - **SK Directory** — add/edit/status (Active, On Leave, Inactive), role filter, live search, real-time listener
  - **Task Board** — kanban (To Do / In Progress / Done), assign to SK, priority (Normal/High/Urgent), due dates, drag-less move controls
  - **Training Center** — module CRUD (name, description, category, duration, required/optional), grid view, live Firestore listener
  - **Performance Dashboard** — per-SK KPIs (tasks done, pending, recognitions), completion progress bar, live aggregation
  - **Recognition Board** — give recognition (5 types), live feed with icons, Firestore-backed
  - **Request Management** — filter by status/type, one-click Approve/Deny, audit trail (resolvedBy, resolvedAt)
  - **SK Calendar** — monthly view, full event CRUD (shift/meeting/training/event/holiday), color-coded by type, click-to-add
  - **Announcements** — post with priority (Normal/Important/Urgent), pin to top, live feed, delete
- **Candidate Concierge** — wired to `initSKOS('candidate-concierge')`: full pipeline (Applied → Review → Interview → Offer → Onboarding → Hired → Declined), add/edit/delete, stage-move dropdown, live search + filter
- **switchTab hooks** — all 9 SKOS subtabs now call `initSKOS(subtab)` on activation; `dsCandidateInit` replaced with `initSKOS`
- **`js/skos.js`** — BK-17 engine added to site tree and script block
- **SW Cache** bumped to `ds-v16.6-1783440223`

---

## [v16.5] — 2026-07-07

### Sprint B — ESF Phase 2: QR Verification · Audit Trail · Workflow Engine · Signature Console

#### New Files
- `js/esf-phase2.js` — Full ESF Phase 2 engine (QR, Audit, Certificates, Workflows, Notifications, Admin)
- `verification.html` — Public document verification portal (scan QR or enter ID to verify)

#### admin.html Changes
- New nav item: **Signature Console** (between Legal Vault and Document Studio)
- New tab: `#tab-esf` — full admin console with 4 panels
- ESF CSS added (console, KPI bar, tabs, panels)
- `switchTab` wired: `if (tab === 'esf') initESF?.()`
- Tab title registered: `esf: 'Signature Console'`
- `<script src="js/esf-phase2.js">` added

#### ESF Phase 2 Capabilities
- **QR Engine** — unique QR per signed doc, links to `/verification.html?doc=&cert=`, records stored in `signature_qr_codes`
- **Certificate Engine** — issues DS-CERT-XXXXXXX per signing, SHA-256 hash, immutable Firestore record, status: Valid/Revoked/Expired
- **Audit Engine** — immutable `signature_audit_logs` + `signature_events`; every sign/view/download/verify action logged
- **Workflow Engine** — sequential approval chains, step-by-step routing, expiration, escalation to management@drippingsecrets.com, reminder logic
- **Notification Bridge** — ESF events push into BK-15 notification center (`dsNotif.createNotification`)
- **Admin Console** — 4 panels: Signed Documents, Certificates (with revoke), Workflows, Audit Trail; CSV export; QR viewer modal; per-doc audit modal
- **Public Verification Portal** — `verification.html`; accepts doc ID or cert ID via URL param or input; displays Valid/Revoked/Expired/Invalid with full cert detail; Firebase-powered; auto-verifies from QR scan
- **Phase 1 augmentation** — `esigApply` patched to auto-issue certificate on every signing event
- **18 Firestore collections** initialized: signature_profiles, signature_profile_versions, signature_sessions, signature_events, signature_requests, signature_documents, signature_initials, signature_certificates, signature_certificate_history, signature_verifications, signature_qr_codes, signature_workflows, signature_workflow_steps, signature_notifications, signature_audit_logs, signature_permissions, signature_templates, signature_metadata

#### sw.js
- Cache bumped to `ds-v16.5-[timestamp]`
- `verification.html` added to ASSETS precache

## [v16.4] — 2026-07-07

### Added — BK-16 Executive Analytics
- `js/analytics.js` — full analytics engine: Firestore data aggregation, 4 Chart.js charts (revenue trend, order status, top products, revenue by source), 6 KPI cards, period selector (7d/30d/90d), recent orders table, customer intelligence panel (retention rate, top spenders), CSV export
- Analytics tab fully rebuilt: period selector, refresh button, CSV export, KPI row, charts grid, revenue summary, recent activity feed, recent orders table, customer metrics
- CSS: `.an-kpi-card` family (pink/teal/gold/purple/green variants), skeleton pulse animation, mini-card grid

### Added — BK-15 Notifications Center
- `js/notifications.js` — real-time in-app notification engine: Firestore `notifications` collection with `onSnapshot` listener, notification bell in Back Office topbar with live unread badge, slide-in notification drawer with filter tabs (All/Unread/Orders/System), mark read / mark all read / clear all, CSV-free type-based icons, test notification generator
- Public API: `window.dsNotif.createNotification(type, message, detail, meta)` available to all admin scripts

### Changed
- SW cache bumped: `ds-v16.4-1783436003`

## [v16.3] — 2026-07-07
### ADLS (Adaptive Dynamic Logo System) · Wellness Library Expansion
**Version:** 16.3 | **Risk:** Low | **Deployment:** Ashley deploys | **SW Cache:** ds-v16.3-1783404520

#### ADLS — Adaptive Dynamic Logo System (Full Implementation)
- **19 brand variant images** ingested and stored in `images/adls/`
- `js/adls.js` — new context-aware brand image renderer (ADLS v1.0)
  - Full variant registry: 19 named contexts (hero, admin, shop, events, event-hq, customer-care, logistics, front-desk, affiliate, content-creator, social-creator, luxury, academy, ai-concierge, truck, truck-2, selfie, logo-black, logo-vector)
  - Auto page-context detection from URL; `data-adls` attribute overrides per element
  - Lazy loading by default; graceful fallback if script fails
  - `ADLS.getVariant()`, `ADLS.renderSlot()`, `ADLS.renderAll()`, `ADLS.preload()` API
- `css/adls.css` — full ADLS styling system (hero banner, panel, sidebar, seal, responsive)
- **Pages wired with ADLS variants:**
  - `index.html` — hero poster now uses ADLS `hero` variant; adls.js + adls.css added
  - `wellness.html` — luxury lifestyle hero banner injected above hero section
  - `events.html` — event HQ cinematic hero banner replaces text-only hero
  - `affiliates.html` — affiliate ADLS panel with brand image integrated into hero
  - `employee.html` — front-desk variant thumbnail added to SK Hub greeting
  - `academy.html` — academy seal variant replaces static logo in app header
  - `shop.html` — adls.js + adls.css added; shop context active
  - `creators.html` — adls.js + adls.css added; content-creator context active
- All integrations are non-destructive; existing functionality fully preserved

#### Wellness Library — Content Expansion (+8 Articles)
- **Total articles: 23** (was 15)
- New articles added to `js/wellness.js` getSampleContent():
  - `wl16` — Your Menstrual Cycle & Intimacy (4-phase breakdown; 9 min; Cycle & Health)
  - `wl17` — Period Sex: What Nobody Tells You (benefits, practical guide; 6 min; Cycle & Health)
  - `wl18` — Bedroom Position Guide for Every Body (body-inclusive, 7 positions; 12 min; Couples)
  - `wl19` — Pelvic Floor Health: Kegels & Beyond (correct technique + hypertonic warning; 8 min; Cycle & Health)
  - `wl20` — The Confidence-Pleasure Connection (dual-direction relationship; 7 min; Self-Care)
  - `wl21` — Understanding Your Arousal Map (dual control model, brake/accelerator; 10 min; Education)
  - `wl22` — Temperature & Sensation Play (beginner guide, safety notes; 8 min; Couples)
  - `wl23` — Emotional Intimacy: Foundation of Physical Connection (Gottman research; 9 min; Relationships)
- **New category filter:** "Cycle & Health" added to wellness.html category bar
- **Series panel updated:** 8 series (was 6); Cycle & Health + Confidence & Pleasure series added
- All articles follow DS brand voice: shame-free, evidence-informed, luxury tone

#### Service Worker
- Cache version bumped to `ds-v16.3-1783404520`

---

## [v16.2] — 2026-07-04
### Enterprise Academy Expansion · Shop Search · Full Accessibility Overhaul
**Version:** 16.2 | **Risk:** Low | **Deployment:** Ashley deploys | **SW Cache:** ds-v16.2-1783298288

#### Boss Academy — Enterprise Spec (10 Colleges, 52 Courses, 161 Lessons)
- Full curriculum rebuilt per DS Enterprise Master Package v1.0 and DSAPB governing spec
- **10 Colleges:** Brand & Identity · Commerce & Sales · Operations & Fulfillment · Customer Experience · Events & Hosting · Marketing & Content · Finance & Compliance · Technology & Platforms · Leadership & Culture · Product Knowledge
- **52 courses** with full lesson content (avg 3 lessons each) = **161 total lessons**
- College filter tab bar added above course grid — filter by any of 10 colleges with aria-pressed states
- Course search bar added — live search across title and college name
- Stats bar updated: 6→52 courses, 29→161 lessons
- `acadFilterCollege()` and `acadSearchCourses()` functions wired to UI
- All existing Firestore progress tracking, certification, and auth systems preserved

#### Shop — Product Search
- Search bar added above shop filter bar (all pages)
- Live text search filters across product name, description, and category
- "No products found" empty-state message when search returns zero results
- Search state (`_shopSearch`) stacked with existing category filter + size filter + sort — all work together

#### Accessibility — Full Site Overhaul
- **Skip-to-main-content** link added to `index.html` and `shop.html` (visually hidden until focused)
- **Focus-visible** outline (3px gold `#d4af37`) applied globally via CSS — keyboard navigation now visible on all interactive elements across all pages including checkout, cart, and filter buttons
- **prefers-reduced-motion** media query added globally — all animations/transitions suppressed for users who prefer reduced motion
- **Cart qty buttons** — `aria-label` added to Decrease/Increase buttons with product name; qty `<span>` gets `aria-live="polite"`
- **Cart count badge** — `aria-live="polite"` + `aria-label` added so screen readers announce count changes
- **Checkout modal** — `aria-labelledby` attribute added
- **Academy search/filter** — all new inputs include `aria-label` and `role="group"` on filter container
- **Shop search** — `aria-label="Search products"` on input
- **`.sr-only` utility class** added to CSS for future screen-reader-only content

#### Files Modified
- `academy.html` — full ACAD_COURSES replacement + college filter UI + search + filter JS
- `shop.html` — search bar + `shopDoSearch()` + no-results state + skip link + cart aria-live
- `index.html` — skip link + cart count aria-live + checkout aria-labelledby
- `js/cart.js` — qty button aria-labels
- `css/style.css` — accessibility block (skip link, focus-visible, reduced-motion, sr-only)
- `sw.js` — cache bumped to `ds-v16.2-1783298288`

---

## [v16.1] — 2026-07-03 (Built; not deployed — superseded by v16.2)
### Hotfix — JS Syntax Errors from v16.0
**SW Cache:** ds-v16.1-1783038310

---

## [v16.0] — 2026-07-03
### Multi-Track Build — Academy LMS · Wellness Expansion · Check-In · "DS" Display Fixes
**Version:** 16.0 | **Risk:** Low–Medium | **Deployment:** Ashley deploys | **SW Cache:** ds-v16.0-1783028554

#### "DS" Display Text Violations — Fully Purged (MANDATORY — ACR D-06)
- `admin.html` — removed all "DS" prefix from display labels, nav items, options, and body copy:
  - Meta title updated to "Back Office"
  - Sidebar nav icons: "DS Academy" → "Boss Academy" etc.
  - Doc type options: "DS Executive" → "Dripping Secrets Executive", "DS Consultation" → "Dripping Secrets Consultation", "DS Style Shoot" → "Dripping Secrets Style Shoot"
  - "DS Brand Assets" section header → "Brand Assets"
  - "DS Boss Academy" cert type labels → "Dripping Secrets Boss Academy"
  - "DS Academy Course" JS defaults → "Boss Academy Course"
  - "10 cert types for DS Boss Academy" tooltip → full name
  - All remaining internal `DS Academy`, `DS Boss` display strings patched
- `academy.html` — rebuilt clean (was stub); all "DS" display text removed

#### Boss Academy LMS — Rich Content Pre-Loaded
- **6 full courses** added to admin Academy tab with pre-loaded lesson libraries:
  1. **Secret Keeper Onboarding** (5 lessons) — Brand Story, Core Values, Customer Journey, Product Knowledge 101, House Rules
  2. **Sensual Product Knowledge** (5 lessons) — Material Safety, Vibration Categories, Lubricants, Couples Products, Cleaning & Care
  3. **Event Hosting Mastery** (5 lessons) — Event Types, Setup & Flow, Guest Experience, Safety & Boundaries, Post-Event
  4. **Customer Service Excellence** (4 lessons) — Brand Voice, Handling Objections, Returns & Refunds, VIP Clients
  5. **Social Media & Branding** (4 lessons) — Platform Strategy, Content Calendar, Hashtag Strategy, Brand Consistency
  6. **Business Operations** (5 lessons) — Back Office Overview, Inventory, Orders & Fulfillment, Financial Records, Compliance
- Courses stored as `ACADEMY_COURSES` const; per-employee progress stored in Firestore `academy_progress` collection
- `acadLoadProgress(empId)` function wired to admin Academy tab; loads real Firestore data with local fallback
- Academy tab renders course grid with progress bars, status badges, per-employee lesson viewer
- Per-lesson read-tracking with Firestore writes; course completion detection; "Mark Complete" action
- Academy CSS (`.acad-course-grid`, `.acad-course-card`, `.acad-lesson-row`, etc.) injected into admin.html

#### Wellness Library — Expanded 6 → 15 Articles
- **9 new articles added** to `wellness.js`:
  - "The Art of Slow Intimacy" — sensate focus, 20-minute rule, nervous system regulation
  - "Body Acceptance & Pleasure" — body image research, mirror practice, pleasure as path to acceptance
  - "Lubrication 101" — water/silicone/oil comparison, what to avoid, material safety
  - "Creating a Sensory Sanctuary at Home" — lighting, scent, sound, temperature, the phone rule
  - "Desire Discrepancy in Relationships" — spontaneous vs. responsive desire, practical navigation
  - "Mindful Masturbation" — mindfulness practice, body literacy, benefits guide
  - "After Trauma: Reclaiming Your Sensual Self" — trauma-informed, somatic safety, gradual re-engagement
  - "Menopause & Midlife Sensuality" — hormonal changes, practical tools, the truth about post-menopausal pleasure
  - "Pleasure During Pregnancy & Postpartum" — trimester guidance, postpartum healing timeline

#### Events — Guest Check-In Feature
- RSVP modal upgraded: added Check-In column to guest list table
- `checkInGuest(rsvpId, eventId)` function writes `checkedIn: true` + `checkedInAt` timestamp to Firestore
- Check-in stat badge shows "X / Y checked in" live in modal header
- Checked-in rows highlighted green; button replaced with timestamp confirmation on check-in
- `checkInGuest` exposed in `DSEvents` public API

#### Preserved (Unchanged)
- All 87 Luxury Play products + local images
- All Back Office wings, portals, auth boundaries, customer accounts
- All commerce logic: CashApp/PayPal/Apple Pay, checkout flow, promo codes
- All v15.0 bug fixes
- Dimi behavior (ElevenLabs remains purged)

---

## [v15.0] — 2026-06-30
### Blueprint Sprint — Bug Fixes + Gap Implementation
**Version:** 15.0 | **Risk:** Low–Medium | **Deployment:** Ashley deploys | **SW Cache:** ds-v15.0-1782775469

#### Bug Fixes (Critical)
- **admin.html — 36 missing-`()` calls fixed:**
  - `loadCustomPromoCodes()` wired in 3 places (codes previously never saved/loaded)
  - `window.getPromoCodes` syntax error fixed (promo codes never bridged to checkout)
  - `serverTimestamp()` fixed in 16 Firestore write calls (writes were silently failing)
  - `renderCustomersTable()` call fixed (Customers tab never rendered)
  - `adminLoadCommunity()`, `DSMedia.adminLoadContent()`, `closeAddSupplierModal()` fixed
  - 25+ `.toLowerCase()` / `.trim()` / `.toUpperCase()` missing-parens fixed (SKOS, cert studio, customers, campaigns, analytics)
  - `getFirestore()` fixed in qty-save (inventory saves were failing)
  - `adminToggleFlag()` and `loadParties()` fixed
- **cart.js — DRIP10 promo code added** (advertised on homepage but was missing from promo list)
- **cart.js — `free_shipping` promo type handler added** (existed in admin UI but cart had no handler)
- **cart.js — flash sale deactivated** (was `active: true` with expired June 21 date)
- **cart.js — checkout address prefill field mapping fixed** (`shippingAddress` nested object now correctly mapped to flat checkout fields)
- **dimi.js — ElevenLabs references fully purged** (comment lines containing brand name removed)

#### Blueprint Gaps Implemented
- **admin.html — Create Event form added** (admin could not create new events from Back Office)
- **events.js — RSVP viewer upgraded** (`alert()` replaced with inline table modal `ds-rsvp-view-modal`)
- **admin.html — Luxury Play supplier filter added** (1on1Wholesale option added to admin product supplier filter)

#### Preserved (Unchanged)
- All 87 Luxury Play products + local images
- All Back Office wings, portals, auth boundaries
- All Firestore collections, e-signatures, Document Studio
- All payment methods (CashApp, PayPal, Apple Pay)
- Dimi chat behavior

**Files Modified:** `admin.html`, `js/cart.js`, `js/events.js`, `js/dimi.js`, `sw.js`, `CHANGELOG.md`
**Rollback Artifact:** `/tasklet/agent/home/DrippingSecrets-v14.0.zip`

---

## [v14.0] — 2026-06-29
### Platform 2.0 — Phase 2: Back Office Wings + Local Image Hosting + Documents
**Version:** 14.0 | **Risk:** Low–Medium | **Deployment:** Ashley deploys | **SW Cache:** ds-v14.0-1782700440

#### New Features
- **Back Office — Candidate Concierge** (new tab)
  - Full hiring pipeline: Apply → Review → Interview → Decision → Offer → Onboard
  - Candidate cards with stage badges, quick-actions per stage
  - Firestore-backed pipeline data
- **Back Office — Customer Support** (new tab)
  - Ticket management: Open / Pending / Resolved views
  - Per-ticket detail cards, status update controls
  - Firestore-backed ticket data
- **Back Office — Communications** (new tab)
  - Email/SMS log view with sent/pending/failed badges
  - Announcement drafting tool with Dimi voice preview
  - Announcement broadcast to Firestore
- **Back Office — E-Signature Modal**
  - Canvas draw + 4-font picker (Great Vibes, Dancing Script, Allura, Sacramento)
  - Signature baked into PDF via pdf-lib on sign
  - Firestore signing record written per execution
- **Back Office — Dashboard enhancements**
  - New stat cards: Active Secret Keepers, Open Support Tickets, Pending Approvals, Active Announcements
  - Live Firestore queries for all new stats
  - Announcement preview widget
- **Back Office — How-To Guide updated**
  - Full documentation for all new wings: Candidate Concierge, Customer Support, Communications, E-Signatures, Finance Wing, Approval Center
- **1on1Wholesale local image hosting**
  - All 87 product image URLs migrated from 1on1wholesale.co.uk CDN → local `images/products/1on1/`
  - Zero external CDN dependencies for product images
- **Offer Letter v3** (DS-HR-OFR-2026-0001)
  - Rebuilt with correct Founder name: Ashley Butler
  - Full DS letterhead, DS Document Standard compliance
  - 8 placeholders, pale plum signature block, live e-sign modal integration
  - Archived: `/tasklet/agent/home/ds-documents/hr/DS-HR-OFR-2026-0001_Offer-Letter-v3.pdf`
- **ACR Addendum A** (DS-ARCH-ACR-2026-0001-ADD-A)
  - Formally records all 5 Founder Decisions (C-01 through C-05)
  - Resolves all critical contradictions and architecture gaps from parent ACR
  - Archived: `/tasklet/agent/home/ds-documents/legal/DS-ARCH-ACR-2026-0001-ADD-A.pdf`

#### Fixes
- Removed stray Venmo reference from Back Office → Settings → Payment Handles help text
- Admin.html: corrected payment method note ("Apple Pay via PayPal — no separate handle needed")

#### Files Modified
- `admin.html` — Candidate Concierge, Customer Support, Communications, e-sign modal, dashboard stats, How-To guide update, Venmo fix
- `js/products.js` — 87 1on1wholesale image URLs → local paths (images/products/1on1/)
- `images/products/1on1/` — 87 product images (new folder)
- `sw.js` — Cache bumped to ds-v14.0-1782700440
- `CHANGELOG.md` — updated

**Rollback:** `/tasklet/agent/home/DrippingSecrets-v13.0.zip` (sealed pre-v14.0)

---

## [v13.0] — 2026-06-28
### Platform 2.0 — Phase 1: Commerce Expansion + Back Office Enhancement
**Version:** 13.0 | **Risk:** Low–Medium | **Deployment:** Ashley deploys

#### New Features
- **44 new products** across 4 new approved suppliers:
  - CNV Wholesale (12): Womanizer, We-Vibe, Lovense — premium app-controlled toys
  - My AWD (10): Satisfyer, Dame, LELO, Kiiroo, b-Vibe — US-based fulfillment
  - Wholesale Adult Toys (12): Doc Johnson, Pipedream, CalExotics — US warehouse
  - Great Deals Distribution (10): Mapale lingerie — inclusive sizing, US-based
- **Back Office — Document Studio: Certificate Generator**
  - Client-side PDF form filling via pdf-lib CDN
  - All 11 LOCKED template form fields auto-populated from form inputs
  - Auto-generates cert number, verification code
  - Flatten + download: cert named `[CERT_NUMBER]_[RECIPIENT].pdf`
- **Back Office — Document Studio: Offer Letter Generator**
  - Full DS-branded offer letter generated client-side via pdf-lib
  - DS letterhead, plum/gold palette, pale plum signature box
  - Numbered: `DS-HR-OFR-[YEAR]-[XXXX].pdf`
- **Back Office — Finance Wing** (new tab)
  - MTD/YTD revenue, total orders, avg order value from Firestore
  - Monthly revenue bar chart, top-selling products
  - Payroll quick-actions linking to Document Studio
  - Commission tracking section
- **Back Office — Approval Center** (new tab)
  - Approval queue: offer letters, creator apps, product publish, refunds
  - Pulls pending creator marketplace applications from Firestore
  - Quick-action shortcuts to relevant tabs
- **Placeholder image** `images/products/placeholder-luxury.jpg` for new supplier products
- **Cert template** hosted at `assets/ds-cert-template.pdf` for client-side generation

#### Fixes Carried from v12.0.1
- ElevenLabs API/voice code fully removed from dimi.js
- Venmo removed from cart.js PAY_LOGOS + PAY_BRAND_COLORS

#### Files Modified
- `js/products.js` — 44 new products, 4 new supplier arrays, DROPSHIP_PRODUCTS updated
- `admin.html` — Document Studio sub-tabs, Finance Wing, Approval Center, pdf-lib script
- `sw.js` — Cache bumped to ds-v13.0
- `images/products/placeholder-luxury.jpg` — new placeholder asset
- `assets/ds-cert-template.pdf` — cert template deployed to site
- `CHANGELOG.md` — updated

**Rollback:** `/tasklet/agent/home/DrippingSecrets-v12.0.zip` (pre-v13.0)

---

## [v12.0.1] — 2026-06-27

### Release Type: Patch — Final Pre-Deploy Cleanup

### Changes
- **dimi.js** — Removed all residual ElevenLabs functional code (API constants, fetch call); only explanatory comments remain; no voice API calls anywhere in client code
- **cart.js** — Removed Venmo SVG from `PAY_LOGOS` and Venmo entry from `PAY_BRAND_COLORS`; all 3 remaining "venmo" references are audit-trail comments only
- **sw.js** — Cache version bumped to `ds-v12.0-1751072400`

### Files Modified
- `js/dimi.js` — ElevenLabs code purged
- `js/cart.js` — Venmo logo/color objects removed
- `sw.js` — Cache version bump

### Rollback Artifact
- `/tasklet/agent/home/DrippingSecrets-v11.9-rollback-pre-v12.0.zip`

### Risk: Low — Comment and dead-code cleanup only

---

## [v12.0] — 2026-06-27

### Release Type: Major Repair + Bug Fix Release

### Changes
- **Back Office Admin — Complete JS Repair (CRITICAL)**
  - Discovered and fixed main admin script block (1,300+ lines) that was entirely outside `<script>` tags — all admin functions were invisible to the browser
  - Added proper `<script>` wrapper restoring dashboard, orders, parties, settings, team, all tabs
  - Implemented `doLogin()` / `doLogout()` functions (password from Firestore settings, fallback `SecretKeeper2024`)
  - Added `adminToggleSidebar()` — PWA/mobile hamburger menu now works
  - Added session-based auth check on page load (Back Office remembers login across refreshes)
  - Fixed 18 `async function name {` syntax errors → `async function name() {`
  - Fixed 22 `function name {` syntax errors → `function name() {`
  - Fixed 23 `(function{` IIFE patterns → `(function() {`
  - Fixed 9 missing arrow function param `()` (e.g., `( =>` → `() =>`)
  - Fixed 37 `onclick="func"` → `onclick="func()"` handlers throughout
  - Fixed 8 `await funcName;` → `await funcName()` call patterns
  - Fixed 24 `if (tab === 'x') funcName;` → `funcName()` in switchTab
  - Fixed 11 Firestore `.get;` → `.get()` and `.data;` → `.data()` patterns
  - Fixed 4 `a.click;` / `.remove;` → `.click()` / `.remove()`
  - Fixed 25 `ctx.save;` / `ctx.restore;` → `.save()` / `.restore()` (canvas cert engine)
  - Fixed 5 `new Date.method` → `new Date().method`
- **Checkout — Venmo Removed**
  - Removed Venmo from PayPal SDK `enable-funding` parameter
  - Updated payment button label: PayPal · Apple Pay (Venmo removed)
  - Updated checkout description copy (3 locations)
  - Updated Dimi's in-chat payment response copy
  - Removed Venmo from `isPP` payment method check
- **Security — ElevenLabs API Key Removed**
  - ElevenLabs API key removed from client-side `dimi.js` (was publicly visible in source)
  - `voiceEnabled` set to `false` — Dimi is voice-silent until key is re-integrated server-side via Netlify function
- **Cleanup — Trendsi Image Folder Purged**
  - `images/trendsi/` folder (824 files) excluded from build — Trendsi permanently retired
- **Service Worker** bumped to `ds-v12.0-1751067600`

### Files Modified
- `admin.html` — major JS repair + auth functions + mobile toggle
- `js/cart.js` — Venmo removal (5 locations)
- `js/dimi.js` — ElevenLabs key removed, voice disabled, Venmo removed from responses
- `sw.js` — cache version bump
- `CHANGELOG.md` — this entry

### Rollback
`DrippingSecrets-v11.9-rollback-pre-v12.0.zip`

### Risk
Medium-High — major admin.html repair; all fixes are additive/corrective, no commerce logic touched. Customer-facing site unchanged except Venmo removal at checkout (correct per brand rules).

---

## v11.9 — Back Office Pay Stub Generator (Document Studio)
**Date:** 2026-06-27
**Version:** 11.9
**Risk:** Low — Back Office only; no customer-facing pages, no commerce, no Firestore, no auth touched

### Changes
- **Document Studio tab activated (`admin.html`):** Previously nav-only shell — now a fully functional Pay Stub Generator UI lives inside. Sub-tab architecture ready for future additions (cert generator, etc.).
- **Pay Stub Form:** Employee info (name, ID, dept, title, pay period, pay date, period #, pay type) · Earnings (regular hours/rate, overtime hours/rate, commission) · Deductions (fed tax, state tax, SS auto 6.2%, Medicare auto 1.45%, health ins) · YTD totals · Payment method toggle (Direct Deposit → last 4 / Paper Check → check number auto-gen).
- **Live Summary Panel:** Right-side sticky panel auto-calculates gross, all deductions, net pay in real time as admin types. Suggested federal tax (10% gross) shown as reference.
- **jsPDF PDF Engine (CDN):** Client-side PDF generation — no server required. Generates a letter-size pay stub matching v2.2 Python engine layout: plum gradient header, DRIPPING SECRETS branding, gold accent line, employee info grid, EARNINGS + DEDUCTIONS tables with alternating rows, NET PAY dark box (current + YTD), summary bar, payment method row, CERTIFIED diagonal watermark (light plum), confidentiality footer, plum footer bar.
- **`tabTitles` object added** — fixes silent bug where `switchTab()` threw ReferenceError on `tabTitles`; all tabs now have proper page-title labels.
- **`dsDocStudioInit` updated** — replaces broken canvas-render calls with proper form initialization.
- **Python engine (`ds_paystub_engine.py`):** Sample data restored to Direct Deposit default; paper check support retained (engine auto-detects method).

### Files Modified
- `admin.html`
- `ds_paystub_engine.py` (sample data only)

### Rollback Artifact
`DrippingSecrets-v11.8-rollback-pre-v11.9.zip`

---


## v11.8 — Safe Space Inclusion, Age Gate & Discreet Privacy Notices
**Date:** 2026-06-27
**Version:** 11.8
**Risk:** Low — additive only; no commerce, auth, or Firestore touched

### Changes
- **Age Gate Overlay (NEW — `js/age-gate.js`):** WCAG 2.1 AA compliant 18+ verification modal on all 36 public pages. Sex-positive, LGBTQ+/kink/ENM welcoming copy. 30-day localStorage persistence. Focus trap, aria-modal, keyboard nav. Back Office/employee/staff portals excluded.
- **Footer — Safe Space Badges:** All 9 footer pages updated with LGBTQ+ Pride flags (Rainbow, Transgender, Bisexual, Leather Pride) as inline SVGs with proper alt text. BDSM triskelion community symbol included. "Safe Space · LGBTQ+ Affirming · Sex-Positive · Kink & Lifestyle Welcoming" label.
- **Footer — Discreet Privacy Excerpt:** All 9 footer pages updated with discreet billing/data privacy statement ("DS Boutique" billing descriptor, no data selling, plain packaging).
- **SW cache** bumped to `ds-v11.8-1752000000`.

### Files Modified
- `js/age-gate.js` (new)
- `index.html`, `about.html`, `shop.html`, `booking.html`, `boxes.html`, `bundles.html`, `contact.html`, `machines.html`, `services.html` (footer + age gate)
- 27 additional public HTML pages (age gate only)
- `sw.js`

### Rollback Artifact
`DrippingSecrets-v11.7.1-rollback-pre-v11.8.zip`

Institutional memory for every build. Protects features from being silently overwritten.

---

## v11.7 — Luxury Play Collection + Trendsi Removal

**Released:** 2026-06-27
**Risk:** Medium — supplier swap, product catalog change, nav/filter changes; no payment/auth/checkout logic touched
**Rollback artifact:** `DrippingSecrets-v11.6-rollback-pre-v11.7.zip`

### Changes
- `js/products.js` — Removed all Trendsi products (IDs 500–580, 81 items); added **Luxury Play** collection (87 premium in-stock items, IDs 600–686, sourced from 1on1Wholesale); updated DROPSHIP_PRODUCTS merge to reference `LUXURY_PLAY_PRODUCTS`
- `js/cart.js` — Replaced `isTrendsi` / `trendsi` shipment group logic with `isLuxuryPlay` / `luxury_play`; ETA updated to 7–10 business days; badge changed to "Luxury Play"; note reads "premium international delivery"
- `shop.html` — Removed Fashion + Bags filter tabs (Trendsi-only); added **✦ Luxury Play** styled gold filter tab (`?filter=luxury`); removed Sneaky Link Bags nav links (header + footer)
- `index.html` — Removed all 3 Sneaky Link Bags nav links; replaced Sneaky Link Bags category tile with **Luxury Play** gold tile linking to `/shop.html?filter=luxury`
- `sneaky-link-bags.html` — Converted to instant redirect to `/shop.html?filter=luxury`
- `sw.js` — cache bumped to `ds-v11.7-1751980000`
- `CHANGELOG.md` — this entry

### Files Modified
`js/products.js` · `js/cart.js` · `shop.html` · `index.html` · `sneaky-link-bags.html` · `sw.js` · `CHANGELOG.md`

---

## v11.6 — Document Studio

**Released:** 2026-06-27
**Risk:** Low — additive only; no existing logic touched
**Rollback artifact:** `DrippingSecrets-v11.5.1-rollback-pre-v11.6.zip`

### Changes
- `admin.html` — New **Document Studio** tab added between Legal Vault and DS Academy in the sidebar nav
  - **DS Academy Certificate card** — live canvas preview updates as you type; custom Awarded To + Course fields; Download Certificate button
  - **DS Letterhead card** — brand-new luxury plum/gold print-ready letterhead; full 8.5×11 canvas with DS wordmark, gold header, emblem, ruled lines, signature block, footer; Download PNG
  - **Secrets Party Agreement card** — live formatted preview of the service agreement template; links to Party Bookings tab
  - **Legal Vault card** — summary + quick-link to Legal Vault tab
- `sw.js` — cache bumped to `ds-v11.6`
- `CHANGELOG.md` — this entry

### Files Modified
- `admin.html`
- `sw.js`
- `CHANGELOG.md`

---

## v11.5.1 — Events Page Dimi Glitch Fix
**Date:** 2026-06-26
**Risk:** Minimal — single CSS link added
**Files Modified:** `events.html`, `sw.js`
**Rollback:** `DrippingSecrets-v11.5.zip`

### Changes
- Fixed: Dimi actor rendering giant/unconstrained at bottom of events page — `dimi-actor.css` was missing from `<head>`; CSS link added (same root cause as wellness.html in v11.5)
- Bumped service worker cache to `ds-v11.5.1-1751916000`

---

## v11.5 — Back Office Login Fix · Dimi Character Bleed Fix
**Date:** 2026-06-27
**Type:** Critical bug fix — Low Risk
**Risk:** Low — no Firestore/auth/payment/checkout changes; two targeted fixes to JS syntax and CSS linking.
**Rollback artifact:** `DrippingSecrets-v11.4-rollback-pre-v11.5.zip`

### Summary
Two-issue fix batch. (1) Back Office login was completely broken after v11.4 — clicking "Sign In" did nothing. Root cause: unescaped apostrophes inside single-quoted JS string literals in the DS Academy quiz data (Module 10 & 11 questions containing contractions such as "hasn't", "she's", "don't", "it's") caused a JavaScript syntax error that prevented the entire 3,400-line script block from parsing — leaving `doLogin()` undefined. Additionally, several task/inventory/announcement action buttons in the SK Management and Ops sections had broken quote-nesting patterns (`''+id+''`) that also produced syntax errors; these were modernized to template literals. (2) Giant Dimi SVG character was rendering unconstrained below the footer on `wellness.html` — `dimi-actor.js` was loaded but `dimi-actor.css` was missing; without the CSS, `#dimi-stage` rendered as a full-width static block. Fix: added `<link rel="stylesheet" href="css/dimi-actor.css">` to wellness.html, which applies `display:none` by default and `position:fixed; width:80px` when activated.

### Changes

#### `admin.html`
- Escaped apostrophes in DS Academy Module 10 quiz question strings: `hasn\'t`, `she\'s`, `don\'t`, `3 D\'s`
- Escaped apostrophe in Module 11 quiz strings: `it\'s` (×2)
- Replaced broken `''+id+''` quote-nesting pattern with template literals in: moveAdminTask buttons (todo/inprogress/done), deleteAdminTask, editSK, deactivateSK, updateAdminRequest (approve/deny), deleteAdminAnnouncement, deleteSupplier, deleteCampaign, updateInventoryQty, toggleProductVisibility, alert button
- Back Office login now fully operational; `doLogin()` correctly defined and callable

#### `wellness.html`
- Added `<link rel="stylesheet" href="css/dimi-actor.css">` to `<head>`
- Dimi SVG character now constrained to 80px wide, fixed-position bottom-right; hidden by default until chat panel opens
- Giant character bleed below footer eliminated

#### `sw.js`
- Cache version bumped: `ds-v11.5-1751910000`

### Files Modified
- `admin.html`
- `wellness.html`
- `sw.js`
- `CHANGELOG.md`

---

## v11.4 — Flash Sale Cleanup · Wellness/Events Fix · Flyer Layout Rebuild · Academy College-Course Overhaul
**Date:** 2026-07-07
**Type:** Multi-fix batch — Low-to-Medium Risk
**Risk:** Low — no Firestore schema changes, no auth/payment/checkout changes, no customer-facing pricing changes; all fixes are content/JS rendering layer only.
**Rollback artifact:** `DrippingSecrets-v11.3-rollback-pre-v11.4.zip`

### Summary
Five-issue fix batch: (1) Removed expired flash-sale copy from `index.html` and stale June-20 references from Dimi's FAQ responses in `admin.html`. (2) Fixed wellness.html and events.html infinite-loading root cause — static content renders immediately; Firestore decorates in the background with a timeout fallback. (3) Rebuilt the social flyer wide layout (Twitter/FB) with editorial bleed composition (v4.0) — product image bleeds full-height right side and fades into background via gradient mask; text zone gets full breathing room; no more split-panel crowding. (4) DS Academy expanded from 9 → 11 modules with college-course metadata (ACAD_META), course codes, credit hours, prerequisites, learning objectives collapsible panel, and redesigned course viewer. (5) Certificate download now uses canvas-rendered PNG output. Dimi flash sale FAQ responses updated to reflect current DRIP10 promo.

### Changes

#### `index.html`
- Removed expired "Flash Sale — Ends June 20 / 30% Off" eyebrow and promotional copy
- Replaced with "Limited Time Only / 10% Off Your Order / Use code DRIP10" promo band with July 4 countdown
- Comment tag updated (no visible change; label only)

#### `js/wellness.js`
- Fixed infinite-loading bug: static wellness guide content now renders immediately on page load without waiting for Firestore
- Firestore decorates/enriches content in background with 5-second timeout fallback
- All six guide cards restored and visible on first render

#### `js/events.js`
- Fixed infinite-loading bug: static event content now renders immediately on page load
- Firestore decoration in background; `filterEvents()` called after render to apply any active filters
- Events page no longer hangs on Firestore availability

#### `js/social-flyer-gen.js`
- `_wide()` function rebuilt v3.1 → v4.0 (editorial bleed layout):
  - Product image now bleeds full-height on the right 50% of canvas
  - Left-edge gradient mask fades product into dark background (no hard card border)
  - Right-side vignette added for depth
  - Price ribbon: elegant rounded pill bottom-right over product zone (not inside a card box)
  - Headline gets full left 51% of width — proper font sizing with auto-shrink to fit, 2-line max
  - Caption limited to 1 line to prevent crowding
  - DRIP10 badge anchored at 78% of height (not competing with text)
  - Sparkles scattered left-biased across canvas for organic feel
  - URL + phone pinned to bottom-left with gold gradient

#### `admin.html`
- **ACAD_TOTAL** bumped 9 → 11
- **Module 10 — Sexual Wellness & Relationship Health (DSA-110, 2.0 hrs, prereqs: DSA-101, DSA-102):**
  - 5 lessons: Desire & Hormones, Products as Connection Tools, OARS Communication Framework, When to Refer, Self-Exploration & Confidence
  - Quiz: 5 questions
- **Module 11 — DS Events, Pop-Ups & Party Hosting (DSA-111, 1.5 hrs, prereqs: DSA-107, DSA-108):**
  - 4 lessons: Event Prep Checklist, Guest Experience Check-In to Close, Product Demos at Live Events, Handling the Unexpected
  - Quiz: 5 questions
- **ACAD_META** object added: course codes (DSA-101 through DSA-111), credit hours, prerequisites, and 4 learning objectives for all 11 modules
- **Course viewer template** upgraded to college-course format:
  - Header shows course code (DSA-1XX) in gold accent above title
  - Meta strip: Course Code · Credits · Estimated Time · Prerequisites · Topics
  - Collapsible Learning Objectives panel (open by default)
  - "Required Readings" section label with lesson completion counter
  - "Knowledge Check" section label above quiz block
- **Dimi FAQ** — stale June-20 flash sale responses replaced with DRIP10 promo messaging (2 occurrences)
- **Certificate download** — `acadBuildCertCanvas()` and `acadDownloadCert()` use canvas-rendered PNG output with proper name/course injection

#### `sw.js`
- Cache version bumped to `ds-v11.4-1751900000`

### Files Modified
- `index.html`
- `js/wellness.js`
- `js/events.js`
- `js/social-flyer-gen.js`
- `admin.html`
- `sw.js`

---

## v11.3 — Social Studio Visual Overhaul (Platform 2.0 / Addendum A)
**Date:** 2026-06-25
**Type:** Feature — Low Risk
**Risk:** Low — JS-only canvas rendering library; no Firestore schema changes, no auth changes, no commerce logic changes; Back Office social studio UI unchanged; public API signature preserved.
**Rollback:** `js/social-flyer-gen.js.bak-pre-v11.3`

### Summary
Full visual overhaul of the Social Flyer Generator to match the Platform 2.0 / Book III Addendum A luxury brand benchmark. Replaces rose/pink-primary palette with the correct metallic gold + deep purple + black brand identity used in Ashley's approved reference flyers.

### Changes
- **js/social-flyer-gen.js** — Rebuilt from scratch (v2 → v3):
  - Brand colors corrected: Metallic Gold is now the primary accent (was rose/pink)
  - Purple-black luxury glitter background with seeded sparkle particle field replaces blurred product hero
  - Gold metallic gradient text on all CTAs and alternating headline lines
  - Purple glitter gradient on alternating headline lines
  - DRIP10 promo badge (gold price-tag style) replaces expired flash-sale bar
  - Social handles footer: IG · FB · TikTok · X with icons and handles
  - Phone number (469) 200-9118 added to tall and wide layouts
  - Feature icon badges (Premium · Discreet Shipping · Secure & Private · Confidence) with canvas-drawn icons in gold rings
  - Dancing Script luxury font loaded for "Dripping Secrets" script accent
  - DS logo gold ring upgraded: animated metallic gradient + glow
  - Product card borders updated to gold with glow
  - Product price pills updated to gold gradient
  - "POV: you found the plug" bar removed entirely
  - Headline pool (6 variations) used when no headline supplied — fresh output per generation
  - "LUXURY · DISCRETION · CONFIDENCE · CONNECTION" footer pillar added
  - BRAND_TAGLINE "You deserve a secret this good." preserved
  - SIZES map and public API (`draw` / `drawToCanvas`) unchanged
- **sw.js** — Cache version bumped to `ds-v11.3-1751500801`

### Files Modified
- `js/social-flyer-gen.js`
- `sw.js`

---

## v11.2 — Brevo Marketing Email Integration
**Date:** 2026-06-25
**Type:** Feature — Low Risk
**Risk:** Low — new Netlify serverless function + UI toggles only; no commerce, no Firestore schema breakage, no auth flow changes; all Brevo calls are fire-and-forget and never block signup or UI.

### Summary
Adds a free marketing email opt-in/opt-out system powered by Brevo (free tier: unlimited contacts, 9,000 emails/month). New customers are auto-subscribed on account creation. Existing customers can opt in or out via a new "Marketing & Promotions" toggle in both the quick account modal and the full account portal.

### Changes
- **netlify/functions/brevo-sync.js** (NEW) — Serverless function; handles subscribe/unsubscribe calls to Brevo API v3; reads `BREVO_API_KEY` from Netlify environment variables; CORS-enabled; fire-and-forget safe.
- **account.html** — Added "Marketing & Promotions" toggle row in Notifications section; updated `saveNotifPref()` to save `marketingOptIn` to Firestore and sync to Brevo; loads `marketingOptIn` preference from Firestore on portal open.
- **js/auth.js** — Added `marketingOptIn: true` to Firestore on new account creation; added `updateMarketingPref()` function; added marketing toggle to quick account modal settings tab; loads `marketingOptIn` from Firestore in `openAccountModal()`.
- **sw.js** — Cache version bumped to `ds-v11.2-1751500800`.

### Files Modified
- `netlify/functions/brevo-sync.js` (new)
- `account.html`
- `js/auth.js`
- `sw.js`
- `CHANGELOG.md`

### Environment Variables Required
- `BREVO_API_KEY` — Brevo API key (already added to Netlify by Ashley)
- `BREVO_LIST_ID` — (optional) Brevo list ID to add contacts to; defaults to `2`

### Rollback
- Full-site rollback: `DrippingSecrets-v11.1-rollback-pre-v11.2.zip`

---

## v11.1 — Marquee & Promo Band Update (DRIP10)
**Date:** 2026-06-25
**Type:** Content — Low Risk
**Risk:** Low — text-only content update; no commerce logic, auth, or Firestore touched.

### Summary
Replaced expired flash sale messaging (30% off, ended June 20) with active DRIP10 promo across two homepage elements.

### Changes
- **Top announcement bar:** Updated to "10% OFF YOUR ORDER · USE CODE DRIP10 AT CHECKOUT · LIMITED TIME ONLY"
- **Homepage promo band:** Title updated to "10% Off Your Order"; subtitle updated to "Use code DRIP10 at checkout · Premium products · Discreet shipping"
- **Countdown:** End date extended to July 4, 2026 (11:59 PM)
- **Service worker cache:** Bumped to `ds-v11.1-1751500000`

### Files Modified
- `index.html`
- `sw.js`
- `CHANGELOG.md`

### Rollback
- Pre-patch snapshot: `index.html.pre-v11.1-rollback` (in ds-site/)
- Full-site rollback: `DrippingSecrets-v11.0.zip`

---

## v11.0 — SKOS Employee Portal + Back Office SKOS & Commerce & Growth Expansion
**Date:** 2026-06-25
**Type:** Feature — Major UI/UX Build
**Risk:** Medium — new Firestore collections added (employees, sk_tasks, sk_requests, sk_events, sk_recognition, sk_announcements, training_modules, suppliers, campaigns, seo_meta); no existing commerce, auth, checkout, or existing Firestore data touched.

### Summary
Full Secret Keepers OS (SKOS) live implementation in two parts:

**Part 1 — employee.html:** Rebuilt as the full SKOS Hub with 12 Firestore-backed tabs (Hub, Schedule, Queue, Tasks, Messages, Requests, Calendar, Training, Knowledge Base, Recognition, Profile, Ask Dimi). All existing auth/schedule/queue/profile logic preserved. Dark plum/gold brand, mobile-responsive.

**Part 2 — admin.html:** Injected two new nav sections with 12 new tabs — Secret Keepers OS (SK Directory, Task Management, Training Center, Performance Dashboard, Recognition Board, Request Management, SK Calendar, Announcements) and Commerce & Growth (Supplier Management, Inventory Center, Homepage Campaigns, SEO Center). All existing admin tabs and logic fully preserved. tabTitles updated. Cache bumped to ds-v11.0.

### New Firestore Collections
- `employees` — SK Directory (admin manages)
- `sk_tasks` — Tasks assigned to Secret Keepers
- `sk_requests` — Employee requests (time off, schedule changes, etc.)
- `sk_events` — Calendar events
- `sk_recognition` — Recognition board posts
- `sk_announcements` — Admin announcements to staff
- `training_modules` — Training modules and progress
- `suppliers` — Internal supplier registry (never customer-facing)
- `campaigns` — Homepage/marketing campaign banners
- `seo_meta` — Page-level SEO meta editor records

### Changes
- `employee.html` — Rebuilt as full SKOS Hub with 12 tabs
- `admin.html` — 12 new SKOS + Commerce & Growth tabs injected; 2 new nav sections added; tabTitles updated; duplicate nav deduped
- `sw.js` — Cache version bumped to ds-v11.0-1751000000
- `CHANGELOG.md` — Updated
- `DrippingSecrets-ProjectBible.md` — Updated

### Files Modified
- `employee.html`
- `admin.html`
- `sw.js`
- `CHANGELOG.md`
- `DrippingSecrets-ProjectBible.md`

### Rollback
Previous package: `DrippingSecrets-v10.0-rollback-pre-v11.zip`

---

## v10.0 — Platform 2.0 Master Specs + Asset Integration + Back Office Guide
**Date:** 2026-06-24
**Type:** Content / Documentation / Assets
**Risk:** Very Low — no commerce, auth, checkout, or Firebase logic touched; guide content and image assets only.

### Summary
Integrated all Platform 2.0 master specifications (Volumes 0–7) and the Adaptive-Dynamic Logo System into the Back Office How-To guide. Copied all 21 Dimi/DS brand assets into the site image tree.

### Changes
- `admin.html` — How-To Guide tab (`tab-howto`) fully rewritten to reflect all 9 master documents: Volume 0 (Platform Constitution), Volume 1 (Customer Experience 2.0), Volume 2 (Back Office Experience 2.0), Volume 3 (Dimi Intelligence 2.0), Volume 4 (SKOS), Volume 5 (Commerce & Growth Engine), Volume 6 (Technical Architecture), Volume 7 (Founder's Blueprint), and the Adaptive-Dynamic Logo System™. All 33 guide sections updated, with all existing operational guides preserved (orders, fulfillment, parties, staff onboarding, etc.).
- `images/dimi/` — 21 new Dimi/DS brand assets added: dimi-core.jpeg, dimi-ai-hologram.jpeg, dimi-product-expert.jpeg, dimi-personal-shopper.jpeg, dimi-customer-support.jpeg, dimi-order-processing.jpeg, dimi-shipping-tracker.jpeg, dimi-vip-concierge.jpeg, dimi-ai-research.jpeg, dimi-ai-event-host.jpeg, ds-luxury-ai-concierge.png, ds-email-signature.jpeg, ds-selfie.png, ds-content-creator.jpeg, ds-affiliate.jpeg, ds-customer-care.jpeg, ds-luxury-lifestyle.jpeg, ds-vip-event.jpeg, ds-social-content-creator.jpeg, ds-logistics.jpeg, ds-admin-desk.jpeg
- `sw.js` — Cache version bumped to ds-v10.0
- `CHANGELOG.md` — Updated with release metadata

### Files Modified
- `admin.html`
- `images/dimi/*.jpeg` (20 new files)
- `images/dimi/ds-luxury-ai-concierge.png` (1 new file)
- `images/dimi/ds-selfie.png` (1 new file)
- `sw.js`
- `CHANGELOG.md`

### Rollback
Previous package: `DrippingSecrets-v9.99.zip` (auth fix; restore if needed)
Rollback artifact: `rollback-auth-fix/DrippingSecrets-v9.98-rollback.zip`

---

## v9.99 — Auth Session Persistence Fix
**Date:** 2026-06-24
**Type:** Auth / Bug Fix
**Risk:** Very Low — auth flow improvement only; zero commerce, layout, or data impact. Customer accounts and data are stored in Firebase cloud and are unaffected by any deploy.

### Problem
Customer accounts appeared "lost" after site deploys. Root cause: Firebase Auth session persistence was not explicitly set, causing some browsers and PWA contexts to drop the sign-in session after a service worker update. Customer accounts were never deleted — they exist permanently in Firebase. Only the local session state was dropping.

### Changes
- `js/auth.js` — `initAuth()` now calls `setPersistence(LOCAL)` before setting up the `onAuthStateChanged` listener; guarantees sign-in sessions survive browser restarts, service-worker cache busts, and site deploys
- `js/auth.js` — `friendlyFirebaseError()` updated: added `auth/invalid-credential`, `auth/too-many-requests`, `auth/user-disabled`, and `auth/unauthorized-domain` error codes with clear, human-readable messages
- `account.html` — Account portal's `DOMContentLoaded` auth init also calls `setPersistence(LOCAL)` for consistency (this page manages its own Firebase auth listener independently of `auth.js`)

### Manual Firebase Console Step Required (One-Time)
Firebase Authentication must whitelist the live domain or sign-ins from the site will be blocked:
> Firebase Console → Authentication → Settings → Authorized Domains → Add `drippingsecrets.com`

### Files Modified
`js/auth.js`, `account.html`

### Rollback
Rollback to v9.98: restore from `DrippingSecrets-v9.98.zip`

---

## v9.98 — Brand Tagline Scrub + New Slogan
**Date:** 2026-06-24
**Type:** Brand / Content
**Risk:** Minimal — copy changes only; zero commerce, auth, layout, or functionality impact.

### Changes
- Retired old tagline "Curated by a secret keeper to help you keep her" sitewide
- Replaced with new official tagline: **"You deserve a secret this good."**
- 32 total replacements across HTML, JS, manifest, and markdown files
- "Secret Keeper" as employee/staff role identity intentionally preserved in all functional contexts (employee portal, staff service references, account greetings)
- Service worker cache bumped to `ds-v9.98-1790250000`

### Files Modified
`index.html`, `about.html`, `shop.html`, `admin.html`, `sneaky-link-bags.html`, `services.html`, `booking.html`, `boxes.html`, `bundles.html`, `contact.html`, `machines.html`, `affiliates.html`, `new-arrivals.html`, `best-sellers.html`, `beauty-wellness.html`, `beginner-friendly.html`, `gifts-under-50.html`, `manifest.json`, `js/dimi.js`, `js/social-flyer-gen.js`, `js/video-gen.js`, `sw.js`, `CHANGELOG.md`

### Rollback
Rollback to v9.97: restore from `DrippingSecrets-v9.97.zip`

---

## v9.97 — GSC HTML File Verification
**Date:** 2026-06-23
**Type:** SEO / Verification
**Risk:** Minimal — adds one static verification file; zero commerce, auth, or layout impact.

### Changes
- Added `googlefadaf8bbba048c8e.html` to site root for Google Search Console HTML file verification
- Service worker cache bumped to `ds-v9.97-1790200000`

### Files Modified
`googlefadaf8bbba048c8e.html`, `sw.js`, `CHANGELOG.md`

### Rollback
Rollback to v9.96: restore from `DrippingSecrets-v9.96.zip`

---

## v9.96 — Google Search Console Verification
**Date:** 2026-06-23
**Type:** SEO / Verification
**Risk:** Minimal — single meta tag added to `<head>`; zero commerce, auth, or layout impact.

### Changes
- Added `<meta name="google-site-verification" content="LE7tI0Wrg4Ir11aQ-1lMwiL-Wi78rngbmoJ4Bh6GzR4" />` to `index.html` (line 6, after viewport meta) for Google Search Console property verification
- Service worker cache bumped to `ds-v9.96-1790100000`

### Files Modified
`index.html`, `sw.js`, `CHANGELOG.md`

### Rollback
Rollback to v9.95: restore from `DrippingSecrets-v9.95.zip`

---

## v9.95 — Revenue Command Dashboard + Full Backlog + Expansion Sprints
**Date:** 2026-06-23
**Type:** Major Expansion
**Risk:** Medium — all new pages/features; existing checkout, auth, Dimi chat, and commerce untouched.

### Changes
- **v9.85** Events Platform — `events.html`, `css/events.css`, `js/events.js` (calendar, RSVP, ticketing, admin tools)
- **v9.86** Wellness Hub — `wellness.html`, `css/wellness.css`, `js/wellness.js` (content center, search, categories, favorites)
- **v9.87** Vendor Marketplace — `vendors.html`, `css/vendors.css`, `js/vendors.js` (vendor profiles, directory, applications, admin approval)
- **v9.88** PWA Experience — `offline.html` (new), `sw.js` updated, `manifest.json` enhanced, `js/pwa.js` +bottom nav +transitions
- **v9.89** Review Collection + Email Capture — email signup section added to `index.html`; `pinterest-content.md` (pin-ready copy/graphics)
- **v9.90** Dripping Subscriptions — `subscriptions.html`, `css/subscriptions.css`, `js/subscriptions.js`; 4 plans (Self Care / Couples / Luxe / Surprise Me); Subscribe, Pause, Skip, Cancel, Upgrade, Downgrade; Firestore: `subscriptions`
- **v9.91** Dimi Personal Shopper — `js/dimi-shopper.js` (new companion module; smart recommendations, bundle generator, cart rescue, analytics); existing `dimi.js` untouched
- **v9.92** Secrets Society — `community.html`, `css/community.css`, `js/community.js`; 5 areas, posts/comments/reactions/following/saved; moderation tools; Firestore: `community`
- **v9.93** Creator Marketplace — `creator-marketplace.html`, `css/creator-marketplace.css`, `js/creator-marketplace.js`; storefronts, collections, referral tracking, rankings, admin approval; Firestore: `creator_marketplace`
- **v9.94** Media Hub — `media.html`, `css/media.css`, `js/media.js`; articles/guides/interviews/video/podcast, categories, tags, search, author profiles, admin publishing; Firestore: `media`
- **v9.95** Revenue Command Dashboard — `revenue-dashboard.html` (CEO one-screen dashboard); revenue today/week/month, subscriptions MRR, new members, affiliate sales, creator sales, Dimi performance, community growth, top products, top categories, recent orders; admin-access gated; opens from Back Office sidebar
- **Admin.html** — 5 new sidebar nav items + 4 new tab panels (Subscriptions, Community, Creator Marketplace, Media Hub); Revenue Command opens in new tab
- **Account.html** — Subscriptions tab added with current plan, next shipment, shipment history, pause/skip/cancel/upgrade actions
- **sitemap.xml** — 8 new URLs added for expansion sprint pages
- **sw.js** — cache bumped to `ds-v9.95-1790000000`

### Files Modified
`events.html`, `css/events.css`, `js/events.js`, `wellness.html`, `css/wellness.css`, `js/wellness.js`, `vendors.html`, `css/vendors.css`, `js/vendors.js`, `offline.html`, `sw.js`, `manifest.json`, `js/pwa.js`, `index.html`, `pinterest-content.md`, `subscriptions.html`, `css/subscriptions.css`, `js/subscriptions.js`, `js/dimi-shopper.js`, `community.html`, `css/community.css`, `js/community.js`, `creator-marketplace.html`, `css/creator-marketplace.css`, `js/creator-marketplace.js`, `media.html`, `css/media.css`, `js/media.js`, `revenue-dashboard.html`, `admin.html`, `js/onboarding.js`, `account.html`, `sitemap.xml`, `CHANGELOG.md`

### Firestore Collections Used
`subscriptions`, `community`, `creator_marketplace`, `media`, `dimi_analytics`, `email_subscribers`

### Rollback
Restore from `/tasklet/agent/home/ds-site-rollback-v9-94/` (621 files — full pre-v9.95 site snapshot)

---

## v9.84 — Creator Portal Sprint (Sprint H)

**Date:** 2026-06-24
**Risk:** Low — new files only; no commerce, cart, auth, or Dimi logic touched
**Rollback artifact:** dripping-secrets-v9.83.zip

### Changes
- **NEW** `creators.html` — public Creator Program landing page: hero, how-it-works, 6 perks, 4 tier cards (Seedling/Blooming/Flourishing/Elite), application form
- **NEW** `js/creator-portal.js` — full creator system: public application (Firestore `creators` collection), referral click/conversion tracking (`?cr=` param), auth-gated account portal dashboard (stats, referral link, content submission, earnings/payouts), admin management panel (load, filter, approve/reject/suspend/reinstate, content review modal)
- **NEW** `css/creator-portal.css` — complete styles: hero, tier badges, how-it-works, perks grid, tier cards, application form, account portal tab, earnings table, admin creator cards, content modal; fully mobile-responsive
- **UPDATED** `account.html` — added Creator portal tab button + `#tab-creator` panel; on-demand load via `DSCreator.initPortalTab()`; added `memberships.css`, `memberships.js`, `creator-portal.css`, `creator-portal.js` to head/scripts
- **UPDATED** `admin.html` — added Creators nav item (with pending badge), `#tab-creators` panel (filter row + creator cards), content review modal, `adminSetCreatorFilter()`, `creator-portal.js` and `creator-portal.css` references; `switchTab('creators')` triggers `loadAdminCreators()`
- **UPDATED** `sitemap.xml` — added `creators.html` (27 URLs total)
- **UPDATED** `sw.js` — bumped to `ds-v9.84-1783400000`

### Files Modified
`creators.html` · `js/creator-portal.js` · `css/creator-portal.css` · `account.html` · `admin.html` · `sitemap.xml` · `sw.js` · `CHANGELOG.md`

### Firestore Collections
- `creators` — creator profiles (docId, handle, email, niche, platform, status, tier, earnings, stats)
- `creators/{id}/content` — content submissions (platform, type, title, url, impressions, clicks, status)
- `creators/{id}/payouts` — payout requests (amount, status, requestedAt)
- `creators/{id}/clickLog` — daily click tracking

---

## v9.83 — SEO + Blog + Memberships Batch
**Date:** 2026-06-24
**Risk:** Low-Medium — all additive; no existing commerce, checkout, auth, Dimi behavior, or Firestore collections touched
**Rollback:** rollback-v9.82-checksums.txt (pre-batch state)

### Bug Fix — Dimi Glitch Friend Removed
- `css/dimi-actor.css` — `#dimi-stage` default changed to `display:none`; actor only becomes `display:block` when chat panel is open (toggled via `js/dimi.js` `togglePanel()`)
- `js/dimi.js` — `togglePanel()` now sets `_actorStage.style.display = open ? 'block' : 'none'`

### SEO Sprint — Crawlability Infrastructure
- NEW `sitemap.xml` — 26 URLs; all pages, collection pages, and blog posts; Google/Bing-ready
- NEW `robots.txt` — allows all crawlers, blocks portals (/admin, /employee, /account, /affiliates, cart/checkout params); includes Sitemap reference
- NEW `js/seo.js` — injects Product and Article JSON-LD schema into shop and blog pages; canonical tag manager; OG image fallback; structured data for organization
- NEW `js/product-faqs.js` — FAQ accordion builder for top 20 products; injects JSON-LD FAQPage schema; renders on product pages via `data-product-id`
- NEW `css/collections.css` — shared styles for all 10 collection pages, blog index grid, blog post hero, blog article body, blog CTA box; mobile-responsive

### SEO Sprint — 10 Collection Pages
- NEW `best-sellers.html` — Best Sellers SEO collection page
- NEW `new-arrivals.html` — New Arrivals SEO collection page
- NEW `gifts-under-25.html` — Gifts Under $25 SEO collection page
- NEW `gifts-under-50.html` — Gifts Under $50 SEO collection page
- NEW `trending.html` — Trending Products SEO collection page
- NEW `customer-favorites.html` — Customer Favorites SEO collection page
- NEW `couples-play.html` — Couples Play SEO collection page
- NEW `beginner-friendly.html` — Beginner-Friendly SEO collection page
- NEW `date-night.html` — Date Night Essentials SEO collection page
- NEW `beauty-wellness.html` — Beauty & Wellness SEO collection page
- All 10: canonical, OG, Twitter Card, JSON-LD, breadcrumbs, category grid rendering via products.js

### SEO Sprint — Blog (5 Buyer-Intent Posts)
- NEW `blog/index.html` — Blog landing page with card grid
- NEW `blog/best-gifts-for-couples.html` — "Best Gifts for Couples: Ideas That Actually Land" (tag: Gifting)
- NEW `blog/unique-birthday-gift-ideas.html` — "Unique Birthday Gift Ideas for Her" (tag: Gifting)
- NEW `blog/romantic-date-night-ideas.html` — "Romantic Date Night Ideas for Couples at Home" (tag: Date Night)
- NEW `blog/best-products-for-beginners.html` — "Best Intimate Wellness Products for Beginners" (tag: Guide)
- NEW `blog/top-trending-products.html` — "Top Trending Intimate Wellness Products This Year" (tag: Trending)
- All 5: Article JSON-LD schema, FAQPage JSON-LD, OG/Twitter Card, canonical, cross-links to shop

### Sprint G — Membership Program (v9.83)
- NEW `js/memberships.js` — `DS_MEMBERSHIPS` module: four tiers (Free/Insider/VIP/Elite); `getMembership()` / `setMembership()` to Firestore `memberships` collection; `renderAccountTab()` for customer portal; `renderAdminPanel()` for Back Office with stats, search/filter, upgrade/downgrade
- NEW `css/memberships.css` — membership account tab styles: tier card, progress bar, features list, tiers comparison grid; mobile-responsive
- `account.html` — new "Membership" portal tab button; `#tab-membership` panel; `memberships.js` + `memberships.css` added; `switchPortalTab()` wired to lazy-render `DS_MEMBERSHIPS.renderAccountTab()`
- `admin.html` — new "Memberships" nav item; `#tab-memberships` panel with `admin-memberships-container`; `memberships.js` + `memberships.css` added; `switchTab()` lazy-renders `DS_MEMBERSHIPS.renderAdminPanel()`

### Service Worker
- `sw.js` — cache version bumped to `ds-v9.83-1783200000`

### Files Modified
`css/dimi-actor.css`, `js/dimi.js`, `sitemap.xml`, `robots.txt`, `js/seo.js` (NEW), `js/product-faqs.js` (NEW), `css/collections.css` (NEW), `css/memberships.css` (NEW), `js/memberships.js` (NEW), `best-sellers.html` (NEW), `new-arrivals.html` (NEW), `gifts-under-25.html` (NEW), `gifts-under-50.html` (NEW), `trending.html` (NEW), `customer-favorites.html` (NEW), `couples-play.html` (NEW), `beginner-friendly.html` (NEW), `date-night.html` (NEW), `beauty-wellness.html` (NEW), `blog/index.html` (NEW), `blog/best-gifts-for-couples.html` (NEW), `blog/unique-birthday-gift-ideas.html` (NEW), `blog/romantic-date-night-ideas.html` (NEW), `blog/best-products-for-beginners.html` (NEW), `blog/top-trending-products.html` (NEW), `account.html`, `admin.html`, `sw.js`

---

## v9.82 — Six-Sprint Enhancement Batch (v9.77–v9.82)
**Date:** 2026-06-24
**Risk:** Medium — large additive batch; all new files; existing commerce/auth/checkout preserved
**Rollback:** rollback-v9.76-checksums.txt (pre-batch state)

### Sprint A — Order Pipeline Validation (v9.77)
- NEW `js/admin-testing.js` — DS-TEST-XXXXXXXX order/customer/review generator, `isTest:true` flag, Firestore-isolated, normal workflow triggers, stats + activity log + delete-all
- `admin.html` — new "Testing" nav tab + `#tab-testing` panel (stats row, 3 generator buttons, activity log, test-orders table)

### Sprint B — Conversion Improvements (v9.78)
- NEW `js/recommendations.js` — Recently Viewed (localStorage), Also Bought, Frequently Bought Together, Recommended For You, Cart Upsell widgets; all read from products.js catalog; no external APIs; no inventory mutation
- NEW `js/exit-intent.js` — mouse-leave + mobile scroll-up exit detector; popup with newsletter/promo offer; stores `newsletter_leads` in Firestore with `source: 'exit-intent'`; 72-hr localStorage gate
- NEW `css/recommendations.css` — widget carousel styles, mobile-responsive
- `shop.html`, `index.html`, `boxes.html`, `bundles.html`, `sneaky-link-bags.html` — recommendations + exit-intent scripts added

### Sprint C — Dimi Concierge Intelligence (v9.79)
- NEW `js/dimi-memory.js` — `DS_MEM` module: `localStorage` conversation memory, returning-visitor detection, `welcomeBack()` greeting, `buildContext()` for prompt injection, `checkoutHelp()` intercept for checkout/payment/shipping questions, `trackQuestion()` for session memory
- `js/dimi.js` — `sendMessage()` now calls `DS_MEM.trackQuestion()`, runs `DS_MEM.checkoutHelp()` local intercept before API call, injects `DS_MEM.buildContext()` into AI context; `togglePanel()` on open: shows welcome-back message if returning + history empty, fires `DimiActor.setState('guiding')`
- All 11 Dimi pages — `dimi-memory.js` added before `dimi.js`

### Sprint D — Dripping Rewards (v9.80)
- NEW `js/rewards.js` — `DS_REWARDS` module: `rewards` Firestore collection; points earn/redeem; tier system (Petal/Bloom/Royal/Legend); dashboard renderer; admin point-adjustment; welcome-back + birthday bonus hooks
- NEW `css/rewards.css` — dashboard card styles, tier badge styles
- `account.html` — Rewards portal tab + `#tab-rewards` panel, `rewards.js` added, `switchPortalTab` wired to `DS_REWARDS.renderDashboard()`
- `admin.html` — new "Rewards" nav tab + `#tab-rewards` admin panel (stats, adjust-points form, members table); inline `loadRewardsAdmin()` + `adminAdjustPoints()` wired

### Sprint E — Affiliate Portal 2.0 (v9.81)
- NEW `js/affiliate-portal.js` — `DS_AFF` module: `affiliates` Firestore collection; auth-gated dashboard; referral link gen + click/conversion tracking; commission ledger; payout requests; admin center in back-office
- NEW `css/affiliate-portal.css` — portal dashboard styles
- `affiliates.html` — `#aff-portal-section` auth-gated dashboard injected before footer; `affiliate-portal.js` + CSS added; auth listener shows portal on login, hides form

### Sprint F — Command Center (v9.82)
- NEW `js/command-center.js` — `DS_COMMAND` module: read-only analytics dashboards for revenue, orders, products, customers, affiliates, and Dimi; mobile-friendly cc-* grid layout
- `admin.html` — new "Command Center" nav tab + `#tab-commandcenter` panel; loads on tab open (lazy); cc-* CSS classes added to inline style block; all three new script tags added before `</body>`

### Service Worker
- `sw.js` — cache bumped to `ds-v9.82-1782991000`

### Files Modified
`js/admin-testing.js` (new), `js/recommendations.js` (new), `js/exit-intent.js` (new), `js/dimi-memory.js` (new), `js/rewards.js` (new), `js/affiliate-portal.js` (new), `js/command-center.js` (new), `css/recommendations.css` (new), `css/rewards.css` (new), `css/affiliate-portal.css` (new), `admin.html`, `account.html`, `affiliates.html`, `js/dimi.js`, `about.html`, `booking.html`, `boxes.html`, `bundles.html`, `contact.html`, `index.html`, `machines.html`, `services.html`, `shop.html`, `sneaky-link-bags.html`, `sw.js`, `CHANGELOG.md`

---

## v9.76 — Dimi Actor Framework
**Date:** June 23, 2026
**Risk:** Low — additive new files; no existing commerce, auth, or layout touched
**Rollback:** ds-v9.75 zip

### Changes
- NEW `css/dimi-actor.css` — full character stage: idle bob, think tilt+dots, speaking bob, guiding lean+point, success jump, warning shake, celebrating dance+sparkles, walk-in stride, mobile scaling
- NEW `js/dimi-actor.js` — DimiActor state machine: 7 states, 5 emotions, SVG character (hand-drawn inline), emotion engine (eyebrows/mouth/blush/sweat/squint per state), page-aware walk-in, proactive greeting bubble, blink engine, eye direction, Web Speech API TTS, custom event bindings (`dimi:success`, `dimi:warning`, `dimi:guide`), cart count celebration watcher
- `js/dimi.js` — wired DimiActor into all TTS paths: `showTyping()` → `thinking` state; ElevenLabs play → `speaking`; ElevenLabs ended → `idle`; `_wssSpeak()` upgraded to route through `DimiActor.speak()`; voice-off path still triggers brief visual acting
- `js/cart.js` — `showOrderReceipt()` now dispatches `dimi:success` → triggers success→celebrate→idle sequence
- All 11 Dimi HTML pages — `dimi-actor.css` added to `<head>`, `dimi-actor.js` added before `dimi.js`
- `sw.js` — cache bumped to `ds-v9.76`

### Files Modified
`css/dimi-actor.css` (new), `js/dimi-actor.js` (new), `js/dimi.js`, `js/cart.js`, `index.html`, `shop.html`, `about.html`, `account.html`, `booking.html`, `boxes.html`, `bundles.html`, `contact.html`, `machines.html`, `services.html`, `sneaky-link-bags.html`, `sw.js`, `CHANGELOG.md`

---

## v9.75 — Dimi Context Awareness
**Date:** 2026-06-22
**Risk:** Low
**Rollback:** DrippingSecrets-v9.74.zip

**Changes:**
- Enhancement Sprint 1: Dimi Context Awareness

**Files Modified:**
- `js/dimi.js`
- `netlify/functions/dimi-chat.js`
- `index.html`, `shop.html`, `about.html`, `account.html`, `booking.html`, `boxes.html`, `bundles.html`, `contact.html`, `machines.html`, `services.html`, `sneaky-link-bags.html`
- `sw.js`

**Details:**
- `window.dimiContext` published per page: `{ page, category, product, cartItems }`
- `dimi.js` reads structured context; watches for category filter clicks, product modal opens, and cart count changes — updates context dynamically without page reload
- Backend `dimi-chat.js` receives structured context and injects page/category/product/cart-aware guidance into the system prompt
- Context-specific opening behavior: Shop → "Looking for something specific?", Roses → Rose collection pitch, Party → Secrets Party pitch, Checkout → shipping help
- Fallback to DOM-based detection for any page/state not explicitly set

---

## v9.74 — Accessibility Sprint 2
**Date:** 2026-06-22
**Risk:** Low
**Rollback:** DrippingSecrets-v9.73.zip

**Changes:**
- Accessibility Sprint 2: ARIA labels, heading hierarchy, nav landmarks

**Files Modified:**
- `js/cart.js`
- `js/auth.js`
- `about.html`
- `account.html`
- `admin.html`
- `employee.html`
- `index.html` (+ all 13 pages with main nav)
- `sw.js`

**Details:**
- Cart badge button: dynamic `aria-label` updates ("Open cart, N items") + `aria-live="polite"` on badge
- Wishlist badge: dynamic `aria-label` updates ("My Account, N wishlist items") + `aria-live="polite"` on badge
- `about.html`: hero heading promoted to `<h1>`, sections to `<h2>`
- `account.html`: login heading `<h2>` → `<h1>`; portal section headings demoted to `<h2>`
- `admin.html`: login heading `<h2>` → `<h1>`
- `employee.html`: portal heading `<h2>` → `<h1>`; tab section headings `<h1>` → `<h2>`
- `aria-label="Main navigation"` added to all 13 public-page nav elements
- `aria-label="Back Office navigation"` added to admin sidebar nav
- SW bumped to `ds-v9.74`

---

## v9.73 — Alert Webhook Reroute
**Date:** 2026-06-22
**Risk:** Low
**Rollback:** DrippingSecrets-v9.72.zip

**Changes:**
- Rerouted real-time order/stock/booking alerts from undeployed Netlify function to Tasklet webhook

**Files Modified:**
- `js/cart.js`
- `sw.js`

**Details:**
- `DS_ALERT_WEBHOOK` in `cart.js` updated: `/.netlify/functions/dimi-alert` → Tasklet public webhook URL
- Root cause confirmed: Netlify Functions were never deployed (file-digest API handles static assets only; function bundling requires CLI or zip deploy)
- All alert types (new order, low stock, sold out, booking, payment) now fire correctly to Tasklet
- Scheduled automation triggers (briefing, social, analytics) confirmed running via Tasklet fallback
- SW bumped to `ds-v9.73`

---

## v9.72 — Back Office Auth Fix
**Date:** 2026-06-21
**Risk:** Low
**Rollback:** DrippingSecrets-v9.71.zip

**Changes:**
- Orders now visible in Back Office after Firebase auth race condition fix

**Files Modified:**
- `admin.html`

**Details:**
- Orders tab was not rendering because Firestore queries fired before auth state resolved
- Fixed auth initialization order; orders, analytics, and team data now load correctly on Back Office entry

---

## v9.71 — Netlify Free Plan Recovery
**Date:** 2026-06-20
**Risk:** Low
**Rollback:** DrippingSecrets-v9.70.zip

**Changes:**
- Site restored after Netlify free-plan bandwidth limit paused it

**Files Modified:**
- None (plan upgrade — no code changes)

**Details:**
- Ashley upgraded Netlify plan; site returned to HTTP 200
- No source file changes in this release

---

## v9.70 — Tasklet Automation Triggers
**Date:** 2026-06-19
**Risk:** Low
**Rollback:** DrippingSecrets-v9.69.zip

**Changes:**
- Tasklet automation triggers created for daily briefing, social batch, monthly analytics

**Files Modified:**
- None (Tasklet-side configuration only)

**Details:**
- Daily 9 AM SMS trigger: Ashley's briefing fallback (`cti_yq15nx7rr5ag1n0ftst5`)
- Daily 10 AM CT trigger: Social batch email (`cti_na8wdx9pvnxf87ncbpgk`)
- 1st-of-month 2 PM CT trigger: Monthly analytics + tax reminder
- Public webhook created for alert routing

---

## v9.69 — Cart Delete Fix
**Date:** 2026-06-18
**Risk:** Low
**Rollback:** DrippingSecrets-v9.68.zip

**Changes:**
- Cart item delete button (×) clipped in checkout view

**Files Modified:**
- `js/cart.js`

**Details:**
- ✕ icon added to delete button; `flex-shrink: 0` applied; overflow clipping resolved in cart item row

---

## v9.68 — Cloudinary CDN Migration
**Date:** 2026-06-14
**Risk:** Medium
**Rollback:** DrippingSecrets-v9.61.zip

**Changes:**
- All 979 Trendsi product images migrated to Cloudinary CDN; deploy zip reduced from ~350 MB to 0.42 MB

**Files Modified:**
- `js/products.js`
- `404.html` (added)
- `sw.js`

**Details:**
- All Trendsi product image URLs in `products.js` updated to Cloudinary CDN (dc302zzst)
- Zero local image references remain for Trendsi catalog
- Product detail modal confirmed: multi-image carousel, size selector, descriptions, compare price
- `404.html` added
- 35/35 integrity checks passed
- Partial live checkout verified: cart, checkout open, UPS live rates, $50 local delivery lock, payment method display
- Known outstanding: PayPal/Firestore/email/SMS path unverified pending real test purchase

---

## v9.61 — Physical Product Rebuild
**Date:** 2026-05-30
**Risk:** Medium
**Rollback:** DrippingSecrets-v9.60.zip

**Changes:**
- All 16 Ashley on-hand physical products rebuilt with correct supplier SKU image folders; ID 93 added

**Files Modified:**
- `js/products.js`
- `sw.js`
- All HTML pages (skip-nav stripped sitewide)

**Details:**
- Correct SKU image folders: MM-D01, BYYJ-156, ZG001, D018-M-LED, PZ-809, QS-D001-S, QS-D001-SZ, QYS-058, XL095, MN002, CDX-4, BJD-010, USK-C30, TB-016, XL091, BJD-012
- ID 93 added (Purple Trouble)
- Skip-nav stripped from all pages per Ashley's standing order

---

## v9.60 — Product Modal Gallery Expansion
**Date:** 2026-05-28
**Risk:** Low
**Rollback:** DrippingSecrets-v9.49.zip

**Changes:**
- 139 product descriptions added; product modal gallery wired; DS Academy expanded to 9 modules

**Files Modified:**
- `js/products.js`
- `admin.html`
- `sw.js`

**Details:**
- Product detail modal: multi-image gallery added for all products with multiple images
- 139 product descriptions written and added to `products.js`
- Back Office login JS syntax error fixed
- DS Academy: Module 9 (Adult Toy Use Literacy) added; `ACAD_TOTAL` = 9

---

## v9.49 — Accessibility Sprint 1 + Twitter OAuth Fix
**Date:** 2026-05-10
**Risk:** Low
**Rollback:** DrippingSecrets-v9.48.zip

**Changes:**
- Accessibility Sprint 1: focus states, skip navigation, reduced motion, contrast improvements

**Files Modified:**
- `css/style.css`
- `index.html`, `admin.html`, `employee.html`, `account.html`, `shop.html`
- `js/auth.js`
- `sw.js`

**Details:**
- Skip-nav link added (later removed in v9.61 per Ashley's order)
- Focus ring styles added sitewide
- `prefers-reduced-motion` media query honors system setting
- Contrast ratio improvements on muted text and placeholder colors
- Cart close button `aria-label` added
- Employee nav landmark labeled
- Twitter (X) OAuth fixed: Client Secret Basic auth method; social status dot fixes
- Customer login screen text cleanup
- Admin Sign Out moved to topbar
- SW bumped to `ds-v9.49`

---

## v9.48 — DS Academy LMS
**Date:** 2026-05-05
**Risk:** Medium
**Rollback:** DrippingSecrets-v9.47.zip

**Changes:**
- Full DS Academy LMS rebuild inside Back Office

**Files Modified:**
- `admin.html`
- `sw.js`

**Details:**
- 4 inner tabs: Courses, My Progress, Certificates, Team Progress
- 8 modules with full lesson content and 5-question quizzes (80% to pass)
- Per-module downloadable certs + Master "Secret Keeper Certification" on all 8 complete
- Firestore-backed per Firebase UID (`academy_progress/{uid}`)
- Cert modal: `display:none` baked inline (admin.html uses inline CSS only)

---

## v9.47 — Dimi Brain (SQL Schema)
**Date:** 2026-04-28
**Risk:** Low
**Rollback:** DrippingSecrets-v9.46.zip

**Changes:**
- Dimi SQL database wired; How-To Guide added; Team tab walkthrough card

**Files Modified:**
- `admin.html`

---

## v9.46 — Three-Tier Portal System
**Date:** 2026-04-22
**Risk:** Medium
**Rollback:** DrippingSecrets-v9.45.zip

**Changes:**
- Full three-tier auth separation: admin / employee / customer

**Files Modified:**
- `admin.html`, `employee.html`, `account.html`

**Details:**
- `admin.html`: Ashley-only, password `SecretKeeper2024`, full Back Office
- `employee.html`: Secret Keepers only — Firebase email/password, role="employee"; My Schedule, My Queue, My Profile tabs only; can't access anything admin
- `account.html`: customers only, completely separate from admin/employee auth
- iOS Safari PWA hamburger fix applied
- `account.html` login heading fixed

---

## v9.45 — Dimi Persona Canon
**Date:** 2026-04-18
**Risk:** Low
**Rollback:** DrippingSecrets-v9.44.zip

**Changes:**
- Millennial/Gen Y vibe layer canonized; Dimi persona updated across all 4 instruction files

**Files Modified:**
- `js/dimi.js`
- `netlify/functions/dimi-chat.js`

---

## v9.44 — Logo Fix + Academy Cert + AI Visual Fixes
**Date:** 2026-04-10
**Risk:** Low
**Rollback:** (prior zip)

**Changes:**
- Back Office login logo path fixed; Academy cert modal display fixed; DALL-E 3 deprecated param removed

**Files Modified:**
- `admin.html`
- `netlify/functions/generate-image.js`

**Details:**
- Login logo path: `uploads/Vector.png` → `/images/logo.png`; `#adminApp { display:none }` default
- `logo.png` resized from 3464×3464 / 8.2 MB → 400×400 / 189 KB
- Academy cert modal: `.acad-cert-modal { display:none }` inline; only shows `.open`
- DALL-E 3: `response_format` param removed (deprecated); prompts sanitized for content policy
- Error toasts now show actual OpenAI error message

---

*This file is updated after every deploy. Do not edit manually — Tasklet maintains it.*

