import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJgWwIpQtZh_ecvK_5IDNoDWPi7ObIwhM",
  authDomain: "lobbyx-87c98.firebaseapp.com",
  databaseURL: "https://lobbyx-87c98-default-rtdb.firebaseio.com/",
  projectId: "lobbyx-87c98",
  storageBucket: "lobbyx-87c98.firebasestorage.app",
  messagingSenderId: "889985293267",
  appId: "1:889985293267:web:a51abf968b9210f4d02d26",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Enhanced Firebase connection test
export const testFirebaseConnection = async (): Promise<boolean> => {
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
      throw firestoreError;
    }
  } catch (error) {
    console.warn("❌ Firebase connection test failed:", error);
    return false;
  }
};

export default app;
