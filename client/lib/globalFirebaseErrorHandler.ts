/**
 * Simple Firebase Error Handler
 */

export const withFirebaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: any
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Handle permission denied errors specifically
    if (error.code === 'permission-denied') {
      console.error('🔒 Firebase Permission Denied:', {
        operation: context?.operation || 'unknown',
        component: context?.component || 'unknown',
        error: error.message
      });

      // Show user-friendly message
      const message = `Veritabanı izinleri güncellenmelidir. Lütfen sistem yöneticisiyle iletişime geçin.`;

      // You could also dispatch a global notification here
      if (typeof window !== 'undefined') {
        console.warn('Permission Error:', message);
      }
    }

    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.code === 'unavailable') {
      console.warn('🌐 Firebase Network Error:', {
        operation: context?.operation || 'unknown',
        component: context?.component || 'unknown',
        error: error.message
      });
    }

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
