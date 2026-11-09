/**
 * ════════════════════════════════════════════════════════════════════
 *  PERSONAL EXECUTIVE AGENT — MASTER WORKFLOW ORCHESTRATOR
 * ════════════════════════════════════════════════════════════════════
 * Sovereign executive coordinator for Mini-Adhy Personal AI.
 * 
 * Capabilities:
 * - High-level task decomposition and planning across personal, academic,
 *   technical, creative, and professional domains.
 * - Enforces least-privilege risk tiers:
 *   * L0 (Observe): Queries, search, health checks, schedule inspection
 *   * L1 (Prepare): Drafts, proposals, candidate plans, simulation
 *   * L2 (Confirm): Sending emails, git commits, physical actuators (requires token)
 *   * L3 (Restricted): Destructive deletions, firmware flashes (strict token)
 * - Transparent execution verification and outcome tracking
 */

import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class PersonalExecutiveAgent {
  constructor(options = {}) {
    this.name = 'PersonalExecutiveAgent';
    this.identityConfig = options.identityConfig || null;
    this.permissionRegistry = options.permissionRegistry || null;
    this.integrationRegistry = options.integrationRegistry || null;
    this.localExecutionAgent = options.localExecutionAgent || null;
    this.hardwareGateway = options.hardwareGateway || null;
    this.securityAudit = options.securityAudit || null;
    this.activePlans = new Map();
  }

  /**
   * Plan a personal objective
   * @param {string} objective
   * @param {Object} context
   */
  async planObjective(objective, context = {}) {
    if (!objective) throw new Error('[PersonalExecutiveAgent] Objective is required.');

    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const domain = context.domain || 'technical';

    const plan = {
      id: planId,
      objective,
      domain,
      createdAt: Date.now(),
      status: 'PREPARED',
      steps: [
        { stepIndex: 1, action: 'context_retrieval', riskTier: EXECUTION_RISK_TIERS.L0_OBSERVE, status: 'PENDING' },
        { stepIndex: 2, action: 'workflow_synthesis', riskTier: EXECUTION_RISK_TIERS.L1_PREPARE, status: 'PENDING' },
        { stepIndex: 3, action: 'execution_dispatch', riskTier: EXECUTION_RISK_TIERS.L2_CONFIRM, status: 'PENDING' },
        { stepIndex: 4, action: 'verification_audit', riskTier: EXECUTION_RISK_TIERS.L0_OBSERVE, status: 'PENDING' }
      ]
    };

    this.activePlans.set(planId, plan);

    if (this.securityAudit) {
      this.securityAudit.logEvent({
        action: 'PLAN_OBJECTIVE',
        actor: this.name,
        riskTier: EXECUTION_RISK_TIERS.L1_PREPARE,
        details: { planId, objective, domain }
      });
    }

    return plan;
  }

  /**
   * Execute an authorized step of a plan
   */
  async executePlanStep(planId, stepIndex, options = {}) {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new Error(`[PersonalExecutiveAgent] Plan '${planId}' not found.`);

    const step = plan.steps.find(s => s.stepIndex === stepIndex);
    if (!step) throw new Error(`[PersonalExecutiveAgent] Step ${stepIndex} not found in plan.`);

    // Check approval if step is L2 or L3
    if (step.riskTier === EXECUTION_RISK_TIERS.L2_CONFIRM || step.riskTier === EXECUTION_RISK_TIERS.L3_RESTRICTED) {
      if (!options.approvalToken) {
        throw new Error(`[PersonalExecutiveAgent] Step ${stepIndex} requires verified owner token (${step.riskTier}).`);
      }
      if (this.permissionRegistry) {
        const payload = { planId, stepIndex };
        const verifyRes = this.permissionRegistry.verifyAndConsumeToken(
          options.approvalToken,
          `plan:${planId}:step:${stepIndex}`,
          payload
        );
        if (!verifyRes.valid) {
          throw new Error(`[PersonalExecutiveAgent] Invalid approval token: ${verifyRes.reason || verifyRes.error}`);
        }
      }
    }

    step.status = 'COMPLETED';
    step.executedAt = Date.now();

    if (this.securityAudit) {
      this.securityAudit.logEvent({
        action: 'EXECUTE_PLAN_STEP',
        actor: this.name,
        riskTier: step.riskTier,
        details: { planId, stepIndex, action: step.action }
      });
    }

    return {
      planId,
      stepIndex,
      action: step.action,
      status: 'SUCCESS',
      timestamp: step.executedAt
    };
  }

  getActivePlans() {
    return Array.from(this.activePlans.values());
  }
}

export default PersonalExecutiveAgent;
