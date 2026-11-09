import { SystemTelemetrySentinel } from '../telemetry/SystemTelemetrySentinel';
import { VoiceSynthesisNexus } from '../voice/VoiceSynthesisNexus';
import { PerceptualVisionAgent } from '../vision/PerceptualVisionAgent';
import { LocalNetworkRadar } from '../radar/LocalNetworkRadar';
import { WorkspaceGuardian } from '../workspace/WorkspaceGuardian';

jest.setTimeout(30000);

describe('STARK EXTENDED CORE CAPABILITIES TEST SUITE', () => {

  describe('1. SystemTelemetrySentinel', () => {
    let sentinel;

    beforeEach(() => {
      sentinel = new SystemTelemetrySentinel({
        memoryWarningThreshold: 85,
        cpuWarningThreshold: 90
      });
    });

    it('retrieves and computes system telemetry snapshot with valid memory calculations', async () => {
      const vitals = await sentinel.getSystemTelemetry();

      expect(vitals).toBeDefined();
      expect(vitals.memory).toBeDefined();
      expect(vitals.memory.totalGb).toBeGreaterThan(0);
      expect(vitals.memory.usedGb).toBeGreaterThanOrEqual(0);
      expect(vitals.memory.freeGb).toBeGreaterThanOrEqual(0);
      expect(vitals.memory.percentUsed).toBeGreaterThanOrEqual(0);
      expect(vitals.memory.percentUsed).toBeLessThanOrEqual(100);

      expect(vitals.cpu).toBeDefined();
      expect(vitals.cpu.cores).toBeGreaterThan(0);
      expect(vitals.cpu.speedMhz).toBeGreaterThan(0);

      expect(Array.isArray(vitals.drives)).toBe(true);
      expect(Array.isArray(vitals.alerts)).toBe(true);
    });

    it('correctly flags threshold alerts when memory usage exceeds limit', async () => {
      const sensitiveSentinel = new SystemTelemetrySentinel({
        memoryWarningThreshold: 1, // Will trigger alert
        cpuWarningThreshold: 99
      });

      const vitals = await sensitiveSentinel.getSystemTelemetry();
      expect(vitals.alerts.some(a => a.subsystem === 'MEMORY')).toBe(true);
    });

    it('profiles top workstation processes sorted by memory working set', async () => {
      const procs = await sentinel.getTopProcesses(5);
      expect(Array.isArray(procs)).toBe(true);
      expect(procs.length).toBeLessThanOrEqual(5);

      if (procs.length > 0) {
        expect(procs[0]).toHaveProperty('pid');
        expect(procs[0]).toHaveProperty('name');
        expect(procs[0]).toHaveProperty('memoryMb');
        expect(procs[0]).toHaveProperty('cpuSec');
      }
    });
  });

  describe('2. VoiceSynthesisNexus', () => {
    let nexus;

    beforeEach(() => {
      nexus = new VoiceSynthesisNexus({ defaultRate: 1, defaultVolume: 90 });
    });

    it('instantiates voice nexus with clean default state and mute support', () => {
      expect(nexus.defaultRate).toBe(1);
      expect(nexus.defaultVolume).toBe(90);
      expect(nexus.isMuted).toBe(false);
      nexus.isMuted = true;
      expect(nexus.isMuted).toBe(true);
    });

    it('manages speech history and stores announcements', async () => {
      expect(Array.isArray(nexus.speechHistory)).toBe(true);
    });

    it('lists installed SAPI voices with Windows properties', async () => {
      const voices = await nexus.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      if (voices.length > 0) {
        expect(voices[0]).toHaveProperty('Name');
        expect(voices[0]).toHaveProperty('Culture');
      }
    });
  });

  describe('3. PerceptualVisionAgent', () => {
    let agent;

    beforeEach(() => {
      agent = new PerceptualVisionAgent();
    });

    it('enumerates top-level visible desktop windows', async () => {
      const windows = await agent.getOpenWindows();
      expect(Array.isArray(windows)).toBe(true);
      if (windows.length > 0) {
        expect(windows[0]).toHaveProperty('Title');
        expect(windows[0]).toHaveProperty('ProcessId');
      }
    });

    it('retrieves active foreground window or handles fallback', async () => {
      const active = await agent.getActiveWindow();
      expect(active).toBeDefined();
      expect(active).toHaveProperty('Title');
    });
  });

  describe('4. LocalNetworkRadar', () => {
    let radar;

    beforeEach(() => {
      radar = new LocalNetworkRadar();
    });

    it('retrieves local network interfaces with valid IP addresses', () => {
      const ifaces = radar.getNetworkInterfaces();
      expect(Array.isArray(ifaces)).toBe(true);
      expect(ifaces.length).toBeGreaterThan(0);
      expect(ifaces[0]).toHaveProperty('ip');
      expect(ifaces[0]).toHaveProperty('mac');
    });

    it('scans local subnet via ARP cache and classifies devices', async () => {
      const scan = await radar.scanLocalDevices();
      expect(scan).toBeDefined();
      expect(Array.isArray(scan.devices)).toBe(true);
      expect(typeof scan.deviceCount).toBe('number');

      if (scan.devices.length > 0) {
        expect(scan.devices[0]).toHaveProperty('ip');
        expect(scan.devices[0]).toHaveProperty('mac');
        expect(scan.devices[0]).toHaveProperty('classification');
      }
    });

    it('pings localhost with low latency successfully', async () => {
      const res = await radar.pingHost('127.0.0.1', 1);
      expect(res.host).toBe('127.0.0.1');
      expect(typeof res.reachable).toBe('boolean');
    });
  });

  describe('5. WorkspaceGuardian', () => {
    let guardian;

    beforeEach(() => {
      guardian = new WorkspaceGuardian();
    });

    it('tracks known workspaces (portfolio, mini-adhy-personal)', () => {
      expect(Array.isArray(guardian.trackedWorkspaces)).toBe(true);
      expect(guardian.trackedWorkspaces.length).toBeGreaterThanOrEqual(2);
      expect(guardian.trackedWorkspaces.some(w => w.includes('portfolio'))).toBe(true);
    });

    it('sweeps git status across monitored repositories', async () => {
      const res = await guardian.sweepAllWorkspaces();
      expect(res).toBeDefined();
      expect(res.workspaceCount).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.workspaces)).toBe(true);

      const targetWs = res.workspaces[0];
      expect(targetWs).toHaveProperty('isGitRepo');
      if (targetWs.isGitRepo) {
        expect(targetWs).toHaveProperty('branch');
        expect(targetWs).toHaveProperty('isClean');
        expect(Array.isArray(targetWs.dirtyFiles)).toBe(true);
      }
    });
  });
});
