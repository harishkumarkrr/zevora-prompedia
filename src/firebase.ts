import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use glob import to avoid build errors if the file is missing on Vercel
const configs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const firebaseConfigFallback = (configs['../firebase-applet-config.json'] as any)?.default || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFallback.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFallback.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFallback.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFallback.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFallback.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFallback.appId,
};

const envDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const configDatabaseId = firebaseConfigFallback.firestoreDatabaseId;
let databaseId = (envDatabaseId || configDatabaseId) || undefined;

console.log('Firebase Config Debug:', {
  projectId: firebaseConfig.projectId,
  envDatabaseId,
  configDatabaseId,
  finalDatabaseId: databaseId
});

// Fix common typo if it exists (i-studio vs ai-studio)
if (databaseId && databaseId.startsWith('i-studio-')) {
  console.warn('Detected potential typo in database ID (missing "a"). Fixing to "ai-studio-".');
  databaseId = 'a' + databaseId;
}

// Initialize Firebase SDK
let app;
try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Firebase API Key is missing. Please check your environment variables or firebase-applet-config.json.');
  }
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Provide a dummy app object to prevent crashes in other services
  app = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false };
}

// Initialize services
export const db = getFirestore(app as any, databaseId);
export const auth = getAuth(app as any);

export default app;
