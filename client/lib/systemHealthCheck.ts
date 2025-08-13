/**
 * Simple System Health Check
 */

import { auth } from "./firebase";

interface HealthCheckResult {
  component: string;
  status: "healthy" | "warning" | "critical";
  message: string;
  details?: any;
}

class SystemHealthCheck {
  private results: HealthCheckResult[] = [];

  async runHealthCheck(): Promise<HealthCheckResult[]> {
    this.results = [];

    console.log("🏥 Starting simple health check...");

    // Check Firebase authentication
    this.results.push({
      component: "Firebase Auth",
      status: auth ? "healthy" : "critical",
      message: auth ? "Initialized" : "Not initialized",
    });

    // Check browser environment
    this.results.push({
      component: "Browser",
      status: typeof window !== "undefined" ? "healthy" : "critical",
      message: typeof window !== "undefined" ? "Ready" : "Not available",
    });

    console.log("✅ Health check completed:", this.results);
    return this.results;
  }

  createHealthIndicator() {
    const criticalIssues = this.results.filter((r) => r.status === "critical");

    if (criticalIssues.length > 0) {
      console.warn("❌ Critical issues found:", criticalIssues);
    } else {
      console.log("✅ System health OK");
    }
  }
}

export const systemHealthCheck = new SystemHealthCheck();

export default systemHealthCheck;
