/**
 * Unified Error Handler
 * Tek merkezi error handling sistemi - tüm error türlerini yönetir
 */

import { forceFirebaseReconnect } from './firebase';

interface ErrorConfig {
  maxErrors: number;
  timeWindow: number;
  retryAttempts: number;
  userNotificationThreshold: number;
}

interface ErrorStats {
  count: number;
  lastErrorTime: number;
  consecutiveErrors: number;
  notificationShown: boolean;
}

class UnifiedErrorHandler {
  private config: ErrorConfig = {
    maxErrors: 5,
    timeWindow: 30000, // 30 seconds
    retryAttempts: 3,
    userNotificationThreshold: 3
  };

  private errorStats: ErrorStats = {
    count: 0,
    lastErrorTime: 0,
    consecutiveErrors: 0,
    notificationShown: false
  };

  private initialized = false;
  private retryPromises = new Map<string, Promise<any>>();

  /**
   * Initialize the unified error handler
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandled_promise');
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'global_error');
    });

    console.log('✅ Unified Error Handler initialized');
  }

  /**
   * Main error handling function
   */
  private async handleError(error: any, source: string = 'unknown') {
    if (!error) return;

    const now = Date.now();
    const isFirebaseError = this.isFirebaseError(error);
    
    // Update error statistics
    this.updateErrorStats(now);

    // Log error for debugging
    console.warn(`🚨 Error detected from ${source}:`, {
      message: error.message,
      code: error.code,
      consecutive: this.errorStats.consecutiveErrors,
      isFirebase: isFirebaseError
    });

    // Handle Firebase specific errors
    if (isFirebaseError) {
      await this.handleFirebaseError(error);
    }

    // Show user notification if threshold reached
    if (this.shouldShowNotification()) {
      this.showUserNotification(isFirebaseError);
    }

    // Trigger recovery if critical threshold reached
    if (this.shouldTriggerRecovery()) {
      this.triggerRecovery();
    }
  }

  /**
   * Check if error is Firebase related
   */
  private isFirebaseError(error: any): boolean {
    if (!error.message) return false;
    
    return (
      error.message.includes('Failed to fetch') ||
      error.message.includes('firebase') ||
      error.message.includes('firestore') ||
      error.message.includes('network-request-failed') ||
      error.code === 'unavailable' ||
      error.code === 'permission-denied'
    );
  }

  /**
   * Update error statistics
   */
  private updateErrorStats(now: number) {
    // Reset stats if error window has passed
    if (now - this.errorStats.lastErrorTime > this.config.timeWindow) {
      this.errorStats.count = 0;
      this.errorStats.consecutiveErrors = 0;
      this.errorStats.notificationShown = false;
    }

    this.errorStats.count++;
    this.errorStats.consecutiveErrors++;
    this.errorStats.lastErrorTime = now;
  }

  /**
   * Handle Firebase specific errors
   */
  private async handleFirebaseError(error: any) {
    try {
      console.log('🔄 Attempting Firebase error recovery...');
      await forceFirebaseReconnect();
    } catch (recoveryError) {
      console.error('❌ Firebase recovery failed:', recoveryError);
    }
  }

  /**
   * Check if user notification should be shown
   */
  private shouldShowNotification(): boolean {
    return (
      this.errorStats.consecutiveErrors >= this.config.userNotificationThreshold &&
      !this.errorStats.notificationShown
    );
  }

  /**
   * Check if recovery should be triggered
   */
  private shouldTriggerRecovery(): boolean {
    return this.errorStats.count >= this.config.maxErrors;
  }

  /**
   * Show user-friendly notification
   */
  private showUserNotification(isFirebaseError: boolean) {
    this.errorStats.notificationShown = true;

    const message = isFirebaseError 
      ? 'Bağlantı sorunları yaşanıyor. Lütfen bekleyin...'
      : 'Bir hata oluştu. Sayfa yenilenebilir.';

    this.createNotification(message, isFirebaseError ? 'warning' : 'error');
  }

  /**
   * Create and show notification
   */
  private createNotification(message: string, type: 'warning' | 'error') {
    // Remove existing notifications
    document.querySelectorAll('.unified-error-notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = 'unified-error-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc2626' : '#f59e0b'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>${type === 'error' ? '⚠️' : '🔄'}</span>
          <span>${message}</span>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="margin-left: auto; background: none; border: none; color: white; cursor: pointer;">
            ✕
          </button>
        </div>
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
  }

  /**
   * Trigger recovery (page reload)
   */
  private triggerRecovery() {
    console.error('🚨 Critical error threshold reached - triggering recovery');
    
    this.createNotification('Kritik hatalar tespit edildi. Sayfa yenileniyor...', 'error');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  /**
   * Manual error reporting
   */
  reportError(error: any, context: string = 'manual') {
    this.handleError(error, context);
  }

  /**
   * Wrap operations with error handling
   */
  async wrapOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallback?: T
  ): Promise<T> {
    const operationKey = `${operationName}_${Date.now()}`;
    
    try {
      // Deduplicate concurrent operations
      if (this.retryPromises.has(operationName)) {
        return await this.retryPromises.get(operationName);
      }

      const promise = this.executeWithRetry(operation, operationName);
      this.retryPromises.set(operationName, promise);
      
      const result = await promise;
      
      // Reset error count on success
      this.errorStats.consecutiveErrors = 0;
      this.errorStats.notificationShown = false;
      
      return result;
    } catch (error) {
      this.reportError(error, operationName);
      
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
    } finally {
      this.retryPromises.delete(operationName);
    }
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry non-retryable errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < this.config.retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`🔄 Retrying ${operationName} in ${delay}ms (attempt ${attempt}/${this.config.retryAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    return (
      error.code === 'permission-denied' ||
      error.code === 'invalid-argument' ||
      error.code === 'not-found' ||
      error.message?.includes('Invalid user') ||
      error.message?.includes('Authentication required')
    );
  }

  /**
   * Reset error statistics
   */
  reset() {
    this.errorStats = {
      count: 0,
      lastErrorTime: 0,
      consecutiveErrors: 0,
      notificationShown: false
    };
  }

  /**
   * Get current error statistics
   */
  getStats() {
    return { ...this.errorStats };
  }
}

// Create singleton instance
export const unifiedErrorHandler = new UnifiedErrorHandler();

// Export convenience functions
export const initializeErrorHandler = () => unifiedErrorHandler.initialize();
export const reportError = (error: any, context?: string) => unifiedErrorHandler.reportError(error, context);
export const wrapOperation = <T>(
  operation: () => Promise<T>,
  operationName: string,
  fallback?: T
) => unifiedErrorHandler.wrapOperation(operation, operationName, fallback);

export default unifiedErrorHandler;
