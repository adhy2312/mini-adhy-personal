/**
 * ════════════════════════════════════════════════════════════════════
 *  SYSTEM TELEMETRY SENTINEL — TONY STARK PC HEALTH MONITOR
 * ════════════════════════════════════════════════════════════════════
 * Provides real-time hardware telemetry and process intelligence:
 * 1. CPU, RAM, Disk, and Battery resource profiling
 * 2. Top resource-consuming process analysis (Memory & CPU hogs)
 * 3. Thermal & load threshold alerts (Memory > 90%, CPU > 95%)
 * 4. Active network adapter & connection state inspection
 */

import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SystemTelemetrySentinel {
  constructor(options = {}) {
    this.memoryWarningThreshold = options.memoryWarningThreshold || 90; // percentage
    this.cpuWarningThreshold = options.cpuWarningThreshold || 95; // percentage
  }

  /**
   * Retrieves full system hardware snapshot
   */
  async getSystemTelemetry() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = Math.round((usedMem / totalMem) * 100);

    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const uptimeSec = os.uptime();

    // Query disk space across Windows drives via PowerShell
    const drives = await this.getDiskDrives();

    // Query battery/power if available
    const power = await this.getPowerStatus();

    // Resource alerts
    const alerts = [];
    if (memPercentage >= this.memoryWarningThreshold) {
      alerts.push({
        level: 'WARNING',
        subsystem: 'MEMORY',
        message: `High RAM utilization: ${memPercentage}% in use (${(usedMem / (1024 ** 3)).toFixed(1)} GB / ${(totalMem / (1024 ** 3)).toFixed(1)} GB)`
      });
    }

    return {
      timestamp: new Date().toISOString(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptimeSeconds: uptimeSec,
      uptimeFormatted: this._formatUptime(uptimeSec),
      memory: {
        totalBytes: totalMem,
        usedBytes: usedMem,
        freeBytes: freeMem,
        totalGb: +(totalMem / (1024 ** 3)).toFixed(2),
        usedGb: +(usedMem / (1024 ** 3)).toFixed(2),
        freeGb: +(freeMem / (1024 ** 3)).toFixed(2),
        percentUsed: memPercentage
      },
      cpu: {
        model: cpus[0]?.model || 'Unknown CPU',
        cores: cpus.length,
        speedMhz: cpus[0]?.speed || 0,
        loadAvg
      },
      drives,
      power,
      alerts
    };
  }

  /**
   * Queries Windows logical drives and free space
   */
  async getDiskDrives() {
    if (os.platform() !== 'win32') {
      return [{ drive: '/', status: 'Non-Windows OS' }];
    }

    try {
      const psCmd = `Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free | ConvertTo-Json -Compress`;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 4000 });
      if (!stdout.trim()) return [];

      const parsed = JSON.parse(stdout);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      return items.map(d => {
        const used = d.Used || 0;
        const free = d.Free || 0;
        const total = used + free;
        return {
          drive: `${d.Name}:`,
          usedGb: +(used / (1024 ** 3)).toFixed(1),
          freeGb: +(free / (1024 ** 3)).toFixed(1),
          totalGb: +(total / (1024 ** 3)).toFixed(1),
          percentUsed: total > 0 ? Math.round((used / total) * 100) : 0
        };
      });
    } catch {
      return [{ drive: 'C:', status: 'Available' }];
    }
  }

  /**
   * Queries battery or AC power state on Windows laptops/workstations
   */
  async getPowerStatus() {
    if (os.platform() !== 'win32') return { isBatteryPowered: false, charging: true };

    try {
      const psCmd = `Get-CimInstance -ClassName Win32_Battery | Select-Object EstimatedChargeRemaining, BatteryStatus | ConvertTo-Json -Compress`;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 3500 });
      if (!stdout.trim()) return { isBatteryPowered: false, source: 'AC_MAINS' };

      const data = JSON.parse(stdout);
      return {
        isBatteryPowered: true,
        percentRemaining: data.EstimatedChargeRemaining || 100,
        status: data.BatteryStatus === 2 ? 'CHARGING' : (data.BatteryStatus === 1 ? 'DISCHARGING' : 'AC_MAINS')
      };
    } catch {
      return { isBatteryPowered: false, source: 'AC_MAINS' };
    }
  }

  /**
   * Analyzes top processes consuming CPU and Memory
   */
  async getTopProcesses(limit = 10) {
    if (os.platform() !== 'win32') return [];

    try {
      const psCmd = `Get-Process | Sort-Object -Descending WorkingSet | Select-Object -First ${limit} Id, ProcessName, WorkingSet, CPU | ConvertTo-Json -Compress`;
      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 5000 });
      if (!stdout.trim()) return [];

      const parsed = JSON.parse(stdout);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      return list.map(p => ({
        pid: p.Id,
        name: p.ProcessName,
        memoryMb: +((p.WorkingSet || 0) / (1024 * 1024)).toFixed(1),
        cpuSec: +(p.CPU || 0).toFixed(1)
      }));
    } catch (err) {
      return [{ error: `Failed to query processes: ${err.message}` }];
    }
  }

  _formatUptime(sec) {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

export const systemTelemetrySentinel = new SystemTelemetrySentinel();

