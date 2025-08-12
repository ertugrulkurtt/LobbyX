import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBJgWwIpQtZh_ecvK_5IDNoDWPi7ObIwhM",
  authDomain: "lobbyx-87c98.firebaseapp.com",
  databaseURL: "https://lobbyx-87c98-default-rtdb.firebaseio.com/",
  projectId: "lobbyx-87c98",
  storageBucket: "lobbyx-87c98.firebasestorage.app",
  messagingSenderId: "889985293267",
  appId: "1:889985293267:web:a51abf968b9210f4d02d26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Simple Firebase connection test
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple test - check if Firebase is initialized
    if (auth && db) {
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Firebase connection test failed:', error);
    return false;
  }
};

export default app;
