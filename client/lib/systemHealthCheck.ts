/**
 * System Health Check
 * Tüm sistem bileşenlerinin sağlığını kontrol eder
 */

import { callSystemTest } from './callSystemTest';
import { unifiedErrorHandler } from './unifiedErrorHandler';
import { uiHealthCheck } from './uiHealthCheck';
import { auth } from './firebase';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
}

class SystemHealthCheck {
  private results: HealthCheckResult[] = [];

  /**
   * Run comprehensive health check
   */
  async runHealthCheck(): Promise<HealthCheckResult[]> {
    this.results = [];
    
    console.log('🏥 Starting system health check...');

    // Check error handler
    await this.checkErrorHandler();
    
    // Check Firebase connectivity
    await this.checkFirebaseConnectivity();
    
    // Check call system
    await this.checkCallSystem();
    
    // Check messaging system
    await this.checkMessagingSystem();
    
    // Check UI components
    await this.checkUIComponents();

    // Run detailed UI health check
    await this.checkUIHealth();

    console.log('🏥 System health check completed');
    this.printHealthReport();
    
    return this.results;
  }

  /**
   * Check error handler
   */
  private async checkErrorHandler(): Promise<void> {
    try {
      const stats = unifiedErrorHandler.getStats();
      
      if (stats.consecutiveErrors > 5) {
        this.addResult('error_handler', 'critical', 
          `Too many consecutive errors: ${stats.consecutiveErrors}`);
      } else if (stats.consecutiveErrors > 2) {
        this.addResult('error_handler', 'warning', 
          `Some errors detected: ${stats.consecutiveErrors}`);
      } else {
        this.addResult('error_handler', 'healthy', 'Error handler functioning normally');
      }
    } catch (error: any) {
      this.addResult('error_handler', 'critical', 'Error handler not accessible', error.message);
    }
  }

  /**
   * Check Firebase connectivity
   */
  private async checkFirebaseConnectivity(): Promise<void> {
    try {
      // Check authentication status first
      const currentUser = auth.currentUser;

      if (!currentUser) {
        this.addResult('firebase_connectivity', 'warning', 'User not authenticated - Firebase tests skipped');
        return;
      }

      // Test if Firebase is accessible by checking debug utilities
      const hasDebugUtils = !!(window as any).firebaseDebug;

      if (hasDebugUtils) {
        // Try to run actual connectivity test
        try {
          const testResults = await (window as any).firebaseDebug.testFirestore();
          if (testResults.success) {
            this.addResult('firebase_connectivity', 'healthy',
              `Firebase connected (${testResults.latency}ms)`);
          } else {
            this.addResult('firebase_connectivity', 'warning',
              `Firebase issues detected: ${testResults.error}`);
          }
        } catch (testError: any) {
          this.addResult('firebase_connectivity', 'warning',
            'Firebase debug test failed', testError.message);
        }
      } else {
        this.addResult('firebase_connectivity', 'warning', 'Firebase debug utilities not found');
      }
    } catch (error: any) {
      this.addResult('firebase_connectivity', 'critical', 'Firebase connectivity check failed', error.message);
    }
  }

  /**
   * Check call system
   */
  private async checkCallSystem(): Promise<void> {
    try {
      const hasCallTest = !!(window as any).callSystemTest;
      
      if (hasCallTest) {
        // Run basic call system tests
        const testResults = await callSystemTest.testBasicFunctionality();
        const summary = callSystemTest.getTestSummary();
        
        if (summary.failed === 0) {
          this.addResult('call_system', 'healthy', 
            `All call tests passed (${summary.passed}/${summary.total})`);
        } else if (summary.failed <= 1) {
          this.addResult('call_system', 'warning', 
            `Some call tests failed (${summary.passed}/${summary.total})`);
        } else {
          this.addResult('call_system', 'critical', 
            `Multiple call tests failed (${summary.passed}/${summary.total})`);
        }
      } else {
        this.addResult('call_system', 'warning', 'Call system test utilities not available');
      }
    } catch (error: any) {
      this.addResult('call_system', 'critical', 'Call system check failed', error.message);
    }
  }

  /**
   * Check messaging system
   */
  private async checkMessagingSystem(): Promise<void> {
    try {
      // Check if messageService is imported and available
      const hasMessageService = typeof window !== 'undefined';
      
      if (hasMessageService) {
        this.addResult('messaging_system', 'healthy', 'Message service appears functional');
      } else {
        this.addResult('messaging_system', 'warning', 'Message service status unknown');
      }
    } catch (error: any) {
      this.addResult('messaging_system', 'critical', 'Messaging system check failed', error.message);
    }
  }

