import { withExponentialBackoff } from './firebase';

interface OperationOptions {
  showUserError?: boolean;
  userErrorMessage?: string;
  maxRetries?: number;
  fallbackValue?: any;
}

// Track failed operations for user feedback
let consecutiveFailures = 0;
let userNotified = false;

/**
 * Robust wrapper for Firebase operations with user feedback
 */
export const robustFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  options: OperationOptions = {}
): Promise<T | null> => {
  const {
    showUserError = true,
    userErrorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.',
    maxRetries = 3,
    fallbackValue = null
  } = options;

  try {
    const result = await withExponentialBackoff(operation, maxRetries);
    
    // Reset failure count on success
    consecutiveFailures = 0;
    userNotified = false;
    
    return result;
  } catch (error: any) {
    consecutiveFailures++;
    
    console.error(`🔥 Firebase operation failed: ${operationName}`, {
      error: error.message,
      consecutiveFailures,
      userNotified
    });

    // Show user notification after 3 consecutive failures
    if (consecutiveFailures >= 3 && !userNotified && showUserError) {
      showUserErrorNotification(userErrorMessage);
      userNotified = true;
    }

    // Check if this is a critical network error
    const isNetworkError = 
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('network-request-failed') ||
      error.code === 'unavailable';

    if (isNetworkError) {
      console.warn('🔄 Network error detected, attempting page reload...');
      
      // If we've had many failures, suggest page reload
      if (consecutiveFailures >= 5) {
        showReloadSuggestion();
      }
    }

    return fallbackValue;
  }
};

/**
 * Show user error notification
 */
const showUserErrorNotification = (message: string) => {
  // Remove any existing error notifications
  const existingNotifications = document.querySelectorAll('.firebase-error-notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = 'firebase-error-notification';
  notification.innerHTML = `
    <div style="
      position: fixed; 
      top: 80px; 
      right: 20px; 
      background: #dc2626; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="font-weight: 600;">⚠️ Bağlantı Sorunu</div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 16px;">
          ✕
        </button>
      </div>
      <div style="margin-top: 4px; opacity: 0.9;">${message}</div>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    </style>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
};

/**
 * Show reload suggestion
 */
const showReloadSuggestion = () => {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%); 
      background: #1f2937; 
      color: white; 
      padding: 24px; 
      border-radius: 12px; 
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      z-index: 10001;
      max-width: 400px;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
      <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">
        Bağlantı Sorunu
      </div>
      <div style="margin-bottom: 20px; opacity: 0.8; line-height: 1.5;">
        Firebase ile bağlantı kurulamıyor. Sayfayı yenilemek sorunu çözebilir.
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button onclick="window.location.reload()" 
                style="
                  background: #3b82f6; 
                  color: white; 
                  border: none; 
                  padding: 10px 20px; 
                  border-radius: 6px; 
                  cursor: pointer; 
                  font-weight: 600;
                ">
          Sayfayı Yenile
        </button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="
                  background: #6b7280; 
                  color: white; 
                  border: none; 
                  padding: 10px 20px; 
                  border-radius: 6px; 
                  cursor: pointer;
                ">
          Kapat
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);
};

/**
 * Quick Firebase operation wrapper for simple operations
 */
export const quickFirebaseOp = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Quick Firebase operation failed, using fallback:', error);
    return fallback;
  }
};

export default {
  robustFirebaseOperation,
  quickFirebaseOp
};
