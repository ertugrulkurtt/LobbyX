/**
 * Subscription Manager to prevent Firebase "Target ID already exists" errors
 */

const activeSubscriptions = new Map<string, () => void>();

/**
 * Create a managed subscription that prevents duplicates
 */
export const createManagedSubscription = (
  subscriptionId: string,
  subscriptionFactory: () => (() => void)
): (() => void) => {
  // Clean up existing subscription if it exists
  const existingUnsubscribe = activeSubscriptions.get(subscriptionId);
  if (existingUnsubscribe) {
    try {
      existingUnsubscribe();
    } catch (error) {
      console.warn(`Error cleaning up existing subscription ${subscriptionId}:`, error);
    }
    activeSubscriptions.delete(subscriptionId);
  }

  // Create new subscription
  try {
    const unsubscribe = subscriptionFactory();
    activeSubscriptions.set(subscriptionId, unsubscribe);
    
    // Return cleanup function
    return () => {
      try {
        unsubscribe();
        activeSubscriptions.delete(subscriptionId);
      } catch (error) {
        console.warn(`Error unsubscribing from ${subscriptionId}:`, error);
      }
    };
  } catch (error) {
    console.error(`Error creating subscription ${subscriptionId}:`, error);
    return () => {}; // Return empty cleanup function
  }
};

/**
 * Clean up all active subscriptions
 */
export const cleanupAllSubscriptions = () => {
  activeSubscriptions.forEach((unsubscribe, id) => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn(`Error cleaning up subscription ${id}:`, error);
    }
  });
  activeSubscriptions.clear();
};

/**
 * Get count of active subscriptions (for debugging)
 */
export const getActiveSubscriptionCount = () => activeSubscriptions.size;

export default {
  createManagedSubscription,
  cleanupAllSubscriptions,
  getActiveSubscriptionCount
};
