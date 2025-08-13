/**
 * Firebase Retry Wrapper - Handles network errors and third-party interference
 */

import { handleFirebaseError } from './firebaseErrorRecovery';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Wraps Firebase operations with automatic retry logic for network errors
 */
export async function withFirebaseRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 5000
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Handle Firebase error reporting
      handleFirebaseError(error, `retry attempt ${attempt + 1}`);

      // Check if this is a retryable network error
      const isNetworkError =
        error.message?.includes("Failed to fetch") ||
        error.code === "unavailable" ||
        error.code === "deadline-exceeded" ||
        error.code === "unauthenticated" ||
        error.message?.includes("network-request-failed") ||
        error.message?.includes("fetch");

      if (!isNetworkError || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.warn(
        `🔄 Firebase operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
        error.message
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Specifically for Firestore operations that might be affected by third-party interference
 */
export async function withFirestoreRetry<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  return withFirebaseRetry(operation, {
    maxRetries: 2,
    baseDelay: 1500,
    maxDelay: 3000
  }).catch((error: any) => {
    // Enhanced error logging for debugging
    if (error.message?.includes("Failed to fetch")) {
      console.error(`Firestore operation failed${context ? ` (${context})` : ''}:`, {
        error: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
    throw error;
  });
}

export default {
  withFirebaseRetry,
  withFirestoreRetry
};
