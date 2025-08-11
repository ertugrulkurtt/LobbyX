import { handleFirebaseNetworkError, forceFirebaseReconnect } from './firebase';

interface ErrorContext {
  operation?: string;
  component?: string;
  timestamp: number;
}

// Track error frequency to prevent spam
const errorLog: { [key: string]: number } = {};
const ERROR_THROTTLE_MS = 5000; // Only log same error once per 5 seconds

/**
 * Global handler for Firebase fetch failures
 */
export const handleFirebaseFetchError = async (
  error: any, 
  context: ErrorContext = { timestamp: Date.now() }
): Promise<boolean> => {
  
  const errorKey = `${error.message || error.code}_${context.operation || 'unknown'}`;
  const now = Date.now();
  
  // Throttle error logging
  if (errorLog[errorKey] && (now - errorLog[errorKey]) < ERROR_THROTTLE_MS) {
    return false;
  }
  
  errorLog[errorKey] = now;
  
  // Check if it's a Firebase fetch error
  const isFetchError = 
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('network-request-failed') ||
    error.message?.includes('unavailable') ||
    error.code === 'unavailable' ||
    error.code === 'network-request-failed';
    
  if (!isFetchError) {
    return false;
  }
  
  console.warn(`🔥 Firebase fetch error detected in ${context.operation || 'unknown operation'}:`, {
    message: error.message,
    code: error.code,
    component: context.component,
    timestamp: new Date(context.timestamp).toISOString()
  });
  
  try {
    // Attempt to handle the network error
    const handled = await handleFirebaseNetworkError(error);
    
    if (handled) {
      console.log('🔄 Firebase error handled, attempting reconnection...');
      
      // Force reconnection after a brief delay
      setTimeout(async () => {
        const success = await forceFirebaseReconnect();
        if (success) {
          console.log('✅ Firebase reconnection successful');
        } else {
          console.error('❌ Firebase reconnection failed');
        }
      }, 1000);
      
      return true;
    }
  } catch (handlerError) {
    console.error('Error in Firebase error handler:', handlerError);
  }
  
  return false;
};

/**
 * Wrap Firebase operations with automatic error handling
 */
export const withFirebaseErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext> = {}
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const handled = await handleFirebaseFetchError(error, {
      ...context,
      timestamp: Date.now()
    });
    
    if (handled) {
      // For handled network errors, provide user-friendly message
      const userError = new Error('Bağlantı sorunu yaşanıyor. Lütfen tekrar deneyin.');
      userError.name = 'NetworkError';
      throw userError;
    }
    
    // Re-throw original error if not handled
    throw error;
  }
};

/**
 * Initialize global Firebase error monitoring
 */
export const initializeGlobalFirebaseErrorHandling = () => {
  // Monitor unhandled promise rejections for Firebase errors
  window.addEventListener('unhandledrejection', async (event) => {
    const error = event.reason;
    
    if (error && typeof error === 'object') {
      const handled = await handleFirebaseFetchError(error, {
        operation: 'unhandled_promise_rejection',
        component: 'global',
        timestamp: Date.now()
      });
      
      if (handled) {
        console.log('🔄 Handled unhandled Firebase error');
        event.preventDefault(); // Prevent console error logging
      }
    }
  });
  
  // Monitor general errors
  window.addEventListener('error', async (event) => {
    const error = event.error;
    
    if (error && typeof error === 'object') {
      await handleFirebaseFetchError(error, {
        operation: 'global_error',
        component: 'window',
        timestamp: Date.now()
      });
    }
  });
  
  console.log('🛡️ Global Firebase error handling initialized');
};

export default {
  handleFirebaseFetchError,
  withFirebaseErrorHandling,
  initializeGlobalFirebaseErrorHandling
};
