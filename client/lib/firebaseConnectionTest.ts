import { auth, db } from './firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Test Firebase connection and authentication
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Wait for auth state to be ready
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve();
      });
    });

    // Test Firestore connection with a simple read
    const testQuery = query(collection(db, 'users'), limit(1));
    await getDocs(testQuery);
    
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error: any) {
    console.warn('⚠️ Firebase connection test failed:', error.message);
    return false;
  }
};

export default { testFirebaseConnection };
