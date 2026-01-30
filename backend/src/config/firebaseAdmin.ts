import admin from 'firebase-admin';

let firebaseAuth: admin.auth.Auth | null = null;

export function getFirebaseAuth(): admin.auth.Auth {
  if (firebaseAuth) return firebaseAuth;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (admin.apps.length === 0) {
    if (projectId && clientEmail && privateKeyRaw) {
      const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      throw new Error(
        'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS).'
      );
    }
  }

  firebaseAuth = admin.auth();
  return firebaseAuth;
}
