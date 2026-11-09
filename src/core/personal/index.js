/**
 * ════════════════════════════════════════════════════════════════════
 *  MINI-ADHY PERSONAL AI — PERSONAL CORE INDEX
 * ════════════════════════════════════════════════════════════════════
 * Unified export of all personal assistant extensions, connectors,
 * hardware gateways, schedulers, and security audit components.
 */

export * from './identity/PersonalIdentityConfig';
export * from './integrations/BaseConnector';
export * from './integrations/IntegrationRegistry';
export * from './connectors/GmailConnector';
export * from './connectors/GitHubConnector';
export * from './connectors/GoogleCalendarConnector';
export * from './connectors/GoogleDriveConnector';
export * from './connectors/BrowserAutomationConnector';
export * from './connectors/DesktopControlConnector';
export * from './local/LocalExecutionAgent';
export * from './hardware/HardwareDeviceGateway';
export * from './hardware/MqttGateway';
export * from './hardware/SerialGateway';
export * from './hardware/Esp32Gateway';
export * from './hardware/RaspberryPiGateway';
export * from './automation/ProactiveScheduler';
export * from './dashboard/PersonalDashboardService';
export * from './security/PersonalSecurityAudit';
export * from './executive/PersonalExecutiveAgent';

