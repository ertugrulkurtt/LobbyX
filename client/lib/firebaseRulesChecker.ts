import { auth, db } from './firebase';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Test if Firestore rules are properly deployed
 */
export const testFirestoreRules = async (): Promise<{
  isDeployed: boolean;
  error?: string;
  message: string;
}> => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      return {
        isDeployed: false,
        error: 'unauthenticated',
        message: 'User must be logged in to test rules'
      };
    }

    const userId = auth.currentUser.uid;
    const testDocRef = doc(db, 'users', userId);

    // Try to read user document (should be allowed)
    await getDoc(testDocRef);

    // Try to write user document (should be allowed)
    await setDoc(testDocRef, { 
      testField: 'test', 
      timestamp: new Date().toISOString() 
    }, { merge: true });

    return {
      isDeployed: true,
      message: 'Firestore rules are properly deployed and working'
    };

  } catch (error: any) {
    if (error.code === 'permission-denied') {
      return {
        isDeployed: false,
        error: 'permission-denied',
        message: 'Firestore rules not deployed or authentication issue. Please deploy rules in Firebase Console.'
      };
    }

    return {
      isDeployed: false,
      error: error.code || 'unknown',
      message: `Firestore test failed: ${error.message}`
    };
  }
};

/**
 * Show user-friendly notification for rules deployment
 */
export const showRulesDeploymentNotification = () => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    z-index: 10000;
    max-width: 400px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 20px;">🔒</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">
          Firebase Rules Gerekli
        </div>
        <div style="margin-bottom: 12px; opacity: 0.9;">
          Firestore kuralları deploy edilmemiş. Mesaj işlemleri çalışmayabilir.
        </div>
        <div style="margin-bottom: 8px; font-size: 12px; opacity: 0.8;">
          <strong>Çözüm:</strong>
        </div>
        <div style="font-size: 12px; margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">
          1. Firebase Console → Firestore Database → Rules<br>
          2. Kuralları güncelle ve Publish et<br>
          3. FIREBASE_QUICK_FIX.md dosyasına bak
        </div>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
          Kapat
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 15 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 15000);
};

/**
 * Check rules on app startup
 */
export const initializeRulesCheck = async () => {
  // Wait for auth to be ready
  if (!auth.currentUser) {
    return;
  }

  try {
    const result = await testFirestoreRules();
    if (!result.isDeployed && result.error === 'permission-denied') {
      showRulesDeploymentNotification();
    }
  } catch (error) {
    console.warn('Rules check failed:', error);
  }
};

export default {
  testFirestoreRules,
  showRulesDeploymentNotification,
  initializeRulesCheck
};
