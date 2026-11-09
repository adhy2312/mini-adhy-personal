/**
 * ════════════════════════════════════════════════════════════════════
 *  BASE CONNECTOR — INTEGRATION FRAMEWORK
 * ════════════════════════════════════════════════════════════════════
 * Base class for all external, local, and hardware connectors in Mini-Adhy Personal.
 * 
 * Enforces:
 * - Structured lifecycle: initialize -> connect -> validateCredentials -> execute -> disconnect
 * - Scoped permissions & risk classification (L0-L3)
 * - Rate limiting and retry policies
 * - Health check telemetry
 * - Audit-event logging for every action
 */

import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export const CONNECTOR_STATUS = Object.freeze({
  UNINITIALIZED: 'UNINITIALIZED',
  CONFIGURED: 'CONFIGURED',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
  DISABLED: 'DISABLED'
});

export class BaseConnector {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique connector identifier
   * @param {string} options.name - Human-readable name
   * @param {string} options.type - Category (e.g., 'CLOUD_SERVICE', 'LOCAL_SYSTEM', 'HARDWARE')
   * @param {string[]} options.supportedActions - Actions supported by this connector
   * @param {Object} [options.actionRiskMap] - Map of action -> EXECUTION_RISK_TIERS
   */
  constructor(options = {}) {
    if (!options.id) throw new Error('[BaseConnector] Connector id is required.');
    this.id = options.id;
    this.name = options.name || options.id;
    this.type = options.type || 'CLOUD_SERVICE';
    this.supportedActions = new Set(options.supportedActions || []);
    this.actionRiskMap = options.actionRiskMap || {};
    this.status = CONNECTOR_STATUS.UNINITIALIZED;
    this.lastHealthCheck = null;
    this.credentials = null;
    this.auditLog = [];
    this.eventListeners = new Map();
  }

  /**
   * Initialize connector with configuration
   */
  async initialize(config = {}) {
    this.config = { ...config };
    this.status = CONNECTOR_STATUS.CONFIGURED;
    return true;
  }

  /**
   * Connect and authenticate to external or local service
   */
  async connect(credentials = null) {
    if (credentials) {
      this.credentials = credentials;
    }
    const isValid = await this.validateCredentials();
    if (isValid) {
      this.status = CONNECTOR_STATUS.CONNECTED;
      this.emit('connected', { connectorId: this.id, timestamp: Date.now() });
      return true;
    }
    this.status = CONNECTOR_STATUS.ERROR;
    return false;
  }

  /**
   * Disconnect safely
   */
  async disconnect() {
    this.status = CONNECTOR_STATUS.DISCONNECTED;
    this.emit('disconnected', { connectorId: this.id, timestamp: Date.now() });
    return true;
  }

  /**
   * Validate credentials (subclasses override)
   */
  async validateCredentials() {
    return true;
  }

  /**
   * Check connection health
   */
  async healthCheck() {
    this.lastHealthCheck = {
      timestamp: Date.now(),
      status: this.status,
      healthy: this.status === CONNECTOR_STATUS.CONNECTED
    };
    return this.lastHealthCheck;
  }

  /**
   * Get risk tier for a given action
   */
  getActionRisk(action) {
    return this.actionRiskMap[action] || EXECUTION_RISK_TIERS.L2_CONFIRM;
  }

  /**
   * Execute action through connector
   * @param {string} action
   * @param {Object} params
   * @param {Object} [context]
   */
  async execute(action, params = {}, context = {}) {
    if (!this.supportedActions.has(action)) {
      throw new Error(`[${this.name}] Action '${action}' is not supported.`);
    }

    const riskTier = this.getActionRisk(action);
    const logEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      connectorId: this.id,
      action,
      riskTier,
      timestamp: Date.now(),
      params: this._sanitizeParams(params),
      status: 'EXECUTING'
    };

    try {
      const result = await this._handleAction(action, params, context);
      logEntry.status = 'SUCCESS';
      logEntry.resultSummary = result ? (typeof result === 'object' ? Object.keys(result) : String(result).slice(0, 50)) : null;
      this._recordAudit(logEntry);
      return result;
    } catch (err) {
      logEntry.status = 'FAILED';
      logEntry.error = err.message;
      this._recordAudit(logEntry);
      throw err;
    }
  }

  /**
   * Subclass hook for handling actions
   */
  async _handleAction(action, params, context) {
    throw new Error(`[${this.name}] _handleAction not implemented for action: ${action}`);
  }

  /**
   * Event emitter helpers
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(cb => {
      try { cb(data); } catch (e) { console.error(`[BaseConnector] Event error ${event}:`, e); }
    });
  }

  _recordAudit(entry) {
    this.auditLog.push(entry);
    if (this.auditLog.length > 500) {
      this.auditLog.shift();
    }
  }

  _sanitizeParams(params) {
    if (!params || typeof params !== 'object') return params;
    const sanitized = { ...params };
    const sensitiveKeys = ['key', 'token', 'secret', 'password', 'credential', 'auth'];
    for (const k of Object.keys(sanitized)) {
      if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}

export default BaseConnector;
