/**
 * ════════════════════════════════════════════════════════════════════
 *  MQTT GATEWAY — IOT TELEMETRY & PUB/SUB MESSAGING
 * ════════════════════════════════════════════════════════════════════
 * Provides MQTT publish/subscribe interfaces for IoT devices, home automation,
 * and remote sensory telemetry.
 */

import { BaseConnector, CONNECTOR_STATUS } from '../integrations/BaseConnector';
import { EXECUTION_RISK_TIERS } from '../../agents/PermissionRegistry';

export class MqttGateway extends BaseConnector {
  constructor(options = {}) {
    super({
      id: 'mqtt_gateway',
      name: 'MQTT Protocol Broker Gateway',
      type: 'HARDWARE',
      supportedActions: [
        'connectBroker',
        'subscribeTopic',
        'unsubscribeTopic',
        'publishMessage',
        'listSubscriptions'
      ],
      actionRiskMap: {
        connectBroker: EXECUTION_RISK_TIERS.L0_OBSERVE,
        subscribeTopic: EXECUTION_RISK_TIERS.L0_OBSERVE,
        unsubscribeTopic: EXECUTION_RISK_TIERS.L0_OBSERVE,
        publishMessage: EXECUTION_RISK_TIERS.L2_CONFIRM,
        listSubscriptions: EXECUTION_RISK_TIERS.L0_OBSERVE
      },
      ...options
    });

    this.brokerUrl = options.brokerUrl || 'mqtt://localhost:1883';
    this.subscriptions = new Set();
    this.messageLog = [];
  }

  async _handleAction(action, params, context) {
    switch (action) {
      case 'connectBroker':
        this.status = CONNECTOR_STATUS.CONNECTED;
        return {
          connected: true,
          brokerUrl: this.brokerUrl,
          clientId: `mini_adhy_${Date.now()}`
        };

      case 'subscribeTopic': {
        const topic = params.topic;
        if (!topic) throw new Error('[MqttGateway] topic is required.');
        this.subscriptions.add(topic);
        return {
          topic,
          subscribed: true,
          activeSubscriptions: Array.from(this.subscriptions)
        };
      }

      case 'unsubscribeTopic':
        this.subscriptions.delete(params.topic);
        return { topic: params.topic, unsubscribed: true };

      case 'publishMessage': {
        const { topic, payload, qos = 0 } = params;
        if (!topic) throw new Error('[MqttGateway] topic is required.');
        const entry = {
          topic,
          payload,
          qos,
          timestamp: Date.now(),
          messageId: `msg_${Date.now()}`
        };
        this.messageLog.push(entry);
        if (this.messageLog.length > 500) this.messageLog.shift();
        return { published: true, messageId: entry.messageId, topic };
      }

      case 'listSubscriptions':
        return {
          subscriptions: Array.from(this.subscriptions),
          count: this.subscriptions.size
        };

      default:
        throw new Error(`[MqttGateway] Unhandled action: ${action}`);
    }
  }
}

export default MqttGateway;

