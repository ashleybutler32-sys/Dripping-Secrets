// Shared Firebase ES Module initializer — used by academy.html and any other
// ES-module-style pages. The compat SDK (firebase-config.js) is used everywhere else.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyBMpCMvPPPBvJGfNFz1DUAjSb-ZBhCYrwU",
  authDomain: "dripping-secrets.firebaseapp.com",
  projectId: "dripping-secrets",
  storageBucket: "dripping-secrets.appspot.com",
  messagingSenderId: "246502789488",
  appId: "1:246502789488:web:5dc93c79a1bf39fbef5e5c"
};

// Prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export { app };
