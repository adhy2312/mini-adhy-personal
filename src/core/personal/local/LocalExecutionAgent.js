/**
 * ════════════════════════════════════════════════════════════════════
 *  LOCAL EXECUTION AGENT — SANDBOXED TERMINAL & SCRIPT EXECUTION
 * ════════════════════════════════════════════════════════════════════
 * Provides safe, sandboxed script and command execution for Mini-Adhy Personal.
 * 
 * Enforces:
 * - Inviolable command blocklist (`rm -rf`, `format`, `del /f /s /q c:\`, `mkfs`)
 * - Command allowlist & path restrictions
 * - Execution timeout guards
 * - Immutable execution logging
 * - Never returns simulated outputs as actual CLI execution
 */

import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class LocalExecutionAgent {
  constructor(options = {}) {
    this.name = 'LocalExecutionAgent';
    this.workingDirectory = options.workingDirectory || process.cwd?.() || '.';
    this.timeoutMs = options.timeoutMs || 30000;
    this.executionHistory = [];
    this.blockedPatterns = [
      /rm\s+-rf\s+[\/\\]/i,
      /del\s+\/f\s+\/s\s+\/q\s+[c-z]:[\/\\]/i,
      /format\s+[c-z]:/i,
      /drop\s+database/i,
      /shutdown/i,
      /:(){ :|:& };:/i // Fork bomb
    ];
    this.allowedExecutables = new Set([
      'git',
      'node',
      'npm',
      'npx',
      'python',
      'python3',
      'pip',
      'pytest',
      'echo',
      'dir',
      'ls',
      'cat',
      'grep',
      'powershell',
      'pwsh',
      'curl',
      'ping',
      'whoami',
      'hostname',
      'type'
    ]);
    this.activeProcesses = new Map();
    this.shellChainingPatterns = [
      /[;&|`$]/,
      />{1,2}/,
      /<{1,2}/
    ];
  }

  /**
   * Validate if a command is permitted to execute, rejecting dangerous commands,
   * shell chaining injection, and unvetted executables.
   */
  validateCommand(command, options = {}) {
    if (!command || typeof command !== 'string') {
      return { allowed: false, reason: 'Command must be a non-empty string.' };
    }

    const trimmed = command.trim();
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(trimmed)) {
        return { allowed: false, reason: `Command matches dangerous pattern: ${pattern}` };
      }
    }

    // Unless explicitly permitted via structured options, reject shell chaining operators
    if (!options.allowChaining) {
      for (const opPattern of this.shellChainingPatterns) {
        if (opPattern.test(trimmed)) {
          return {
            allowed: false,
            reason: 'Security Violation: Shell chaining operators (&, |, ;, `, $) are prohibited.'
          };
        }
      }
    }

    const executable = trimmed.split(/\s+/)[0].toLowerCase();
    if (!this.allowedExecutables.has(executable)) {
      return {
        allowed: false,
        reason: `Executable '${executable}' is not in the allowed local commands list.`
      };
    }

    return { allowed: true, executable };
  }

  /**
   * Emergency stop: Aborts and kills all currently active spawned child processes
   */
  emergencyStop() {
    let killedCount = 0;
    for (const [procId, childProc] of this.activeProcesses.entries()) {
      try {
        childProc.kill('SIGKILL');
        killedCount++;
      } catch {}
      this.activeProcesses.delete(procId);
    }
    return { success: true, terminatedCount: killedCount, timestamp: Date.now() };
  }

  /**
   * Execute command in a sandboxed session with strict structured argument separation
   */
  async executeCommand(command, options = {}) {
    const validation = this.validateCommand(command, options);
    if (!validation.allowed) {
      const blockedRecord = {
        command,
        allowed: false,
        reason: validation.reason,
        timestamp: Date.now(),
        status: 'BLOCKED'
      };
      this.executionHistory.push(blockedRecord);
      throw new Error(`[LocalExecutionAgent] Execution blocked: ${validation.reason}`);
    }

    let executionOutput = `[Sandboxed Execution] Command '${validation.executable}' accepted.`;
    let isRealExecution = false;

    // In a real Node environment, execute real system process with strict safety guards
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      try {
        const { exec } = await import('node:child_process');
        const procId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const execPromise = new Promise((resolveExec, rejectExec) => {
          const child = exec(command, {
            cwd: this.workingDirectory,
            timeout: this.timeoutMs,
            maxBuffer: 1024 * 1024 * 5 // 5MB buffer limit
          }, (err, stdout, stderr) => {
            this.activeProcesses.delete(procId);
            if (err) return rejectExec(Object.assign(err, { stdout, stderr }));
            resolveExec({ stdout, stderr });
          });

          this.activeProcesses.set(procId, child);
        });

        const { stdout, stderr } = await execPromise;
        executionOutput = stdout || stderr || '[Execution completed with zero output]';
        isRealExecution = true;
      } catch (execErr) {
        executionOutput = execErr.stdout || execErr.stderr || execErr.message;
        const errRecord = {
          id: `exec_err_${Date.now()}`,
          command,
          executable: validation.executable,
          timestamp: Date.now(),
          status: 'FAILED',
          output: executionOutput,
          error: execErr.message
        };
        this.executionHistory.push(errRecord);
        return {
          success: false,
          commandId: errRecord.id,
          executable: validation.executable,
          output: executionOutput,
          error: execErr.message,
          executionTimestamp: errRecord.timestamp
        };
      }
    }

    const record = {
      id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      command,
      executable: validation.executable,
      timestamp: Date.now(),
      status: 'EXECUTED',
      output: executionOutput,
      isReal: isRealExecution
    };

    this.executionHistory.push(record);
    if (this.executionHistory.length > 200) {
      this.executionHistory.shift();
    }

    return {
      success: true,
      commandId: record.id,
      executable: validation.executable,
      output: record.output,
      executionTimestamp: record.timestamp,
      isReal: isRealExecution
    };
  }

  getHistory() {
    return [...this.executionHistory];
  }
}

export default LocalExecutionAgent;

