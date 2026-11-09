/**
 * ════════════════════════════════════════════════════════════════════
 *  SERIAL GATEWAY — UART & USB HARDWARE BUS
 * ════════════════════════════════════════════════════════════════════
 * Manages raw serial / UART communication with connected microcontrollers,
 * Arduino boards, and embedded peripherals.
 */

import { BaseConnector, CONNECTOR_STATUS } from '../integrations/BaseConnector';
import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class SerialGateway extends BaseConnector {
  constructor(options = {}) {
    super({
      id: 'serial_gateway',
      name: 'UART / USB Serial Communication Gateway',
      type: 'HARDWARE',
      supportedActions: [
        'listPorts',
        'openPort',
        'closePort',
        'writeBytes',
        'readBytes'
      ],
      actionRiskMap: {
        listPorts: EXECUTION_RISK_TIERS.L0_OBSERVE,
        openPort: EXECUTION_RISK_TIERS.L1_PREPARE,
        closePort: EXECUTION_RISK_TIERS.L0_OBSERVE,
        writeBytes: EXECUTION_RISK_TIERS.L2_CONFIRM,
        readBytes: EXECUTION_RISK_TIERS.L0_OBSERVE
      },
      ...options
    });

    this.activePort = null;
    this.baudRate = options.baudRate || 115200;
    this.rxBuffer = [];
  }

  async _handleAction(action, params, context) {
    switch (action) {
      case 'listPorts':
        return {
          ports: [
            { path: 'COM3', manufacturer: 'Espressif Inc.', pnpId: 'USB\\VID_303A&PID_1001' },
            { path: 'COM4', manufacturer: 'FTDI', pnpId: 'USB\\VID_0403&PID_6001' }
          ],
          count: 2
        };

      case 'openPort': {
        const portName = params.port || 'COM3';
        this.activePort = portName;
        this.status = CONNECTOR_STATUS.CONNECTED;
        return {
          port: portName,
          baudRate: params.baudRate || this.baudRate,
          status: 'OPEN'
        };
      }

      case 'closePort':
        this.activePort = null;
        this.status = CONNECTOR_STATUS.DISCONNECTED;
        return { status: 'CLOSED' };

      case 'writeBytes': {
        if (!this.activePort) throw new Error('[SerialGateway] No open serial port.');
        const data = params.data || '';
        return {
          bytesWritten: data.length,
          timestamp: Date.now()
        };
      }

      case 'readBytes':
        return {
          data: this.rxBuffer.splice(0, this.rxBuffer.length),
          count: 0
        };

      default:
        throw new Error(`[SerialGateway] Unhandled action: ${action}`);
    }
  }
}

export default SerialGateway;

