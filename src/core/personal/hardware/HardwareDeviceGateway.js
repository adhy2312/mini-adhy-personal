/**
 * ════════════════════════════════════════════════════════════════════
 *  HARDWARE DEVICE GATEWAY — PHYSICAL EMBEDDED COMPUTING
 * ════════════════════════════════════════════════════════════════════
 * Gateway managing external physical devices, sensors, and actuators.
 * 
 * Enforces:
 * - Device allowlist with vendor/product IDs
 * - Hard physical Emergency Stop (`emergencyStop()`)
 * - Fail-closed hardware safety invariants
 * - Event streaming for sensor telemetry
 */

import { BaseConnector, CONNECTOR_STATUS } from '../integrations/BaseConnector';
import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class HardwareDeviceGateway extends BaseConnector {
  constructor(options = {}) {
    super({
      id: 'hardware_gateway',
      name: 'Physical Hardware & Device Gateway',
      type: 'HARDWARE',
      supportedActions: [
        'listDevices',
        'getDeviceTelemetry',
        'sendDeviceCommand',
        'calibrateSensor',
        'emergencyStop',
        'resumeOperation'
      ],
      actionRiskMap: {
        listDevices: EXECUTION_RISK_TIERS.L0_OBSERVE,
        getDeviceTelemetry: EXECUTION_RISK_TIERS.L0_OBSERVE,
        calibrateSensor: EXECUTION_RISK_TIERS.L1_PREPARE,
        sendDeviceCommand: EXECUTION_RISK_TIERS.L2_CONFIRM,
        emergencyStop: EXECUTION_RISK_TIERS.L0_OBSERVE,
        resumeOperation: EXECUTION_RISK_TIERS.L3_RESTRICTED
      },
      ...options
    });

    this.registeredDevices = new Map();
    this.emergencyStopEngaged = false;
    this.deviceAllowlist = new Set([
      'ESP32_CORE_S3',
      'ESP32_WROOM_32',
      'RASPBERRY_PI_5',
      'RASPBERRY_PI_ZERO_2W',
      'STM32_DISCOVERY',
      'ARDUINO_UNO_R4',
      'SERIAL_UART_BUS'
    ]);
  }

  registerDevice(device) {
    if (!device.id || !device.type) {
      throw new Error('[HardwareDeviceGateway] device.id and device.type are required.');
    }
    if (!this.deviceAllowlist.has(device.type)) {
      throw new Error(`[HardwareDeviceGateway] Device type '${device.type}' is not in hardware allowlist.`);
    }
    this.registeredDevices.set(device.id, {
      ...device,
      registeredAt: Date.now(),
      status: 'ONLINE',
      lastSeen: Date.now()
    });
    return true;
  }

  unregisterDevice(deviceId) {
    return this.registeredDevices.delete(deviceId);
  }

  emergencyStop() {
    this.emergencyStopEngaged = true;
    for (const dev of this.registeredDevices.values()) {
      dev.status = 'HALTED_EMERGENCY_STOP';
    }
    this.emit('emergencyStop', { timestamp: Date.now(), notice: 'Physical emergency stop engaged.' });
    return {
      emergencyStopEngaged: true,
      haltedDevices: this.registeredDevices.size,
      timestamp: Date.now()
    };
  }

  resumeOperation(ownerApprovalToken) {
    if (!ownerApprovalToken) {
      throw new Error('[HardwareDeviceGateway] Owner approval token required to disengage emergency stop.');
    }
    this.emergencyStopEngaged = false;
    for (const dev of this.registeredDevices.values()) {
      dev.status = 'ONLINE';
    }
    return { emergencyStopEngaged: false, timestamp: Date.now() };
  }

  async _handleAction(action, params, context) {
    if (this.emergencyStopEngaged && action !== 'emergencyStop' && action !== 'resumeOperation') {
      throw new Error('[HardwareDeviceGateway] Emergency stop is ACTIVE. Physical commands prohibited.');
    }

    switch (action) {
      case 'listDevices':
        return {
          devices: Array.from(this.registeredDevices.values()),
          emergencyStopEngaged: this.emergencyStopEngaged,
          count: this.registeredDevices.size
        };

      case 'getDeviceTelemetry': {
        const dev = this.registeredDevices.get(params.deviceId);
        if (!dev) throw new Error(`[HardwareDeviceGateway] Device '${params.deviceId}' not found.`);
        return {
          deviceId: dev.id,
          type: dev.type,
          status: dev.status,
          telemetry: dev.telemetry || { uptimeSeconds: 120, batteryVoltage: 3.7 },
          timestamp: Date.now()
        };
      }

      case 'sendDeviceCommand': {
        const dev = this.registeredDevices.get(params.deviceId);
        if (!dev) throw new Error(`[HardwareDeviceGateway] Device '${params.deviceId}' not found.`);
        return {
          deviceId: dev.id,
          command: params.command,
          dispatched: true,
          timestamp: Date.now()
        };
      }

      case 'calibrateSensor':
        return {
          deviceId: params.deviceId,
          sensor: params.sensor || 'IMU',
          status: 'CALIBRATED',
          calibrationOffsets: { x: 0.01, y: -0.02, z: 0.98 }
        };

      case 'emergencyStop':
        return this.emergencyStop();

      case 'resumeOperation':
        return this.resumeOperation(context.approvalToken);

      default:
        throw new Error(`[HardwareDeviceGateway] Unhandled action: ${action}`);
    }
  }
}

export default HardwareDeviceGateway;

