import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { db, rtdb } from './firebase';
import { withFirebaseErrorHandling } from './globalFirebaseErrorHandler';

export interface ConnectionTestResult {
  service: string;
  success: boolean;
  error?: string;
  latency?: number;
}

/**
 * Test Firestore connection
 */
export const testFirestoreConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();

  try {
    // Check authentication first
    const { auth } = require('./firebase');
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return {
        service: 'Firestore',
        success: false,
        error: 'User not authenticated',
        latency: Date.now() - startTime
      };
    }

    await withFirebaseErrorHandling(
      () => getDocs(collection(db, 'users')),
      { operation: 'test_firestore_connection', component: 'debugUtils' }
    );

    return {
      service: 'Firestore',
      success: true,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      service: 'Firestore',
      success: false,
      error: error.message,
      latency: Date.now() - startTime
    };
  }
};

/**
 * Test Realtime Database connection
 */
export const testRealtimeDatabaseConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  
  try {
    await withFirebaseErrorHandling(
      () => get(ref(rtdb, '/.info/connected')),
      { operation: 'test_rtdb_connection', component: 'debugUtils' }
    );
    
    return {
      service: 'Realtime Database',
      success: true,
      latency: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      service: 'Realtime Database',
      success: false,
      error: error.message,
      latency: Date.now() - startTime
    };
  }
};

/**
 * Run comprehensive Firebase connection test
 */
export const runFirebaseConnectionTest = async (): Promise<ConnectionTestResult[]> => {
  console.log('🔥 Running Firebase connection test...');
  
  const results = await Promise.all([
    testFirestoreConnection(),
    testRealtimeDatabaseConnection()
  ]);
  
  console.log('🔥 Firebase connection test results:', results);
  
  return results;
};

/**
 * Test specific Firebase operation with detailed logging
 */
export const testFirebaseOperation = async (
  operationName: string,
  operation: () => Promise<any>
): Promise<{ success: boolean; error?: string; result?: any }> => {
  console.log(`🧪 Testing Firebase operation: ${operationName}`);
  
  try {
    const result = await withFirebaseErrorHandling(
      operation,
      { operation: operationName, component: 'debugUtils' }
    );
    
    console.log(`✅ ${operationName} succeeded`, result);
    return { success: true, result };
  } catch (error: any) {
    console.error(`❌ ${operationName} failed:`, error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally for debugging
if (import.meta.env.DEV) {
  (window as any).firebaseDebug = {
    testConnection: runFirebaseConnectionTest,
    testFirestore: testFirestoreConnection,
    testRTDB: testRealtimeDatabaseConnection,
    testOperation: testFirebaseOperation
  };
  
  console.log('🛠️ Firebase debug utilities available at window.firebaseDebug');
}

export default {
  testFirestoreConnection,
  testRealtimeDatabaseConnection,
  runFirebaseConnectionTest,
  testFirebaseOperation
};
