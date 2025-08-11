/**
 * Network Error Handler - Handle "Failed to fetch" and other network errors gracefully
 */

let networkErrorCount = 0;
let lastNetworkError = 0;
const NETWORK_ERROR_THRESHOLD = 5;
const ERROR_RESET_TIME = 30000; // 30 seconds

/**
 * Handle network fetch failures
 */
export const handleNetworkError = (error: any) => {
  const now = Date.now();

  // Reset counter if enough time has passed
  if (now - lastNetworkError > ERROR_RESET_TIME) {
    networkErrorCount = 0;
  }

  networkErrorCount++;
  lastNetworkError = now;

  // Only show notification for non-Firebase errors to avoid noise
  const isFirebaseError = error.message?.includes('firestore') ||
                         error.message?.includes('firebase');

  // If too many network errors and not Firebase, show user notification
  if (networkErrorCount >= NETWORK_ERROR_THRESHOLD && !isFirebaseError) {
    showNetworkErrorNotification();
    networkErrorCount = 0; // Reset to prevent spam
  }
};

/**
 * Show network error notification to user
 */
const showNetworkErrorNotification = () => {
  // Remove existing notification
  const existing = document.querySelector('.network-error-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'network-error-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f59e0b;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    z-index: 10000;
    max-width: 300px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span>🌐</span>
      <div>
        <div style="font-weight: 600; margin-bottom: 2px;">Bağlantı Sorunu</div>
        <div style="font-size: 12px; opacity: 0.9;">
          İnternet bağlantınızı kontrol edin. Uygulama otomatik olarak yeniden denenecek.
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
        ✕
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message || error.toString();
  
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('ERR_NETWORK') ||
    message.includes('ERR_INTERNET_DISCONNECTED') ||
    error.code === 'ERR_NETWORK' ||
    error.name === 'NetworkError'
  );
};

/**
 * Wrap fetch with error handling
 */
export const safeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (isNetworkError(error)) {
      handleNetworkError(error);
    }
    throw error;
  }
};

// Don't override fetch - let other libraries (FullStory, etc.) handle it
// Instead, rely on unhandled rejection handling

export default {
  handleNetworkError,
  isNetworkError,
  safeFetch
};
