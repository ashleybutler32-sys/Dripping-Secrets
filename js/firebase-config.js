// ===== DRIPPING SECRETS | Firebase Configuration =====
//
// ⚠️  SETUP REQUIRED — Replace the placeholder values below with your real Firebase config.
//
// HOW TO GET YOUR CONFIG (takes about 5 minutes):
// 1. Go to https://console.firebase.google.com  →  Sign in with your Google account
// 2. Click "Add project" → name it "dripping-secrets" → Continue through the steps
// 3. From the project dashboard, click the </> icon ("Add a web app")
// 4. Give the app a name (e.g. "ds-site") → Register App
// 5. Copy the firebaseConfig object shown and paste it below, replacing the placeholders
//
// ALSO ENABLE IN FIREBASE CONSOLE:
//   Authentication → Sign-in method → Email/Password → Enable
//   Firestore Database → Create database → Start in production mode
//     → Rules tab → paste this rule and Publish:
//
//   rules_version = '2';
//   service cloud.firestore {
//     match /databases/{database}/documents {
//       // All orders (guests + signed-in) — admin reads from here
//       match /orders/{orderId} { allow read, write: if true; }
//       // Per-user collections (signed-in only)
//       match /users/{userId} { allow read, write: if request.auth.uid == userId; }
//       match /users/{userId}/orders/{orderId} { allow read, write: if request.auth.uid == userId; }
//       match /wishlists/{userId} { allow read, write: if request.auth.uid == userId; }
//       // Party bookings
//       match /parties/{partyId} { allow read, write: if true; }
//       // Affiliate applications
//       match /affiliates/{affId} { allow read, write: if true; }
//       // Product requests
//       match /product_requests/{reqId} { allow read, write: if true; }
//       // Reviews (verified purchase backed)
//       match /reviews/{reviewId} { allow read: if true; write: if request.auth != null; }
//     }
//   }

const firebaseConfig = {
  apiKey:            "AIzaSyAukxs1tsXPyDSkCg06pVr-pr6ehHYnjKM",
  authDomain:        "dripping-secrets.firebaseapp.com",
  projectId:         "dripping-secrets",
  storageBucket:     "dripping-secrets.firebasestorage.app",
  messagingSenderId: "229351433648",
  appId:             "1:229351433648:web:6c598f983b3985c7902275",
  measurementId:     "G-FHMJDTKW1Y"
};

// Auto-initialize (safe — skips if config is still placeholder)
let FIREBASE_READY = false;
try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY" && typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    FIREBASE_READY = true;
    console.log('✅ Firebase initialized');
  }
} catch(e) {
  console.warn('Firebase init skipped:', e.message);
}
