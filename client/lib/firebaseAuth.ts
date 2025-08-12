import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Wait for Firebase auth to be ready
 */
export const waitForAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Ensure user is authenticated before operation
 */
export const ensureAuthenticated = async (): Promise<User> => {
  const user = await waitForAuth();
  if (!user) {
    throw new Error('User must be authenticated for this operation');
  }
  return user;
};

/**
 * Get current user with auth check
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    return await waitForAuth();
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated synchronously
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

export default {
  waitForAuth,
  ensureAuthenticated,
  getCurrentUser,
  isAuthenticated
};
