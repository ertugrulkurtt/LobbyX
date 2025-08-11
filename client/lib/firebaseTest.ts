import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');

    // Check if user is authenticated first
    if (!auth.currentUser) {
      console.log('Firebase connection test skipped - user not authenticated');
      return true; // Return true to not block app loading
    }

    // Try to read a simple collection (only if authenticated)
    const testCollection = collection(db, 'users');
    const snapshot = await getDocs(testCollection);

    console.log('Firebase connection test successful - found', snapshot.size, 'users');
    return true;
  } catch (error: any) {
    console.error('Firebase connection test failed:', error);

    // Check for specific error types
    if (error.code === 'unavailable') {
      console.error('Firebase service is unavailable - network issue');
    } else if (error.code === 'permission-denied') {
      console.error('Firebase permission denied - check Firestore rules');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('Network fetch failed - possible network or CORS issue');
    }

    // Don't block app loading for Firebase test failures
    return false;
  }
};
