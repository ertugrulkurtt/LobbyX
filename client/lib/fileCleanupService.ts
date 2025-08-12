import { cleanupExpiredFiles } from './fileService';
import { auth } from './firebase';

// Cleanup interval: Check every 6 hours
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Storage key for last cleanup timestamp
const LAST_CLEANUP_KEY = 'lobbyx-last-file-cleanup';

/**
 * Check if cleanup is needed and run if necessary
 */
export const checkAndRunCleanup = async (): Promise<void> => {
  try {
    // Only run cleanup if user is authenticated
    if (!auth.currentUser) {
      console.log('Skipping file cleanup - user not authenticated');
      return;
    }

    const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
    const lastCleanupTime = lastCleanup ? parseInt(lastCleanup) : 0;
    const now = Date.now();

    // Check if 6 hours have passed since last cleanup
    if (now - lastCleanupTime >= CLEANUP_INTERVAL) {
      console.log('Starting scheduled file cleanup...');

      await cleanupExpiredFiles();

      // Update last cleanup timestamp
      localStorage.setItem(LAST_CLEANUP_KEY, now.toString());

      console.log('File cleanup completed successfully');
    }
  } catch (error) {
    console.error('Error during scheduled file cleanup:', error);
  }
};

/**
 * Force cleanup regardless of interval
 */
export const forceCleanup = async (): Promise<void> => {
  try {
    // Only run cleanup if user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to run file cleanup');
    }

    console.log('Starting forced file cleanup...');

    await cleanupExpiredFiles();

    // Update last cleanup timestamp
    localStorage.setItem(LAST_CLEANUP_KEY, Date.now().toString());

    console.log('Forced file cleanup completed successfully');
  } catch (error) {
    console.error('Error during forced file cleanup:', error);
    throw error;
  }
};

/**
 * Get last cleanup time
 */
export const getLastCleanupTime = (): Date | null => {
  const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
  return lastCleanup ? new Date(parseInt(lastCleanup)) : null;
};

/**
 * Initialize cleanup service
 * Should be called when app starts
 */
export const initFileCleanupService = (): void => {
  // Run initial cleanup check
  checkAndRunCleanup();

  // Set up periodic cleanup checks (every hour)
  setInterval(() => {
    checkAndRunCleanup();
  }, 60 * 60 * 1000); // 1 hour

  console.log('File cleanup service initialized');
};

export default {
  checkAndRunCleanup,
  forceCleanup,
  getLastCleanupTime,
  initFileCleanupService
};
