import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read a simple collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    
    console.log('Firebase connection test successful');
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
    
    return false;
  }
};
