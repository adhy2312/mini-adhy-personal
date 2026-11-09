/**
 * ════════════════════════════════════════════════════════════════════
 *  MINI-ADHY PERSONAL AI — EXTENSION ARCHITECTURE TEST SUITE
 * ════════════════════════════════════════════════════════════════════
 * Comprehensive test verification for all Phase 5, 6, and 7 modules:
 * - Personal Identity Configuration
 * - Integration Registry & Base Connector
 * - Personal Connectors (Gmail, GitHub, Calendar, Drive, Browser, Desktop)
 * - Local Execution Agent & Sandboxed Terminal
 * - Hardware Device Gateways (Physical, MQTT, Serial, ESP32, Raspberry Pi)
 * - Proactive Scheduler & Personal Dashboard
 * - Cryptographic Security Audit & Personal Executive Agent
 */

import {
  PersonalIdentityConfig,
  PERSONAL_ASSISTANCE_DOMAINS,
  BaseConnector,
  CONNECTOR_STATUS,
  IntegrationRegistry,
  GmailConnector,
  GitHubConnector,
  GoogleCalendarConnector,
  GoogleDriveConnector,
  BrowserAutomationConnector,
  DesktopControlConnector,
  LocalExecutionAgent,
  HardwareDeviceGateway,
  MqttGateway,
  SerialGateway,
  Esp32Gateway,
  RaspberryPiGateway,
  ProactiveScheduler,
  PersonalDashboardService,
  PersonalSecurityAudit,
  PersonalExecutiveAgent
} from '../index';
import { PermissionRegistry, EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

// Mock Sanity client to avoid ESM import errors
jest.mock('../../../sanity', () => ({
  client: { fetch: jest.fn().mockResolvedValue([]) },
  urlFor: jest.fn().mockReturnValue({ url: () => '' })
}));

describe('Mini-Adhy Personal AI — Extension Architecture', () => {
  let permissionRegistry;

  beforeEach(() => {
    permissionRegistry = new PermissionRegistry();
  });

  describe('1. Personal Identity Configuration', () => {
    test('initializes identity with 5 primary assistance domains', () => {
      const config = new PersonalIdentityConfig();
      expect(config.isDomainSupported(PERSONAL_ASSISTANCE_DOMAINS.PERSONAL)).toBe(true);
      expect(config.isDomainSupported(PERSONAL_ASSISTANCE_DOMAINS.ACADEMIC)).toBe(true);
      expect(config.isDomainSupported(PERSONAL_ASSISTANCE_DOMAINS.TECHNICAL)).toBe(true);
      expect(config.isDomainSupported(PERSONAL_ASSISTANCE_DOMAINS.CREATIVE)).toBe(true);
      expect(config.isDomainSupported(PERSONAL_ASSISTANCE_DOMAINS.PROFESSIONAL)).toBe(true);

      const preamble = config.getSystemPromptPreamble();
      expect(preamble).toContain('Mini-Adhy Personal AI');
      expect(preamble).toContain('Adhithya Mohan S');
    });
  });

  describe('2. Integration Registry & Base Connector', () => {
    test('manages connector lifecycle and executes actions', async () => {
      const registry = new IntegrationRegistry(permissionRegistry);
      const gmail = new GmailConnector();
      registry.registerConnector(gmail);

      expect(registry.getConnector('gmail')).toBe(gmail);
      const list = registry.listConnectors();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('gmail');

      // Execute L0 action without token
      const threads = await registry.executeConnectorAction('gmail', 'listThreads', { limit: 5 });
      expect(threads.count).toBe(0);

      // Execute L2 action (sendEmail) without token -> must throw
      await expect(
        registry.executeConnectorAction('gmail', 'sendEmail', { to: 'test@adhy.tech', subject: 'Hi', body: 'Test' })
      ).rejects.toThrow(/requires owner approval token/);
    });

    test('executes L2 action when provided with valid owner approval token', async () => {
      const registry = new IntegrationRegistry(permissionRegistry);
      const gmail = new GmailConnector();
      registry.registerConnector(gmail);

      const payload = {
        connectorId: 'gmail',
        action: 'sendEmail',
        params: { to: 'test@adhy.tech', subject: 'Hi', body: 'Test' }
      };
      const token = permissionRegistry.issueApprovalToken(
        'gmail:sendEmail',
        payload,
        'Adhithya Mohan',
        { ttlMs: 60000 }
      );

      const result = await registry.executeConnectorAction(
        'gmail',
        'sendEmail',
        payload.params,
        { approvalToken: token.token }
      );
      expect(result.sent).toBe(true);
      expect(result.recipient).toBe('test@adhy.tech');
    });
  });

  describe('3. Cloud Connectors (Gmail, GitHub, Calendar, Drive)', () => {
    test('GmailConnector creates drafts', async () => {
      const gmail = new GmailConnector();
      const draft = await gmail.execute('draftReply', {
        to: 'colleague@university.edu',
        subject: 'DSP Research Notes',
        body: 'Attached are the bandpass filter coefficients.'
      });
      expect(draft.status).toBe('DRAFT_CREATED');
      expect(draft.draft.to).toBe('colleague@university.edu');
    });

    test('GitHubConnector handles repo and branch queries', async () => {
      const gh = new GitHubConnector();
      const branchRes = await gh.execute('createBranch', { repo: 'portfolio', branch: 'feat/audio-engine' });
      expect(branchRes.status).toBe('BRANCH_CREATED');
      expect(branchRes.branch).toBe('feat/audio-engine');
    });

    test('GoogleCalendarConnector creates and lists events', async () => {
      const cal = new GoogleCalendarConnector();
      const created = await cal.execute('createEvent', { summary: 'Signal Processing Seminar' });
      expect(created.status).toBe('SCHEDULED');

      const list = await cal.execute('listEvents', {});
      expect(list.count).toBe(1);
    });

    test('GoogleDriveConnector uploads and searches documents', async () => {
      const drive = new GoogleDriveConnector();
      const uploaded = await drive.execute('uploadFile', { name: 'research.pdf', content: 'PDF_BINARY_CONTENT' });
      expect(uploaded.status).toBe('UPLOADED');

      const search = await drive.execute('searchFiles', { query: 'research' });
      expect(search.count).toBe(1);
    });
  });

  describe('4. Browser & Desktop Connectors', () => {
    test('BrowserAutomationConnector enforces script sandboxing', async () => {
      const browser = new BrowserAutomationConnector();
      const nav = await browser.execute('navigate', { url: 'https://arxiv.org/abs/dsp-eeg' });
      expect(nav.currentUrl).toBe('https://arxiv.org/abs/dsp-eeg');

      // Attempt dangerous script evaluation
      await expect(
        browser.execute('evaluateScript', { script: 'require("child_process").exec("whoami")' })
      ).rejects.toThrow(/Sandbox violation/);
    });

    test('DesktopControlConnector enforces application allowlist and emergency stop', async () => {
      const desktop = new DesktopControlConnector();

      // Allowed app
      const launchRes = await desktop.execute('launchApprovedApp', { appName: 'code' });
      expect(launchRes.status).toBe('LAUNCHED');

      // Disallowed app
      await expect(
        desktop.execute('launchApprovedApp', { appName: 'malicious_binary.exe' })
      ).rejects.toThrow(/not in the approved application allowlist/);

      // Trigger emergency stop
      const stopRes = await desktop.execute('emergencyStop', {});
      expect(stopRes.emergencyStopActive).toBe(true);

      // Operations blocked under emergency stop
      await expect(
        desktop.execute('launchApprovedApp', { appName: 'code' })
      ).rejects.toThrow(/EMERGENCY STOP/);

      // Resume operation
      desktop.resumeAfterEmergencyStop('owner_token_123');
      const status = await desktop.execute('getSystemStatus', {});
      expect(status.isEmergencyStopped).toBe(false);
    });
  });

  describe('5. Local Execution Agent', () => {
    test('blocks dangerous commands and permits safe allowlisted executables', async () => {
      const localExec = new LocalExecutionAgent();

      // Dangerous command block
      await expect(
        localExec.executeCommand('rm -rf /')
      ).rejects.toThrow(/Execution blocked/);

      await expect(
        localExec.executeCommand('del /f /s /q c:\\windows')
      ).rejects.toThrow(/Execution blocked/);

      // Permitted safe executable
      const res = await localExec.executeCommand('git status');
      expect(res.success).toBe(true);
      expect(res.executable).toBe('git');
      expect(localExec.getHistory().length).toBe(3); // 2 blocked + 1 success
    });
  });

  describe('6. Hardware Device Gateways (Physical, MQTT, Serial, ESP32, Raspberry Pi)', () => {
    test('HardwareDeviceGateway manages physical allowlist and emergency halt', async () => {
      const hw = new HardwareDeviceGateway();

      // Register allowlisted device
      hw.registerDevice({ id: 'esp32_lab', type: 'ESP32_CORE_S3' });
      expect(hw.registeredDevices.size).toBe(1);

      // Register non-allowlisted device
      expect(() => {
        hw.registerDevice({ id: 'unknown_drone', type: 'UNKNOWN_QUADCOPTER' });
      }).toThrow(/not in hardware allowlist/);

      // Emergency stop
      const haltRes = hw.emergencyStop();
      expect(haltRes.emergencyStopEngaged).toBe(true);

      // Disallowed command under emergency stop
      await expect(
        hw.execute('sendDeviceCommand', { deviceId: 'esp32_lab', command: 'START_MOTOR' })
      ).rejects.toThrow(/Emergency stop is ACTIVE/);
    });

    test('MqttGateway handles topic subscribe and publish', async () => {
      const mqtt = new MqttGateway();
      await mqtt.execute('connectBroker', {});
      const sub = await mqtt.execute('subscribeTopic', { topic: 'home/sensors/dsp' });
      expect(sub.subscribed).toBe(true);

      const pub = await mqtt.execute('publishMessage', { topic: 'home/sensors/dsp', payload: { eegBpm: 72 } });
      expect(pub.published).toBe(true);
    });

    test('SerialGateway lists ports and writes data', async () => {
      const serial = new SerialGateway();
      const ports = await serial.execute('listPorts', {});
      expect(ports.count).toBeGreaterThan(0);

      await serial.execute('openPort', { port: 'COM3' });
      const writeRes = await serial.execute('writeBytes', { data: 'PING\n' });
      expect(writeRes.bytesWritten).toBe(5);
    });

    test('Esp32Gateway reports chip telemetry and toggles GPIO', async () => {
      const esp32 = new Esp32Gateway();
      const info = await esp32.execute('getDeviceInfo', {});
      expect(info.cores).toBe(2);

      const gpioRes = await esp32.execute('setGpioPin', { pin: 2, state: 1 });
      expect(gpioRes.state).toBe(1);
    });

    test('RaspberryPiGateway reports system health and camera capture', async () => {
      const rpi = new RaspberryPiGateway();
      const health = await rpi.execute('getSystemHealth', {});
      expect(health.cpuTempC).toBeGreaterThan(0);

      const cam = await rpi.execute('captureCameraSnapshot', {});
      expect(cam.resolution).toBe('1920x1080');
    });
  });

  describe('7. Automation, Dashboard & Cryptographic Security Audit', () => {
    test('ProactiveScheduler registers and triggers routines', async () => {
      const scheduler = new ProactiveScheduler();
      let ran = false;
      scheduler.registerJob({
        id: 'morning_brief',
        name: 'Morning Cognitive Briefing',
        intervalMs: 3600000,
        handler: async () => {
          ran = true;
          return { brief: 'All systems green.' };
        }
      });

      const res = await scheduler.runJobNow('morning_brief');
      expect(ran).toBe(true);
      expect(res.status).toBe('SUCCESS');
      expect(scheduler.listJobs().length).toBe(1);
    });

    test('PersonalSecurityAudit verifies chained hash integrity', () => {
      const audit = new PersonalSecurityAudit();
      audit.logEvent({ action: 'AUTH_SUCCESS', actor: 'Adhithya', riskTier: 'L0_OBSERVE' });
      audit.logEvent({ action: 'TOKEN_ISSUED', actor: 'PermissionRegistry', riskTier: 'L1_PREPARE' });
      audit.logEvent({ action: 'CONNECTOR_EXECUTE', actor: 'GmailConnector', riskTier: 'L2_CONFIRM' });

      const check = audit.verifyIntegrity();
      expect(check.valid).toBe(true);
      expect(check.totalEntries).toBe(3);

      // Tamper simulation
      audit.auditTrail[1].action = 'TAMPERED_ACTION';
      const tamperedCheck = audit.verifyIntegrity();
      expect(tamperedCheck.valid).toBe(false);
    });

    test('PersonalDashboardService aggregates complete system telemetry', async () => {
      const identityConfig = new PersonalIdentityConfig();
      const registry = new IntegrationRegistry();
      registry.registerConnector(new GmailConnector());
      const hw = new HardwareDeviceGateway();
      const audit = new PersonalSecurityAudit();
      const scheduler = new ProactiveScheduler();

      const dashboard = new PersonalDashboardService({
        identityConfig,
        integrationRegistry: registry,
        hardwareGateway: hw,
        securityAudit: audit,
        scheduler
      });

      const summary = await dashboard.getDashboardSummary();
      expect(summary.system.name).toBe('Mini-Adhy Personal AI');
      expect(summary.connectors.total).toBe(1);
      expect(summary.security.auditChainValid).toBe(true);
    });

    test('PersonalExecutiveAgent plans objectives and executes steps with owner tokens', async () => {
      const executive = new PersonalExecutiveAgent({ permissionRegistry });
      const plan = await executive.planObjective('Build high-frequency DSP filter module', { domain: 'academic' });

      expect(plan.status).toBe('PREPARED');
      expect(plan.steps.length).toBe(4);

      // Execute L0 step (context_retrieval) without token
      const step1Res = await executive.executePlanStep(plan.id, 1);
      expect(step1Res.status).toBe('SUCCESS');

      // Execute L2 step (execution_dispatch) without token -> must throw
      await expect(
        executive.executePlanStep(plan.id, 3)
      ).rejects.toThrow(/requires verified owner token/);

      // Issue approval token
      const payload = { planId: plan.id, stepIndex: 3 };
      const token = permissionRegistry.issueApprovalToken(
        `plan:${plan.id}:step:3`,
        payload,
        'Adhithya Mohan'
      );

      const step3Res = await executive.executePlanStep(plan.id, 3, { approvalToken: token.token });
      expect(step3Res.status).toBe('SUCCESS');
    });
  });
});

