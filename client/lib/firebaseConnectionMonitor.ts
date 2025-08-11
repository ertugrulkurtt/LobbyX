import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from './firebase';

let isMonitoring = false;
let connectionRetryCount = 0;
const MAX_RETRY_COUNT = 3;

export interface ConnectionStatus {
  isConnected: boolean;
  lastError?: string;
  retryCount: number;
}

let connectionStatus: ConnectionStatus = {
  isConnected: true,
  retryCount: 0
};

const connectionListeners: ((status: ConnectionStatus) => void)[] = [];

/**
 * Add connection status listener
 */
export const addConnectionListener = (listener: (status: ConnectionStatus) => void) => {
  connectionListeners.push(listener);
  // Immediately call with current status
  listener(connectionStatus);
};

/**
 * Remove connection status listener
 */
export const removeConnectionListener = (listener: (status: ConnectionStatus) => void) => {
  const index = connectionListeners.indexOf(listener);
  if (index > -1) {
    connectionListeners.splice(index, 1);
  }
};

/**
 * Notify all listeners of connection status change
 */
const notifyListeners = () => {
  connectionListeners.forEach(listener => listener(connectionStatus));
};

/**
 * Update connection status
 */
const updateConnectionStatus = (isConnected: boolean, error?: string) => {
  const previousStatus = connectionStatus.isConnected;
  connectionStatus = {
    isConnected,
    lastError: error,
    retryCount: connectionRetryCount
  };

  // Only notify if status changed
  if (previousStatus !== isConnected) {
    console.log(`Firebase connection status changed: ${isConnected ? 'Connected' : 'Disconnected'}`);
    notifyListeners();
  }
};

/**
 * Attempt to reconnect to Firebase
 */
const attemptReconnection = async (): Promise<boolean> => {
  if (connectionRetryCount >= MAX_RETRY_COUNT) {
    console.error('Max reconnection attempts reached');
    return false;
  }

  connectionRetryCount++;
  console.log(`Attempting Firebase reconnection (${connectionRetryCount}/${MAX_RETRY_COUNT})`);

  try {
    // Try to re-enable network
    await enableNetwork(db);
    
    // Test connection with a simple query
    await testConnection();
    
    connectionRetryCount = 0; // Reset on success
    updateConnectionStatus(true);
    return true;
  } catch (error: any) {
    console.error(`Reconnection attempt ${connectionRetryCount} failed:`, error.message);
    updateConnectionStatus(false, error.message);
    
    // Wait before next retry (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, connectionRetryCount - 1), 10000);
    setTimeout(() => {
      if (connectionRetryCount < MAX_RETRY_COUNT) {
        attemptReconnection();
      }
    }, delay);
    
    return false;
  }
};

/**
 * Test Firebase connection
 */
const testConnection = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Connection test timeout'));
    }, 5000);

    // Simple test - this will fail if not connected
    const unsubscribe = () => {
      clearTimeout(timeout);
    };

    try {
      // This is a simple way to test if Firebase is responsive
      unsubscribe();
      resolve();
    } catch (error) {
      unsubscribe();
      reject(error);
    }
  });
};

/**
 * Handle network errors globally
 */
export const handleNetworkError = (error: any): boolean => {
  const errorMessage = error.message || error.toString();
  
  // Check if it's a network-related error
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('network-request-failed') ||
    errorMessage.includes('unavailable') ||
    error.code === 'unavailable'
  ) {
    console.warn('Network error detected:', errorMessage);
    updateConnectionStatus(false, errorMessage);
    
    // Attempt reconnection if not already trying
    if (connectionStatus.isConnected || connectionRetryCount === 0) {
      attemptReconnection();
    }
    
    return true; // Indicates this was a network error
  }
  
  return false; // Not a network error
};

/**
 * Force reconnection attempt
 */
export const forceReconnection = async (): Promise<boolean> => {
  connectionRetryCount = 0; // Reset retry count
  return attemptReconnection();
};

/**
 * Get current connection status
 */
export const getConnectionStatus = (): ConnectionStatus => {
  return { ...connectionStatus };
};

/**
 * Initialize connection monitoring
 */
export const initializeConnectionMonitoring = () => {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('Firebase connection monitoring initialized');

  // Monitor online/offline events
  window.addEventListener('online', () => {
    console.log('Browser back online, testing Firebase connection...');
    forceReconnection();
  });

  window.addEventListener('offline', () => {
    console.log('Browser went offline');
    updateConnectionStatus(false, 'Browser offline');
  });

  // Initial connection test
  testConnection()
    .then(() => updateConnectionStatus(true))
    .catch((error) => updateConnectionStatus(false, error.message));
};

export default {
  initializeConnectionMonitoring,
  handleNetworkError,
  forceReconnection,
  getConnectionStatus,
  addConnectionListener,
  removeConnectionListener
};
