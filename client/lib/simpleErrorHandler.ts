/**
 * Simple Error Handler - Handle network errors without interfering with fetch
 */

// Track network errors for user notification
let networkErrorCount = 0;
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN = 60000; // 1 minute

/**
 * Show network connectivity notification to user
 */
const showConnectivityNotification = () => {
  const now = Date.now();
  
  // Don't spam notifications
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) {
    return;
  }
  
  lastNotificationTime = now;
  
  // Remove any existing notification
  const existing = document.querySelector('.connectivity-notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'connectivity-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
    z-index: 10000;
    max-width: 320px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">🌐</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Bağlantı Sorunu</div>
        <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">
          İnternet bağlantınızı kontrol edin. Uygulama bağlantı kurulmaya çalışıyor.
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">
        ×
      </button>
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

// Monitor for network-related unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  if (error && error.message?.includes('Failed to fetch')) {
    // Count network errors
    networkErrorCount++;
    
    // Show notification after several failures
    if (networkErrorCount >= 3) {
      showConnectivityNotification();
      networkErrorCount = 0; // Reset counter
    }
    
    // Prevent the error from being unhandled
    event.preventDefault();
  }
});

// Reset error count when online
window.addEventListener('online', () => {
  networkErrorCount = 0;
  
  // Remove any existing connectivity notification
  const notification = document.querySelector('.connectivity-notification');
  if (notification) {
    notification.remove();
  }
});

export default {
  showConnectivityNotification
};
