/**
 * Simple Error Handler - Basic error wrapping without complexity
 */

// Simple wrapper for operations - just executes and logs errors
export const wrapOperation = async <T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.warn(`Error in ${context || "operation"}:`, error);
    throw error;
  }
};

// Simple error handler class for compatibility
export class UnifiedErrorHandler {
  initialize() {
    console.log("Simple error handler initialized");
  }
}

export const unifiedErrorHandler = new UnifiedErrorHandler();

export default {
  wrapOperation,
  unifiedErrorHandler,
};
