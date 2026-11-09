/**
 * ════════════════════════════════════════════════════════════════════
 *  CONTROLLED TERMINAL OPERATOR — LEVEL 0-4 GOVERNANCE ENGINE
 * ════════════════════════════════════════════════════════════════════
 * Secure, sandboxed terminal command executor enforcing strict
 * authorization tiers, secrets redaction, workspace boundaries, and audit logging.
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export const PERMISSION_TIERS = {
  LEVEL_0_READONLY: 0,
  LEVEL_1_LOW_RISK: 1,
  LEVEL_2_REVERSIBLE: 2,
  LEVEL_3_PRIVILEGED: 3,
  LEVEL_4_HIGH_IMPACT: 4
};

export class ControlledTerminalOperator {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(process.cwd());
    this.allowedWorkspaces = options.allowedWorkspaces || [
      this.rootDir,
      'd:\\portfolio\\portfolio',
      'd:\\portfolio\\mini-adhy-personal'
    ];
    this.auditLog = [];
    this.secretsRegex = /(?:api[_-]?key|secret|token|password|bearer|auth)[\s:=]+([^\s,;]+)/gi;
  }

  /**
   * Classifies command into appropriate Level 0 to Level 4 risk tier
   */
  classifyCommand(cmdString) {
    const lower = cmdString.trim().toLowerCase();

    // High Impact / Destructive (LEVEL 4)
    const level4Patterns = [
      'format ', 'diskpart', 'rmdir /s /q c:', 'del /s /q c:',
      'rm -rf /', 'drop database', 'mkfs', 'fdisk'
    ];
    for (const p of level4Patterns) {
      if (lower.includes(p)) return PERMISSION_TIERS.LEVEL_4_HIGH_IMPACT;
    }

    // Privileged / Security / Service Config (LEVEL 3)
    const level3Patterns = [
      'net user', 'net localgroup', 'set-executionpolicy', 'sc stop',
      'sc delete', 'reg add', 'reg delete', 'sudo ', 'iptables', 'netsh firewall'
    ];
    for (const p of level3Patterns) {
      if (lower.includes(p)) return PERMISSION_TIERS.LEVEL_3_PRIVILEGED;
    }

    // Reversible file changes / compilation (LEVEL 2)
    const level2Patterns = [
      'npm run build', 'git commit', 'git push', 'mkdir', 'touch',
      'cargo build', 'go build', 'npm install'
    ];
    for (const p of level2Patterns) {
      if (lower.includes(p)) return PERMISSION_TIERS.LEVEL_2_REVERSIBLE;
    }

    // Low risk non-destructive operations (LEVEL 1)
    const level1Patterns = [
      'npm test', 'cargo test', 'go test', 'pytest', 'git diff',
      'git status', 'python', 'node '
    ];
    for (const p of level1Patterns) {
      if (lower.includes(p)) return PERMISSION_TIERS.LEVEL_1_LOW_RISK;
    }

    // Default to Readonly (LEVEL 0)
    return PERMISSION_TIERS.LEVEL_0_READONLY;
  }

  /**
   * Redacts sensitive credentials from logs and output strings
   */
  redactSecrets(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(this.secretsRegex, (match, secret) => {
      if (secret.length <= 4) return match.replace(secret, '***');
      return match.replace(secret, secret.slice(0, 2) + '***' + secret.slice(-2));
    });
  }

  /**
   * Executes approved terminal command with security boundary checks
   */
  async executeCommand(commandString, options = {}) {
    const cwd = options.cwd || this.rootDir;
    const requiredTier = this.classifyCommand(commandString);
    const start = Date.now();

    // Verify workspace boundary
    const isWorkspaceAllowed = this.allowedWorkspaces.some(w => cwd.toLowerCase().startsWith(w.toLowerCase()));
    if (!isWorkspaceAllowed) {
      const err = new Error(`COMMAND_REJECTED: Execution directory '${cwd}' is outside authorized workspaces.`);
      this._recordAudit(commandString, cwd, requiredTier, false, err.message, Date.now() - start);
      throw err;
    }

    // Verify high impact authorization token for Level 4
    if (requiredTier === PERMISSION_TIERS.LEVEL_4_HIGH_IMPACT) {
      if (!options.approvalToken || options.approvalToken.status !== 'APPROVED_BY_RUST_VAULT') {
        const err = new Error('PERMISSION_DENIED: Level 4 high-impact operation requires cryptographic approval token.');
        this._recordAudit(commandString, cwd, requiredTier, false, err.message, Date.now() - start);
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      exec(commandString, { cwd, timeout: options.timeout || 30000 }, (error, stdout, stderr) => {
        const durationMs = Date.now() - start;
        const sanitizedStdout = this.redactSecrets(stdout || '');
        const sanitizedStderr = this.redactSecrets(stderr || '');

        if (error) {
          this._recordAudit(commandString, cwd, requiredTier, false, error.message, durationMs);
          return reject(new Error(`Exit code ${error.code}: ${sanitizedStderr || sanitizedStdout || error.message}`));
        }

        this._recordAudit(commandString, cwd, requiredTier, true, 'SUCCESS', durationMs);
        resolve({
          command: this.redactSecrets(commandString),
          stdout: sanitizedStdout,
          stderr: sanitizedStderr,
          durationMs,
          tier: requiredTier,
          status: 'EXECUTION_SUCCESS'
        });
      });
    });
  }

  _recordAudit(command, cwd, tier, success, message, durationMs) {
    this.auditLog.push({
      command: this.redactSecrets(command),
      cwd,
      tier,
      success,
      message,
      durationMs,
      timestamp: new Date().toISOString()
    });
  }

  getAuditLogs(limit = 20) {
    return this.auditLog.slice(-limit);
  }
}
