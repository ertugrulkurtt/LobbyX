// Critical error recovery system for Firebase failures

let firebaseErrorCount = 0;
let lastErrorTime = 0;
const ERROR_THRESHOLD = 5; // Number of errors before recovery
const ERROR_WINDOW = 30000; // 30 seconds
const RECOVERY_DELAY = 2000; // 2 seconds before reload

/**
 * Track Firebase errors and trigger recovery if needed
 */
export const trackFirebaseError = (error: any) => {
  const now = Date.now();
  
  // Reset count if errors are too old
  if (now - lastErrorTime > ERROR_WINDOW) {
    firebaseErrorCount = 0;
  }
  
  firebaseErrorCount++;
  lastErrorTime = now;
  
  console.warn(`🚨 Firebase error tracked (${firebaseErrorCount}/${ERROR_THRESHOLD}):`, error.message);
  
  // Trigger recovery if threshold reached
  if (firebaseErrorCount >= ERROR_THRESHOLD) {
    triggerCriticalRecovery();
  }
};

/**
 * Trigger critical recovery (page reload)
 */
const triggerCriticalRecovery = () => {
  console.error('🚨 Critical Firebase errors detected - triggering recovery');
  
  // Show user notification
  showRecoveryNotification();
  
  // Reload page after delay
  setTimeout(() => {
    window.location.reload();
  }, RECOVERY_DELAY);
};

/**
 * Show recovery notification to user
 */
const showRecoveryNotification = () => {
  // Remove any existing notifications
  const existing = document.querySelector('.critical-recovery-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'critical-recovery-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      padding: 16px;
      text-align: center;
      z-index: 99999;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">
      🔄 Kritik hata tespit edildi - Sayfa yenileniyor...
    </div>
  `;
  
  document.body.appendChild(notification);
};

/**
 * Initialize critical error monitoring
 */
export const initializeCriticalErrorRecovery = () => {
  // Monitor global errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message?.includes('fetch')) {
      trackFirebaseError(event.error);
    }
  });
  
  // Monitor unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    if (error && typeof error === 'object' && error.message?.includes('fetch')) {
      trackFirebaseError(error);
    }
  });
  
  console.log('🛡️ Critical error recovery initialized');
};

/**
 * Manual error reporting for caught errors
 */
export const reportFirebaseError = (error: any) => {
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('network-request-failed') ||
      error.code === 'unavailable') {
    trackFirebaseError(error);
  }
};

export default {
  trackFirebaseError,
  initializeCriticalErrorRecovery,
  reportFirebaseError
};