  /**
   * Check UI components
   */
  private async checkUIComponents(): Promise<void> {
    try {
      // Check if React is loaded
      const hasReact = !!(window as any).React;
      
      // Check if main app container exists
      const hasAppContainer = !!document.getElementById('root');
      
      // Check for common UI elements
      const hasButtons = document.querySelectorAll('button').length > 0;
      const hasInputs = document.querySelectorAll('input').length > 0;

      const uiElements = {
        react: hasReact,
        container: hasAppContainer,
        buttons: hasButtons,
        inputs: hasInputs
      };

      const healthyCount = Object.values(uiElements).filter(Boolean).length;
      
      if (healthyCount >= 3) {
        this.addResult('ui_components', 'healthy', 'UI components loading correctly', uiElements);
      } else if (healthyCount >= 2) {
        this.addResult('ui_components', 'warning', 'Some UI components missing', uiElements);
      } else {
        this.addResult('ui_components', 'critical', 'UI components not loading properly', uiElements);
      }
    } catch (error: any) {
      this.addResult('ui_components', 'critical', 'UI component check failed', error.message);
    }
  }

  /**
   * Check UI health
   */
  private async checkUIHealth(): Promise<void> {
    try {
      const uiIssues = await uiHealthCheck.runUIHealthCheck();
      const summary = uiHealthCheck.getUIHealthSummary();

      if (summary.overall === 'good') {
        this.addResult('ui_health', 'healthy', 'UI/UX components functioning well');
      } else if (summary.overall === 'fair') {
        this.addResult('ui_health', 'warning',
          `UI/UX has some issues (${summary.counts.warning} warnings, ${summary.counts.critical} critical)`);
      } else {
        this.addResult('ui_health', 'critical',
          `UI/UX has critical issues (${summary.counts.critical} critical, ${summary.counts.warning} warnings)`);
      }
    } catch (error: any) {
      this.addResult('ui_health', 'warning', 'UI health check failed', error.message);
    }
  }

  /**
   * Add health check result
   */
  private addResult(
    component: string,
    status: 'healthy' | 'warning' | 'critical',
    message: string,
    details?: any
  ): void {
    this.results.push({
      component,
      status,
      message,
      details
    });
  }

  /**
   * Print health report to console
   */
  private printHealthReport(): void {
    console.log('\n🏥 SYSTEM HEALTH REPORT');
    console.log('========================');
    
    const statusCounts = {
      healthy: this.results.filter(r => r.status === 'healthy').length,
      warning: this.results.filter(r => r.status === 'warning').length,
      critical: this.results.filter(r => r.status === 'critical').length
    };

    console.log(`✅ Healthy: ${statusCounts.healthy}`);
    console.log(`⚠️ Warning: ${statusCounts.warning}`);
    console.log(`🚨 Critical: ${statusCounts.critical}`);
    console.log('');

    this.results.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '🚨';
      console.log(`${icon} ${result.component}: ${result.message}`);
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
    });

    // Overall system health
    const overallHealth = statusCounts.critical > 0 ? 'CRITICAL' :
                         statusCounts.warning > 0 ? 'WARNING' : 'HEALTHY';
    
    console.log(`\n🏥 OVERALL SYSTEM HEALTH: ${overallHealth}`);
  }

  /**
   * Get system health summary
   */
  getHealthSummary(): {
    overall: 'healthy' | 'warning' | 'critical';
    components: HealthCheckResult[];
    counts: { healthy: number; warning: number; critical: number };
  } {
    const counts = {
      healthy: this.results.filter(r => r.status === 'healthy').length,
      warning: this.results.filter(r => r.status === 'warning').length,
      critical: this.results.filter(r => r.status === 'critical').length
    };

    const overall = counts.critical > 0 ? 'critical' :
                   counts.warning > 0 ? 'warning' : 'healthy';

    return {
      overall,
      components: this.results,
      counts
    };
  }

  /**
   * Create visual health status indicator
   */
  createHealthIndicator(): void {
    // Remove existing indicator
    const existing = document.getElementById('system-health-indicator');
    if (existing) existing.remove();

    const summary = this.getHealthSummary();
    
    const indicator = document.createElement('div');
    indicator.id = 'system-health-indicator';
    indicator.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${summary.overall === 'healthy' ? '#16a34a' : 
                     summary.overall === 'warning' ? '#f59e0b' : '#dc2626'};
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: system-ui, sans-serif;
        z-index: 1000;
        cursor: pointer;
        user-select: none;
      ">
        🏥 System: ${summary.overall.toUpperCase()}
      </div>
    `;

    // Click to show detailed report
    indicator.addEventListener('click', () => {
      this.printHealthReport();
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
export const systemHealthCheck = new SystemHealthCheck();

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).systemHealthCheck = systemHealthCheck;
  console.log('🛠️ System health check available at window.systemHealthCheck');
}

export default systemHealthCheck;
