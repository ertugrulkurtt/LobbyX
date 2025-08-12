/**
 * UI/UX Health Check Utility
 * UI bileşenlerinin durumunu ve kullanıcı deneyimini kontrol eder
 */

interface UIIssue {
  type: 'critical' | 'warning' | 'info';
  component: string;
  description: string;
  fix?: string;
}

class UIHealthCheck {
  private issues: UIIssue[] = [];

  /**
   * Run comprehensive UI health check
   */
  async runUIHealthCheck(): Promise<UIIssue[]> {
    this.issues = [];
    
    console.log('🎨 Starting UI/UX health check...');

    // Check basic page structure
    this.checkPageStructure();
    
    // Check accessibility
    this.checkAccessibility();
    
    // Check responsive design
    this.checkResponsiveDesign();
    
    // Check performance indicators
    this.checkPerformance();
    
    // Check user interaction elements
    this.checkInteractionElements();
    
    // Check loading states
    this.checkLoadingStates();

    console.log('🎨 UI health check completed');
    this.printUIReport();
    
    return this.issues;
  }

  /**
   * Check basic page structure
   */
  private checkPageStructure(): void {
    // Check for main content areas
    const hasHeader = !!document.querySelector('header, nav, [role="banner"]');
    const hasMain = !!document.querySelector('main, [role="main"], .main-content');
    const hasNavigation = !!document.querySelector('nav, .navigation, .sidebar');

    if (!hasHeader) {
      this.addIssue('warning', 'page_structure', 'No header/navigation found');
    }

    if (!hasMain) {
      this.addIssue('warning', 'page_structure', 'No main content area found');
    }

    if (!hasNavigation) {
      this.addIssue('info', 'page_structure', 'No navigation element detected');
    }

    // Check for basic meta tags
    const hasViewport = !!document.querySelector('meta[name="viewport"]');
    const hasTitle = !!document.title && document.title.length > 0;

    if (!hasViewport) {
      this.addIssue('critical', 'page_structure', 'Missing viewport meta tag', 'Add viewport meta tag for mobile compatibility');
    }

    if (!hasTitle) {
      this.addIssue('warning', 'page_structure', 'Missing or empty page title');
    }
  }

