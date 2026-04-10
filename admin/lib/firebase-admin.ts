import * as admin from "firebase-admin";

function getCredential(): admin.credential.Credential {
  // Prefer env-var approach (works on Vercel & any CI)
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Vercel escapes newlines in env vars — restore them
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  throw new Error(
    "Firebase Admin credentials missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in your environment."
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({ credential: getCredential() });
    console.log("Firebase Admin initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
