import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
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

// Enable network by default and handle errors
let networkEnabled = true;

export const handleFirebaseNetworkError = async (error: any) => {
  console.warn('Firebase network error detected:', error);

  if (!networkEnabled) {
    try {
      await enableNetwork(db);
      networkEnabled = true;
      console.log('Firebase network re-enabled');
    } catch (enableError) {
      console.error('Failed to re-enable Firebase network:', enableError);
    }
  }
};

export const forceFirebaseReconnect = async () => {
  try {
    if (networkEnabled) {
      await disableNetwork(db);
      networkEnabled = false;
    }

    // Wait a moment then re-enable
    setTimeout(async () => {
      try {
        await enableNetwork(db);
        networkEnabled = true;
        console.log('Firebase network reconnected');
      } catch (error) {
        console.error('Failed to reconnect Firebase:', error);
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to force Firebase reconnect:', error);
  }
};

// Monitor network status
window.addEventListener('online', () => {
  console.log('Browser online - attempting Firebase reconnect');
  forceFirebaseReconnect();
});

window.addEventListener('offline', () => {
  console.log('Browser offline - Firebase will handle gracefully');
});

export default app;
