// Global error handler for Firebase and network issues

let errorHandlerInitialized = false;

export const initializeGlobalErrorHandler = () => {
  if (errorHandlerInitialized) return;
  
  errorHandlerInitialized = true;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Check if it's a Firebase network error
    if (
      error && 
      (error.message?.includes('Failed to fetch') ||
       error.code === 'unavailable' ||
       error.message?.includes('network-request-failed'))
    ) {
      console.warn('Unhandled Firebase network error caught:', error);
      
      // Prevent the default browser error reporting
      event.preventDefault();
      
      // Show user-friendly notification instead of console error
      showNetworkErrorNotification();
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (
      error && 
      (error.message?.includes('Failed to fetch') ||
       error.message?.includes('firebase') ||
       error.message?.includes('firestore'))
    ) {
      console.warn('Global Firebase error caught:', error);
      
      // Prevent error propagation for network issues
      event.preventDefault();
      
      showNetworkErrorNotification();
    }
  });

  console.log('Global error handler initialized');
};

let notificationShown = false;
let notificationTimeout: NodeJS.Timeout;

const showNetworkErrorNotification = () => {
  // Throttle notifications - only show once every 10 seconds
  if (notificationShown) return;
  
  notificationShown = true;
  
  // Clear any existing timeout
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  // Create a subtle notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1s infinite;"></div>
      <span>Bağlantı sorunu - Yeniden deneniyor...</span>
    </div>
  `;

  // Add animation keyframes if not already added
  if (!document.querySelector('#global-error-styles')) {
    const style = document.createElement('style');
    style.id = 'global-error-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);

  // Reset throttle after 10 seconds
  notificationTimeout = setTimeout(() => {
    notificationShown = false;
  }, 10000);
};

export default { initializeGlobalErrorHandler };
