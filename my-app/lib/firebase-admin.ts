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
      
      // Handle potential formatting issues with newlines from some env var providers
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "tfh-partner-app.firebasestorage.app",
      });
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
      // Clean up the private key. Vercel sometimes wraps env vars in quotes or escapes newlines.
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Remove surrounding quotes if present
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1);
      }
      
      // Replace literal \n with actual newline character
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        storageBucket: "tfh-partner-app.firebasestorage.app",
      });
    } else {
      try {
        // Local development: use the service account JSON file in the project root.
        // Using fs.readFileSync ensures Webpack doesn't try to bundle the file during Vercel builds.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require("fs");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require("path");
        const serviceAccountPath = path.join(process.cwd(), "tfh-partner-app-firebase-adminsdk-fbsvc-f78730d175.json");
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: "tfh-partner-app.firebasestorage.app",
        });
      } catch (error) {
        console.error("Firebase Admin initialization error: Service account not found or environment variables missing/invalid.");
      }
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
