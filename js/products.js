// ============================================================
// PRODUCTS.JS — single assembled file
// Physical products: IDs 1–13, 91, 92, 93 (16 Ashley on-hand items)
// DO NOT add/remove physical products without running integrity check.
// LOCKED COUNT: 16 items — integrity check floor ≥13 physical.
// ============================================================

// ── PHYSICAL PRODUCTS (IDs 1–13, 91, 92, 93) ────────────────
// ============================================================
// PHYSICAL PRODUCTS — Ashley ships via UPS | DFW same-day $50+
// ⚠️  DO NOT EDIT without running integrity check after.
// ============================================================
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "The Machine",
    tagline: "Hands-Free. Limitless.",
    description: "Fully automatic thrusting sex machine built on a heavy-duty metal + ABS frame. Six interchangeable attachments, plug-in AC power (no batteries dying mid-session), and an 85° adjustable angle so you dial in the perfect position. The strongest thing in the room.",
    details: ["Material: Metal + ABS", "Color: Black", "6 attachments included", "85° angle adjustment", "Plug-in power (AC 100–240V)", "Item size: 14.58\" × 5.91\" × 7.09\"", "Not waterproof — keep electronics dry"],
    price: 183.99,
    comparePrice: 508.99,
    image: "images/products/MM-D01/MM-D01-1.jpg",
    images: [
      "images/products/MM-D01/MM-D01-1.jpg",
      "images/products/MM-D01/MM-D01-2.jpg",
      "images/products/MM-D01/MM-D01-3.jpg",
      "images/products/MM-D01/MM-D01-4.jpg",
      "images/products/MM-D01/MM-D01-5.jpg",
      "images/products/MM-D01/MM-D01-6.jpg",
      "images/products/MM-D01/MM-D01-7.jpg",
      "images/products/MM-D01/MM-D01-8.jpg",
      "images/products/MM-D01/MM-D01-9.jpg"
    ],
    category: "machines",
    badge: "Best Seller",
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 2,
    name: "The Piper",
    tagline: "Triple Threat. One Toy.",
    description: "Three sensations in one — thrusting, rotating, and heating — with 10 speed combinations and a traditional remote control so you or your partner stays in charge. Medical-grade silicone body in warm brown, USB magnetic charging, fully waterproof. Includes a fabric bag for discreet storage.",
    details: ["Material: Medical Grade Silicone + ABS", "Color: Brown", "10 speeds", "Vibrating + Thrusting + Rotating + Heating", "Total length: 8.67\" / Insertable: 6.30\"", "Diameter: 1.58\"", "Remote controlled (includes 27A 12V battery)", "USB Magnetic Charging", "Waterproof", "Includes: vibrator, charger, remote, fabric bag"],
    price: 88.99,
    comparePrice: 158.99,
    image: "images/products/BYYJ-156/BYYJ-156-1.jpg",
    images: [
      "images/products/BYYJ-156/BYYJ-156-1.jpg",
      "images/products/BYYJ-156/BYYJ-156-2.jpg",
      "images/products/BYYJ-156/BYYJ-156-3.jpg",
      "images/products/BYYJ-156/BYYJ-156-4.jpg",
      "images/products/BYYJ-156/BYYJ-156-5.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 3,
    name: "Always-On Strap",
    tagline: "Your Body. Your Rules.",
    description: "Full-coverage strap-on harness with a solid 7.09\" medical-grade silicone dildo built right in. Adjustable waist (24–43\") and hip (29–45\") straps fit all body types. No batteries, no charging — pure body-safe silicone that's waterproof and ready when you are.",
    details: ["Material: Medical Grade Silicone", "Color: Flesh", "Insertable length: 7.09\"", "Diameter: 1.58\"", "Waist circumference: 24–43\"", "Hips circumference: 29–45\"", "Waterproof", "No batteries required", "Includes: strap-on harness + dildo"],
    price: 78.99,
    comparePrice: 138.99,
    image: "images/products/ZG001/ZG001-1.jpg",
    images: [
      "images/products/ZG001/ZG001-1.jpg",
      "images/products/ZG001/ZG001-2.jpg",
      "images/products/ZG001/ZG001-3.jpg",
      "images/products/ZG001/ZG001-4.jpg",
      "images/products/ZG001/ZG001-5.jpg",
      "images/products/ZG001/ZG001-6.jpg",
      "images/products/ZG001/ZG001-7.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 2,
    dropship: false
  },
  {
    id: 4,
    name: "Light Show Dildo",
    tagline: "Turn the Lights Down. Or Up.",
    description: "Crystal-clear TPE dildo that lights up from the inside. No vibration — just a mesmerizing glow that sets the entire mood. Strong suction cup base for hands-free play, realistic shape, body-safe and waterproof. Batteries included.",
    details: ["Material: TPE", "Color: Clear", "Total length: 7.29\"", "Insertable length: 5.52\"", "Diameter: 1.42\"", "Light-up only (no vibration)", "Battery: 2 × LR41 (included)", "Waterproof", "Suction cup base"],
    price: 48.99,
    comparePrice: 83.99,
    image: "images/products/D018-M-LED/D018-M-LED-1.jpg",
    images: [
      "images/products/D018-M-LED/D018-M-LED-1.jpg",
      "images/products/D018-M-LED/D018-M-LED-2.jpg",
      "images/products/D018-M-LED/D018-M-LED-3.jpg",
      "images/products/D018-M-LED/D018-M-LED-4.jpg",
      "images/products/D018-M-LED/D018-M-LED-5.jpg",
      "images/products/D018-M-LED/D018-M-LED-6.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 5,
    name: "Naughty Nurse Set",
    tagline: "Eight Pieces. Zero Rules.",
    description: "Full 8-piece BDSM restraint kit in PU leather and plush — everything you need for a complete scene right out of the box. Handcuffs, ankle cuffs, blindfold, ball gag, whip, collar with lead, leash, and cross strap. Elegant white and red colorway for when you want bondage to look as good as it feels.",
    details: ["Material: PU + Plush", "Color: White + Red", "8 pieces total", "Includes: Handcuffs, Ankle Cuffs, Blindfold, Ball Gag, Whip (15\"), Collar + Lead (24.82\"), Leash, Cross Strap", "Ball gag diameter: 1.54\"", "No batteries required"],
    price: 53.99,
    comparePrice: 98.99,
    image: "images/products/PZ-809/PZ-809-1.jpg",
    images: [
      "images/products/PZ-809/PZ-809-1.jpg",
      "images/products/PZ-809/PZ-809-2.jpg",
      "images/products/PZ-809/PZ-809-3.jpg",
      "images/products/PZ-809/PZ-809-4.jpg",
      "images/products/PZ-809/PZ-809-5.jpg",
      "images/products/PZ-809/PZ-809-6.jpg",
      "images/products/PZ-809/PZ-809-7.jpg",
      "images/products/PZ-809/PZ-809-8.jpg",
      "images/products/PZ-809/PZ-809-9.jpg",
      "images/products/PZ-809/PZ-809-10.jpg",
      "images/products/PZ-809/PZ-809-11.jpg",
      "images/products/PZ-809/PZ-809-12.jpg"
    ],
    category: "bondage",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 6,
    name: "Double Trouble",
    tagline: "Two Ends, Zero Limits.",
    description: "Body-safe TPE double-ended dildo — 13.20\" of flexible fun built for shared play or solo exploration. Crystal clear so every angle shows. Slim enough for comfort, long enough for every position. Waterproof, no batteries needed, just pure flexibility.",
    details: ["Material: Body-Safe TPE", "Color: Clear", "Total length: 13.20\"", "Insertable per end: 5.12\"", "Diameter: 1.26\"", "Waterproof", "No batteries needed", "Flexible — bends to any angle"],
    price: 38.99,
    comparePrice: 63.99,
    image: "images/products/QS-D001-S/QS-D001-S-1.jpg",
    images: [
      "images/products/QS-D001-S/QS-D001-S-1.jpg",
      "images/products/QS-D001-S/QS-D001-S-2.jpg",
      "images/products/QS-D001-S/QS-D001-S-3.jpg",
      "images/products/QS-D001-S/QS-D001-S-4.jpg",
      "images/products/QS-D001-S/QS-D001-S-5.jpg",
      "images/products/QS-D001-S/QS-D001-S-6.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 7,
    name: "Bound to Please",
    tagline: "Under the Bed. Over the Edge.",
    description: "Under-bed restraint system with adjustable nylon straps (up to 66.98\") that fit most standard bed frames — no hardware, no drilling. Soft plush-lined handcuffs included. Sets up in minutes, stores flat under your mattress. Your secret nobody has to know about.",
    details: ["Material: Nylon + Plush", "Color: Black", "Total strap length: 66.98\"", "Fits most standard bed frames", "Includes handcuffs (soft plush lining)", "No batteries required", "Easy under-mattress storage"],
    price: 38.99,
    comparePrice: 68.99,
    image: "images/products/TB-016-1.jpg",
    images: [
      "images/products/TB-016-1.jpg",
      "images/products/TB-016-2.jpg",
      "images/products/TB-016-3.jpg",
      "images/products/TB-016-4.jpg",
      "images/products/TB-016-5.jpg",
      "images/products/TB-016-6.jpg",
      "images/products/TB-016-7.jpg",
      "images/products/TB-016-8.jpg",
      "images/products/TB-016-9.jpg",
      "images/products/TB-016-10.jpg",
      "images/products/TB-016-11.jpg",
      "images/products/TB-016-12.jpg",
      "images/products/TB-016-13.jpg"
    ],
    category: "bondage",
    badge: null,
    inStock: true,
    qty: 2,
    dropship: false
  },
  {
    id: 8,
    name: "Date Night Firecracker",
    tagline: "Hand Them the App. Watch the Show.",
    description: "Nine-speed app-controlled vibrating egg with a slim insertable design and USB rechargeable battery. Medical-grade silicone, fully waterproof. Control it solo or hand the app to your partner from anywhere — across the room or across the city.",
    details: ["Material: Medical Grade Silicone", "Color: Pink", "9 speeds", "App-controlled", "Total length: 8.08\"", "Insertable length: 6.70\"", "Diameter: 1.50\"", "USB Rechargeable (cable included)", "Waterproof", "Includes: vibrating egg, charger cable, user manual"],
    price: 38.99,
    comparePrice: 73.99,
    image: "images/products/XL091-1.jpg",
    images: [
      "images/products/XL091-1.jpg",
      "images/products/XL091-1A.jpg",
      "images/products/XL091-2.jpg",
      "images/products/XL091-3.jpg",
      "images/products/XL091-4.jpg",
      "images/products/XL091-5.jpg",
      "images/products/XL091-6.jpg",
      "images/products/XL091-7.jpg"
    ],
    category: "couples",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 9,
    name: "Pocket Body",
    tagline: "Compact. Realistic. Discreet.",
    description: "Life-like 1.16 lb TPE pocket torso with a realistic brown finish and soft, skin-like texture. At 5.91\" long with a 4.14\" diameter, it's sized for easy handling and discreet storage. Fully waterproof — easy to clean, easy to store.",
    details: ["Material: TPE", "Color: Brown", "Length: 5.91\"", "Diameter: 4.14\"", "Weight: 1.16 LB", "Waterproof", "No batteries needed", "Includes: sex doll in display box"],
    price: 38.99,
    comparePrice: 68.99,
    image: "images/products/BJD-012-1.jpg",
    images: [
      "images/products/BJD-012-1.jpg",
      "images/products/BJD-012-2.jpg",
      "images/products/BJD-012-3.jpg",
      "images/products/BJD-012-4.jpg",
      "images/products/BJD-012-5.jpg",
      "images/products/BJD-012-6.jpg",
      "images/products/BJD-012-7.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 2,
    dropship: false
  },
  {
    id: 10,
    name: "The Goddess",
    tagline: "Commanding. Unapologetic.",
    description: "Medical-grade silicone at full 10.84\" total length — 8.08\" insertable — with a commanding 1.97\" diameter and deep brown lifelike finish. Powerful suction cup base locks onto any flat surface for hands-free positioning. Firm, smooth, and absolutely built to satisfy.",
    details: ["Material: Medical Grade Silicone", "Color: Deep Brown", "Total length: 10.84\"", "Insertable length: 8.08\"", "Diameter: 1.97\"", "Strong suction cup base", "Waterproof", "No batteries needed"],
    price: 83.99,
    comparePrice: 148.99,
    image: "images/products/QYS-058/QYS-058-1.jpg",
    images: [
      "images/products/QYS-058/QYS-058-1.jpg",
      "images/products/QYS-058/QYS-058-2.jpg",
      "images/products/QYS-058/QYS-058-3.jpg",
      "images/products/QYS-058/QYS-058-4.jpg",
      "images/products/QYS-058/QYS-058-5.jpg",
      "images/products/QYS-058/QYS-058-6.jpg",
      "images/products/QYS-058/QYS-058-7.jpg"
    ],
    category: "toys",
    badge: "Fan Favorite",
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 11,
    name: "Lip Service",
    tagline: "Suck. Thrust. Repeat.",
    description: "10-speed automatic masturbator with three simultaneous functions — vibrating, sucking, and thrusting — plus realistic sound effects for full immersion. Plug-in rechargeable, fully waterproof, and sized at a grippy 3.86\" diameter. The upgrade from basic that you've been putting off.",
    details: ["Material: ABS + TPE", "Color: Black", "10 speeds", "Vibrating + Sucking + Thrusting + Sound Effects", "Diameter: 3.86\"", "Length: 11.46\"", "Plug-in rechargeable (cable included)", "Waterproof", "Includes: masturbator, charger, user manual"],
    price: 28.99,
    comparePrice: 58.99,
    image: "images/products/XL095/XL095-1.jpg",
    images: [
      "images/products/XL095/XL095-1.jpg",
      "images/products/XL095/XL095-2.jpg",
      "images/products/XL095/XL095-3.jpg",
      "images/products/XL095/XL095-4.jpg",
      "images/products/XL095/XL095-5.jpg",
      "images/products/XL095/XL095-6.jpg",
      "images/products/XL095/XL095-7.jpg",
      "images/products/XL095/XL095-8.jpg",
      "images/products/XL095/XL095-9.jpg",
      "images/products/XL095/XL095-10.jpg"
    ],
    category: "couples",
    badge: null,
    inStock: true,
    qty: 3,
    dropship: false
  },
  {
    id: 12,
    name: "Date Night Dice",
    tagline: "Roll the Dice. Own the Night.",
    description: "Set of 5 solid pine wood adult dice loaded with positions, actions, and locations — plus a placement plate to map out the full scenario. Drop them on the table, see what the night demands. Comes in a drawstring fabric bag. No batteries. No excuses.",
    details: ["Material: Pine Wood", "Color: Natural wood tone", "5 dice + placement plate", "Cube size: 0.99\" × 0.99\"", "Comes with fabric drawstring bag", "No batteries needed", "Not waterproof"],
    price: 38.99,
    comparePrice: 63.99,
    image: "images/products/MN002/MN002-1.jpg",
    images: [
      "images/products/MN002/MN002-1.jpg",
      "images/products/MN002/MN002-2.jpg",
      "images/products/MN002/MN002-3.jpg",
      "images/products/MN002/MN002-4.jpg",
      "images/products/MN002/MN002-5.jpg",
      "images/products/MN002/MN002-6.jpg",
      "images/products/MN002/MN002-7.jpg"
    ],
    category: "games",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 13,
    name: "Rose Charger",
    tagline: "Keep the Vibe Alive.",
    description: "50CM white DC magnetic charging cable made specifically for WM52-series rose sex toys. Secure magnetic contact (1.2CM spacing), compact PVC build, and a weight of under 0.02 kg — toss it in your nightstand and forget the worry. Because dead batteries are a mood killer.",
    details: ["Material: PVC", "Color: White", "Length: 50CM (19.70\")", "Magnetic charging point spacing: 1.2CM (0.47\")", "Compatible: WM52 Series rose toys", "Weight: 0.017 KG (0.60 oz)", "Packaged in aluminum foil bag"],
    price: 18.99,
    comparePrice: 28.99,
    image: "images/products/CDX-4/CDX-4-1.jpg",
    images: [
      "images/products/CDX-4/CDX-4-1.jpg",
      "images/products/CDX-4/CDX-4-2.jpg",
      "images/products/CDX-4/CDX-4-3.jpg",
      "images/products/CDX-4/CDX-4-4.jpg",
      "images/products/CDX-4/CDX-4-5.jpg",
      "images/products/CDX-4/CDX-4-6.jpg"
    ],
    category: "accessories",
    badge: null,
    inStock: true,
    qty: 2,
    dropship: false
  },
  {
    id: 91,
    name: "Full Figure",
    tagline: "Life-Like Weight. Zero Complications.",
    description: "Life-like 5.45 lb TPE full torso with a realistic brown finish and immersive weight that makes every angle feel natural. At 7.88\" long with a generous 5.71\" diameter, this is the step up from pocket-size. Fully waterproof, easy to clean.",
    details: ["Material: TPE", "Color: Brown", "Length: 7.88\"", "Diameter: 5.71\"", "Weight: 5.45 LB", "Waterproof", "No batteries needed", "Includes: sex doll in display box"],
    price: 53.99,
    comparePrice: 93.99,
    image: "images/products/BJD-010/BJD-010-1.jpg",
    images: [
      "images/products/BJD-010/BJD-010-1.jpg",
      "images/products/BJD-010/BJD-010-2.jpg",
      "images/products/BJD-010/BJD-010-3.jpg",
      "images/products/BJD-010/BJD-010-4.jpg",
      "images/products/BJD-010/BJD-010-5.jpg",
      "images/products/BJD-010/BJD-010-6.jpg",
      "images/products/BJD-010/BJD-010-7.jpg",
      "images/products/BJD-010/BJD-010-8.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 2,
    dropship: false
  },
  {
    id: 92,
    name: "The Ring Leader",
    tagline: "Pleasure for Two. Worn by One.",
    description: "9-speed silicone vibrating cock ring with USB magnetic charging and a body-safe medical-grade silicone build. Fully waterproof with a compact 3.07\" profile. Adds vibration right where it counts for shared pleasure during intimacy. Comes with a fabric bag.",
    details: ["Material: Medical Grade Silicone + ABS", "Color: Black", "9 speeds", "Length: 3.07\"", "Diameter: 2.21\"", "USB Magnetic Charging", "Rechargeable", "Waterproof", "Includes: cock ring, charger cable, user manual, fabric bag"],
    price: 33.99,
    comparePrice: 58.99,
    image: "images/products/USK-C30/USK-C30-1.jpg",
    images: [
      "images/products/USK-C30/USK-C30-1.jpg",
      "images/products/USK-C30/USK-C30-2.jpg",
      "images/products/USK-C30/USK-C30-3.jpg",
      "images/products/USK-C30/USK-C30-4.jpg",
      "images/products/USK-C30/USK-C30-5.jpg",
      "images/products/USK-C30/USK-C30-6.jpg",
      "images/products/USK-C30/USK-C30-7.jpg",
      "images/products/USK-C30/USK-C30-8.jpg",
      "images/products/USK-C30/USK-C30-9.jpg",
      "images/products/USK-C30/USK-C30-10.jpg",
      "images/products/USK-C30/USK-C30-11.jpg"
    ],
    category: "couples",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  },
  {
    id: 93,
    name: "Purple Trouble",
    tagline: "Two Ends, Zero Limits.",
    description: "Body-safe TPE double-ended dildo — 13.20\" of flexible fun built for shared play or solo exploration. Vibrant clear purple colorway that brings the drama. Slim enough for comfort, long enough for every position. Waterproof, no batteries needed, just pure flexibility.",
    details: ["Material: Body-Safe TPE", "Color: Clear Purple", "Total length: 13.20\"", "Insertable per end: 5.12\"", "Diameter: 1.26\"", "Waterproof", "No batteries needed", "Flexible — bends to any angle"],
    price: 38.99,
    comparePrice: 63.99,
    image: "images/products/QS-D001-SZ/QS-D001-SZ-1.jpg",
    images: [
      "images/products/QS-D001-SZ/QS-D001-SZ-1.jpg",
      "images/products/QS-D001-SZ/QS-D001-SZ-2.jpg",
      "images/products/QS-D001-SZ/QS-D001-SZ-3.jpg",
      "images/products/QS-D001-SZ/QS-D001-SZ-4.jpg",
      "images/products/QS-D001-SZ/QS-D001-SZ-5.jpg",
      "images/products/QS-D001-SZ/QS-D001-SZ-6.jpg"
    ],
    category: "toys",
    badge: null,
    inStock: true,
    qty: 1,
    dropship: false
  }
];

// ── DEAR LOVER DROPSHIP PRODUCTS (IDs 14–33) ────────────────────────────────
// Ships 10–21 business days via Dear Lover | Bags, Fashion, Accessories
const DL_PRODUCTS = []; // Dear Lover — NIXED supplier removed

// ── CJ DROPSHIPPING PRODUCTS (IDs 277–314) ──────────────────
// 38 items · supplier: 'cj' · 7–15 biz day delivery
const CJ_PRODUCTS = [
  { id: 277, name: "Xilaizhi Energy Boost Candy Pack", price: 12.99, comparePrice: 17.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934778665770684416.jpg", supplier: 'cj', dropship: true, qty: null, description: "A little boost in a big-flavor bite. These energy candy packs are made for on-the-go days when coffee isn\'t cutting it. Natural energy blend, portable, no crash.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 278, name: "Men's Ice Silk Short Sleeve Pajama Set", price: 17.99, comparePrice: 23.99, category: "fashion", tags: ["fashion", "sleepwear"], image: "https://cf.cjdropshipping.com/quick/product/f4e1e17e-1363-4be4-81a7-64049096bac0.jpg", supplier: 'cj', dropship: true, qty: null, description: "Cool, light, and effortlessly comfortable. This ice silk pajama set keeps men comfortable all night — breathable fabric that\'s soft against the skin and styled for lounging or sleeping.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 279, name: "Wireless Bluetooth Headphones", price: 26.99, comparePrice: 38.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/d26d512a-5354-4840-b7e3-6ccc3ed8baec.jpg", supplier: 'cj', dropship: true, qty: null, description: "Wireless sound that just works. These Bluetooth headphones deliver clear audio, solid bass, and comfortable over-ear fit — great for workouts, commutes, or unwinding.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 280, name: "Melatonin Sleep Aid Gummies", price: 9.99, comparePrice: 12.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934778803088003072.jpg", supplier: 'cj', dropship: true, qty: null, description: "Wind down without counting sheep. These melatonin gummies support your natural sleep cycle — soft, chewable, and a relaxing ritual before bed.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 281, name: "Breast Enhancement Wellness Gummies", price: 13.99, comparePrice: 19.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934779607207383040.jpg", supplier: 'cj', dropship: true, qty: null, description: "A daily wellness gummy formulated with herbs and botanicals to support breast fullness and feminine confidence. Take as a supplement alongside your self-care routine.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 282, name: "Travel Cosmetic Bag Large Capacity Multifunction Travel C...", price: 11.99, comparePrice: 16.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://cf.cjdropshipping.com/4890d2ae-b0fa-405f-a296-e09b2e551cec.png", supplier: 'cj', dropship: true, qty: null, description: "Everything organized, every time. This large-capacity multifunction travel cosmetic bag features multiple compartments, durable fabric, and a layout that makes getting ready on-the-go actually easy.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 283, name: "Glucosamine Chondroitin Ginger Tablets", price: 11.99, comparePrice: 16.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934779396049342464.jpg", supplier: 'cj', dropship: true, qty: null, description: "Joint health in a daily tablet. This blend of glucosamine, chondroitin, and ginger helps support cartilage, reduce discomfort, and keep you moving with ease.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 284, name: "Hair & Nail Growth Collagen Jelly", price: 11.99, comparePrice: 16.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934779057023750144.jpg", supplier: 'cj', dropship: true, qty: null, description: "Glow from the inside out. This collagen jelly supplement is designed to nourish your hair and nails — smooth, portable, and actually enjoyable to take.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 285, name: "360\u00b0 Remote Smart Security Camera", price: 46.99, comparePrice: 70.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/20200523/578683750114.jpg", supplier: 'cj', dropship: true, qty: null, description: "Eyes on everything. This 360° smart security camera connects to your phone for real-time remote monitoring — rotating lens, night vision, motion alerts, easy setup.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 286, name: "Men's Hawaiian Style Beach Pants Loose Quick-dry Casual S...", price: 22.99, comparePrice: 31.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://oss-cf.cjdropshipping.com/product/2024/06/21/03/6edbe19b-ff0b-4d74-a87f-462e393a06e1.jpg", supplier: 'cj', dropship: true, qty: null, description: "Relaxed beach energy, all day. These quick-dry Hawaiian print beach pants are loose-fitting, lightweight, and made for warm-weather comfort — pool, boardwalk, or backyard.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 287, name: "1080P Full HD Camcorder XD IR-CUT Mini Camera Smallest In...", price: 24.99, comparePrice: 35.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/ba506424-4df0-415d-a1df-808552c6d211.png", supplier: 'cj', dropship: true, qty: null, description: "Tiny camera, big detail. This palm-sized IR-CUT mini camcorder shoots 1080P full HD and fits in your pocket — perfect for discreet recording or capturing moments on the go.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 288, name: "Two-Piece Push-Up Bikini Set \u2013 Printed", price: 13.99, comparePrice: 19.99, category: "fashion", tags: ["fashion", "swimwear"], image: "https://cf.cjdropshipping.com/quick/product/5f416df5-0f75-4a71-a9f5-452125e75854.jpg", supplier: 'cj', dropship: true, qty: null, description: "Turn heads at the pool or beach. This printed push-up bikini set features a flattering two-piece cut, vibrant print, and adjustable straps for a customized fit.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 289, name: "Sambucus Elderberry Immunity Gummies", price: 9.99, comparePrice: 12.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934779329913556992.jpg", supplier: 'cj', dropship: true, qty: null, description: "Immunity support that tastes like a treat. Packed with elderberry extract plus essential vitamins, these gummies help your body defend itself — delicious and daily.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 290, name: "Portable Travel Pillow with Cosmetic Pouch", price: 9.99, comparePrice: 12.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://oss-cf.cjdropshipping.com/product/2025/07/04/08/2b16e940-a406-4d3a-8844-7f07f8925c78_trans.jpeg", supplier: 'cj', dropship: true, qty: null, description: "Two essentials, one zip. This travel pillow comes with an attached cosmetic pouch — neck support for long flights and a place for your carry-on essentials, all in one compact design.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 291, name: "CT62 Portable Multifunctional Mobile Phone Camera Stand P...", price: 59.99, comparePrice: 90.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/8192caa4-2ac9-40fe-b792-4987db5d9d9a.jpg", supplier: 'cj', dropship: true, qty: null, description: "Your phone\'s new best friend. The CT62 is a portable multi-function tripod and phone stand — adjustable, compact, and built for content creators, video calls, and live streaming.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 292, name: "Winter Ribbed Knit Suits Fashion Loose Pullover Sweater T...", price: 22.99, comparePrice: 33.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://oss-cf.cjdropshipping.com/product/2025/08/19/01/52e0cf7b-fdfb-459a-85fc-5d2fc9c853f9.jpg", supplier: 'cj', dropship: true, qty: null, description: "Cozy-chic winter lounging. This ribbed knit set pairs a relaxed pullover with matching wide-leg pants — soft, stretchy, and elevated enough to wear out or stay in.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 293, name: "Female Balance & Wellness Jelly Supplement", price: 11.99, comparePrice: 16.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934779000857825280.jpg", supplier: 'cj', dropship: true, qty: null, description: "A daily wellness jelly formulated to support female hormone balance, energy, and inner harmony. Gentle, plant-forward, and easy to add to your morning routine.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 294, name: "Women's Autumn Street Blazer & Pants Set", price: 28.99, comparePrice: 42.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://cf.cjdropshipping.com/quick/product/ba5a128b-a605-4950-9359-9b23e8aafcfc.jpg", supplier: 'cj', dropship: true, qty: null, description: "Boss-lady autumn energy. This blazer and pants set is tailored for women who move with intention — structured top, matching trousers, effortlessly pulled together.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 295, name: "Men's Linen Shorts & Chinese Style Suit", price: 18.99, comparePrice: 24.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://cf.cjdropshipping.com/quick/product/93c7767a-cd3a-4096-a424-472dc84c43bd.jpg", supplier: 'cj', dropship: true, qty: null, description: "Relaxed and refined. This men\'s linen shorts and suit combo brings casual Chinese-inspired styling to a hot-weather look — breathable, light, and surprisingly versatile.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 296, name: "Summer Shorts Suit Fashion Loose Short-sleeved T-shirt An...", price: 15.99, comparePrice: 21.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://cf.cjdropshipping.com/quick/product/d85626d5-2c5c-477f-9ca8-e2f81a9ef11d.jpg", supplier: 'cj', dropship: true, qty: null, description: "Matching energy for warm days. This shorts suit features a loose short-sleeved tee and matching shorts — the kind of set that goes from errands to the cookout without a second thought.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 297, name: "Lapel Short Sleeve Shorts Suit Young And Middle-aged Wear...", price: 41.99, comparePrice: 61.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://cf.cjdropshipping.com/quick/product/f12a2f5d-53a4-41d1-b002-ae6639a53d06.jpg", supplier: 'cj', dropship: true, qty: null, description: "Cool and coordinated. This lapel short-sleeve shorts suit is a clean, mature look for men who want to be put-together without trying too hard. Great for summer outings.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 298, name: "Two-Piece Push-Up Bikini Set", price: 13.99, comparePrice: 19.99, category: "fashion", tags: ["fashion", "swimwear"], image: "https://cf.cjdropshipping.com/quick/product/aaa0f059-8c2f-4338-9aa6-0f1761460d40.jpg", supplier: 'cj', dropship: true, qty: null, description: "Beach-to-bar ready. This push-up bikini set comes in a solid silhouette with a flattering underwire top and cheeky bottoms — classic, confident, and made to be seen.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 299, name: "Large Capacity Trolley Travel Bag", price: 37.99, comparePrice: 56.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://oss-cf.cjdropshipping.com/product/2024/07/02/01/fe3be2bc-40d0-4bca-9f05-611d6b5343f3.jpg", supplier: 'cj', dropship: true, qty: null, description: "Pack big, move easy. This large-capacity trolley travel bag rolls smooth and zips wide — perfect for weekend trips, extended travel, or whenever you need to bring everything.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 300, name: "3-Piece Long Sleeve Swimwear Cover Set", price: 17.99, comparePrice: 23.99, category: "fashion", tags: ["fashion", "swimwear"], image: "https://cf.cjdropshipping.com/371d8573-18aa-4e7d-81dc-38b3906c34ac.jpg", supplier: 'cj', dropship: true, qty: null, description: "Sun, swim, and style. This 3-piece long sleeve swimwear set includes a coverup and two-piece suit — ideal for beach days when you want to be effortlessly put-together.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 301, name: "Portable Travel Organizer Storage Box", price: 9.99, comparePrice: 12.99, category: "lifestyle", tags: ["lifestyle", "home", "accessories"], image: "https://oss-cf.cjdropshipping.com/product/2025/08/12/02/98e9ddcf-bb3c-4029-be13-5441b5c60650.jpg", supplier: 'cj', dropship: true, qty: null, description: "Travel organized, arrive ready. This portable storage box keeps your everyday essentials — chargers, meds, jewelry, or accessories — neat, compact, and grab-and-go.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 302, name: "Men's Cotton Linen Casual Shirt Outfit", price: 24.99, comparePrice: 35.99, category: "fashion", tags: ["fashion", "clothing"], image: "https://cf.cjdropshipping.com/quick/product/086f53c9-c220-41fa-9356-781c677afb5d.jpg", supplier: 'cj', dropship: true, qty: null, description: "Easy, breezy, classic. This men\'s cotton linen casual shirt outfit is made for warm days when comfort is non-negotiable. Light fabric, relaxed fit, no fuss.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 303, name: "HD WiFi Smart Portable Mini Camera", price: 17.99, comparePrice: 23.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://oss-cf.cjdropshipping.com/product/2023/11/16/04/5698ee1a-a88a-4a42-ac5b-ce432f6f81fe_trans.jpeg", supplier: 'cj', dropship: true, qty: null, description: "Compact surveillance with WiFi. This mini HD smart camera connects to your phone for live viewing from anywhere — hidden or visible, it keeps a quiet eye on what matters.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 304, name: "Luggage Organizer Set \u2013 6-Piece Oxford Cloth", price: 9.99, comparePrice: 12.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://oss-cf.cjdropshipping.com/product/2025/07/14/01/bbbf44b7-912f-4283-8f47-554261e21db6_trans.jpeg", supplier: 'cj', dropship: true, qty: null, description: "Pack smarter. This 6-piece Oxford cloth luggage organizer set keeps your clothes, accessories, shoes, and toiletries sorted and easy to find — a game changer for frequent travelers.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 305, name: "LED Night Light Mushroom Wall Socket Lamp EU US Plug Warm...", price: 9.99, comparePrice: 12.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://oss-cf.cjdropshipping.com/product/2024/12/07/02/4e46e607-53e6-4704-b934-d9719d483517.jpg", supplier: 'cj', dropship: true, qty: null, description: "Soft night light that\'s actually cute. This mushroom-shaped LED wall socket lamp adds warm ambient light to any room without waking anyone up. US and EU plug compatible.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 306, name: "Men's Satin Nightgown & Shorts Set", price: 22.99, comparePrice: 33.99, category: "fashion", tags: ["fashion", "sleepwear"], image: "https://cf.cjdropshipping.com/quick/product/8a33dd5e-3e5a-40a8-b3c6-35d32a6b0b09.jpg", supplier: 'cj', dropship: true, qty: null, description: "Soft luxury for his nights. This men\'s satin nightgown and shorts set is smooth against skin, temperature-regulating, and drapes beautifully. A bedroom upgrade he\'ll love.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 307, name: "Noise-Reduction Sports In-Ear Headset", price: 15.99, comparePrice: 21.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/quick/product/a79e119e-3833-4f35-a2ca-1c2f9170202a.jpg", supplier: 'cj', dropship: true, qty: null, description: "Sports-grade sound, all-day comfort. These noise-reduction in-ear headsets are built for active use — lightweight, secure fit, crystal-clear audio, and tangle-resistant.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 308, name: "Lace V-Neck Satin Nightdress", price: 11.99, comparePrice: 16.99, category: "fashion", tags: ["fashion", "sleepwear"], image: "https://cf.cjdropshipping.com/quick/product/232b1b06-c7ea-4063-a0ed-4fb048f0f453.jpg", supplier: 'cj', dropship: true, qty: null, description: "Romance in a nightgown. This lace V-neck satin nightdress hits mid-length with a silky body and delicate lace trim — the kind of thing you wear when the night has plans.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 309, name: "Book-Style Dustproof Storage Handbag", price: 12.99, comparePrice: 17.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://cf.cjdropshipping.com/quick/product/09f2d612-dd0f-4811-bb78-9d77f99f74e5.jpg", supplier: 'cj', dropship: true, qty: null, description: "Chic storage that closes like a book. This dustproof storage handbag has a structured book-style design — great for protecting jewelry, accessories, or delicate items at home or on the go.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 310, name: "Smart Pet GPS Tracking Locator", price: 18.99, comparePrice: 24.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/quick/product/64e1b84f-db42-47f7-8e91-74617a10480c.jpg", supplier: 'cj', dropship: true, qty: null, description: "Never lose your pet again. This smart GPS tracking locator attaches to any collar and connects to your phone — real-time location, geo-fence alerts, and peace of mind.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 311, name: "Fiber Boost Wellness Gummies", price: 9.99, comparePrice: 12.99, category: "wellness", tags: ["wellness", "supplements", "health"], image: "https://cf.cjdropshipping.com/17501184/1934778797098536960.jpg", supplier: 'cj', dropship: true, qty: null, description: "Digestive health made easy. These fiber-boost gummies support gut regularity and bloat relief — chewable, tasty, and a simple addition to your daily stack.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 312, name: "Hair Removal & Shaving Repair Cream", price: 9.99, comparePrice: 12.99, category: "beauty", tags: ["beauty", "hair-removal", "skincare"], image: "https://cf.cjdropshipping.com/ad578024-5202-43e0-92c6-54ebe5b7bed7.jpeg", supplier: 'cj', dropship: true, qty: null, description: "Post-shave perfection. This repair cream soothes irritation, reduces redness, and leaves skin silky smooth after hair removal. Works on face, underarms, legs, and more.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 313, name: "Travel Bag brand men 2 in 1 Garment Bag High-capacity Mul...", price: 21.99, comparePrice: 30.99, category: "accessories", tags: ["accessories", "bags", "travel"], image: "https://oss-cf.cjdropshipping.com/product/2024/06/12/01/0e009084-80dc-437f-ba35-156071798c0d.jpg", supplier: 'cj', dropship: true, qty: null, description: "The garment bag that does it all. This 2-in-1 high-capacity men\'s travel garment bag converts from suit carrier to duffel — wrinkle protection, multiple compartments, ready for any trip.", shippingNote: "7–15 business days via CJ Dropshipping" },
  { id: 314, name: "It Is Essential To Keep Cool In Summer", price: 29.99, comparePrice: 43.99, category: "lifestyle", tags: ["lifestyle", "tech", "accessories"], image: "https://cf.cjdropshipping.com/963acf5d-34f4-48af-bc8d-e57f85f4ceec.jpg", supplier: 'cj', dropship: true, qty: null, description: "Beat the heat in style. This cooling essential is perfect for summer — compact, efficient, and made to keep you comfortable when temperatures rise. A warm-weather must-have.", shippingNote: "7–15 business days via CJ Dropshipping" }
];


// ── LUXURY PLAY PRODUCTS (IDs 600+) ───────────────────────────────────────────
// 87 items · source: 'luxury_play' · 7-10 business day delivery · premium dropship
const LUXURY_PLAY_PRODUCTS = [
  {
    "id": 600,
    "name": "SilexD Apollo Male Pleasure Doll with Interchangeable Dildo",
    "price": 697.22,
    "category": "luxury",
    "tags": [
      "luxury",
      "dolls"
    ],
    "image": "images/products/1on1/n12526-silexd-apollo-male-pleasure-doll-winterchangeable-dildo-1.jpg",
    "sku": "n12526",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Apollo is a big realistic torso, shaped like a male chest and made from thermo reactive liquid silicone for a truly realistic pleasure experience! Featuring a unique dildo docking station, this doll comes with a 7 inch dildo but you can easily change and try out as many different sized dildos as you like. Features: Made from ultra realistic, ultra soft liquid silicone Thermo reactive, can be heate",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 601,
    "name": "LELO Enigma Wave Dual Stimulation Sonic Massager Black",
    "price": 330.19,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12348-lelo-enigma-wave-black-1.jpg",
    "sku": "n12348",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Using special WaveMotion technology and two synchronized motors, the Enigma Wave moves like a subtle wave as it fuses satisfying inner stimulation with deep vibrations as it mimics the finger massage motion on the insertable tail for mesmerizing g-spot stimulation. Features: Sensonic technology offers clitoral stimulation without making direct contact 3 motors for triple pleasure Ergonomic interna",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 602,
    "name": "Lelo Soraya Wave Dual Action Vibrator Deep Rose",
    "price": 292.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11612-lelo-soraya-wave-deep-rose-2.jpg",
    "sku": "n11612",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Luxury Rabbit Vibrator with Wavemotion technology 'Come hither' motion in tip and flexible arm with powerful vibrations Made from body safe silicone Fully waterproof USB rechargeable",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 603,
    "name": "Lelo Soraya Wave Dual Action Vibrator Midnight Blue",
    "price": 292.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11611-lelo-soraya-wave-midnight-blue-1.jpg",
    "sku": "n11611",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Luxury Rabbit Vibrator with Wavemotion technology 'Come hither' motion in tip and flexible arm with powerful vibrations Made from body safe silicone Fully waterproof USB rechargeable",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 604,
    "name": "LELO DOT Clitoral Vibrator Aqua",
    "price": 215.89,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11982-lelo-dot-clitoral-vibrator-aqua-1.jpg",
    "sku": "n11982",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Looking for something new with a more targeted orgasm? LELO DOT is a clitoral pinpoint vibrator which used externally allows for multiple endless orgasms without causing numbness. Traditional vibrations numb the area around the clitoris and, more often than not, prevent you from experiencing multiple orgasms due to saturation. But, thanks to its soft and bendable tip and revolutionary elliptical m",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 605,
    "name": "Adrien Lastic Siltex Ultra Masturbator",
    "price": 123.18,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12525-adrien-lastic-siltex-ultra-masturbator-1.jpg",
    "sku": "n12525",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Super hand held male masturbator with soft, squeezable case and pressure valve. Features: Ergonomic, flexible shape Waterproof Easy to use and clean Product Length: 7.5 inches/19cm, Insertable Length: 6 inches/16cm, Diameter: 1.4 inches/3.5cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 606,
    "name": "SilexD 15 inch Realistic Silicone Dual Density Dildo with Suction Cup with Balls",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11775-15inch-realistic-Silicone-Dual-Density-Dildo-wSuction-Cup-wBalls-1.jpg",
    "sku": "n11775",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Made from Dual Density Silicone Raised Veins for Internal Stimulation 15 inches Realistic shape with a life like tip and balls Can be used as a strap on dildo Suction cup allows for hand free use Pthalate free",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 607,
    "name": "Bathmate Hydroxtreme 9 Penis Pump Clear",
    "price": 304.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12200-bathmate-hydroextreme9-penis-pump-clear-2.jpg",
    "sku": "n12200",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Best Selling Hydro Pump on the Market 35% more powerful than the original Hydro Has hand ball pump and hose to make maximum use of the pressure Increase Length and Girth Completely Safe to Use Harder, Stronger Erections Comes complete with range of accesssories to enable easy use Designed for a penis size of 7-9 inches (17.5-23cm) when erect",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 608,
    "name": "Adrien Lastic Venus Hands Free Double Vibrator",
    "price": 139.69,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12754-adrien-lastic-venus-hands-free-double-vibrator-1.jpg",
    "sku": "n12754",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Venus is a versatile and portable, remote controlled double vibrator. Features: Designed to simultaneously stimulate clitoris and g-spot Remote controlled for solo or partner play 10 vibrating modes, unlock more through the app Can be used during intercourse for intense stimulation Can be used as a panty vibrator Control through Adrien Lastic app for a wide variety of functions Rechargeable Storag",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 609,
    "name": "LELO Ida Wave Peach",
    "price": 228.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11980-lelo-ida-wave-peach-1.jpg",
    "sku": "n11980",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "IDA Wave is an app-connected massager which is powered by two separate motors especially created for those who wish to build up their orgasm gradually. The rotating, insertable tail is the source of deep pleasuring on the G-spot as it uses specially designed WaveMotionTM technology that mimics finger-like motion, while the larger top brings satisfying vibrations to the clitoris. Features: 2 vibrat",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 610,
    "name": "LELO Smart Wand 2 Large Aqua",
    "price": 228.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12896-lelo-smart-wand2-large-aqua-6.jpg",
    "sku": "n12896",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Relax with the exquisite LELO Smart Wand 2- the world's premium cordless body massager. This is the largest in the range - satisfying the deepest muscle aches and discerning size-queens! Fully waterproof and rechargeable, take the Smart Wand wherever you want to go! With Extra Long-Lasting Charge - Longer battery life and 10 vibration settings to enjoy hours upon hours of pleasure, the smarts of t",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 611,
    "name": "Bouncy Bliss Classic Sit-On Vibrator with Rechargeable Remote Control",
    "price": 138.42,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/N12379-bouncy-bliss-sit-on-vibrator.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Bouncy Bliss Sit-On Vibrator Remote controlled vibrator Hands free Sit on vibrator 3 motors with 10 Vibrating modes Bouncer encloses the total U shape of the clitoris Vibrations resonates through inner thighs Vibrator insertable length: 4.5 inches/11.5 cm Vibrator has a different texture on either side for clitoral stimulation Removeable vibrator so easy to clean Body dimensions (once inflated): 1",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 612,
    "name": "LELO Dot Cruise Clitoral Vibrator Peach Please",
    "price": 253.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12346-lelo-dot-cruise-peach-please-10.jpg",
    "sku": "n12346",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Lelo Dot Cruise is the upgraded version of the groundbreaking clitoral pinpoint vibrator. Using Infinite Loop Technology that combines a unique elliptical motions with a soft, bendable tip to offer unmatched stimulation with absolute precision across the clitoris and external erogenous zones. Using the patented Cruise Control technology you can now experience multiple pleasure settings at a co",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 613,
    "name": "LELO Dot Cruise Clitoral Vibrator Pistachio Cream",
    "price": 253.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12347-lelo-dot-cruise-pistachio-cream-3.jpg",
    "sku": "n12347",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Lelo Dot Cruise is the upgraded version of the groundbreaking clitoral pinpoint vibrator. Using Infinite Loop Technology that combines a unique elliptical motions with a soft, bendable tip to offer unmatched stimulation with absolute precision across the clitoris and external erogenous zones. Using the patented Cruise Control technology you can now experience multiple pleasure settings at a co",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 614,
    "name": "Adrien Lastic Harmony Stones Kegel Balls",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12755-adrien-lastic-harmony-stones-kegel-balls-1.jpg",
    "sku": "n12755",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Kegel stone set to help strengthen pelvic floor muscles. Set includes two different silicone cases and 6 different Harmony stones. Stones included: Pink Jade 38gr for Serenity Tigers Eye 38gr for Confidence Carnelian 38gr for Sexual desire Bianstone 38gr for Revitalisation Amethyst 37gr for Enlightenment Crystal 31gr for Harmony",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 615,
    "name": "LELO Boomerang Dual Ended Vibrator Purple",
    "price": 253.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n13055-lelo-boomerang-dual-ended-vibrator-purple-1.jpg",
    "sku": "n13055",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "For couples who love to share the new Lelo Boomerang is the best way to meet in the middle and experience a new type of penetrative play. With two silky, vibrating ends with sensory ribs and a curved, ergomonic design the Boomerang invites you to both give and receive. Features: 8 Vibration settings plus 2 when connected to the Lelo app Two vibrating motors, one on each side of the device Sensory ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 616,
    "name": "LELO Soraya Anal Beads Violet Dusk",
    "price": 253.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n12342-lelo-soraya-anal-beads-violet-9.jpg",
    "sku": "n12342",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Soraya Beads massager is a pleasure device specifically designed for those just diving into anal play exploration. With its unique design, the Soraya Beads aims to arouse the sensitive nerve endings in and around the anus for a new type of orgasmic sensation, one bead at a time! All of this is possible due to innovative Bow-Motion technology, inspired by the masterful movements of violin playe",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 617,
    "name": "LELO Soraya Anal Beads Black",
    "price": 253.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n12341-lelo-soraya-anal-beads-black-1.jpg",
    "sku": "n12341",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Soraya Beads massager is a pleasure device specifically designed for those just diving into anal play exploration. With its unique design, the Soraya Beads aims to arouse the sensitive nerve endings in and around the anus for a new type of orgasmic sensation, one bead at a time! All of this is possible due to innovative Bow-Motion technology, inspired by the masterful movements of violin playe",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 618,
    "name": "LELO Smart Wand 2 Medium Deep Rose",
    "price": 190.49,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n11979-lelo-smart-wand2-medium-deep-rose-1.jpg",
    "sku": "n11979",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Relax and unwind with the exquisite LELO Smart Wand 2- the world's most luxurious full-body massager. This is the ultimate foreplay tool for yourself or your partner! Free the tension in your body by releasing stress and relaxing your muscles. Fully waterproof and rechargeable, take the Smart Wand wherever you want to go! With Extra Long-Lasting Charge - Longer battery life and 10 vibration settin",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 619,
    "name": "Bathmate Hydroxtreme 7 Penis Pump Clear",
    "price": 266.69,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11454-bathmate-hydroextreme7-penis-pump-clear-2.jpg",
    "sku": "n11454",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Best Selling Hydro Pump on the Market 35% more powerful than the original Hydro Has hand ball pump and hose to make maximum use of the pressure Increase Length and Girth Completely Safe to Use Harder, Stronger Erections Comes complete with range of accesssories to enable easy use Designed for a penis size of 5-7 inches (12.5-17.5cm) when erect",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 620,
    "name": "LELO Sona 3 Clitoral Massager Cyber Purple",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n13018-lelo-sona3-cyber-purple-1.jpg",
    "sku": "n13018",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Introducing the latest generation of the legendary sonic clitoral massager. The Sona 3 features SenSonic technology with 10 pleasure settings and the new SmoothRise technology that allows you to switch gently between intensity levels for maximum comfort. Made from super-soft silicone for comfort, the Sona 3 is ideal for precise clitoral stimulation and can be paired with the LELO app to access two",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 621,
    "name": "LELO Sona 3 Clitoral Massager Cream",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n13017-lelo-sona3-cream-1.jpg",
    "sku": "n13017",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Introducing the latest generation of the legendary sonic clitoral massager. The Sona 3 features SenSonic technology with 10 pleasure settings and the new SmoothRise technology that allows you to switch gently between intensity levels for maximum comfort. Made from super-soft silicone for comfort, the Sona 3 is ideal for precise clitoral stimulation and can be paired with the LELO app to access two",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 622,
    "name": "LELO Tor 3 App Controlled Cock Ring Black",
    "price": 177.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12895-lelo-tor3-app-controlled-cock-ring-black-1.jpg",
    "sku": "n12895",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Tor 3 is designed for intense mutual orgasms, coming with 8 powerful vibration settings and by easily connecting to the Lelo app you can not only unlock additional pleasure settings and intensities but it also offers over 4000 articles, erotic literature and relationship tips, making it a comprehensive sexual wellness hub. Made from premium body-safe silicone the Tor 3 flexes and bends to fit ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 623,
    "name": "Doc Johnson The Great American Challenge Huge Dildo",
    "price": 161.28,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n2432-the_great_american_challenge-1.jpg",
    "sku": "n2432",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The biggest dildo in the world, probably! The Great American Challenge from Doc Johnson is quite simply HUGE!!!!!!!!!!!!!! Realistic in shape and constructed from soft jelly rubber this dildo is 17-inches long with a girth of 8-inches, yes 8-inches! ***** WARNING***** ONLY BUY THIS DILDO IF YOU ARE UP TO THE CHALLENGE!  Extra Large Length And Girth  Perfect For Advanced Players  Body-Safe  Pro",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 624,
    "name": "ElectraStim Linx Electro Stimulator",
    "price": 507.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "bondage"
    ],
    "image": "images/products/1on1/n13012-electrastim-linx-electro-stimulator-8.jpg",
    "sku": "n13012",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Next generation, dual-channel electro stimulator designed for all levels of users seeking powerful, customisable and connected electro play. Featuring all the interactive modes including Tilt, Flick, Microphone and Stereo Stim plus two brand new modes that take e-stim to a new level. Playlist allows users to create fully custom electro session by combining different stimulation 'snippets' that you",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 625,
    "name": "LELO SONA 2 Cruise Clitoral Massager Cerise",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/N11630-lelo-sona-2-cruise-clitoral-massager-cerise.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Sonic massager with Cruise Control Regulates power to maintain speed and strength Soft waves for gentle clitoral stimulation Press against body for automatic increased intensity and pleasure 12 pleasure settings Made from body safe silicone Waterproof Up to 2 hours use in one go Not for sale in Germany.",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 626,
    "name": "LELO F2 Stamina Trainer and Stroker Blue",
    "price": 228.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12864-lelo-f2-stamina-trainer-stroker-blue-1.jpg",
    "sku": "n12864",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Lelo F2 is an open ended stroker and when connected to the Lelo app it transforms into the ultimate endurance trainer with two specially developed exercise routines. The stamina trainer helps users build endurance and experience more powerful orgasms and guided kegel exercises help ensure a more satisfying sexual performance. Features: App connected with 8 powerful pleasure settings and unlock two",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 627,
    "name": "Electrastim SensaVox",
    "price": 431.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "bondage"
    ],
    "image": "images/products/1on1/n11956-electrastim-sensavox-1.jpg",
    "sku": "n11956",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "ElectraStim SensaVox Electro Sex Stimulator is one of Electrastims most advanced and powerful stimulators, jam-packed with tantalising features in a sleek, high-end design. If you want a performance e-stim power box that offers more ways to play then youll love this dual-channel electro sex machine. Create your own stimulation patterns using music or using voice commands to control the rhythm, in",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 628,
    "name": "Svakom Alex Neo 2 Interactive App Controlled Thrusting Male Masturbator",
    "price": 190.49,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12088-svakom-alex-neo2-male-masturbator-1.jpg",
    "sku": "n12088",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "This updated version of the best selling Alex Neo is smaller so easier to hold, quieter and has an improved motor but still all your favourite features. Equipped with a powerful motor and 7 intense settings that allow you to adjust the thrusting strength, this tech-filled masturbator will bring your wildest fantasies alive. And to take your imagination to the next level, you can also listen to 5 d",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 629,
    "name": "LELO Tiani 3 Couples Massager Cerise",
    "price": 177.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12856-lelo-tiani3-cerise-1.jpg",
    "sku": "n12856",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Tiani 3 is the new and improved version of LELOs original Red Dot Design Award-winning couples massager, worn by women when making love. The powerful vibrations provide targeted sensations to the clitoris, while the smooth silicone design gives ultimate pleasure and comfort. Waterproof, rechargeable and remote-controlled, Tiani 3 is the go-to LELO design for sharing simultaneous orgasms with y",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 630,
    "name": "LELO Sona 3 Cruise Clitoral Massager Black",
    "price": 177.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n13019-lelo-sona3-cruise-black-1.jpg",
    "sku": "n13019",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Introducing the latest generation of the legendary sonic clitoral massager. The Sona 3 Cruise features SenSonic technology with 10 pleasure settings and the new SmoothRise technology that allows you to switch gently between intensity levels for maximum comfort and for those looking for even more power, the Sona 3 Cruise ensures a consistent intensity throughout using the Cruise Control technology.",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 631,
    "name": "LELO Tiani 3 Couples Massager Deep Rose",
    "price": 177.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12485-lelo-tiani3-couples-massager-deep-rose-1.jpg",
    "sku": "n12485",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Tiani 3 is the new and improved version of LELOs original Red Dot Design Award-winning couples massager, worn by women when making love. The powerful vibrations provide targeted sensations to the clitoris, while the smooth silicone design gives ultimate pleasure and comfort. Waterproof, rechargeable and remote-controlled, Tiani 3 is the go-to LELO design for sharing simultaneous orgasms with y",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 632,
    "name": "LELO Gigi 3 App Controlled G-Spot Vibrator Deep Rose",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12893-lelo-gigi3-app-controlled-gspot-vibrator-deep-rose-1.jpg",
    "sku": "n12893",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Gigi 3 has a redesigned shape, curved, to ensure an optimal fit for all fans of powerful G-spot stimulation. Made from soft silicone for enhanced comfort and a better feel on the inside. The Lelo app provides access to two additional modes and offers extensive customisation options for the best experience. Features: 8 Powerful pleasure settings App-connected Precise pleasure Unique tip can be ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 633,
    "name": "Svakom Sam Neo 2 Pro Interactive Heating Sucking and Vibrating Masturbator",
    "price": 152.39,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12512-svakom-sam-neo2-pro-interactive-heating-sucking-vibrating-masturbator-1.jpg",
    "sku": "n12512",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Svakom Sam Neo 2 Pro Interactive Heating, Sucking and Vibrating Masturbator Features: Heats to 38 degrees with powerful suction and vibration for your ultimate blowjob Use the Extended O function to reduce intensity for a longer orgasm Pair with the Svakom App for extra solo and partner play options App-Controlled with world wide range, video interaction, webcam friendly USB rechargeable, Battery ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 634,
    "name": "ElectraStim FLUX Dual Channel Electrosex Stimulator",
    "price": 380.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "bondage"
    ],
    "image": "images/products/1on1/n11312-electrastim-flux-dual-channel-electrosex-stimulator-2-1.jpg",
    "sku": "n11312",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Bridging the gap between starter electro sex kits and expensive high-end units by giving you the best bits of both, Flux has been meticulously designed to be easy to use, fast to master and compatible with all our electro sex accessories. Features: Dual output 99 Intensity levels 6 Play Modes. 40+ options. OLED graphic display Motion control modes (Flick &amp; Tilt) Sound control modes (Micropho",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 635,
    "name": "LELO Billy 2 Prostate Massager Black",
    "price": 163.82,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n12481-lelo-billy2-prostate-massager-black-1.jpg",
    "sku": "n12481",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Explore new, more daring pleasure  now with 8 pleasure settings and even more power. There is simply no finer or more luxurious prostate massager for men who are serious about their personal satisfaction. And now, its waterproof and USB-rechargeable too. Features: Waterproof, ideal for bath or shower use Tapered shape for ease and comfortable insertion 8 powerful vibrating patterns Made from pre",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 636,
    "name": "LELO SONA 2 Sonic Clitoral Massager - Purple",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11233-lelo-sona2-purple-5.jpg",
    "sku": "n11233",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "SONA is the biggest step forward in pleasure for years. Instead of using standard vibrations, like your old sextoys, SONA uses sonic pulses and waves to stimulate more of the clitoris than ever before - think about it as a small subwoofer that resonates the entire clitors, not just in the part you can see. Place the mouth over the clitoris and a sensitive percussion will give you a deep-tissue m",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 637,
    "name": "LELO Surfer 2 Unisex Anal Vibrating Plug Black",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n13045-LELO-Surfer2-unisex-anal-vibrating-plug-black-1-1.jpg",
    "sku": "n13045",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Lelo Surfer 2 is a unisex anal vibrating plug suitable to solo and partner play. It offers a wide range of sensations varying from gentle vibrations to more intense pulses and features 4 manual vibration modes plus 2 more via the Lelo app, with 8 adjustable intenstiies for hands-free stimulation. Features: Ergonomic shape for any body 6 Powerful pleasure settings Love Bridge App feature Fully ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 638,
    "name": "LELO SONA Cruise Clitoral Massager Cerise",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11599-lelo-sona-cruise-cerise-8.jpg",
    "sku": "n11599",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Uses gentle sonic waves to stimulate clitoris Offers prolonged climax Whisper quiet Made from body safe silicone Waterproof Easy to clean Not for sale in Germany.",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 639,
    "name": "LELO Surfer 2 Unisex Anal Vibrating Plug Cyber Purple",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n13044-LELO-Surfer2-unisex-anal-vibrating-plug-cyber-purple-1-1.jpg",
    "sku": "n13044",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Lelo Surfer 2 is a unisex anal vibrating plug suitable to solo and partner play. It offers a wide range of sensations varying from gentle vibrations to more intense pulses and features 4 manual vibration modes plus 2 more via the Lelo app, with 8 adjustable intenstiies for hands-free stimulation. Features: Ergonomic shape for any body 6 Powerful pleasure settings Love Bridge App feature Fully ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 640,
    "name": "Svakom Primo Remote Control Warming Butt Plug - Black",
    "price": 87.62,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n10289-svakom-primo-remote-control-warming-butt-plug-1.jpg",
    "sku": "n10289",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Primo has 5 different modes, and 5 intensities in every mode, so you have 5 x 5 = 25 selections. More ways for you to explore.Despite of Primo's small size, the motor inside of his silicone body still lives up to your strongest desires. 5 different intensities, from weak to strong, which one satisfy you the most? Primo is designed with pinhole charging port, and it's completely waterproof. Do it i",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 641,
    "name": "Party Color PANTY Remote Control Vibrator Orange",
    "price": 82.54,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12767-party-color-panty-remote-control-vibrator-orange-1.jpg",
    "sku": "n12767",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Colourful and cheerful easy to use panty vibrator Features: Discreet pleasure vibrator Ergonomic design 10 Functions Remote controlled Made from silicone/ABS Waterproof Product size: 4 inches x 1.5 inches /10 cm x 3.8 cm How to use: Secure the vibrator to your pantyhose using the removable magnets on the top of the toy, ensuring the vibrating portion is positioned for optimal stimulation. Press an",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 642,
    "name": "Glyde Ultra Slimfit Strawberry Flavour Vegan Condoms 100 Bulk Pack",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11169-glyde-slimfit-strawberry-100bulk.jpg",
    "sku": "n11169",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "100 bulk pack premium vegan condom - registered with the Vegan Society since 2006 Red colour Strawberry flavour Standard shape with teat end Lubricated Nominal width: 49mm Length: 170mm Thickness: 0.062mm Glyde condoms are dairy-free, glycerin-free, paraben-free The 100% plant-based product can even be composted. Boxes are made with 100% recycled cardboard and vegetable inks. Please note that thes",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 643,
    "name": "Svakom Emma Neo 2 Wand Vibrator",
    "price": 138.42,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12750-svakom-emma-neo2-1-.jpg",
    "sku": "n12750",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Emma Neo 2 delivers powerful yet quiet vibration without transferring to the handle in an ultra lightweight, body safe design. Coloured lights show vibration settings as you enjoy optional 38oC heat setting. For more options, use Emma Neo 2 with the Svakom App and is also compatible with adult videos and cam sites. Features: Powerful vibration and 38oC heat in a lightweight body safe design Colour",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 644,
    "name": "Bathmate Hydromax 9 Penis Pump Clear",
    "price": 177.79,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11806-bathmate-hydromax9-penis-pump-clear-2.jpg",
    "sku": "n11806",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "35% More Power Than the Original Bathmate Series! The Best Selling Hydro Pump on the Market Increase Length and Girth Completely Safe to Use Harder, Stronger Erections The Hydromax9 is designed for a penis size of 7-9\" (17.5-23cm) when erect",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 645,
    "name": "Loving Joy 7.5\" Remote Gyrating & Vibrating Silicone Dildo",
    "price": 88.89,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/N12743-loving-joy-7-5-remote-gyrating-vibrating-silicone-dildo-DUO.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Loving Joy 7.5\" Remote Gyrating &amp; Vibrating Silicone Dildo Features: 10 Functions Gyrating and vibrating Remote controlled (Rechargeable) Made from silicone Real like feel Suction base for hands free fun Product total length: 8.75 inches/22 cm, Insertable length: 6.25 inches/16 cm, Circumference: 5.25 inches/13.5 cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 646,
    "name": "Loving Joy 7.5\" Remote Thrusting & Vibrating Silicone Dildo",
    "price": 88.89,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/N12744-loving-joy-7-5-remote-thrusting-vibrating-silicone-dildo-DUO.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Loving Joy 7.5\" Remote Thrusting Silicone Dildo Features: 10 Functions Thrusting and vibrating Remote controlled (Rechargeable) Made from silicone Real like feel Suction base for hands free fun Product total length: 8.25 inches/21 cm, Insertable length: 6.5 inches/16.5 cm, Circumference: 5 inches/12.5 cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 647,
    "name": "MYLO 3-in-1 Body Wand Massager Earth",
    "price": 140.97,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/N13050-mylo-3-in-1-body-wand-massager-earth.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Elevate your intimate wellness ritual and deepen your connection to pleasure with the MYLO Luxury 3-in-1 Body Wand Massager. This premium device is inspired by the five elements - Air, Earth, Fire, Water, and Spirit, to awaken your sensual energy. Crafted from soft, medical-grade silicone and featuring an ergonomic, flexible design, MYLO adapts seamlessly to your body. It is powered by three indep",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 648,
    "name": "MYLO 3-in-1 Body Wand Massager Fire",
    "price": 140.97,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/N13051-mylo-3-in-1-body-wand-massager-fire.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Elevate your intimate wellness ritual and deepen your connection to pleasure with the MYLO Luxury 3-in-1 Body Wand Massager. This premium device is inspired by the five elements - Air, Earth, Fire, Water, and Spirit, to awaken your sensual energy. Crafted from soft, medical-grade silicone and featuring an ergonomic, flexible design, MYLO adapts seamlessly to your body. It is powered by three indep",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 649,
    "name": "MYLO 3-in-1 Body Wand Massager Air",
    "price": 140.97,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/N13049-mylo-3-in-1-body-wand-massager-air.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Elevate your intimate wellness ritual and deepen your connection to pleasure with the MYLO Luxury 3-in-1 Body Wand Massager. This premium device is inspired by the five elements - Air, Earth, Fire, Water, and Spirit, to awaken your sensual energy. Crafted from soft, medical-grade silicone and featuring an ergonomic, flexible design, MYLO adapts seamlessly to your body. It is powered by three indep",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 650,
    "name": "MYLO 3-in-1 Body Wand Massager Water",
    "price": 140.97,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/N13052-mylo-3-in-1-body-wand-massager-water.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Elevate your intimate wellness ritual and deepen your connection to pleasure with the MYLO Luxury 3-in-1 Body Wand Massager. This premium device is inspired by the five elements - Air, Earth, Fire, Water, and Spirit, to awaken your sensual energy. Crafted from soft, medical-grade silicone and featuring an ergonomic, flexible design, MYLO adapts seamlessly to your body. It is powered by three indep",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 651,
    "name": "Doc Johnson Main Squeeze Stamina Trainer Male Masturbator",
    "price": 100.32,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11176-doc-johnson-main-squeeze-endurance-trainer-male-masturbator-1-1.jpg",
    "sku": "n11176",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Uniquely Textured ULTRASKYN Masturbator with Hard Outer Case Builds Stamina and Improves Sexual Well-Being Lifelike ULTRASKYN Warms to the Touch Squeeze Plate Allows User to Control Pressure End Cap Twists to Adjust Suction Strength Screw-on Top for Discreet Storage Fully Disassembles for Cleaning Phthalate-Free, Body-Safe",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 652,
    "name": "LELO Switch Dual Ended Vibrator Lilac",
    "price": 228.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12980-lelo-switch-dual-ended-vibrator-lilac-1-1.jpg",
    "sku": "n12980",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "This dual ended vibrator is designed for versatile pleasure. With two powerful motors, one for external stimulation and one for internal, it offers targeted stimulation at both ends! The wand head features soft ribs for clitoral pleasure whilst the other end delivers deep vaginal vibrations. You can also connect to the Lelo app for remote control and customisable settings. Features: App connected,",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 653,
    "name": "Rough Rider Pleasure Doll",
    "price": 228.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "dolls"
    ],
    "image": "images/products/1on1/n11645-rough-rider-pleasure-doll-1.jpg",
    "sku": "n11645",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Perfectly formed male torso Dual Density dildo with flexible shaft Torso size: Length 10 inch / 25,4 cm Width 10 inch / 25,4 cm Height 5 inch / 12,7 cm Dildo size: Length 7.5 inch / 19 cm Insertable length 6.75 inch / 17,1 cm Width 1.5 inch / 3,8 cm Silicone, water based, hybrid lube safe",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 654,
    "name": "Svakom Cici Flexible Head Vibrator Violet",
    "price": 92.7,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n10960-svakom-cici-1.jpeg",
    "sku": "n10960",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "&nbsp; &nbsp; Small Size, discreet for travelling and safe travel lock USB rechargeable. Whisper Quiet Waterproof Made from environmentally friendly silicone material",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 655,
    "name": "Svakom Hannes Neo Heat Vibrating Male Masturbator",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12090-svakom-hannes-neo-heat-vibrating-male-masturbator-1.jpg",
    "sku": "n12090",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Hannes Neo is the latest addition to the Svakom Neo range and combines a heat function with 7 intense auto-thrusting modes with special focus on the tip of the penis for your ultimate pleasure. As with all the Neo range, the Hannes is app-enabled so you can hand over the controls to your partner whether they are in the next room or on the other side of the world. Just download the FeelConnect3",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 656,
    "name": "LELO Sona 2 Travel Clitoral Massager Purple",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12344-lelo-sona2-travel-purple-1.jpg",
    "sku": "n12344",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Sona 2 Travel is the compact version of the best selling Sona 2 clitoral massager. It uses Lelo's signature technology to offer powerful sonic wave stimulation to the clitoris but has been developed to enhance the user's intimate experience with its sleek, discreet and compact design, making it the perfect travel companion for pleasure seekers allowing easy access to orgasms at all times! Feat",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 657,
    "name": "Svakom Galaxie Suction Vibrator with Mood Projector Midnight Black",
    "price": 114.29,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12374-svakom-galaxie-suction-vibrator-mood-projector-black-1.jpg",
    "sku": "n12374",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Svakom Galaxie Suction Vibrator with Mood Projector 5 modes and 5 intensities of suction style clitoral stimulation Long distance APP control Starry display projected from charging dock creating atmospheric mood Pair with Svakom App for extra solo and partnered play options Memory Function Resume on last suction mode used and avoid accidental turn-ons Travel Lock https://dai.ly/k2fpD98Bl1QXQqzXzuK",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 658,
    "name": "Jes-Extender Light Standard",
    "price": 208.27,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n9744-Jes-Extender_Light-1.jpg",
    "sku": "n9744",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "The Jes-Extender Light is our entry price version of penis enlargers. The Jes-Extender Light comes with: Basel Unit Dual function front piece Comfort strap front piece Two 2 inch/5 cm elongation bars Two 1 inch/2,5 cm elongation bars Protection pad 1 year warranty Double Money Back Guarantee (terms apply) Please note this product can only be used on penis sizes up to 17cm (6.7 inches). Penis tract",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 659,
    "name": "Svakom Edeny App Controlled Knicker Vibrator",
    "price": 114.29,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n11601-svakom-eden-app-controlled-clitoral-stimulator-1.jpg",
    "sku": "n11601",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "APP-controlled, Bluetooth enabled. App available in App Store and Google Play Store Comes with a thong for discreet use (thong has elastic waistband to fit most sizes up to 42 inches/107cm) Hi-tech device wrapped in a silky, curved, ergonomic design Music mode Free touch mode Long distance mode 11 vibration modes Ultra-soft and eco-friendly material Runs, at least, 1 hour on a 1-hour charge USB re",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 660,
    "name": "SilexD 8 inch Realistic Liquid Silicone Dildo with Suction Cup",
    "price": 82.54,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12881-silexd-8inch-Realistic-liquid-Silicone-dildo-wsuction-cup-1.jpg",
    "sku": "n12881",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "SilexD 8 inch Realistic Liquid Silicone Dildo with Suction Cup Features: Made from premium super soft liquid silicone Durable, flexible and realistic dildo Thermoreactive - can soften in microwave or harden in the freezer Strong suction base Total Length: 20 cm, Insertable Length: 19cm, Diameter: 4.3 cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 661,
    "name": "LELO Tiani 2 Design Edition Couples Vibrator Deep Rose",
    "price": 165.09,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n8814-lelo_tiani_2_design_edition_deep_rose-1_1.jpg",
    "sku": "n8814",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Lelo's award-winning couple's massager is back and even more fabulous than before! The Tiani 2 Design Edition has been created to be worn by women when making love with a man. This gorgeous piece of bedroom kit can be controlled wirelessly by the clever, built-in SenseMotion technology that allows the user to change and adapt sensations during lovemaking through the movements of the included remot",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 662,
    "name": "Bathmate Hydromax 7 Penis Pump Clear",
    "price": 139.69,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n10640-bathmate-hydromax7-penis-pump-clear-2.jpg",
    "sku": "n10640",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "35% More Power Than the Original Bathmate Series! The Best Selling Hydro Pump on the Market Increase Length and Girth Completely Safe to Use Harder, Stronger Erections",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 663,
    "name": "ElectraStim Flick Stimulator Multi Pack EM60-M",
    "price": 203.19,
    "category": "luxury",
    "tags": [
      "luxury",
      "bondage"
    ],
    "image": "images/products/1on1/n8719-electrastim-flick-EM60-M-1.jpg",
    "sku": "n8719",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "ElectraStim Flick is a revolution in electro stimulation technology! The new Flick controller from ElectraStim not only has seven built in programmes including, escalating patterns, it's also able to stimulate in rhythm with the flicking movements of the control unit! Add your own personal stimulation beat or stimulate in time with your own wrist movements during masturbation, the patent pending f",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 664,
    "name": "Femintimate Daisy Clitoral Massager",
    "price": 95.24,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12416-femintimate-daisy-clitoral-massager-1.jpg",
    "sku": "n12416",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Femintimate Daisy Massager is a personal massager and intimate stimulator designed for women`s well-being. Its ergonomic design allows a comfortable hold and use. Made with phthalate-free high quality super soft silicone and ABS. It has two super powerful and super quiet motors with 10 suction and vibration modes. Rechargeable and waterproof. &nbsp;",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 665,
    "name": "Rev Sucking and Vibrating Male Masturbator",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/N12956-rev-suction-vibrating-masturbator-Pkg-DUO.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Rev Sucking and Vibrating Male Masturbator Features: Sucking and vibrating male masturbator 7 functions (4 speeds and 3 patterns) Pressure release valve on back LED display shows suction level Removeable sleeve Made from TPE and ABS USB rechargeable Insertable length: 5 inches/12cm Instructions for use: Press and hold the vibrate button to turn vibration on or off. Similarly, press and hold the su",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 666,
    "name": "Mina Surge Remote Thrusting & Vibrating Strapless Strap On",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12530-mina-remote-thrusting-vibrating-strapless-strap-on-1.jpg",
    "sku": "n12530",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Mina Surge Remote Thrusting &amp; Vibrating Strapless Strap On Product features: Remote controlled 3 Thrusting modes 10 vibrating modes 3 motors Made from silicone Waterproof (Level IPX6) Rechargeable Total length: 9.37 inches / 23.8cm Insertable length: 5.2 inches / 13.2cm Diameter of shaft: 1.45 inches / 3.7cm Diameter of base: 1.29 inches / 3.28cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 667,
    "name": "Svakom Sam Neo 2 Interactive Sucking and Vibrating Masturbator",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12511-svakom-sam-neo2-interactive-sucking-vibrating-masturbator-1.jpg",
    "sku": "n12511",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Svakom Sam Neo 2 Interactive Sucking and Vibrating Masturbator Features: Independent suction and vibration create powerful blowjob sensations Use the Extended O function to reduce intensity for a longer orgasm Interactive Suction and Vibration Masturbator Pair with the Svakom App for extra solo and partner play options App-Controlled with world wide range, adult video interaction, webcam friendly ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 668,
    "name": "Svakom Duoglow 2in1 Vibrator",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12981-svakom-duolepa-2in1-vibrator-1.jpg",
    "sku": "n12981",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "For 2-in-1 versatility the Duoglow features two interlocking parts, a powerful vibrator and a versatile stimulator. You can use them together for blended, all over pleasure or separately for targeted sensations. The stimulator also doubles as a standalone remote for the vibrator when desired. The vibrator features a double beaded thrusting band designed to move to your rhythm. Use the customisable",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 669,
    "name": "Doc Johnson Platinum The Gal Pal",
    "price": 72.38,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n8034-platinum_the_gal_pal-1-1.jpg",
    "sku": "n8034",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Welcome to the girl's best friend... the Gal Pal from Doc Johnson's Platinum range! This ergonomically designed strapless strap on is presented in an iridescent purple colour and made from gorgeously sumptuous, phthalate free premium silicone for optimum comfort and sensuality. This strapless strap on stimulates both the wearer and the one receiving... slip the plug style dong inside and pleasure ",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 670,
    "name": "Svakom Iker Neo Prostate Massager",
    "price": 110.48,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n12749-svakom-iker-neo-1-.jpg",
    "sku": "n12749",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Iker Neo triples your pleasure with powerful vibration and pulsation for your prostate and vibrating perineal massage. The flexible neck allows for easier positioning while coloured lights on the base indicate vibration modes. For more options, use Iker Neo with the Svakom App and is also compatible with adult videos and cam sites. Features: Vibrating shaft with independent pulsation for your pros",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 671,
    "name": "Svakom Margot G-Spot Vibrator Lilac",
    "price": 110.48,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12982-svakom-margot-gspot-vibrator-lilac-1.jpg",
    "sku": "n12982",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Margot delivers deep, rumbly power right where you want it! Featuring two motors, one in the head and one in the neck. Features: Deep vibration and warming dual motor stimulation 5 Vibration modes and 1 heating mode with 10 intensity levels Angles head for targeted g-spot pleasure Made from soft, double layered silicone Use Svakom app to customise modes and play long distance Travel lock, memory f",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 672,
    "name": "Doc Johnson Dick Rambone Black",
    "price": 101.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n9084-doc_johnson_dick_rambone_black-1.jpg",
    "sku": "n9084",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Are you ready for the ride of your life? The Dick Rambone by Doc Johnson is 15 inches full of realistic pleasure, moulded from the eponymous porn star, famous for his well-endowed package. Its safe to say that this black monster will never leave you wanting more, with those brave enough to take him on left more than weak at the knees. The bonus of a suction cup base adds the ability of hands-free",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 673,
    "name": "Male Edge Pro",
    "price": 207.0,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n5779-male-edge-pro-01.jpg",
    "sku": "n5779",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Male Edge is a revolutionary new penis extender to deliver maximum results in minimum time! From the makers of the Jes Extender, the most successful penis extender in the world to date, comes this updated, stronger, lighter weight version that is guaranteed to make you bigger, quicker! Male Edge works through traction. It expands the skin tissue using its unique traction mechanism. This stimulates",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 674,
    "name": "Bathmate Hydromax 5 Penis Pump Clear",
    "price": 126.99,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11805-bathmate-hydromax5-penis-pump-clear-2.jpg",
    "sku": "n11805",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "35% More Power Than the Original Bathmate Series! The Best Selling Hydro Pump on the Market Increase Length and Girth Completely Safe to Use Harder, Stronger Erections The Hydromax5 is designed for a penis size of 3-5\" (7.5-12.5cm) when erect",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 675,
    "name": "We-Vibe Wand 2 Purple",
    "price": 184.14,
    "category": "luxury",
    "tags": [
      "luxury",
      "couples"
    ],
    "image": "images/products/1on1/n12849-we-vibe-wand2-purple-1.jpg",
    "sku": "n12849",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "We-Vibe Wand 2 is the ultimate vibrating massager. Cordless and extremely powerful, itll deliver the climax of your dreams. Its pleasure-shaped, flexible head and compact, ergonomic handle ensure those deep, satisfying vibrations are right where you want them. Features: 10 intensity levels Cordless power Versatile pleasure head App control Whisper quiet Rechargeable Waterproof &nbsp; Please note:",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 676,
    "name": "LELO SONA Sonic Clitoral Massager - Cerise",
    "price": 101.59,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n10625-lelo-sona-sonic-clitoral-massager-cerise-1.jpg",
    "sku": "n10625",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "SONA is the biggest step forward in pleasure for years. Instead of using standard vibrations, like your old sextoys, SONA uses sonic pulses and waves to stimulate more of the clitoris than ever before - think about it as a small subwoofer that resonates the entire clitors, not just in the part you can see. Place the mouth over the clitoris and a sensitive percussion will give you a deep-tissue m",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 677,
    "name": "Bound to Please Dog Mask",
    "price": 63.49,
    "category": "luxury",
    "tags": [
      "luxury",
      "bondage"
    ],
    "image": "images/products/1on1/N12240-bound-to-please-dog-mask.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Bound to Please Dog Mask Product features: Dog Mask Bondage Hood Removable ears, snout, blindfold and padded gag Snout features zip Fixed collar with o-ring Adjustable laced back Padlockable 6-hole prong fastening Gag insertable: 2.5 inches / 6 cm Gag width: 2 inches / 5 cm wide Gag circumference: 4.75 inches / 12 cm Collar adjustable circumference: Smallest - 14 inches (35.5 cm) / Largest - 20 in",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 678,
    "name": "SilexD Real Skin 8 inch Silicone Dildo with Balls",
    "price": 88.89,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n13001-silexd-real-skin-8inch-silicone-dildo-wballs-1.jpg",
    "sku": "n13001",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "SilexD Real Skin 8 inch Silicone Dildo with Balls Features: Made from premium super soft liquid silicone Durable, flexible and realistic dildo Dual density with soft exterior and firm core Thermoreactive - can soften in microwave or harden in the freezer Strong suction base Total Length: 20 cm, Insertable Length: 16cm, Diameter: 4.2 cm",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 679,
    "name": "Glyde Ultra Supermax Vegan Condoms 100 Bulk Pack",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11116-glyde-supermax-1.jpg",
    "sku": "n11116",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "100 bulk pack Extra large premium vegan condom registered with the Vegan Society since 2006 Natural colour No flavour Standard shape with teat end Lubricated Nominal width: 60mm Length: 200mm Thickness: 0.062mm Glyde condoms are dairy-free, glycerin-free, paraben-free The 100% plant-based product can even be composted. Boxes are made with 100% recycled cardboard and vegetable inks. Please note tha",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 680,
    "name": "Glyde Ultra Maxi Vegan Condoms 100 Bulk Pack",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11115-glyde-maxi-1.jpg",
    "sku": "n11115",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "100 bulk pack premium vegan condom - registered with the Vegan Society since 2006 Extra Long and wide Natural colour No flavour Standard shape with teat end Lubricated Nominal width: 56mm Length: 190mm Thickness: 0.062mm Glyde condoms are dairy-free, glycerin-free, paraben-free The 100% plant-based product can even be composted. Boxes are made with 100% recycled cardboard and vegetable inks. Pleas",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 681,
    "name": "Glyde Ultra Blueberry Flavour Vegan Condoms 100 Bulk Pack",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11167-glyde-blueberry-100bulk.jpg",
    "sku": "n11167",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "100 bulk pack premium vegan condom - registered with the Vegan Society since 2006 Violet colour Wildberry flavour Standard shape with teat end Lubricated Nominal width: 53mm Length: 180mm Thickness: 0.062mm Glyde condoms are dairy-free, glycerin-free, paraben-free The 100% plant-based product can even be composted. Boxes are made with 100% recycled cardboard and vegetable inks. Please note that th",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 682,
    "name": "Glyde Ultra Slimfit  Vegan Condoms 100 Bulk Pack",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n11293-glyde-slimfit-1.jpg",
    "sku": "n11293",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "100 bulk pack premium vegan condom - registered with the Vegan Society since 2006 Natural/transparent colour No flavour Standard shape with teat end Lubricated Nominal width: 49mm Length: 170mm Thickness: 0.062mm Glyde condoms are dairy-free, glycerin-free, paraben-free The 100% plant-based product can even be composted. Boxes are made with 100% recycled cardboard and vegetable inks. Please note t",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 683,
    "name": "Svakom Selena G-Spot Vibrator",
    "price": 97.78,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n13000-svakom-selena-gspot-vibrator-DUO.jpg",
    "sku": "n13000",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Selena is a dual motor, app-controlled vibrator designed for precision pleasure. Featuring a warming tip, rhythmic thrusting and a ridged head for targeted sensations. The ridged head is designed to guide vibration towards its centre, creating consistent stimulation exactly where you want it, whilst the warmth of the tip enhances every movement. Use the Svakom app or KooSync App for customised con",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 684,
    "name": "SilexD 8.5 inch Remote Controlled Vibrating Girthy Silicone Dildo",
    "price": 107.94,
    "category": "luxury",
    "tags": [
      "luxury",
      "anal"
    ],
    "image": "images/products/1on1/n12979-silexd-8.5inch-remote-controlled-vibrating-girthy-dildo-1.jpg",
    "sku": "n12979",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Model 1 8.5 inch Realistic Vibrating Dildo with wireless remote control. Features: Realistic, lifelike design Super soft touch dual density silicone with a soft exterior and a firm core Flexible and comfortable Extra strong suction base 10 Vibration modes USB Rechargeable 1 Powerful motor Made from thermo-reactive silicone Total Length: 8.07 inches/20.5 cm, Insertable Length: 6.7 inches/17cm, Inse",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 685,
    "name": "We-Vibe Melt Pink",
    "price": 171.44,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12848-we-vibe-melt-pink-1.jpg",
    "sku": "n12848",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Melt was developed to allow couples to fully experience the intense orgasms of Pleasure Air technology. The slim shape lets Melt slip between partners during sex, enhancing intimacy with precision clitoral stimulation. Features: Air pressure clitoral stimulator 10 intensity levels App control Whisper quiet Rechargeable Waterproof &nbsp; Please note: It is NOT allowed to sell We-Vibe products on th",
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 686,
    "name": "Svakom Cici 2 Flexible Head Slim Vibrator",
    "price": 92.7,
    "category": "luxury",
    "tags": [
      "luxury",
      "toys"
    ],
    "image": "images/products/1on1/n12442-svakom-cici2-flexible-head-vibrator-1.jpg",
    "sku": "n12442",
    "supplier": "luxury_play",
    "dropship": true,
    "inStock": true,
    "description": "Cici is the new standard in luxury clitoral stimulators and now app-compatible! The Svakom Cici is a super powerful clitoris massager which is slim and flexible with an arched head to target the G-Spot. Boasting 5 vibration modes and 5 intensities and added warmth to 38 degrees centigrade. Memory function Unique ribbed flexible head for use at any angle Small Size, discreet for travelling and safe",
    "shippingNote": "7–10 business days · Premium shipping"
  }
,
  {
    "id": 901,
    "name": "Loving Joy 7.5\" Remote Gyrating & Vibrating Silicone Dildo",
    "price": 75.56,
    "comparePrice": 88.89,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "dildo", "app-controlled"],
    "image": "images/products/1on1/n12743-loving-joy-7-5-remote-gyrating-vibrating-silicone-dildo-DUO.jpg",
    "sku": "n12743",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Loving Joy 7.5\" Remote Gyrating &amp; Vibrating Silicone Dildo  Features: <ul>  	<li>10 Functions</li>  	<li>Gyrating and vibrating</li>  	<li>Remote controlled (Rechargeable)</li>  	<li>Made from silicone</li>  	<li>Real like feel</li>  	<li>Suction base for hands free fun</li>  	<li>Product total ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 902,
    "name": "Loving Joy 7.5\" Remote Thrusting & Vibrating Silicone Dildo",
    "price": 75.56,
    "comparePrice": 88.89,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "dildo", "app-controlled"],
    "image": "images/products/1on1/n12744-loving-joy-7-5-remote-thrusting-vibrating-silicone-dildo-DUO.jpg",
    "sku": "n12744",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Loving Joy 7.5\" Remote Thrusting Silicone Dildo  Features: <ul>  	<li>10 Functions</li>  	<li>Thrusting and vibrating</li>  	<li>Remote controlled (Rechargeable)</li>  	<li>Made from silicone</li>  	<li>Real like feel</li>  	<li>Suction base for hands free fun</li>  	<li>Product total length: 8.25 i",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 903,
    "name": "Mates SKYN Original Condom BX144 Clinic Pack",
    "price": 139.25,
    "comparePrice": 163.82,
    "category": "luxury",
    "tags": ["luxury"],
    "image": "images/products/placeholder-luxury.jpg",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "<ul>  	<li>Straight shape with teat end</li>  	<li>Smooth texture</li>  	<li>Coated with long-lasting ultra smooth lubricant</li>  	<li>Made from soft and comfortable non latex material</li>  	<li>Same strength as premium latex</li>  	<li>Natural colour</li>  	<li>Electronically tested for safety an",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 904,
    "name": "SilexD 6 inch Realistic Liquid Silicone Dildo with Suction Cup",
    "price": 59.36,
    "comparePrice": 69.84,
    "category": "luxury",
    "tags": ["luxury", "dildo", "clitoral", "silexd"],
    "image": "images/products/1on1/n12881-silexd-8inch-realistic-liquid-silicone-dildo-wsuction-cup-1.jpg",
    "sku": "n12881",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "SilexD 6 inch Realistic Liquid Silicone Dildo with Suction Cup  Features: <ul>  	<li>Made from premium super soft liquid silicone</li>  	<li>Durable, flexible and realistic dildo</li>  	<li>Thermoreactive - can soften in microwave or harden in the freezer</li>  	<li>Strong suction base</li>  	<li>To",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 905,
    "name": "Svakom Vick Neo 2 Prostate Massager",
    "price": 88.51,
    "comparePrice": 104.13,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "prostate", "svakom"],
    "image": "images/products/1on1/n10289-svakom-primo-remote-control-warming-butt-plug-1.jpg",
    "sku": "n10289",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Vick Neo 2 delivers powerful vibrations to your prostate and perineum for dual pleasure. The textured shaft twists 180 degrees and heats up to 38oC while the base has coloured lights for each mode and magnetically holds the remote control.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 906,
    "name": "Sky Stratus Tapping Plug",
    "price": 70.16,
    "comparePrice": 82.54,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "anal", "app-controlled"],
    "image": "images/products/1on1/n13044-lelo-surfer2-unisex-anal-vibrating-plug-cyber-purple-1-1.jpg",
    "sku": "n13044",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Sky Stratus Tapping Plug  Features: <ul>  	<li>10 Powerful functions</li>  	<li>Dual motors</li>  	<li>Thumping G-spot/P-spot massager</li>  	<li>Clitoral stimulator</li>  	<li>Made from body safe silicone</li>  	<li>Splash proof</li>  	<li>Product length: 3.5 inches/8.9 cm, Insertable length: 3.25 ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 907,
    "name": "Sky Nimbus G-Spot Finder",
    "price": 70.16,
    "comparePrice": 82.54,
    "category": "luxury",
    "tags": ["luxury", "vibrator"],
    "image": "images/products/1on1/n13017-lelo-sona3-cream-1.jpg",
    "sku": "n13017",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Sky Nimbus G-Spot Finder  Features: <ul>  	<li>10 Powerful functions</li>  	<li>Dual motors</li>  	<li>Thumping G-spot/P-spot massager</li>  	<li>Tapping action</li>  	<li>Clitoral stimulator</li>  	<li>Made from body safe silicone</li>  	<li>Splash proof</li>  	<li>Product length: 5 inches/12.7 cm,",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 908,
    "name": "Sky Cumulus G-Spot Stimulator",
    "price": 70.16,
    "comparePrice": 82.54,
    "category": "luxury",
    "tags": ["luxury", "vibrator"],
    "image": "images/products/1on1/n13018-lelo-sona3-cyber-purple-1.jpg",
    "sku": "n13018",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Sky Cumulus G-Spot Stimulator  Features: <ul>  	<li style=\"font-weight: 400;\" aria-level=\"1\">Targeted Pleasure: Equipped with dual motors and 10 vibration functions, this vibe delivers powerful, targeted sensation for maximum pleasure.</li>  	<li style=\"font-weight: 400;\" aria-level=\"1\">Ergonomic De",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 909,
    "name": "Svakom Cici+ 2 App Controlled Slim Rabbit Vibrator",
    "price": 80.95,
    "comparePrice": 95.24,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "rabbit", "app-controlled", "svakom"],
    "image": "images/products/1on1/n10960-svakom-cici-1.jpeg",
    "sku": "n10960",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Enjoy blended G-Spot and clitoral orgasms in an ultra slim design. Cici is the new standard in luxury clitoral stimulators and now app-compatible! Pair with the Svakom App for extra solo and partner play options.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 910,
    "name": "Loving Joy FLUX Silicone Bendable G-Spot Vibrator",
    "price": 59.36,
    "comparePrice": 69.84,
    "category": "luxury",
    "tags": ["luxury", "vibrator"],
    "image": "images/products/1on1/n12743-loving-joy-7-5-remote-gyrating-vibrating-silicone-dildo-DUO.jpg",
    "sku": "n12743",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Buy the Loving Joy Flux Silicone G-Spot Vibrator today! This bendable g-spot vibrator features an easy to use control pad at the base. The shaft is bendable allowing you to change the angle of the vibrator, giving you more control over how much targeted stimulation you want!  The Loving Joy Flux is ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 911,
    "name": "Nauti Silicone Rabbit Vibrator",
    "price": 59.36,
    "comparePrice": 69.84,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "rabbit"],
    "image": "images/products/1on1/n12379-bouncy-bliss-sit-on-vibrator.jpg",
    "sku": "n12379",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "NAUTI Silicone Rabbit Vibrator  Product features: <ul>  	<li>10 Function Rabbit Vibrator</li>  	<li>Curved tip for g-spot stimulation</li>  	<li>USB Rechargeable</li>  	<li>Made from Silicone</li>  	<li>Waterproof</li>  	<li>Total Length: 6.5 inches/16.5 cm</li>  	<li>Insertable Length: 4 inches/10 ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 912,
    "name": "Svakom Trysta Neo Targeted Rolling G-Spot Rabbit Vibrator",
    "price": 78.8,
    "comparePrice": 92.7,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "rabbit", "svakom"],
    "image": "images/products/1on1/n13000-svakom-selena-gspot-vibrator-duo.jpg",
    "sku": "n13000",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "An interactive rabbit vibrator with a 3 speed G-spot rolling ball. This new version of the popular Trysta delivers 5 vibration modes, intelligent mode and 5 intensities.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 913,
    "name": "Svakom Chika App-Controlled Flexible Warming Rabbit Vibrator",
    "price": 78.8,
    "comparePrice": 92.7,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "rabbit", "app-controlled", "svakom"],
    "image": "images/products/1on1/n12442-svakom-cici2-flexible-head-vibrator-1.jpg",
    "sku": "n12442",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "The Svakom Chika is an interactive rabbit vibrator which offers independent G-Spot and Clitoral stimulation together with 5 vibration modes, intelligent mode and 5 intensities with added warmth up to 39 degrees centigrade.  Using the app you can customise and enjoy long distance play whilst able to ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 914,
    "name": "Svakom Mora Neo Interactive Rabbit Vibrator with Thrusting Beads",
    "price": 78.8,
    "comparePrice": 92.7,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "rabbit", "app-controlled", "svakom"],
    "image": "images/products/1on1/n12982-svakom-margot-gspot-vibrator-lilac-1.jpg",
    "sku": "n12982",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "An interactive rabbit vibrator with a ring of beads which move up and down for added sensations. The beaded ring has 3 speeds and delivers 5 vibration modes, intelligent mode and 5 intensities.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 915,
    "name": "LELO Mia 3 Clitoral Vibrator Deep Rose",
    "price": 97.15,
    "comparePrice": 114.29,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "clitoral", "lelo"],
    "image": "images/products/1on1/n11982-lelo-dot-clitoral-vibrator-aqua-1.jpg",
    "sku": "n11982",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Mia 3 is a discreet personal vibrator for pleasure on the go!  Features: <ul>  	<li>8 Powerful pleasure settings, varying in intensity from teasing murmur to satisfying pulse</li>  	<li>Compact and discreet lipstick design</li>  	<li>Made from Silicone/ABS</li>  	<li>Sculpted tip for accurate pleasu",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 916,
    "name": "LELO DOT Travel Purple",
    "price": 97.15,
    "comparePrice": 114.29,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "lelo"],
    "image": "images/products/1on1/n12344-lelo-sona2-travel-purple-1.jpg",
    "sku": "n12344",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "LELO DOT Travel is a smaller clitoral pinpoint vibrator which used externally allows for multiple endless orgasms without causing numbness. It can easily fit into any bag or suitcase whilst still offering all the signature features of the original Dot and is all about providing easy access to a new ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 917,
    "name": "LELO LIV 3 App Controlled G-Spot Vibrator Deep Rose",
    "price": 97.15,
    "comparePrice": 114.29,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "app-controlled", "lelo"],
    "image": "images/products/1on1/n12893-lelo-gigi3-app-controlled-gspot-vibrator-deep-rose-1.jpg",
    "sku": "n12893",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "The Liv 3 G-spot vibrator is designed to perfectly complement the body and enhance your experience. A refined design has a curved body and rounded tip for precise internal and external stimulation.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 918,
    "name": "Svakom Ella Neo Interactive App Controlled Vibrating Egg",
    "price": 86.35,
    "comparePrice": 101.59,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "app-controlled", "svakom"],
    "image": "images/products/1on1/n12750-svakom-emma-neo2-1-.jpg",
    "sku": "n12750",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "The Svakom Ella Neo Vibrating Bullet Egg will give you a whole world of pleasures and more.  With a host of features, you will want to spend hours exploring everything that the Ella has to offer.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 919,
    "name": "Svakom Phoenix Neo Interactive App Controlled Vibrator",
    "price": 86.35,
    "comparePrice": 101.59,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "app-controlled", "svakom"],
    "image": "images/products/1on1/n11601-svakom-eden-app-controlled-clitoral-stimulator-1.jpg",
    "sku": "n11601",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Feel scorching satisfaction and step into the future of sex technology with the Svakom Phoenix Interactive App Controlled Vibrator.  Ergonomically designed to hit all the right spots, this beautiful silicone vibrator offers bulbous internal stimulation targeted at the G-spot for intense, leg-shaking",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 920,
    "name": "Svakom Phoenix Neo 2 Interactive App Controlled Vibrator",
    "price": 97.15,
    "comparePrice": 114.29,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "app-controlled", "svakom"],
    "image": "images/products/1on1/n11601-svakom-eden-app-controlled-clitoral-stimulator-1.jpg",
    "sku": "n11601",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "This is a new version of the Phoenix Neo, updated to give you more battery time and the function to turn off the light through the app whilst the improved size will comfortably fit more users.  Ergonomically designed to hit all the right spots, this beautiful silicone vibrator offers bulbous interna",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 921,
    "name": "Svakom Galaxie Suction Vibrator with Mood Projector Metallic Lilac",
    "price": 97.15,
    "comparePrice": 114.29,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "clitoral", "svakom"],
    "image": "images/products/1on1/n12374-svakom-galaxie-suction-vibrator-mood-projector-black-1.jpg",
    "sku": "n12374",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Svakom Galaxie Suction Vibrator with Mood Projector <ul>  	<li>5 modes and 5 intensities of suction style clitoral stimulation</li>  	<li>Long distance APP control</li>  	<li>Starry display projected from charging dock creating atmospheric mood</li>  	<li>Pair with Svakom App for extra solo and part",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 922,
    "name": "Mina Echo Remote Vibrating Strapless Strap On",
    "price": 86.35,
    "comparePrice": 101.59,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "couples", "app-controlled"],
    "image": "images/products/1on1/n12530-mina-remote-thrusting-vibrating-strapless-strap-on-1.jpg",
    "sku": "n12530",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Mina Echo Remote Vibrating Strapless Strap On  Product features: <ul>  	<li>Remote controlled</li>  	<li>10 vibrating modes</li>  	<li>2 motors</li>  	<li>Made from silicone</li>  	<li>Waterproof (Level IPX6)</li>  	<li>Rechargeable</li>  	<li>Total Length: 9.5 inches / 24 cm</li>  	<li>Insertable l",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 923,
    "name": "Toosh Remote Controlled Metal Vibrating Anal Beads",
    "price": 59.36,
    "comparePrice": 69.84,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "anal", "app-controlled"],
    "image": "images/products/1on1/n12341-lelo-soraya-anal-beads-black-1.jpg",
    "sku": "n12341",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Toosh Remote Controlled Metal Vibrating Anal Beads  Features: <ul>  	<li>One touch 10 speed vibrator</li>  	<li>Remote controlled</li>  	<li>Magnetic USB charger</li>  	<li>Made from aluminium alloy</li>  	<li>Insertable length: 3.8 inches / 97 mm</li>  	<li>Total length: 4.2 inches / 107 mm</li>  	",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 924,
    "name": "Toosh Remote Controlled Metal Vibrating Anal Plug",
    "price": 59.36,
    "comparePrice": 69.84,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "anal", "app-controlled"],
    "image": "images/products/1on1/n12341-lelo-soraya-anal-beads-black-1.jpg",
    "sku": "n12341",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Toosh Remote Controlled Metal Vibrating Anal Plug  Features: <ul>  	<li>One touch 10 speed vibrator</li>  	<li>Remote controlled</li>  	<li>Magnetic USB charger</li>  	<li>Made from aluminium alloy</li>  	<li>Insertable length: 4.3 inches / 109 mm</li>  	<li>Total length: 4.6 inches / 117mm</li>  	<",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 925,
    "name": "ElectraStim Flick Stimulator Pack EM60-E",
    "price": 118.74,
    "comparePrice": 139.69,
    "category": "luxury",
    "tags": ["luxury", "electro"],
    "image": "images/products/1on1/n8719-electrastim-flick-em60-m-1.jpg",
    "sku": "n8719",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "ElectraStim Flick is a revolution in electro stimulation technology!  Flick not only has seven built in programmes including, escalating patterns but it is also able to stimulate in rhythm with the flicking movements of the control unit!  Whether you simply want to add your own personal stimulation ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 926,
    "name": "Svakom Vick Remote Control Prostate Massager",
    "price": 78.8,
    "comparePrice": 92.7,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "prostate", "app-controlled", "svakom"],
    "image": "images/products/1on1/n10289-svakom-primo-remote-control-warming-butt-plug-1.jpg",
    "sku": "n10289",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "<ul>  	<li>Perfect angle for prostate stimulation</li>  	<li>Remote Control mades positioning easier</li>  	<li>Multiple angles for G-spot and clitoris stimulation</li>  	<li>Svakom Intelligent Mode</li>  	<li>Powerful vibrations</li>  	<li>Waterproof up to 1 metre</li>  	<li>Made from eco friendly ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 927,
    "name": "SilexD 8.5 inch Realistic Silicone Dual Density Girthy Dildo with Suction Cup with Balls",
    "price": 64.76,
    "comparePrice": 76.19,
    "category": "luxury",
    "tags": ["luxury", "dildo", "clitoral", "silexd"],
    "image": "images/products/1on1/n12881-silexd-8inch-realistic-liquid-silicone-dildo-wsuction-cup-1.jpg",
    "sku": "n12881",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Buy this high quality 8.5 inch Realistic Silicone Dual Density Girthy Dildo with Suction Cup with Balls today!.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 928,
    "name": "SilexD 7 inch Real Skin Liquid Silicone Dildo with Suction Cup and Balls",
    "price": 64.76,
    "comparePrice": 76.19,
    "category": "luxury",
    "tags": ["luxury", "dildo", "clitoral", "silexd"],
    "image": "images/products/1on1/n12881-silexd-8inch-realistic-liquid-silicone-dildo-wsuction-cup-1.jpg",
    "sku": "n12881",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "Super realistic 7 inch Silicone Dildo with Suction Cup and balls  Features: <ul>  	<li>Made from premium liquid silicone</li>  	<li>Realistic feel mimics the sensation of the real thing</li>  	<li>Dual Density design features soft exterior and firm core</li>  	<li>Hypoallergenic and body safe</li>  ",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 929,
    "name": "Adrien Lastic Dual Density Cushioned Core Vibrating Suction Cup Silicone Dildo 6.5 Inch",
    "price": 64.76,
    "comparePrice": 76.19,
    "category": "luxury",
    "tags": ["luxury", "vibrator", "dildo", "clitoral", "adrien-lastic"],
    "image": "images/products/1on1/n12754-adrien-lastic-venus-hands-free-double-vibrator-1.jpg",
    "sku": "n12754",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "This dual density dildo 6.5 Inch has an integrated motor with 10 vibration modes and is made from super soft silicone. The dual density give it a realistic feel with a soft outer skin and firm inner core.",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  },
  {
    "id": 930,
    "name": "Nauti Silicone Ribbed Vibrator",
    "price": 53.97,
    "comparePrice": 63.49,
    "category": "luxury",
    "tags": ["luxury", "vibrator"],
    "image": "images/products/1on1/n12379-bouncy-bliss-sit-on-vibrator.jpg",
    "sku": "n12379",
    "supplier": "luxury_play",
    "dropship": true,
    "qty": null,
    "inStock": true,
    "description": "NAUTI Silicone Ribbed Vibrator  Product features: <ul>  	<li>10 Function Ribbed Vibrator</li>  	<li>USB Rechargeable</li>  	<li>Made from Silicone</li>  	<li>Waterproof</li>  	<li>Total Length: 6.5 inches/16.5 cm</li>  	<li>Insertable Length: 5 inches/12.5 cm</li>  	<li>Circumference at widest point",
    "details": ["Body-safe premium materials","USB rechargeable","Discreet packaging","7–10 business days shipping"],
    "shippingNote": "7–10 business days · Premium shipping"
  }
];

const TOPDAWG_PRODUCTS = []; // TopDawg — NIXED supplier removed

// ── MERGE LOGIC ─────────────────────────────────────────────
// ============================================================
// PRODUCTS.JS — merge layer only. Product DATA lives in:
//   products-physical.js  (IDs 1–13,  13 items  — UPS shipped by Ashley)
//   products-dl.js        (IDs 14–27, 14 items  — Dear Lover dropship)
//
// ⚠️  PROTECTION PROTOCOL:
//   • Never edit product DATA here — edit the correct data file.
//   • Integrity check locks counts. If any count drops, zip is blocked.
// ============================================================

// Merge all product sources (loaded before this file via index.html)
// ── CNV WHOLESALE PRODUCTS (IDs 701–712) ─────────────────────
// Supplier: CNV (wholesale.sextoy.com) | Premium brands: Womanizer, We-Vibe, Lovense
// Free dedicated dropship portal | No supplier name customer-facing
// Shipping: 7–14 business days (international fulfillment)
const CNV_PRODUCTS = [
  { id: 701, name: "Womanizer Premium 2 — Clitoral Stimulator (Black)", price: 164.99, comparePrice: 219.00, category: "toys", tags: ["vibrator","suction","clitoral","womanizer","premium","luxury"], supplier: "cnv", dropship: true, qty: null, description: "The icon, upgraded. Womanizer Premium 2 delivers Pleasure Air® technology with 14 intensity levels, autopilot mode, and a whisper-quiet motor. 100% waterproof, rechargeable, and made from premium body-safe silicone. The one they keep coming back for.", details: ["Pleasure Air® suction technology","14 intensity levels + Autopilot mode","100% waterproof","USB rechargeable","Body-safe silicone","Whisper-quiet SmartSilence®"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 702, name: "Womanizer Classic 2 — Clitoral Stimulator (Bordeaux)", price: 109.99, comparePrice: 139.00, category: "toys", tags: ["vibrator","suction","clitoral","womanizer","classic","luxury"], supplier: "cnv", dropship: true, qty: null, description: "Classic never looked this good. The Womanizer Classic 2 brings Pleasure Air® technology with 12 intensity levels into an elegant form redesigned for modern comfort. Fully waterproof, USB rechargeable, and wrapped in premium silicone.", details: ["12 intensity levels","Pleasure Air® technology","100% waterproof","USB rechargeable","Premium body-safe silicone"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 703, name: "Womanizer Liberty — Travel Clitoral Stimulator (Raspberry)", price: 89.99, comparePrice: 119.00, category: "toys", tags: ["vibrator","suction","clitoral","womanizer","travel","luxury"], supplier: "cnv", dropship: true, qty: null, description: "Luxury in your carry-on. The Womanizer Liberty is a compact, travel-ready Pleasure Air® stimulator with magnetic closure cap and 6 intensity levels. Discreet, powerful, and airport-approved.", details: ["6 intensity levels","Magnetic closure cap","Travel-friendly size","100% waterproof","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 704, name: "Womanizer Starlet 3 — Entry Luxury Stimulator (Black)", price: 59.99, comparePrice: 79.00, category: "toys", tags: ["vibrator","suction","clitoral","womanizer","starlet","beginner"], supplier: "cnv", dropship: true, qty: null, description: "Where luxury begins. The Womanizer Starlet 3 delivers the legendary Pleasure Air® experience at an accessible price point — 4 intensity levels, 100% waterproof, and the silicone head for effortless positioning.", details: ["4 intensity levels","Pleasure Air® technology","100% waterproof","USB rechargeable","Body-safe materials"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 705, name: "We-Vibe Sync O — App-Controlled Couples Vibrator", price: 154.99, comparePrice: 199.00, category: "couples", tags: ["vibrator","couples","we-vibe","app-controlled","luxury","wearable"], supplier: "cnv", dropship: true, qty: null, description: "Designed for two. The We-Vibe Sync O features a flexible adjustable design for external + internal stimulation simultaneously — controlled via the We-Connect app from anywhere. 10 intensity levels, whisper-quiet, fully waterproof.", details: ["Adjustable flexible design","Dual stimulation (internal + clitoral)","We-Connect app control","10 vibration modes","100% waterproof","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 706, name: "We-Vibe Moxie+ — Wearable Panty Vibrator (Dusty Pink)", price: 109.99, comparePrice: 149.00, category: "couples", tags: ["vibrator","wearable","panty","we-vibe","app-controlled","hands-free"], supplier: "cnv", dropship: true, qty: null, description: "Wear it anywhere. The We-Vibe Moxie+ clips discreetly into any underwear for hands-free clitoral stimulation — partner-controlled or solo, in public or private. Magnetic charge, whisper-quiet, up to 2 hrs battery.", details: ["Magnetic clip-on design","We-Connect app + remote control","10 vibration modes","Whisper-quiet motor","Up to 2 hours battery","Waterproof"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 707, name: "We-Vibe Bond — App-Controlled Cock Ring", price: 79.99, comparePrice: 109.00, category: "couples", tags: ["cock-ring","couples","we-vibe","app-controlled","vibrating","men"], supplier: "cnv", dropship: true, qty: null, description: "Shared pleasure, elevated. The We-Vibe Bond is a stretchy, flexible vibrating cock ring with 10 vibration modes and app control via We-Connect. Adds intensity for him while the external vibe reaches her during intimacy.", details: ["Stretchy one-size fit","10 vibration modes","We-Connect app + remote","Stimulates both partners","Waterproof","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 708, name: "We-Vibe Touch X — Versatile Clitoral Massager (Velvet Green)", price: 79.99, comparePrice: 99.00, category: "toys", tags: ["vibrator","clitoral","we-vibe","touch","massager","luxury"], supplier: "cnv", dropship: true, qty: null, description: "Curved for you. The We-Vibe Touch X's petal-shaped head flexes and conforms to your body for pinpoint or broad clitoral stimulation — 12 modes, whisper-quiet, and 100% waterproof. Works solo or with a partner.", details: ["Flexible petal-shaped head","12 vibration modes","100% waterproof","Whisper-quiet","USB rechargeable","Can be used with a partner"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 709, name: "Lovense Lush 3 — App-Controlled Bullet Vibrator", price: 109.99, comparePrice: 129.00, category: "toys", tags: ["vibrator","app-controlled","lovense","bullet","wearable","long-distance"], supplier: "cnv", dropship: true, qty: null, description: "The one that started it all — perfected. Lovense Lush 3 is the world's most connected wearable vibe with Bluetooth + long-distance control via the Lovense app. Quiet enough for anywhere, powerful enough for everywhere. 5hr battery.", details: ["Lovense app + long-distance control","Sync to music","Custom vibration patterns","Whisper-quiet motor","5-hour battery life","Body-safe silicone"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 710, name: "Lovense Ferri — Magnetic Panty Vibrator", price: 99.99, comparePrice: 119.00, category: "toys", tags: ["vibrator","panty","lovense","magnetic","wearable","app-controlled"], supplier: "cnv", dropship: true, qty: null, description: "Stays put. Goes far. Lovense Ferri clips magnetically into any underwear for hands-free stimulation controlled by you, your partner, or anyone — across the room or across the world via the Lovense app.", details: ["Magnetic clip design","Lovense app control (no distance limit)","10+ custom patterns","Whisper-quiet","Waterproof","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 711, name: "Lovense Gush — App-Controlled Masturbator (Male)", price: 109.99, comparePrice: 129.00, category: "toys", tags: ["masturbator","men","lovense","app-controlled","male","vibrating"], supplier: "cnv", dropship: true, qty: null, description: "His experience, upgraded. The Lovense Gush is a vibrating masturbator controlled via the Lovense app — solo or partner-guided from anywhere. Texture-rich inner canal, adjustable pressure, waterproof sleeve for easy cleaning.", details: ["Lovense app + long-distance control","Multiple vibration modes","Adjustable suction pressure","Textured inner canal","Waterproof removable sleeve","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
  { id: 712, name: "Lovense Domi 2 — App-Controlled Wand Massager", price: 109.99, comparePrice: 139.00, category: "toys", tags: ["wand","massager","lovense","app-controlled","powerful","luxury"], supplier: "cnv", dropship: true, qty: null, description: "The wand that answers to you — and your partner. Lovense Domi 2 packs a powerful flexible head into a compact form with Lovense app control for solo or long-distance play. Corded power means no battery anxiety.", details: ["Flexible adjustable neck","Lovense app + long-distance control","Corded power (no battery limit)","Powerful motor","Customizable vibration patterns","Waterproof head"], image: "images/products/placeholder-luxury.jpg", shippingNote: "7–14 business days | Discreet packaging" },
];

// ── MY AWD PRODUCTS (IDs 713–722) ────────────────────────────
// Supplier: My AWD (myawd.com) | US-based; free dropship; no MOQ; EIN required
// Shipping: 3–7 business days (US-based fulfillment)
const MYAWD_PRODUCTS = [
  { id: 713, name: "Satisfyer Pro 2 — Clitoral Air Pulsation Vibrator", price: 39.99, comparePrice: 59.99, category: "toys", tags: ["vibrator","air-pulsation","clitoral","satisfyer","beginner","bestseller"], supplier: "myawd", dropship: true, qty: null, description: "The cult classic that started a revolution. Satisfyer Pro 2 delivers 11 levels of air-pulse stimulation with a waterproof body and USB rechargeable design — all at an accessible price point. No wonder it went viral.", details: ["11 air-pulse intensity levels","100% waterproof","USB rechargeable","Body-safe ABS + silicone","Whisper-quiet motor"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 714, name: "Satisfyer Curvy 3+ — App-Controlled Pressure Wave Vibe", price: 54.99, comparePrice: 79.99, category: "toys", tags: ["vibrator","air-pulsation","app-controlled","satisfyer","curvy","luxury"], supplier: "myawd", dropship: true, qty: null, description: "Curves that count. The Satisfyer Curvy 3+ combines Pressure Wave technology with app-controlled vibrations — 11 suction programs, 10 vibration modes, and a curved neck that finds the right angle every time.", details: ["11 suction + 10 vibration modes","Satisfyer app control","100% waterproof","USB rechargeable","Ergonomic curved design"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 715, name: "Hot Octopuss JETT — Dual-Motor Male Vibrator", price: 74.99, comparePrice: 99.99, category: "toys", tags: ["male","vibrator","hot-octopuss","dual-motor","men","hands-free"], supplier: "myawd", dropship: true, qty: null, description: "Not your average. Hot Octopuss JETT is a dual-motor vibrating male masturbator designed for full penile stimulation — hands-free or guided. Two independent motors deliver targeted vibration that's genuinely different.", details: ["Dual independent motors","Hands-free design","2 vibration functions each motor","Body-safe silicone","USB rechargeable","Waterproof"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 716, name: "Dame Products Eva II — Hands-Free Couples Vibrator", price: 89.99, comparePrice: 124.99, category: "couples", tags: ["vibrator","couples","dame","hands-free","wearable","clitoral"], supplier: "myawd", dropship: true, qty: null, description: "Stays in place. No straps needed. Dame Eva II rests on the labia using flexible wings during partnered sex for hands-free clitoral vibration — 3 speeds, fully waterproof, and designed by women for real bodies.", details: ["Flexible wing-hold design","3 vibration speeds","100% waterproof","Body-safe silicone","USB rechargeable","Designed for real anatomies"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 717, name: "Maude Vibe — Personal Vibrator (Periwinkle)", price: 49.99, comparePrice: 69.99, category: "toys", tags: ["vibrator","maude","minimalist","clitoral","rechargeable","beginner"], supplier: "myawd", dropship: true, qty: null, description: "Less is more, on purpose. Maude Vibe keeps it clean: one body-safe silicone bullet, three vibration modes, USB-C rechargeable. No frills, no gimmicks — just a well-made personal vibrator designed to last.", details: ["3 vibration modes","Body-safe silicone","USB-C rechargeable","Waterproof","Minimalist design","1-year warranty"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 718, name: "b-Vibe Snug Plug 2 — Weighted Silicone Anal Plug (Rose)", price: 74.99, comparePrice: 99.99, category: "toys", tags: ["anal","plug","b-vibe","weighted","silicone","couples"], supplier: "myawd", dropship: true, qty: null, description: "Weight that works. The b-Vibe Snug Plug 2 uses internal steel balls to create a unique weighted sensation during wear — curved neck for a secure fit, premium silicone construction, and a flared base for safety.", details: ["Internal weighted steel balls","Flared safety base","Curved neck for retention","Premium body-safe silicone","Beginner-friendly size","Hand-washable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 719, name: "LELO INA Wave 2 — Dual-Action Rabbit Vibrator (Cerise)", price: 154.99, comparePrice: 199.99, category: "toys", tags: ["vibrator","rabbit","lelo","dual-action","wave","luxury"], supplier: "myawd", dropship: true, qty: null, description: "Wave motion meets dual stimulation. The LELO INA Wave 2 features a unique wave arm for internal motion plus clitoral branch stimulation — 10 vibration patterns, 100% waterproof, and USB rechargeable. Luxury that delivers.", details: ["WaveMotion™ internal arm","Clitoral branch stimulator","10 vibration patterns","100% waterproof","USB rechargeable","Body-safe silicone"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 720, name: "Jimmyjane FORM 2 — Rechargeable Rabbit Vibrator", price: 84.99, comparePrice: 114.99, category: "toys", tags: ["vibrator","rabbit","jimmyjane","dual-stimulation","rechargeable","luxury"], supplier: "myawd", dropship: true, qty: null, description: "Designed around you. Jimmyjane FORM 2's symmetrical dual-ear design stimulates clitoris and labia simultaneously — 5 vibration modes, waterproof, and USB rechargeable in a sleek low-profile form.", details: ["Dual-ear symmetrical design","5 vibration modes","100% waterproof","USB rechargeable","Body-safe materials","Award-winning design"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 721, name: "Kiiroo PEARL 2+ — App-Controlled G-Spot Vibrator", price: 99.99, comparePrice: 134.99, category: "toys", tags: ["vibrator","g-spot","kiiroo","app-controlled","long-distance","interactive"], supplier: "myawd", dropship: true, qty: null, description: "Connect across any distance. The Kiiroo PEARL 2+ is an app-controlled G-spot vibrator with interactive sync capabilities — use solo, control from anywhere, or pair with compatible toys for real-time response.", details: ["Feel Connect app control","G-spot curved design","Interactive sync capable","5 vibration levels","100% waterproof","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
  { id: 722, name: "Doc Johnson Optimum Power Moto-Bator — Stroker (Male)", price: 64.99, comparePrice: 89.99, category: "toys", tags: ["masturbator","male","doc-johnson","vibrating","stroker","men"], supplier: "myawd", dropship: true, qty: null, description: "Power-assisted pleasure. The Doc Johnson Optimum Power Moto-Bator features a powerful dual-density TPR stroker sleeve with multi-speed vibration for a premium solo experience that doesn't hold back.", details: ["Multi-speed vibrating motor","Dual-density TPR sleeve","Open-ended design (any size)","Easy-clean removable sleeve","Phthalate-free materials","Battery operated (2 AA)"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US-based fulfillment" },
];

// ── WHOLESALE ADULT TOYS PRODUCTS (IDs 723–736) ──────────────
// Supplier: Wholesale Adult Toys (wholesaleadulttoys.com)
// Brands: Doc Johnson, Pipedream, CalExotics | Free dropship
// Shipping: 3–7 business days (US warehouse)
const WAT_PRODUCTS = [
  { id: 723, name: "Doc Johnson American Bombshell B-10 Realistic Dildo (Brown)", price: 54.99, comparePrice: 79.99, category: "toys", tags: ["dildo","realistic","doc-johnson","bombshell","brown","suction"], supplier: "wat", dropship: true, qty: null, description: "American made, built to impress. The Doc Johnson B-10 Bombshell is a 10-inch realistic dildo in rich brown with a powerful suction cup base — ULTRASKYN material that feels uncannily real and cleans up easily.", details: ["10 inches total length","ULTRASKYN® realistic material","Strong suction cup base","Harness compatible","Phthalate-free","Made in the USA"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 724, name: "Doc Johnson Vac-U-Lock Complete Set — Strap-On System", price: 89.99, comparePrice: 129.99, category: "strap-ons", tags: ["strap-on","dildo","harness","doc-johnson","vac-u-lock","couple"], supplier: "wat", dropship: true, qty: null, description: "The system that started it all. Doc Johnson's Vac-U-Lock Complete Kit includes harness + plug + attachments in a locking system that creates a truly secure connection. Mix and match with any Vac-U-Lock compatible attachment.", details: ["Harness + 2 attachments included","Universal Vac-U-Lock system","Adjustable waist straps","Compatible with all Vac-U-Lock toys","Body-safe materials"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 725, name: "Pipedream Fantasy For Her Thrusting Suction Stimulator", price: 69.99, comparePrice: 99.99, category: "toys", tags: ["vibrator","suction","thrusting","pipedream","fantasy","dual-stimulation"], supplier: "wat", dropship: true, qty: null, description: "Both at once. Pipedream's Fantasy For Her combines internal thrusting with clitoral suction stimulation in one compact toy — 10 thruster speeds, 10 suction intensities, USB rechargeable, and fully waterproof.", details: ["10 thrusting + 10 suction speeds","Internal + clitoral dual-action","100% waterproof","USB rechargeable","Body-safe silicone"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 726, name: "Pipedream Fetish Fantasy Deluxe Shock Therapy Paddle", price: 39.99, comparePrice: 59.99, category: "bondage", tags: ["bondage","paddle","electro","pipedream","fetish-fantasy","bdsm"], supplier: "wat", dropship: true, qty: null, description: "Sensation play, elevated. This Pipedream Fetish Fantasy paddle delivers light, adjustable electric stimulation with a genuine leather paddle surface — 2 tingle settings, safe and beginner-accessible, requires 2 AAA batteries.", details: ["Light adjustable electric stimulation","Genuine leather paddle","2 tingle intensity settings","Requires 2 AAA batteries","Safe beginner electro-play"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 727, name: "CalExotics California Dreaming Palm Springs Pleaser", price: 59.99, comparePrice: 84.99, category: "toys", tags: ["vibrator","clitoral","calexotics","california-dreaming","dual-motor","beginner"], supplier: "wat", dropship: true, qty: null, description: "Dreamy dual-action from CalExotics. The Palm Springs Pleaser features dual motors — one for internal vibration and one for external clitoral stimulation — with 10 vibration functions and a fully flexible neck.", details: ["Dual independent motors","10 vibration functions","Flexible ergonomic neck","100% waterproof","USB rechargeable","Body-safe silicone"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 728, name: "CalExotics Optimum Series — Silicone Pump & Play Kit", price: 44.99, comparePrice: 64.99, category: "toys", tags: ["pump","men","calexotics","optimum","enhancement","male"], supplier: "wat", dropship: true, qty: null, description: "Precision pump, serious results. The CalExotics Optimum Series Silicone Pump & Play Kit includes a comfortable silicone sleeve + palm-pump cylinder for an easy, effective pumping experience.", details: ["Easy palm-pump mechanism","Comfortable silicone sleeve","Transparent cylinder for visual","Quick-release valve","Measurement markings on cylinder"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 729, name: "Doc Johnson Main Squeeze — Realistic Masturbator (Bossy Belladonnas)", price: 34.99, comparePrice: 49.99, category: "toys", tags: ["masturbator","male","doc-johnson","main-squeeze","realistic","men"], supplier: "wat", dropship: true, qty: null, description: "Squeeze, release, repeat. Doc Johnson's Main Squeeze series delivers a realistic textured channel in a soft, squeezable outer casing — the texture and pressure vary as you control the squeeze intensity.", details: ["Squeezable outer casing","Textured inner canal","Open-ended (any size)","Phthalate-free","Easy-clean design","Lifelike texture"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 730, name: "Pipedream King Cock 10-inch Vibrating Dildo with Balls (Brown)", price: 69.99, comparePrice: 99.99, category: "toys", tags: ["dildo","vibrating","king-cock","pipedream","realistic","brown","suction"], supplier: "wat", dropship: true, qty: null, description: "Real weight, real texture, real vibration. Pipedream's King Cock 10\" delivers lifelike detail — textured shaft, realistic balls, and a strong vibrating motor — all mounted on a sturdy suction cup base.", details: ["10 inches with suction base","Built-in vibrating motor","Realistic balls + texture","Harness compatible","Phthalate-free PVC","Requires 2 AA batteries"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 731, name: "CalExotics Boundless Contour G-Spot Vibrator", price: 49.99, comparePrice: 69.99, category: "toys", tags: ["vibrator","g-spot","calexotics","boundless","rechargeable","beginner"], supplier: "wat", dropship: true, qty: null, description: "Contoured for where it counts. The CalExotics Boundless Contour features a curved tip designed specifically for G-spot contact — 10 vibration functions, fully waterproof, and USB rechargeable.", details: ["G-spot curved tip","10 vibration functions","100% waterproof","USB rechargeable","Body-safe silicone","Beginner-friendly size"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 732, name: "Pipedream Anal Fantasy Elite Remote Anal Plug", price: 54.99, comparePrice: 79.99, category: "toys", tags: ["anal","plug","remote","pipedream","vibrating","couples"], supplier: "wat", dropship: true, qty: null, description: "Remote-ready for any situation. This Pipedream Elite Anal Fantasy plug vibrates with 10 functions, includes a wireless remote, and features a flared base for safety and a tapered tip for comfortable wear.", details: ["10 vibration functions","Wireless remote control","Flared safety base","Tapered insertion tip","Body-safe silicone","USB rechargeable"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 733, name: "CalExotics JOPEN Pave Eclipse Rabbit — Rose Gold", price: 84.99, comparePrice: 119.99, category: "toys", tags: ["vibrator","rabbit","jopen","pave","rose-gold","luxury","dual-stimulation"], supplier: "wat", dropship: true, qty: null, description: "Rose gold luxury that performs. The JOPEN Pave Eclipse features crystal-embellished handles, internal + clitoral dual motors, and 7 vibration modes — a statement piece that's more than just pretty.", details: ["Crystal-embellished design","Dual internal + clitoral motors","7 vibration modes","100% waterproof","USB rechargeable","Luxury gift-ready packaging"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
  { id: 734, name: "Doc Johnson TITANMEN — 9 Inch Anal Tool (Black)", price: 34.99, comparePrice: 49.99, category: "toys", tags: ["dildo","anal","titanmen","doc-johnson","beginner-anal","body-safe"], supplier: "wat", dropship: true, qty: null, description: "Built for where it's going. The Doc Johnson TITANMEN 9\" Anal Tool is specifically designed for anal play with a non-realistic, beginner-friendly profile and a stable flared base — made in the USA from phthalate-free UR3®.", details: ["9-inch UR3® realistic material","Flared base for safety","Made in the USA","Phthalate-free","Slightly flexible material","Suction cup base"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–7 business days | US warehouse" },
];

// ── GREAT DEALS DISTRIBUTION PRODUCTS (IDs 735–748) ──────────
// Supplier: Great Deals Distribution (greatdealsdist.com)
// Brand: Mapale Lingerie | $4/order dropship fee (factored into price)
// US-based | Shipping: 3–5 business days
const GDD_PRODUCTS = [
  { id: 735, name: "Mapale — Strappy Lace Teddy (Black)", price: 34.99, comparePrice: 54.99, category: "lingerie", tags: ["lingerie","teddy","lace","mapale","strappy","one-piece"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Straps in all the right places. This Mapale lace teddy features strategic strappy cutouts, a deep V neckline, and adjustable fit — the kind of piece that commands the room before you say a word.", details: ["Strappy cutout design","Deep V front","Adjustable back straps","Lace + mesh construction","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 736, name: "Mapale — Open-Back Lace Chemise (Ivory)", price: 32.99, comparePrice: 49.99, category: "lingerie", tags: ["lingerie","chemise","lace","mapale","open-back","romantic"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Soft, sheer, and completely confident. This Mapale ivory lace chemise features an open-back design with satin bow detail — flowing lace skirt and elegant fit that hits just above the thigh.", details: ["Open-back with satin bow","Flowing lace hem","Adjustable spaghetti straps","Semi-sheer construction","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 737, name: "Mapale — Cut-Out Halter Body (Red)", price: 36.99, comparePrice: 54.99, category: "lingerie", tags: ["lingerie","bodysuit","halter","mapale","cutout","red","bold"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Red flag? More like red flag that you're about to have the best night. This Mapale halter bodysuit features bold cutout panels, a deep plunge front, and an adjustable neck tie — all in rich red.", details: ["Halter neck with ties","Cutout side panels","Deep plunge neckline","Snap closure bottom","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 738, name: "Mapale — Fishnet Bra & Skirt Set (Black)", price: 28.99, comparePrice: 44.99, category: "lingerie", tags: ["lingerie","set","fishnet","mapale","bra","skirt","classic"], sizes: ["S/M","L/XL","1X/2X"], supplier: "gdd", dropship: true, qty: null, description: "Classic made edgy. This Mapale fishnet two-piece set pairs a stretch fishnet bra with a matching mini skirt — an iconic combination that plays well with your existing wardrobe or solo as a look.", details: ["Fishnet bra + skirt set","Available up to 2X","Stretch construction","Can be worn with or without coverage underneath","Sizes: S/M, L/XL, 1X/2X"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 739, name: "Mapale — Satin & Lace Bustier Corset (Dusty Mauve)", price: 44.99, comparePrice: 69.99, category: "lingerie", tags: ["lingerie","bustier","corset","mapale","satin","lace","shapewear"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Structure meets seduction. This Mapale satin and lace bustier features boning for light shaping, adjustable lace-up back, and sweetheart neckline in a romantic dusty mauve that photographs beautifully.", details: ["Light boning for shape","Adjustable lace-up back","Sweetheart neckline","Satin + lace construction","Garter tab straps included","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 740, name: "Mapale — Plus Size Strappy Lace Bodysuit (Black/Wine)", price: 38.99, comparePrice: 59.99, category: "lingerie", tags: ["lingerie","plus-size","bodysuit","mapale","strappy","inclusive"], sizes: ["1X/2X","3X/4X"], supplier: "gdd", dropship: true, qty: null, description: "Because luxury doesn't have a size limit. This Mapale plus-size strappy lace bodysuit features the same bold cutout design as the classic — in a size-inclusive construction with adjustable straps, snap bottom, and stunning detail.", details: ["Plus-size inclusive design","Adjustable straps","Snap closure bottom","Lace + mesh panels","Sizes: 1X/2X and 3X/4X"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 741, name: "Mapale — Floral Lace Babydoll with G-String (Blush)", price: 29.99, comparePrice: 44.99, category: "lingerie", tags: ["lingerie","babydoll","lace","mapale","floral","set","romantic"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Soft and stunning. This Mapale floral lace babydoll set features a flowing lace overlay, adjustable shoulder straps, and comes with a matching G-string for a complete look that's effortlessly romantic.", details: ["Floral lace overlay","Adjustable spaghetti straps","Matching G-string included","Snap open back","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 742, name: "Mapale — Open Bra & Crotchless Panty Set (Black Lace)", price: 24.99, comparePrice: 39.99, category: "lingerie", tags: ["lingerie","set","open-bra","crotchless","mapale","lace","intimate"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Open to possibilities. This Mapale open bra + crotchless panty set in stretch lace is direct, confident, and made for the moments that matter most. Stretch construction for a comfortable fit.", details: ["Open-cup stretch lace bra","Crotchless lace panty","Stretch-to-fit construction","No underwire","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 743, name: "Mapale — Lace Robe with Matching Thong Set (Black)", price: 39.99, comparePrice: 59.99, category: "lingerie", tags: ["lingerie","robe","lace","mapale","set","thong","boudoir"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "A full moment from the first step. This Mapale lace robe set includes a flowing lace duster robe with belt and a matching lace thong — a complete boudoir look that's hotel-worthy at home.", details: ["Flowy lace duster robe","Matching lace thong included","Self-tie belt","See-through lace detail","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
  { id: 744, name: "Mapale — Velvet Plunge Mini Dress (Deep Plum)", price: 46.99, comparePrice: 72.99, category: "lingerie", tags: ["lingerie","dress","velvet","mapale","plunge","plum","luxury"], sizes: ["S/M","L/XL"], supplier: "gdd", dropship: true, qty: null, description: "Luxury from the fabric forward. This Mapale velvet mini dress in deep plum features a plunge neckline, figure-hugging stretch velvet, and a length that keeps things interesting. Wear it in, wear it out.", details: ["Stretch velvet construction","Deep plunge V neckline","Mini length","Fully lined body","Sizes: S/M and L/XL"], image: "images/products/placeholder-luxury.jpg", shippingNote: "3–5 business days | US-based" },
];

const DROPSHIP_PRODUCTS = [
  ...(typeof CJ_PRODUCTS !== 'undefined' ? CJ_PRODUCTS : []),
  ...(typeof LUXURY_PLAY_PRODUCTS !== 'undefined' ? LUXURY_PLAY_PRODUCTS : []),
  ...(typeof CNV_PRODUCTS !== 'undefined' ? CNV_PRODUCTS : []),
  ...(typeof MYAWD_PRODUCTS !== 'undefined' ? MYAWD_PRODUCTS : []),
  ...(typeof WAT_PRODUCTS !== 'undefined' ? WAT_PRODUCTS : []),
  ...(typeof GDD_PRODUCTS !== 'undefined' ? GDD_PRODUCTS : []),
]; // DL (Dear Lover) + TOPDAWG removed — nixed suppliers

function addBundleToCart(bundleId) {
  const b = BUNDLES_DATA.find(x => x.id === bundleId);
  if (!b) return;

  // Validate all choices made
  const choiceNames = [];
  let bundleHasDropship = false;

  for (const c of b.choices) {
    const sel = document.getElementById(`bundle-${c.key}`);
    if (!sel || !sel.value) {
      alert(`Please select: ${c.label}`);
      return;
    }
    const selectedId = parseInt(sel.value, 10);
    // Look up name from live products (handles both physical + dropship fallbacks)
    const allProds = getProducts();
    const prod = allProds.find(p => p.id === selectedId);
    if (prod) {
      choiceNames.push(prod.name);
      if (prod.dropship || prod.id >= 14) bundleHasDropship = true;
    } else {
      // Fallback: read label from the select option text
      const selectedOption = sel.options[sel.selectedIndex];
      choiceNames.push(selectedOption ? selectedOption.text.split(' ($')[0] : '');
    }
  }

  const itemName = `${b.name} (${[...b.fixedItems, ...choiceNames].join(', ')})`;

  // Add to cart as a single bundle line item
  if (typeof cart !== 'undefined') {
    const existing = cart.find(x => x.bundleId === bundleId);
    if (existing) {
      existing.qty++;
      if (bundleHasDropship) existing.dropship = true;
    } else {
      cart.push({
        id: 900 + BUNDLES_DATA.indexOf(b),
        bundleId: bundleId,
        name: itemName,
        price: b.bundlePrice,
        qty: 1,
        image: 'images/logo.png',
        dropship: bundleHasDropship
      });
    }
    if (typeof saveCart === 'function') saveCart();
    if (typeof renderCartDrawer === 'function') renderCartDrawer();
    if (typeof updateCartBadge === 'function') updateCartBadge();
  }

  closeBookingModal();

  // Show confirmation toast
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = `${b.icon} ${b.name} added to cart!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2800);
}

// ---- Runtime helpers (admin overrides stored in localStorage) ----
function getProducts() {
  const overrides = JSON.parse(localStorage.getItem('ds_product_overrides') || '{}');
  const ALL_PRODUCTS = [...DEFAULT_PRODUCTS, ...DROPSHIP_PRODUCTS];
  return ALL_PRODUCTS.map(p => {
    const o = overrides[p.id] || {};
    // Compute effective inStock:
    // 1. Admin override takes absolute priority
    // 2. Dropship/unlimited items are always in stock
    // 3. Physical items: in stock if qty > 0 or qty not tracked
    // 4. Items explicitly marked inStock:false in product data stay out
    let effectiveInStock;
    if (o.inStock !== undefined) {
      effectiveInStock = o.inStock;                          // admin override
    } else if ((p.dropship === true) || p.qty === null || p.qty === undefined) {
      effectiveInStock = true;                               // unlimited supply
    } else if (typeof p.qty === 'number') {
      effectiveInStock = p.qty > 0;                         // tracked qty
    } else {
      effectiveInStock = p.inStock !== undefined ? p.inStock : true; // fallback
    }
    return {
      ...p,
      price:        o.price        !== undefined ? o.price        : p.price,
      comparePrice: o.comparePrice !== undefined ? o.comparePrice : p.comparePrice,
      inStock:      effectiveInStock,
      qty:          o.qty          !== undefined ? o.qty          : p.qty,
      dropship:     o.dropship     !== undefined ? o.dropship     : p.dropship,
      badge:        o.badge        !== undefined ? o.badge        : p.badge,
      images:       o.images       !== undefined ? o.images       : (p.images && p.images.length ? p.images : (p.image ? [p.image] : [])),
      image:        o.images?.[0]  !== undefined ? o.images[0]    : p.image,
    };
  });
}
function getPromoCodes() {
  // Hardcoded system codes (always available, cannot be deleted via Admin)
  const SYSTEM_CODES = [
    { code: 'ADMIN',  type: 'admin',   value: 0,  active: true, label: 'Ashley cost price' },
    { code: 'FAM30',  type: 'percent', value: 30, active: true, label: 'Family & Friends 30% off' }
  ];
  const custom = JSON.parse(localStorage.getItem('ds_promo_codes') || '[]');
  // Merge: custom codes can override system codes by matching code name
  const customCodes = custom.map(c => c.code.toUpperCase());
  const merged = SYSTEM_CODES.filter(s => !customCodes.includes(s.code));
  return [...merged, ...custom];
}
function getLocalDeliverySettings() {
  const defaults = {
    enabled:   true,
    fee:       15,
    // 3-digit zip prefixes within ~1hr drive of Princeton TX (75407)
    zones: ['750','751','752','753','754','755','760','761','762','763']
  };
  return JSON.parse(localStorage.getItem('ds_local_delivery') || 'null') || defaults;
}

function getPaymentMethods() {
  const defaults = {
    cashapp:  { label: 'Cash App',  handle: '$flawwless23',   enabled: true  },
    applepay: { label: 'Apple Pay', handle: '9452100907',     enabled: true  },
    venmo:    { label: 'Venmo',     handle: '',               enabled: false },
    paypal:   { label: 'PayPal',    handle: 'assistant.manager@drippingsecrets.com', enabled: true },
  };
  const saved = JSON.parse(localStorage.getItem('ds_payment_methods') || 'null');
  if (!saved) return defaults;
  // Strip removed methods (zelle/chime) if they exist in old saved data
  const { chime, zelle, paymentcloud, ...clean } = saved;
  return { ...defaults, ...clean };
}

// Global PRODUCTS reference (used by cart.js)
window.PRODUCTS = getProducts();

// ===========================
// PRODUCT DETAIL MODAL
// ===========================

let _pmQty = 1;
let _pmProductId = null;
let _pmSize    = null;

/* ─── Luxury Product Drawer (Phase 5) ──────────────────────────────────────
   Replaces centered modal with a right-sliding drawer panel.
   Function names preserved so all callers continue to work.
   ─────────────────────────────────────────────────────────────────────────── */

function _ensureDrawer() {
  let d = document.getElementById('product-drawer');
  if (!d) {
    d = document.createElement('div');
    d.id = 'product-drawer';
    document.body.appendChild(d);
  }
  return d;
}

function openProductModal(productId) {
  var p = getProducts().find(function(x){ return x.id === productId; });
  if (!p) return;
  _pmProductId = productId;
  _pmQty = 1;
  _pmSize = null;

  var drawer = _ensureDrawer();
  var isWl   = (typeof isWishlisted === 'function') ? isWishlisted(productId) : false;
  var imgs   = (p.images && p.images.length) ? p.images : (p.image ? [p.image] : []);
  var related = getProducts().filter(function(x){
    return x.id !== productId && x.category === p.category && x.inStock !== false;
  }).slice(0, 4);

  var shippingNote = p.shippingNote || p.shipping ||
    ((p.category === 'luxury_play' || p.tab === 'luxury_play') ? '7–10 business days international shipping' : '');

  // --- Gallery thumbs
  var thumbsHtml = '';
  if (imgs.length > 1) {
    var thumbItems = '';
    for (var ti = 0; ti < imgs.length; ti++) {
      var act = ti === 0 ? ' active' : '';
      thumbItems += '<img src="' + imgs[ti] + '" alt="' + p.name + ' ' + (ti+1) + '" class="pd-thumb' + act + '"'
        + ' onclick="pdSwitchImg(this.src,this)"'
        + ' onerror="this.style.display=\'none\'">';
    }
    thumbsHtml = '<div class="pd-thumbs">' + thumbItems + '</div>';
  }

  // --- Badge / tagline
  var topMeta = '';
  if (p.badge)   topMeta += '<div class="pd-badge-label">' + p.badge + '</div>';
  if (p.tagline) topMeta += '<p style="font-size:.75rem;color:rgba(255,255,255,.45);margin-bottom:6px;font-style:italic">' + p.tagline + '</p>';

  // --- Pricing
  var priceHtml = '<span class="pd-price">$' + (p.price||0).toFixed(2) + '</span>';
  if (p.comparePrice) {
    priceHtml += '<span class="pd-compare">$' + p.comparePrice.toFixed(2) + '</span>';
    priceHtml += '<span class="pd-savings">Save $' + (p.comparePrice - p.price).toFixed(2) + '</span>';
  }

  // --- Availability
  var availHtml = '';
  if (p.inStock !== false) {
    availHtml = '<div class="pd-availability"><div class="pd-avail-dot"></div><span class="pd-avail-text">In Stock &amp; Ready</span></div>';
  }
  if (p.qty !== null && p.qty !== undefined && p.qty <= 3 && p.qty > 0) {
    availHtml += '<div class="pd-low-stock">&#x1F525; Only ' + p.qty + ' left!</div>';
  }

  // --- Details list
  var detailsHtml = '';
  if (p.details && p.details.length) {
    detailsHtml = '<ul class="pd-details-list">';
    for (var di = 0; di < p.details.length; di++) detailsHtml += '<li>' + p.details[di] + '</li>';
    detailsHtml += '</ul>';
  }

  // --- Size buttons
  var sizesHtml = '';
  if (p.sizes && p.sizes.length) {
    var sizeBtns = '';
    for (var si2 = 0; si2 < p.sizes.length; si2++) {
      sizeBtns += '<button class="pd-size-btn" onclick="pdSelectSize(\'' + p.sizes[si2] + '\',this)">' + p.sizes[si2] + '</button>';
    }
    sizesHtml = '<p class="pd-size-label">Select Size</p>'
      + '<div class="pd-size-btns" id="pd-size-btns">' + sizeBtns + '</div>'
      + '<p class="pd-size-hint" id="pd-size-hint">Please select a size</p>';
  }

  // --- Actions / out-of-stock
  var actionsHtml = '';
  if (p.inStock === false || (p.inStock !== undefined && !p.inStock)) {
    actionsHtml = '<div class="pd-out-stock">Currently Out of Stock</div>';
  } else {
    actionsHtml = '<div class="pd-actions">'
      + '<div class="pd-qty-wrap">'
      + '<button class="pd-qty-btn" onclick="pdQtyChange(-1)">\u2212</button>'
      + '<span class="pd-qty-val" id="pd-qty-val">1</span>'
      + '<button class="pd-qty-btn" onclick="pdQtyChange(1)">+</button>'
      + '</div>'
      + '<button class="pd-atc-btn" onclick="pdAddToCart()">Add to Cart</button>'
      + '<button class="pd-wishlist-btn' + (isWl ? ' wishlisted' : '') + '" id="pd-wishlist-btn"'
      + ' onclick="toggleWishlist(' + productId + ').then(function(added){'
      + 'this.innerHTML=added?\'&#9829;\':\'&#9825;\';this.classList.toggle(\'wishlisted\',added);}.bind(this))">'
      + (isWl ? '&#9829;' : '&#9825;') + '</button>'
      + '</div>';
    if (shippingNote) actionsHtml += '<div class="pd-shipping-note">&#x1F69A; ' + shippingNote + '</div>';
  }

  // --- Related products
  var relatedHtml = '';
  if (related.length) {
    var relCards = '';
    for (var ri = 0; ri < related.length; ri++) {
      var rp = related[ri];
      var rpImg = (rp.images && rp.images[0]) || rp.image || '';
      relCards += '<div class="pd-rel-card" onclick="openProductModal(' + rp.id + ')">'
        + '<img src="' + rpImg + '" alt="' + rp.name + '" class="pd-rel-img" onerror="this.src=\'images/products/placeholder-luxury.jpg\'">'
        + '<div class="pd-rel-name">' + rp.name + '</div>'
        + '<div class="pd-rel-price">$' + (rp.price||0).toFixed(2) + '</div>'
        + '</div>';
    }
    relatedHtml = '<div class="pd-related"><div class="pd-related-title">You May Also Like</div>'
      + '<div class="pd-related-grid">' + relCards + '</div></div>';
  }

  // --- Assemble
  drawer.innerHTML =
    '<div class="pd-header">'
    + '<span class="pd-header-label">Product Details</span>'
    + '<button class="pd-close" onclick="closeProductModal()" aria-label="Close">\u2715</button>'
    + '</div>'
    + '<div class="pd-gallery">'
    + '<div class="pd-main-wrap">'
    + '<img src="' + (imgs[0]||'') + '" alt="' + p.name + '" class="pd-main-img" id="pd-main-img"'
    + ' onerror="this.src=\'images/products/placeholder-luxury.jpg\'">'
    + '</div>' + thumbsHtml + '</div>'
    + '<div class="pd-info">'
    + topMeta
    + '<h2 class="pd-name">' + p.name + '</h2>'
    + '<div class="pd-pricing">' + priceHtml + '</div>'
    + availHtml
    + '<p class="pd-desc">' + (p.description||'') + '</p>'
    + detailsHtml
    + sizesHtml
    + actionsHtml
    + '</div>'
    + relatedHtml;

  var overlay = document.getElementById('product-modal-overlay');
  if (overlay) overlay.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Legacy aliases — callers that still use the old pm* names continue to work
function switchPmImage(src, thumb) { pdSwitchImg(src, thumb); }
function pmQtyChange(delta)        { pdQtyChange(delta); }
function selectPmSize(size, btn)   { pdSelectSize(size, btn); }
function pmAddToCart()             { pdAddToCart(); }

// Alias for admin panel compatibility
window.getAllProducts = getProducts;
