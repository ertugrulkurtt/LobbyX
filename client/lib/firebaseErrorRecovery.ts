/**
 * Firebase Error Recovery - Handles third-party interference without global fetch override
 */

let errorCount = 0;
let lastErrorTime = 0;
const ERROR_RESET_INTERVAL = 30000; // 30 seconds

/**
 * Handle Firebase errors caused by third-party interference
 */
export const handleFirebaseError = (error: any, context?: string): void => {
  const now = Date.now();
  
  // Reset error count if enough time has passed
  if (now - lastErrorTime > ERROR_RESET_INTERVAL) {
    errorCount = 0;
  }
  
  lastErrorTime = now;
  
  // Check if this is a fetch error that might be caused by FullStory or similar
  if (error.message?.includes("Failed to fetch")) {
    errorCount++;
    
    console.warn(`🔧 Firebase fetch error detected${context ? ` (${context})` : ''} - attempt ${errorCount}:`, {
      error: error.message,
      context,
      userAgent: navigator.userAgent.includes('FullStory') ? 'FullStory detected' : 'No FullStory'
    });
    
    // Dispatch event for UI handling
    window.dispatchEvent(new CustomEvent('firebase-network-error', { 
      detail: { error, context, errorCount }
    }));
    
    // If we have multiple errors, suggest potential solutions
    if (errorCount >= 3) {
      console.warn('🚨 Multiple Firebase fetch errors detected. This may be caused by:');
      console.warn('  • Browser extensions interfering with requests');
      console.warn('  • FullStory or other analytics tools');
      console.warn('  • Network connectivity issues');
      console.warn('  • CORS or security policies');
    }
  }
};

/**
 * Reset error tracking
 */
export const resetErrorTracking = (): void => {
  errorCount = 0;
  lastErrorTime = 0;
};

/**
 * Get current error stats
 */
export const getErrorStats = () => ({
  errorCount,
  lastErrorTime,
  timeSinceLastError: Date.now() - lastErrorTime
});

/**
 * Check if we should show user-facing error message
 */
export const shouldShowUserError = (): boolean => {
  return errorCount >= 2 && (Date.now() - lastErrorTime) < ERROR_RESET_INTERVAL;
};

export default {
  handleFirebaseError,
  resetErrorTracking,
  getErrorStats,
  shouldShowUserError
};