  /**
   * Check accessibility features
   */
  private checkAccessibility(): void {
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    if (imagesWithoutAlt.length > 0) {
      this.addIssue('warning', 'accessibility', 
        `${imagesWithoutAlt.length} images missing alt text`,
        'Add alt text to all images');
    }

    // Check for form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      const hasLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
      const hasAriaLabel = !!input.getAttribute('aria-label');
      return !hasLabel && !hasAriaLabel;
    });

    if (inputsWithoutLabels.length > 0) {
      this.addIssue('warning', 'accessibility',
        `${inputsWithoutLabels.length} form inputs missing labels`,
        'Add labels or aria-label to all form inputs');
    }

    // Check for keyboard navigation
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      this.addIssue('critical', 'accessibility', 'No focusable elements found for keyboard navigation');
    }
  }

  /**
   * Check responsive design
   */
  private checkResponsiveDesign(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Check if content fits on small screens
    if (width < 768) {
      const hasHorizontalScroll = document.body.scrollWidth > width;
      
      if (hasHorizontalScroll) {
        this.addIssue('warning', 'responsive_design',
          'Horizontal scroll detected on mobile',
          'Ensure content fits within viewport width');
      }
    }

    // Check for responsive elements
    const hasFlexbox = getComputedStyle(document.body).display.includes('flex');
    const hasGrid = getComputedStyle(document.body).display.includes('grid');
    const responsiveElements = document.querySelectorAll('[class*="responsive"], [class*="flex"], [class*="grid"]');

    if (!hasFlexbox && !hasGrid && responsiveElements.length === 0) {
      this.addIssue('info', 'responsive_design', 'No modern layout methods detected');
    }

    // Check for mobile-friendly touch targets
    const buttons = document.querySelectorAll('button, [role="button"], a');
    const smallButtons = Array.from(buttons).filter(button => {
      const rect = button.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44; // Apple's recommended minimum
    });

    if (smallButtons.length > 0) {
      this.addIssue('warning', 'responsive_design',
        `${smallButtons.length} touch targets smaller than recommended 44px`,
        'Increase button sizes for better mobile usability');
    }
  }

  /**
   * Check performance indicators
   */
  private checkPerformance(): void {
    // Check bundle size (if available)
    if ((window as any).performance && (window as any).performance.getEntriesByType) {
      const navigationEntries = (window as any).performance.getEntriesByType('navigation');
      
      if (navigationEntries.length > 0) {
        const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].fetchStart;
        
        if (loadTime > 5000) {
          this.addIssue('critical', 'performance', 
            `Slow page load time: ${Math.round(loadTime)}ms`,
            'Optimize bundle size and reduce network requests');
        } else if (loadTime > 2000) {
          this.addIssue('warning', 'performance',
            `Page load time: ${Math.round(loadTime)}ms`,
            'Consider optimizing for faster loading');
        }
      }
    }

    // Check for large images
    const images = document.querySelectorAll('img');
    const largeImages = Array.from(images).filter(img => {
      return img.naturalWidth > 2000 || img.naturalHeight > 2000;
    });

    if (largeImages.length > 0) {
      this.addIssue('warning', 'performance',
        `${largeImages.length} potentially oversized images detected`,
        'Optimize image sizes for web use');
    }
  }

  /**
   * Check user interaction elements
   */
  private checkInteractionElements(): void {
    // Check for buttons without hover states
    const buttons = document.querySelectorAll('button, [role="button"]');
    
    if (buttons.length === 0) {
      this.addIssue('warning', 'interaction', 'No interactive buttons found');
    }

    // Check for loading indicators
    const loadingElements = document.querySelectorAll(
      '.loading, .spinner, [role="progressbar"], [aria-live]'
    );

    if (loadingElements.length === 0) {
      this.addIssue('info', 'interaction', 'No loading indicators detected');
    }

    // Check for error states
    const errorElements = document.querySelectorAll(
      '.error, .alert, [role="alert"], [aria-invalid="true"]'
    );

    // This is actually good if there are no errors
    if (errorElements.length > 0) {
      this.addIssue('info', 'interaction', `${errorElements.length} error states currently visible`);
    }
  }

  /**
   * Check loading states
   */
  private checkLoadingStates(): void {
    // Check for skeleton loaders or loading animations
    const skeletonElements = document.querySelectorAll(
      '.skeleton, .shimmer, .loading-skeleton, [class*="animate-pulse"]'
    );

    const spinnerElements = document.querySelectorAll(
      '.spinner, [class*="animate-spin"], .loading-spinner'
    );

    if (skeletonElements.length === 0 && spinnerElements.length === 0) {
      this.addIssue('info', 'loading_states', 'No loading animations detected');
    }
  }

  /**
   * Add UI issue
   */
  private addIssue(
    type: 'critical' | 'warning' | 'info',
    component: string,
    description: string,
    fix?: string
  ): void {
    this.issues.push({
      type,
      component,
      description,
      fix
    });
  }

  /**
   * Print UI report to console
   */
  private printUIReport(): void {
    console.log('\n🎨 UI/UX HEALTH REPORT');
    console.log('======================');
    
    const typeCounts = {
      critical: this.issues.filter(i => i.type === 'critical').length,
      warning: this.issues.filter(i => i.type === 'warning').length,
      info: this.issues.filter(i => i.type === 'info').length
    };

    console.log(`🚨 Critical: ${typeCounts.critical}`);
    console.log(`⚠️ Warning: ${typeCounts.warning}`);
    console.log(`ℹ️ Info: ${typeCounts.info}`);
    console.log('');

    this.issues.forEach(issue => {
      const icon = issue.type === 'critical' ? '🚨' : 
                   issue.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${issue.component}: ${issue.description}`);
      if (issue.fix) {
        console.log(`   Fix: ${issue.fix}`);
      }
    });

    // Overall UI health
    const overallHealth = typeCounts.critical > 0 ? 'NEEDS ATTENTION' :
                         typeCounts.warning > 3 ? 'FAIR' : 'GOOD';
    
    console.log(`\n🎨 OVERALL UI HEALTH: ${overallHealth}`);
  }

  /**
   * Get UI health summary
   */
  getUIHealthSummary(): {
    overall: 'good' | 'fair' | 'poor';
    issues: UIIssue[];
    counts: { critical: number; warning: number; info: number };
  } {
    const counts = {
      critical: this.issues.filter(i => i.type === 'critical').length,
      warning: this.issues.filter(i => i.type === 'warning').length,
      info: this.issues.filter(i => i.type === 'info').length
    };

    const overall = counts.critical > 0 ? 'poor' :
                   counts.warning > 3 ? 'fair' : 'good';

    return {
      overall,
      issues: this.issues,
      counts
    };
  }

  /**
   * Create UI health indicator
   */
  createUIHealthIndicator(): void {
    // Remove existing indicator
    const existing = document.getElementById('ui-health-indicator');
    if (existing) existing.remove();

    const summary = this.getUIHealthSummary();
    
    const indicator = document.createElement('div');
    indicator.id = 'ui-health-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${summary.overall === 'good' ? '#16a34a' : 
                     summary.overall === 'fair' ? '#f59e0b' : '#dc2626'};
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: system-ui, sans-serif;
        z-index: 1000;
        cursor: pointer;
        user-select: none;
      ">
        🎨 UI: ${summary.overall.toUpperCase()}
      </div>
    `;

    // Click to show detailed report
    indicator.addEventListener('click', () => {
      this.printUIReport();
    });

    document.body.appendChild(indicator);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }, 10000);
  }
}

// Create singleton instance
export const uiHealthCheck = new UIHealthCheck();

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).uiHealthCheck = uiHealthCheck;
  console.log('🛠️ UI health check available at window.uiHealthCheck');
}

export default uiHealthCheck;
