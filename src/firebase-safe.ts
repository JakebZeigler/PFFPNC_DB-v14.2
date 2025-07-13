import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Safe Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config before initializing
const isFirebaseConfigValid = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
  return requiredKeys.every(key => firebaseConfig[key as keyof typeof firebaseConfig]);
};

let app: any = null;
let db: any = null;

try {
  if (isFirebaseConfigValid()) {
    console.log('Initializing Firebase with valid config...');
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config is incomplete, running in offline mode');
    console.log('Missing Firebase env vars:', {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      appId: !!firebaseConfig.appId
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { db };
export default app;
