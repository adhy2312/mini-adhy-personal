/**
 * ════════════════════════════════════════════════════════════════════
 *  PERSONAL DASHBOARD SERVICE — COGNITIVE STATE AGGREGATOR
 * ════════════════════════════════════════════════════════════════════
 * Central aggregator supplying the Personal Assistant UI with real-time:
 * - Active agent mesh status (JARVIS, ULTRON, Hermes)
 * - Connector health (Email, Calendar, GitHub, Drive, Hardware)
 * - Pending approval requests (L2/L3 actions waiting for owner token)
 * - Recent memory reflections & learning adaptations
 * - System resource load & emergency stop status
 */

export class PersonalDashboardService {
  constructor(options = {}) {
    this.identityConfig = options.identityConfig || null;
    this.integrationRegistry = options.integrationRegistry || null;
    this.hardwareGateway = options.hardwareGateway || null;
    this.securityAudit = options.securityAudit || null;
    this.scheduler = options.scheduler || null;
    this.memoryService = options.memoryService || null;
    this.permissionRegistry = options.permissionRegistry || null;
  }

  /**
   * Produce comprehensive dashboard telemetry payload
   */
  async getDashboardSummary() {
    const timestamp = Date.now();
    const connectors = this.integrationRegistry ? this.integrationRegistry.listConnectors() : [];
    const scheduledJobs = this.scheduler ? this.scheduler.listJobs() : [];
    const auditStatus = this.securityAudit ? this.securityAudit.verifyIntegrity() : { valid: true };
    const recentAudits = this.securityAudit ? this.securityAudit.getEntries({ limit: 10 }) : [];

    let memoryStats = { totalRecords: 0, pendingHypotheses: 0 };
    if (this.memoryService) {
      const records = this.memoryService.listMemories ? this.memoryService.listMemories() : [];
      memoryStats.totalRecords = records.length;
    }

    return {
      system: {
        name: 'Mini-Adhy Personal AI',
        version: '2.0.0-personal',
        status: 'OPERATIONAL',
        timestamp
      },
      connectors: {
        total: connectors.length,
        items: connectors
      },
      automation: {
        activeJobs: scheduledJobs.filter(j => j.enabled).length,
        jobs: scheduledJobs
      },
      hardware: {
        emergencyStopEngaged: this.hardwareGateway ? this.hardwareGateway.emergencyStopEngaged : false
      },
      security: {
        auditChainValid: auditStatus.valid,
        recentAudits
      },
      memory: memoryStats
    };
  }
}

export default PersonalDashboardService;
