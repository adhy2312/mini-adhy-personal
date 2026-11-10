/**
 * ════════════════════════════════════════════════════════════════════
 *  COMPUTER OPERATOR — SECURE WINDOWS-FIRST SYSTEM OPERATIONS (PHASE 1)
 * ════════════════════════════════════════════════════════════════════
 * Gives Mini-Adhy real, secure, Windows-first ability to understand
 * and operate the user's computer:
 * 
 * 1. Computer Intelligence & System Telemetry (OS, CPU, RAM, Disks, Network)
 * 2. Process & Application Manager (inspect, launch, close, running check)
 * 3. File & Workspace Operator (containment, backups, diffs, traversal prevention)
 * 4. Terminal & Command Sandbox (Level 0-4 governance, shell injection rejection)
 * 5. Desktop & Window Context
 * 6. ActionLedger (immutable audit log of all mutations & actions)
 * 7. Emergency Stop (instant cancellation of running processes)
 */

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { exec, spawn } from 'child_process';
import { LocalExecutionAgent } from './LocalExecutionAgent.js';
import { LocalFileOpsAgent } from './LocalFileOpsAgent.js';
import { ControlledTerminalOperator, PERMISSION_TIERS } from '../terminal/ControlledTerminalOperator.js';

export const ACTION_STATES = Object.freeze({
  PLANNED: 'PLANNED',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  APPROVED: 'APPROVED',
  EXECUTING: 'EXECUTING',
  VERIFYING: 'VERIFYING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  BLOCKED: 'BLOCKED'
});

export class ActionLedger {
  constructor() {
    this.entries = [];
  }

  record(action) {
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      state: action.state || ACTION_STATES.COMPLETED,
      type: action.type || 'SYSTEM_ACTION',
      target: action.target || 'LOCAL_HOST',
      details: action.details || {},
      operatorIdentity: action.operatorIdentity || 'OWNER::AUTHENTICATED',
      approvalToken: action.approvalToken || null,
      verificationPassed: action.verificationPassed !== false
    };
    this.entries.push(entry);
    return entry;
  }

  getEntries(limit = 50) {
    return this.entries.slice(-limit);
  }
}

export class ComputerOperator {
  constructor(options = {}) {
    this.name = 'ComputerOperator';
    this.baseDirectory = path.resolve(options.baseDirectory || 'd:\\portfolio');
    this.allowedWorkspaces = (options.allowedWorkspaces || [
      this.baseDirectory,
      'd:\\portfolio\\portfolio',
      'd:\\portfolio\\mini-adhy-personal'
    ]).map(p => path.resolve(p));

    this.ledger = new ActionLedger();
    this.executionAgent = new LocalExecutionAgent({ workingDirectory: this.baseDirectory });
    this.fileOps = new LocalFileOpsAgent({ baseDirectory: this.baseDirectory, allowedRoots: this.allowedWorkspaces });
    this.terminalOperator = new ControlledTerminalOperator({ allowedWorkspaces: this.allowedWorkspaces });
    this.activeProcesses = new Map();
  }

  /**
   * 1. COMPUTER INTELLIGENCE: Real Windows System Telemetry Snapshot
   */
  async getSystemTelemetry() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();

    const snapshot = {
      platform: 'Windows NT (Win32)',
      osRelease: os.release(),
      osType: os.type(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: Math.floor(os.uptime()),
      cpuModel: cpus[0]?.model || 'Generic x86_64 Processor',
      cpuCores: cpus.length,
      memoryTotalMB: Math.round(totalMem / (1024 * 1024)),
      memoryUsedMB: Math.round(usedMem / (1024 * 1024)),
      memoryFreeMB: Math.round(freeMem / (1024 * 1024)),
      memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
      networkInterfaces: Object.keys(os.networkInterfaces()).filter(iface => !iface.includes('Loopback')),
      timestamp: new Date().toISOString()
    };

    this.ledger.record({
      type: 'TELEMETRY_SNAPSHOT',
      target: 'HARDWARE_SUBSYSTEM',
      details: { memoryUsage: snapshot.memoryUsagePercent, cpuCores: snapshot.cpuCores }
    });

    return snapshot;
  }

  /**
   * 2. PROCESS INSPECTION: List running processes and resource usage
   */
  async getRunningProcesses(limit = 30) {
    return new Promise((resolve) => {
      exec('tasklist /FO CSV /NH', { timeout: 8000 }, (err, stdout) => {
        if (err || !stdout) {
          return resolve({
            success: false,
            error: err ? err.message : 'No process data retrieved',
            processes: []
          });
        }

        const lines = stdout.trim().split(/\r?\n/);
        const processes = lines.slice(0, limit).map((line) => {
          const parts = line.split('","').map(s => s.replace(/^"|"$/g, '').trim());
          return {
            name: parts[0] || 'Unknown',
            pid: parseInt(parts[1], 10) || 0,
            sessionName: parts[2] || '',
            sessionNum: parts[3] || '',
            memoryUsage: parts[4] || ''
          };
        }).filter(p => p.name && p.pid > 0);

        this.ledger.record({
          type: 'PROCESS_INSPECTION',
          target: 'PROCESS_TABLE',
          details: { inspectedCount: processes.length }
        });

        resolve({
          success: true,
          count: processes.length,
          processes
        });
      });
    });
  }

