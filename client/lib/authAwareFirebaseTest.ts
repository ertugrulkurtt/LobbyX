/**
 * Authentication-Aware Firebase Testing
 * Firebase testlerini sadece kullanıcı authenticate olduğunda çalıştırır
 */

import { auth } from './firebase';
import { testFirebaseConnection } from './firebase';

interface AuthTestResult {
  isAuthenticated: boolean;
  firebaseConnected: boolean;
  message: string;
}

/**
 * Safe Firebase connection test that checks authentication first
 */
export const safeFirebaseConnectionTest = async (): Promise<AuthTestResult> => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return {
      isAuthenticated: false,
      firebaseConnected: false,
      message: 'User not authenticated - Firebase tests skipped'
    };
  }

  try {
    const connected = await testFirebaseConnection();
    return {
      isAuthenticated: true,
      firebaseConnected: connected,
      message: connected ? 'Firebase connection successful' : 'Firebase connection failed'
    };
  } catch (error: any) {
    return {
      isAuthenticated: true,
      firebaseConnected: false,
      message: `Firebase test error: ${error.message}`
    };
  }
};

/**
 * Initialize authentication-aware Firebase testing
 */
export const initializeAuthAwareFirebaseTest = () => {
  // Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ User authenticated, running Firebase connection test...');
      setTimeout(async () => {
        const result = await safeFirebaseConnectionTest();
        console.log(`🔥 Firebase test result:`, result);
      }, 2000); // Wait 2 seconds after auth for stability
    } else {
      console.log('ℹ️ User not authenticated, Firebase tests disabled');
    }
  });
  
  console.log('🔐 Authentication-aware Firebase testing initialized');
};

/**
 * Manual Firebase test (can be called from console)
 */
export const runManualFirebaseTest = async () => {
  console.log('🧪 Running manual Firebase connection test...');
  const result = await safeFirebaseConnectionTest();
  
  if (result.isAuthenticated) {
    if (result.firebaseConnected) {
      console.log('✅ Firebase connection test PASSED');
    } else {
      console.error('❌ Firebase connection test FAILED:', result.message);
    }
  } else {
    console.warn('⚠️ Firebase connection test SKIPPED:', result.message);
  }
  
  return result;
};

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).runFirebaseTest = runManualFirebaseTest;
  console.log('🛠️ Manual Firebase test available at window.runFirebaseTest()');
}

export default {
  safeFirebaseConnectionTest,
  initializeAuthAwareFirebaseTest,
  runManualFirebaseTest
};
