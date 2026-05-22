import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any;

if (import.meta.env.VITE_FIREBASE_API_KEY) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} else {
  console.warn("Firebase API key is missing. Please configure VITE_FIREBASE_API_KEY in your environment variables.");
  db = new Proxy({}, {
    get(_, prop) {
      throw new Error(`Firebase is not initialized. Prop '${String(prop)}' accessed, but environment variables are missing.`);
    }
  });
}

export { db };
