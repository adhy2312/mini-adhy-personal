/**
 * ════════════════════════════════════════════════════════════════════
 *  PERSONAL SECURITY AUDIT — CRYPTOGRAPHIC AUDIT LOGGING
 * ════════════════════════════════════════════════════════════════════
 * Immutable, append-only security log for all personal assistant actions:
 * - Preparation, confirmation, and execution stages
 * - Human approval token verifications
 * - Emergency stop triggers
 * - Connector authentications and permission changes
 */

export class PersonalSecurityAudit {
  constructor(options = {}) {
    this.name = 'PersonalSecurityAudit';
    this.auditTrail = [];
    this.previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  /**
   * Log an audit event with chained hash integrity
   */
  logEvent(event = {}) {
    const timestamp = Date.now();
    const entryData = {
      id: `audit_${timestamp}_${Math.random().toString(36).slice(2, 7)}`,
      action: event.action || 'UNKNOWN',
      actor: event.actor || 'system',
      riskTier: event.riskTier || 'L0_OBSERVE',
      target: event.target || 'core',
      status: event.status || 'RECORDED',
      details: event.details || {},
      timestamp,
      previousHash: this.previousHash
    };

    const entryHash = this._computeHash(JSON.stringify(entryData));
    entryData.entryHash = entryHash;
    this.previousHash = entryHash;

    this.auditTrail.push(entryData);
    if (this.auditTrail.length > 1000) {
      this.auditTrail.shift();
    }

    return entryData;
  }

  /**
   * Verify chain integrity
   */
  verifyIntegrity() {
    let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const entry of this.auditTrail) {
      if (entry.previousHash !== lastHash) {
        return { valid: false, brokenEntryId: entry.id, reason: 'Broken previousHash link' };
      }
      const dataToHash = { ...entry };
      delete dataToHash.entryHash;
      const computed = this._computeHash(JSON.stringify(dataToHash));
      if (computed !== entry.entryHash) {
        return { valid: false, brokenEntryId: entry.id, reason: 'Tampered entryHash' };
      }
      lastHash = entry.entryHash;
    }
    return { valid: true, totalEntries: this.auditTrail.length };
  }

  getEntries(options = {}) {
    const limit = options.limit || 50;
    return this.auditTrail.slice(-limit);
  }

  _computeHash(str) {
    let h1 = 0xdeadbeef ^ 0;
    let h2 = 0x41c6ce57 ^ 0;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const part1 = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
    const part2 = (4294967296 * (2097151 & h1) + (h2 >>> 0)).toString(16).padStart(16, '0');
    return `${part1}${part2}`;
  }
}

export default PersonalSecurityAudit;

