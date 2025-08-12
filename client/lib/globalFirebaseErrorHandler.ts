/**
 * Simple Firebase Error Handler
 */

export const withFirebaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: any
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Firebase operation error:', error);
    throw error;
  }
};

export const handleFirebaseFetchError = async (error: any, context?: any): Promise<boolean> => {
  console.warn('Firebase fetch error:', error);
  return false;
};

export const initializeGlobalFirebaseErrorHandling = () => {
  console.log('Simple Firebase error handling initialized');
};

export default {
  withFirebaseErrorHandling,
  handleFirebaseFetchError,
  initializeGlobalFirebaseErrorHandling
};
