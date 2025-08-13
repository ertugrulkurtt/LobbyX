/**
 * Performance Optimization Utilities
 * Bundle size ve performance iyileştirmeleri için utility'ler
 */

import React from 'react';

// Lazy loading utility for heavy components
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc);
};

// Debounce utility for search and input operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Memory cleanup for event listeners
export const createCleanupRegistry = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    register: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('Cleanup function failed:', error);
        }
      });
      cleanupFunctions.length = 0;
    }
  };
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for older browsers
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Performance monitoring
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measurement = performance.getEntriesByName(name, 'measure')[0];
        return measurement ? measurement.duration : 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },
  
  getNavigationTiming: () => {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return null;
    }
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;
    
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart
    };
  }
};

// Bundle size monitoring
export const bundleAnalyzer = {
  analyzeBundleSize: () => {
    if (typeof window === 'undefined') return null;
    
    // Rough estimation of bundle size based on script tags
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const scriptSources = scripts.map(script => (script as HTMLScriptElement).src);
    const styleSources = styles.map(link => (link as HTMLLinkElement).href);
    
    return {
      scriptCount: scripts.length,
      styleCount: styles.length,
      scriptSources,
      styleSources,
      recommendation: scripts.length > 10 ? 'Consider code splitting' : 'Bundle size looks reasonable'
    };
  },
  
  detectUnusedCode: () => {
    // Simple detection of potentially unused code
    const unusedSelectors: string[] = [];
    
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        if (sheet.href && !sheet.href.includes(window.location.origin)) return;
        
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              const styleRule = rule as CSSStyleRule;
              if (!document.querySelector(styleRule.selectorText)) {
                unusedSelectors.push(styleRule.selectorText);
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      });
    } catch (error) {
      console.warn('Unused code detection failed:', error);
    }
    
    return {
      unusedSelectors: unusedSelectors.slice(0, 10), // Limit to first 10
      count: unusedSelectors.length,
      recommendation: unusedSelectors.length > 100 ? 'Consider CSS purging' : 'CSS usage looks reasonable'
    };
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  getMemoryUsage: () => {
    if (typeof (performance as any).memory === 'undefined') {
      return null;
    }
    
    const memory = (performance as any).memory;
    
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  },
  
  isMemoryPressure: () => {
    const usage = memoryMonitor.getMemoryUsage();
    return usage ? usage.percentage > 80 : false;
  }
};

// Overall performance report
export const generatePerformanceReport = () => {
  console.log('\n⚡ PERFORMANCE REPORT');
  console.log('====================');
  
  // Navigation timing
  const navigation = performanceMonitor.getNavigationTiming();
  if (navigation) {
    console.log('📊 Navigation Timing:');
    console.log(`  DNS: ${navigation.dns.toFixed(1)}ms`);
    console.log(`  Request: ${navigation.request.toFixed(1)}ms`);
    console.log(`  Response: ${navigation.response.toFixed(1)}ms`);
    console.log(`  DOM: ${navigation.dom.toFixed(1)}ms`);
    console.log(`  Total: ${navigation.total.toFixed(1)}ms`);
    console.log('');
  }
  
  // Bundle analysis
  const bundle = bundleAnalyzer.analyzeBundleSize();
  if (bundle) {
    console.log('📦 Bundle Analysis:');
    console.log(`  Scripts: ${bundle.scriptCount}`);
    console.log(`  Stylesheets: ${bundle.styleCount}`);
    console.log(`  Recommendation: ${bundle.recommendation}`);
    console.log('');
  }
  
  // Memory usage
  const memory = memoryMonitor.getMemoryUsage();
  if (memory) {
    console.log('💾 Memory Usage:');
    console.log(`  Used: ${memory.used}MB`);
    console.log(`  Total: ${memory.total}MB`);
    console.log(`  Usage: ${memory.percentage}%`);
    console.log(`  Status: ${memory.percentage > 80 ? 'HIGH' : memory.percentage > 60 ? 'MEDIUM' : 'GOOD'}`);
    console.log('');
  }
  
  // Unused code
  const unused = bundleAnalyzer.detectUnusedCode();
  console.log('🧹 Code Usage:');
  console.log(`  Unused CSS selectors: ${unused.count}`);
  console.log(`  Recommendation: ${unused.recommendation}`);
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  // Mark initial load
  performanceMonitor.mark('app-start');
  
  // Monitor memory if available
  if (memoryMonitor.getMemoryUsage()) {
    setInterval(() => {
      if (memoryMonitor.isMemoryPressure()) {
        console.warn('⚠️ High memory usage detected');
      }
    }, 30000); // Check every 30 seconds
  }
  
  // Generate report after load
  setTimeout(() => {
    performanceMonitor.mark('app-ready');
    generatePerformanceReport();
  }, 2000);
  
  console.log('⚡ Performance monitoring initialized');
};

// Make available globally for debugging
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).performanceUtils = {
    generateReport: generatePerformanceReport,
    bundleAnalyzer,
    memoryMonitor,
    performanceMonitor
  };
  console.log('🛠️ Performance utilities available at window.performanceUtils');
}

export default {
  debounce,
  throttle,
  createCleanupRegistry,
  createIntersectionObserver,
  performanceMonitor,
  bundleAnalyzer,
  memoryMonitor,
  generatePerformanceReport,
  initializePerformanceMonitoring
};
