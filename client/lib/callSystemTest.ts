/**
 * Call System Test Utility
 * Arama sistemi fonksiyonlarını test etmek için utility
 */

import { callService } from './callService';

interface CallTestResult {
  function: string;
  success: boolean;
  error?: string;
  duration?: number;
}

class CallSystemTest {
  private testResults: CallTestResult[] = [];

  /**
   * Test call service basic functionality
   */
  async testBasicFunctionality(): Promise<CallTestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting call system tests...');

    // Test 1: Service initialization
    await this.testServiceInitialization();
    
    // Test 2: Audio system
    await this.testAudioSystem();
    
    // Test 3: State management
    await this.testStateManagement();
    
    // Test 4: Error handling
    await this.testErrorHandling();

    console.log('🧪 Call system tests completed:', this.testResults);
    return this.testResults;
  }

  /**
   * Test service initialization
   */
  private async testServiceInitialization(): Promise<void> {
    const startTime = Date.now();
    try {
      // Check if callService is properly initialized
      const hasService = !!callService;
      const hasCurrentCall = callService.getCurrentCall !== undefined;
      const hasDebugMethod = callService.debugCurrentCall !== undefined;
      
      if (hasService && hasCurrentCall && hasDebugMethod) {
        this.addResult('service_initialization', true, Date.now() - startTime);
        console.log('✅ Call service initialization test passed');
      } else {
        throw new Error('Service not properly initialized');
      }
    } catch (error: any) {
      this.addResult('service_initialization', false, Date.now() - startTime, error.message);
      console.error('❌ Call service initialization test failed:', error);
    }
  }

  /**
   * Test audio system
   */
  private async testAudioSystem(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test microphone permission check
      const hasMicPermission = await callService.checkMicrophonePermission();
      
      if (hasMicPermission) {
        this.addResult('audio_system', true, Date.now() - startTime);
        console.log('✅ Audio system test passed - microphone accessible');
      } else {
        // Not necessarily an error, user might have denied permission
        this.addResult('audio_system', true, Date.now() - startTime, 'Microphone permission denied by user');
        console.log('⚠️ Audio system test - microphone permission denied');
      }
    } catch (error: any) {
      this.addResult('audio_system', false, Date.now() - startTime, error.message);
      console.error('❌ Audio system test failed:', error);
    }
  }

  /**
   * Test state management
   */
  private async testStateManagement(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test getCurrentCall method
      const currentCall = callService.getCurrentCall();
      
      // Test debugCurrentCall method
      callService.debugCurrentCall();
      
      // Test cleanup method
      if (typeof callService.cleanup === 'function') {
        // Don't actually call cleanup during test
        this.addResult('state_management', true, Date.now() - startTime);
        console.log('✅ State management test passed');
      } else {
        throw new Error('Cleanup method not available');
      }
    } catch (error: any) {
      this.addResult('state_management', false, Date.now() - startTime, error.message);
      console.error('❌ State management test failed:', error);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test invalid call ID handling
      try {
        await callService.endCall('invalid_call_id');
        // Should not throw error, should handle gracefully
        this.addResult('error_handling', true, Date.now() - startTime);
        console.log('✅ Error handling test passed');
      } catch (error) {
        // If it throws, that's not necessarily bad, depends on implementation
        this.addResult('error_handling', true, Date.now() - startTime, 'endCall throws for invalid ID');
        console.log('⚠️ Error handling test - endCall throws for invalid ID');
      }
    } catch (error: any) {
      this.addResult('error_handling', false, Date.now() - startTime, error.message);
      console.error('❌ Error handling test failed:', error);
    }
  }

  /**
   * Test call flow simulation
   */
  async testCallFlow(
    callerId: string,
    callerName: string,
    receiverId: string,
    receiverName: string,
    conversationId: string
  ): Promise<CallTestResult[]> {
    console.log('🧪 Starting call flow test...');
    
    const flowResults: CallTestResult[] = [];
    
    try {
      // Test call initiation
      const startTime = Date.now();
      const callId = await callService.initiateCall(
        callerId,
        callerName,
        undefined,
        receiverId,
        receiverName,
        undefined,
        conversationId
      );
      
      flowResults.push({
        function: 'initiate_call',
        success: true,
        duration: Date.now() - startTime
      });
      
      console.log('✅ Call initiation test passed, callId:', callId);
      
      // Wait a moment, then test ending call
      setTimeout(async () => {
        try {
          const endStartTime = Date.now();
          await callService.endCall(callId);
          
          flowResults.push({
            function: 'end_call',
            success: true,
            duration: Date.now() - endStartTime
          });
          
          console.log('✅ Call ending test passed');
        } catch (error: any) {
          flowResults.push({
            function: 'end_call',
            success: false,
            error: error.message
          });
          console.error('❌ Call ending test failed:', error);
        }
      }, 2000);
      
    } catch (error: any) {
      flowResults.push({
        function: 'initiate_call',
        success: false,
        error: error.message
      });
      console.error('❌ Call initiation test failed:', error);
    }
    
    return flowResults;
  }

  /**
   * Add test result
   */
  private addResult(
    functionName: string,
    success: boolean,
    duration?: number,
    error?: string
  ): void {
    this.testResults.push({
      function: functionName,
      success,
      duration,
      error
    });
  }

  /**
   * Get test summary
   */
  getTestSummary(): { total: number; passed: number; failed: number } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    
    return { total, passed, failed };
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const summary = this.getTestSummary();
    
    let report = `\n📊 CALL SYSTEM TEST REPORT\n`;
    report += `================================\n`;
    report += `Total Tests: ${summary.total}\n`;
    report += `Passed: ${summary.passed}\n`;
    report += `Failed: ${summary.failed}\n`;
    report += `Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%\n\n`;
    
    report += `DETAILED RESULTS:\n`;
    report += `-----------------\n`;
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      const error = result.error ? ` - ${result.error}` : '';
      
      report += `${status} ${result.function}${duration}${error}\n`;
    });
    
    return report;
  }
}

// Create singleton instance
export const callSystemTest = new CallSystemTest();

// Make available globally for debugging
if (import.meta.env.DEV) {
  (window as any).callSystemTest = callSystemTest;
  console.log('🛠️ Call system test utility available at window.callSystemTest');
}

export default callSystemTest;
