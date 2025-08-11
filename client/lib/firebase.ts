import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBJgWwIpQtZh_ecvK_5IDNoDWPi7ObIwhM",
  authDomain: "lobbyx-87c98.firebaseapp.com",
  databaseURL: "https://lobbyx-87c98-default-rtdb.firebaseio.com/",
  projectId: "lobbyx-87c98",
  storageBucket: "lobbyx-87c98.firebasestorage.app",
  messagingSenderId: "889985293267",
  appId: "1:889985293267:web:a51abf968b9210f4d02d26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
