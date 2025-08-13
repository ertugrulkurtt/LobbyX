/**
 * Minimal Error Handler - Only log Firebase errors without any fetch interference
 */

// Simply log Firebase-related errors without preventing or modifying anything
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // Only log Firebase errors quietly, don't prevent anything
  if (error && error.message?.includes('Failed to fetch')) {
    // Check if it's actually a Firebase error (not FullStory)
    if (error.stack?.includes('firebase') || error.stack?.includes('firestore')) {
      console.debug('Firebase network error (handled):', error.message.substring(0, 50));
    }
    // DO NOT call event.preventDefault() - let other libraries handle their errors
  }
});

// No fetch overrides, no interference - just monitoring
export default {};
