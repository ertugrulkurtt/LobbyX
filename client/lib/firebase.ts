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

  // Check if it's actually a network error
  const isNetworkError =
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('network-request-failed') ||
    error.message?.includes('unavailable') ||
    error.code === 'unavailable' ||
    error.code === 'network-request-failed';

  if (!isNetworkError) {
    console.log('Error is not network-related, skipping network handling');
    return false;
  }

  if (!networkEnabled) {
    try {
      await enableNetwork(db);
      networkEnabled = true;
      console.log('Firebase network re-enabled');
      return true;
    } catch (enableError) {
      console.error('Failed to re-enable Firebase network:', enableError);
      return false;
    }
  }

  return true;
};

export const forceFirebaseReconnect = async (): Promise<boolean> => {
  try {
    console.log('Forcing Firebase reconnection...');

    if (networkEnabled) {
      await disableNetwork(db);
      networkEnabled = false;
      console.log('Firebase network disabled');
    }

    // Wait a moment then re-enable
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await enableNetwork(db);
      networkEnabled = true;
      console.log('Firebase network reconnected successfully');
      return true;
    } catch (error) {
      console.error('Failed to reconnect Firebase:', error);
      return false;
    }
  } catch (error) {
    console.error('Failed to force Firebase reconnect:', error);
    return false;
  }
};

// Add exponential backoff retry utility
export const withExponentialBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry for non-network errors
      if (error.code === 'permission-denied' ||
          error.code === 'invalid-argument' ||
          error.code === 'not-found') {
        throw error;
      }

      // Check if it's a network error
      const isNetworkError = await handleFirebaseNetworkError(error);

      if (!isNetworkError && attempt === 1) {
        // If it's not a network error, don't retry
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying Firebase operation in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Monitor network status with better handling
let isReconnecting = false;

window.addEventListener('online', async () => {
  console.log('Browser online - attempting Firebase reconnect');

  if (isReconnecting) {
    console.log('Reconnection already in progress');
    return;
  }

  isReconnecting = true;
  const success = await forceFirebaseReconnect();

  if (success) {
    console.log('Firebase reconnection successful');
  } else {
    console.error('Firebase reconnection failed');
  }

  isReconnecting = false;
});

window.addEventListener('offline', () => {
  console.log('Browser offline - Firebase operations will be queued');
  networkEnabled = false;
});

// Add visibility change handler for better reconnection
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && navigator.onLine && !networkEnabled) {
    console.log('Page became visible and online - checking Firebase connection');
    await forceFirebaseReconnect();
  }
});

// Global error handler for unhandled Firebase errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;

  if (error && typeof error === 'object' &&
      (error.message?.includes('Failed to fetch') ||
       error.code === 'unavailable' ||
       error.code === 'network-request-failed')) {

    console.warn('Caught unhandled Firebase network error:', error.message);

    // Try to handle it
    handleFirebaseNetworkError(error).catch(console.error);

    // Prevent the error from being logged as unhandled
    event.preventDefault();
  }
});

export default app;
