// Simplified Firebase operations wrapper with better error handling
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, forceFirebaseReconnect } from './firebase';

export interface FirebaseOperation<T> {
  operation: () => Promise<T>;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Execute Firebase operation with retry logic
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry certain errors
      if (
        error.code === 'permission-denied' ||
        error.code === 'invalid-argument' ||
        error.code === 'not-found'
      ) {
        throw error;
      }

      // Check if it's a network error
      const isNetworkError = 
        error.message.includes('Failed to fetch') ||
        error.code === 'unavailable' ||
        error.message.includes('network-request-failed') ||
        error.message.includes('offline');

      if (isNetworkError && attempt < maxRetries) {
        console.warn(`Network error in Firebase operation (attempt ${attempt}/${maxRetries})`);
        
        // Try to force reconnect on network errors
        if (attempt === 1) {
          try {
            await forceFirebaseReconnect();
          } catch (reconnectError) {
            console.warn('Firebase reconnect failed:', reconnectError);
          }
        }

        // Wait before retry with exponential backoff
        const backoffDelay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        continue;
      }

      // If this was the last attempt or not a network error, throw
      if (attempt === maxRetries) {
        console.error('Firebase operation failed after retries:', error);
        
        if (isNetworkError) {
          const networkError = new Error('Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.');
          networkError.name = 'NetworkError';
          throw networkError;
        }
        
        throw error;
      }
    }
  }

  throw lastError!;
}

/**
 * Safe collection reference
 */
export function safeCollection(path: string) {
  return collection(db, path);
}

/**
 * Safe document reference
 */
export function safeDoc(path: string, id: string) {
  return doc(db, path, id);
}

/**
 * Safe document get with retry
 */
export async function safeGetDoc(docRef: any): Promise<DocumentSnapshot> {
  return executeWithRetry(() => getDoc(docRef));
}

/**
 * Safe collection get with retry
 */
export async function safeGetDocs(queryRef: any): Promise<QuerySnapshot> {
  return executeWithRetry(() => getDocs(queryRef));
}

/**
 * Safe document add with retry
 */
export async function safeAddDoc(collectionRef: any, data: any) {
  return executeWithRetry(() => addDoc(collectionRef, data));
}

/**
 * Safe document update with retry
 */
export async function safeUpdateDoc(docRef: any, data: any) {
  return executeWithRetry(() => updateDoc(docRef, data));
}

/**
 * Safe document delete with retry
 */
export async function safeDeleteDoc(docRef: any) {
  return executeWithRetry(() => deleteDoc(docRef));
}

/**
 * Safe query builder
 */
export function safeQuery(collectionRef: any, ...queryConstraints: any[]) {
  return query(collectionRef, ...queryConstraints);
}

/**
 * Safe snapshot listener with error handling
 */
export function safeOnSnapshot(
  queryRef: any,
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    queryRef,
    onNext,
    (error) => {
      console.error('Firestore snapshot error:', error);
      
      // Try to handle network errors
      if (
        error.message.includes('Failed to fetch') ||
        error.code === 'unavailable'
      ) {
        console.warn('Network error in snapshot listener, attempting reconnect...');
        forceFirebaseReconnect();
      }
      
      if (onError) {
        onError(error);
      }
    }
  );
}

export { where, orderBy, limit };