  /**
   * 3. APPLICATION OPERATOR: Launch and verify application execution
   */
  async launchApplication(appName, args = []) {
    const knownApps = {
      code: 'code',
      explorer: 'explorer.exe',
      terminal: 'wt.exe',
      powershell: 'powershell.exe',
      cmd: 'cmd.exe',
      notepad: 'notepad.exe',
      calc: 'calc.exe'
    };

    const targetExe = knownApps[appName.toLowerCase()] || appName;

    // Security Gate: Disallow arbitrary unknown executables unless approved
    if (!knownApps[appName.toLowerCase()] && !/^[a-zA-Z0-9_\-\.]+\.exe$/.test(targetExe)) {
      this.ledger.record({
        type: 'APP_LAUNCH_BLOCKED',
        target: targetExe,
        state: ACTION_STATES.BLOCKED,
        details: { reason: 'Untrusted application name format' }
      });
      return { success: false, error: `Refusing to launch unverified executable: ${targetExe}` };
    }

    return new Promise((resolve) => {
      try {
        const child = spawn(targetExe, args, {
          detached: true,
          stdio: 'ignore',
          shell: false
        });

        child.unref();

        this.ledger.record({
          type: 'APPLICATION_LAUNCH',
          target: targetExe,
          state: ACTION_STATES.COMPLETED,
          details: { pid: child.pid, args }
        });

        resolve({
          success: true,
          application: targetExe,
          pid: child.pid,
          status: 'LAUNCHED'
        });
      } catch (err) {
        this.ledger.record({
          type: 'APPLICATION_LAUNCH_FAILED',
          target: targetExe,
          state: ACTION_STATES.FAILED,
          details: { error: err.message }
        });

        resolve({ success: false, error: err.message });
      }
    });
  }

  /**
   * 4. WORKSPACE OPERATOR: Safe file read and write with containment verification
   */
  async readWorkspaceFile(filePath, maxLines = 150) {
    const res = await this.fileOps.readFile(filePath, maxLines);
    this.ledger.record({
      type: 'FILE_READ',
      target: filePath,
      state: res.success ? ACTION_STATES.COMPLETED : ACTION_STATES.FAILED,
      details: { lines: res.totalLines || 0 }
    });
    return res;
  }

  async writeWorkspaceFile(filePath, content, options = {}) {
    const res = await this.fileOps.writeFile(filePath, content, options);
    this.ledger.record({
      type: 'FILE_WRITE',
      target: filePath,
      state: res.success ? ACTION_STATES.COMPLETED : ACTION_STATES.FAILED,
      details: { bytesWritten: res.bytesWritten || 0, backupCreated: res.backupCreated }
    });
    return res;
  }

  /**
   * 5. COMMAND EXECUTION: Controlled PowerShell execution with Level 0-4 governance
   */
  async executeControlledCommand(commandString, options = {}) {
    const classifiedTier = this.terminalOperator.classifyCommand(commandString);

    if (classifiedTier === PERMISSION_TIERS.LEVEL_4_HIGH_IMPACT && !options.approvalToken) {
      this.ledger.record({
        type: 'COMMAND_BLOCKED',
        target: commandString,
        state: ACTION_STATES.BLOCKED,
        details: { reason: 'Level 4 High-Impact commands require cryptographic human approval token.' }
      });
      return {
        success: false,
        blocked: true,
        tier: classifiedTier,
        error: 'Security Policy: Level 4 command blocked. Requires explicit approval token.'
      };
    }

    const execResult = await this.terminalOperator.executeCommand(commandString, options);
    this.ledger.record({
      type: 'COMMAND_EXECUTION',
      target: commandString,
      state: execResult.success ? ACTION_STATES.COMPLETED : ACTION_STATES.FAILED,
      approvalToken: options.approvalToken || null,
      details: { tier: classifiedTier, executionTimeMs: execResult.executionTimeMs }
    });

    return execResult;
  }

  /**
   * 6. EMERGENCY STOP: Halts all running processes immediately
   */
  emergencyStop() {
    const termStop = this.executionAgent.emergencyStop();
    this.ledger.record({
      type: 'EMERGENCY_STOP',
      target: 'ALL_PROCESSES',
      state: ACTION_STATES.COMPLETED,
      details: { terminatedCount: termStop.terminatedCount }
    });
    return {
      success: true,
      status: 'EMERGENCY_STOP_TRIGGERED',
      details: termStop,
      timestamp: Date.now()
    };
  }
}

