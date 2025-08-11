/**
 * THIS FILE IS DEPRECATED - DO NOT USE
 * Use simpleErrorHandler.ts instead to prevent conflicts with FullStory
 */

// This file is intentionally empty to prevent any fetch overrides
export const deprecatedNetworkHandler = () => {
  console.warn('networkErrorHandler.ts is deprecated. Use simpleErrorHandler.ts instead.');
};

export default {
  deprecatedNetworkHandler
};
