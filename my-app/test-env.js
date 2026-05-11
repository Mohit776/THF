const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const admin = require('firebase-admin');

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
console.log("Raw from Next env:", JSON.stringify(privateKey.substring(0, 50)));

if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
} else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey.replace(/\\n/g, '\n');

console.log("After processing:", JSON.stringify(privateKey.substring(0, 50)));

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
  const db = admin.firestore();
  db.collection('users').limit(1).get().then(() => console.log('SUCCESS')).catch(e => console.error('FAILED', e.message));
} catch (e) {
  console.error("Init failed", e.message);
}
