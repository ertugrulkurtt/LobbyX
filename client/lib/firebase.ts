import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyADxmd8rEqlZvlWIQT8E_q1xdokiWodvNA",
  authDomain: "lobbyx-8be54.firebaseapp.com",
  databaseURL: "https://lobbyx-8be54-default-rtdb.firebaseio.com/",
  projectId: "lobbyx-8be54",
  storageBucket: "lobbyx-8be54.firebasestorage.app",
  messagingSenderId: "967244100169",
  appId: "1:967244100169:web:7c56ad028f6586ebaec598"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Enable offline persistence for better reliability
import { enableNetwork, disableNetwork } from "firebase/firestore";

// Enhanced Firebase connection test with retry logic
export const testFirebaseConnection = async (retryCount = 0): Promise<boolean> => {
  try {
    // Check if Firebase services are initialized
    if (!auth || !db) {
      console.warn("Firebase services not initialized");
      return false;
    }

    // Test Firestore with a simple read operation
    const testDoc = doc(db, "_test", "connection");
    try {
      await getDoc(testDoc);
      console.log("✅ Firebase connection successful");
      return true;
    } catch (firestoreError: any) {
      // If it's a permission error, Firebase is still working
      if (firestoreError.code === "permission-denied") {
        console.log(
          "✅ Firebase connection OK (permission denied expected for test doc)",
        );
        return true;
      }

      // Handle network errors with retry
      if ((firestoreError.message?.includes("Failed to fetch") ||
           firestoreError.code === "unavailable") && retryCount < 2) {
        console.log(`🔄 Retrying Firebase connection test... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return testFirebaseConnection(retryCount + 1);
      }

      throw firestoreError;
    }
  } catch (error: any) {
    console.warn("❌ Firebase connection test failed:", error);

    // If it's a network error, provide more helpful logging
    if (error.message?.includes("Failed to fetch")) {
      console.warn("💡 This may be caused by third-party extensions or network issues");
    }

    return false;
  }
};

export default app;
