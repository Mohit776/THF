import admin from "firebase-admin";

// Use lazy initialization to avoid build-time errors on Vercel
// when environment variables are not available during static generation.

let initialized = false;

function ensureInitialized() {
  if (initialized) return;

  if (!admin.apps.length) {
    // Try environment variable first, then fall back to local service account file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "tfh-partner-app.firebasestorage.app",
      });
    } else {
      // Local development: use the service account JSON file in the project root
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require("../tfh-partner-app-firebase-adminsdk-fbsvc-238c3dff75.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "tfh-partner-app.firebasestorage.app",
      });
    }
  }

  initialized = true;
}

// ── Lazy accessor for Firestore ──
// All server actions import { adminDb } from "@/lib/firebase-admin"
export function getAdminDb() {
  ensureInitialized();
  return admin.firestore();
}

// Proxy object so `adminDb.collection(...)` works without calling a function,
// while still deferring initialization until the first property access.
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop, receiver) {
    const db = getAdminDb();
    const value = Reflect.get(db, prop, receiver);
    if (typeof value === "function") {
      return value.bind(db);
    }
    return value;
  },
});

// Default export (used by notifications.ts and the send-notification route)
export default admin;
