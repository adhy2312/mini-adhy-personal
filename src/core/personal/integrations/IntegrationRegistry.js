/**
 * ════════════════════════════════════════════════════════════════════
 *  INTEGRATION REGISTRY — PERSONAL CONNECTOR MANAGEMENT
 * ════════════════════════════════════════════════════════════════════
 * Manages the registration, health, state, and permission checks
 * of all personal connectors and hardware gateways.
 */

import { BaseConnector, CONNECTOR_STATUS } from './BaseConnector';
import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class IntegrationRegistry {
  constructor(permissionRegistry = null) {
    this.permissionRegistry = permissionRegistry;
    this.connectors = new Map();
  }

  /**
   * Register a connector
   */
  registerConnector(connector) {
    if (!(connector instanceof BaseConnector)) {
      throw new Error('[IntegrationRegistry] Connector must extend BaseConnector.');
    }
    if (this.connectors.has(connector.id)) {
      console.warn(`[IntegrationRegistry] Overwriting existing connector '${connector.id}'.`);
    }
    this.connectors.set(connector.id, connector);
    return true;
  }

  /**
   * Unregister connector
   */
  unregisterConnector(id) {
    if (this.connectors.has(id)) {
      const conn = this.connectors.get(id);
      conn.disconnect().catch(() => {});
      this.connectors.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Get connector by id
   */
  getConnector(id) {
    return this.connectors.get(id) || null;
  }

  /**
   * List all connectors and statuses
   */
  listConnectors() {
    return Array.from(this.connectors.values()).map(conn => ({
      id: conn.id,
      name: conn.name,
      type: conn.type,
      status: conn.status,
      supportedActions: Array.from(conn.supportedActions),
      lastHealthCheck: conn.lastHealthCheck
    }));
  }

  /**
   * Execute action on a connector with security checks
   */
  async executeConnectorAction(connectorId, action, params = {}, options = {}) {
    const connector = this.getConnector(connectorId);
    if (!connector) {
      throw new Error(`[IntegrationRegistry] Connector '${connectorId}' not found.`);
    }

    const riskTier = connector.getActionRisk(action);

    // If permission registry is configured, verify permissions
    if (this.permissionRegistry) {
      const operationName = `${connectorId}:${action}`;
      const payload = { connectorId, action, params };

      if (riskTier === EXECUTION_RISK_TIERS.L2_CONFIRM || riskTier === EXECUTION_RISK_TIERS.L3_RESTRICTED) {
        if (!options.approvalToken) {
          throw new Error(`[IntegrationRegistry] Action '${action}' on '${connectorId}' requires owner approval token (${riskTier}).`);
        }
        const verifyRes = this.permissionRegistry.verifyAndConsumeToken(
          options.approvalToken,
          operationName,
          payload
        );
        if (!verifyRes.valid) {
          throw new Error(`[IntegrationRegistry] Invalid or expired approval token: ${verifyRes.reason || verifyRes.error}`);
        }
      }
    }

    return await connector.execute(action, params, options);
  }

  /**
   * Run comprehensive health check on all registered connectors
   */
  async checkAllHealth() {
    const results = {};
    for (const [id, conn] of this.connectors.entries()) {
      results[id] = await conn.healthCheck();
    }
    return results;
  }
}

export default IntegrationRegistry;
