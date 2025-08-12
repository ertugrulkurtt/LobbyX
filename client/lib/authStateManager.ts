import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

let authReady = false;
let currentUser: User | null = null;
const authReadyCallbacks: (() => void)[] = [];

// Initialize auth state listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!authReady) {
    authReady = true;
    // Call all waiting callbacks
    authReadyCallbacks.forEach(callback => callback());
    authReadyCallbacks.length = 0;
  }
});

/**
 * Wait for authentication to be ready
 */
export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (authReady) {
      resolve(currentUser);
    } else {
      authReadyCallbacks.push(() => resolve(currentUser));
    }
  });
};

/**
 * Wait for user to be authenticated
 */
export const waitForAuthenticatedUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (authReady && currentUser) {
      resolve(currentUser);
    } else if (authReady && !currentUser) {
      reject(new Error('User is not authenticated'));
    } else {
      authReadyCallbacks.push(() => {
        if (currentUser) {
          resolve(currentUser);
        } else {
          reject(new Error('User is not authenticated'));
        }
      });
    }
  });
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  return authReady && !!currentUser;
};

/**
 * Get current user if authenticated
 */
export const getCurrentUser = (): User | null => {
  return authReady ? currentUser : null;
};

/**
 * Retry operation with authentication check
 */
export const withAuthCheck = async <T>(
  operation: () => Promise<T>,
  operationName: string = 'firebase_operation'
): Promise<T> => {
  try {
    // Wait for auth to be ready
    await waitForAuth();
    
    // Check if user is authenticated
    if (!currentUser) {
      throw new Error(`Authentication required for ${operationName}`);
    }

    return await operation();
  } catch (error: any) {
    if (error.code === 'unauthenticated' || error.code === 'permission-denied') {
      // Try to refresh auth state
      await waitForAuth();
      if (!currentUser) {
        throw new Error(`Authentication required for ${operationName}`);
      }
      // Retry once
      return await operation();
    }
    throw error;
  }
};

export default {
  waitForAuth,
  waitForAuthenticatedUser,
  isAuthenticated,
  getCurrentUser,
  withAuthCheck
};
