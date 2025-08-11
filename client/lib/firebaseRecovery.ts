/**
 * Firebase Recovery - Handle critical Firebase internal assertion failures
 */

let assertionFailureCount = 0;
const MAX_ASSERTION_FAILURES = 3;

/**
 * Handle Firebase internal assertion failures by reloading the page
 */
export const handleFirebaseInternalAssertion = () => {
  assertionFailureCount++;
  
  console.warn(`Firebase internal assertion failure #${assertionFailureCount}`);
  
  if (assertionFailureCount >= MAX_ASSERTION_FAILURES) {
    console.error('Critical Firebase state corruption detected. Reloading page...');
    
    // Show user notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #dc2626;
      color: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(220, 38, 38, 0.5);
      z-index: 10000;
      text-align: center;
      font-family: system-ui, sans-serif;
    `;
    notification.innerHTML = `
      <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
        🔄 Sayfa Yenileniyor
      </div>
      <div style="font-size: 14px;">
        Firebase bağlantı sorunu nedeniyle sayfa yenileniyor...
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};

/**
 * Reset assertion failure count
 */
export const resetAssertionFailureCount = () => {
  assertionFailureCount = 0;
};

// Monitor console errors for Firebase internal assertions
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  
  if (message.includes('FIRESTORE') && message.includes('INTERNAL ASSERTION FAILED')) {
    handleFirebaseInternalAssertion();
  }
  
  // Call original console.error
  originalConsoleError.apply(console, args);
};

export default {
  handleFirebaseInternalAssertion,
  resetAssertionFailureCount
};
