import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, collection, getDocs } from 'firebase/firestore';
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

  // Check if it's actually a network error
  const isNetworkError =
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('network-request-failed') ||
    error.message?.includes('unavailable') ||
    error.code === 'unavailable' ||
    error.code === 'network-request-failed';

  if (!isNetworkError) {
    return false;
  }

  if (!networkEnabled) {
    try {
      await enableNetwork(db);
      networkEnabled = true;
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

    if (networkEnabled) {
      await disableNetwork(db);
      networkEnabled = false;
    }

    // Wait a moment then re-enable
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await enableNetwork(db);
      networkEnabled = true;
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
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Monitor network status with better handling
let isReconnecting = false;

window.addEventListener('online', async () => {

  if (isReconnecting) {
    return;
  }

  isReconnecting = true;
  const success = await forceFirebaseReconnect();


  isReconnecting = false;
});

window.addEventListener('offline', () => {
  networkEnabled = false;
});

// Add visibility change handler for better reconnection
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && navigator.onLine && !networkEnabled) {
    await forceFirebaseReconnect();
  }
});

// Global error handler for unhandled Firebase errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;

  if (error && typeof error === 'object') {
    const isFirebaseError =
      error.message?.includes('Failed to fetch') ||
      error.code === 'unavailable' ||
      error.code === 'network-request-failed' ||
      error.message?.includes('firebase') ||
      error.message?.includes('firestore');

    if (isFirebaseError) {

      // Try to handle it
      handleFirebaseNetworkError(error).catch(console.error);

      // Prevent the error from being logged as unhandled
      event.preventDefault();

      // Show user-friendly message
      if (document.body) {
        showFirebaseErrorNotification();
      }
    }
  }
});

// Show user-friendly error notification
let errorNotificationShown = false;
const showFirebaseErrorNotification = () => {
  if (errorNotificationShown) return;
  errorNotificationShown = true;

  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    ">
      <div style="font-weight: 600; margin-bottom: 4px;">Bağlantı Sorunu</div>
      <div>Firebase ile bağlantı sorunu yaşanıyor. Sayfa yenilenecek...</div>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-reload after 3 seconds
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

// Firebase connection test with authentication check
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated first
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return false;
    }

    // Test Firebase connectivity with a simple authenticated operation
    const testRef = collection(db, 'users');
    await getDocs(testRef);
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('🔒 Firebase connection test failed - Firestore rules need deployment');
    } else {

      // Only attempt reconnection for network errors
      if (error.message?.includes('Failed to fetch') ||
          error.message?.includes('network-request-failed')) {
        await forceFirebaseReconnect();
      }
    }

    return false;
  }
};

// Authentication state listening is now handled by authAwareFirebaseTest.ts

export default app;
