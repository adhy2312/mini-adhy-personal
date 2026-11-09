/**
 * ════════════════════════════════════════════════════════════════════
 *  LOCAL NETWORK RADAR — WORKSHOP & SUBNET RECONNAISSANCE
 * ════════════════════════════════════════════════════════════════════
 * Gives Mini-Adhy real-time visibility into the local environment:
 * 1. Subnet & ARP device discovery (Laptops, phones, ESP32, Pis, Gateways)
 * 2. Rapid TCP port connectivity probing (MQTT, Web, SSH, RTSP)
 * 3. Ping round-trip latency & packet loss diagnostics
 * 4. Network adapter interface profiling
 */

import os from 'os';
import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class LocalNetworkRadar {
  constructor() {
    this.lastScanResults = [];
    this.lastScanTime = null;
  }

  /**
   * Retrieves all local network adapters and active IP addresses
   */
  getNetworkInterfaces() {
    const interfaces = os.networkInterfaces();
    const result = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (!addr.internal && addr.family === 'IPv4') {
          result.push({
            adapter: name,
            ip: addr.address,
            netmask: addr.netmask,
            mac: addr.mac
          });
        }
      }
    }
    return result;
  }

  /**
   * Scans ARP cache to map active hosts on local WiFi/LAN
   */
  async scanLocalDevices() {
    try {
      const { stdout } = await execAsync('arp -a', { timeout: 5000 });
      const lines = stdout.split('\n');
      const devices = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // Match: IP Address      Physical Address      Type
        const match = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([0-9a-fA-F-]+)\s+(\w+)/);
        if (match) {
          const ip = match[1];
          const mac = match[2].toUpperCase().replace(/-/g, ':');
          const type = match[3];

          // Skip broadcast and multicast addresses
          if (ip.endsWith('.255') || ip.startsWith('224.') || ip === '255.255.255.255') {
            continue;
          }

          devices.push({
            ip,
            mac,
            type,
            classification: this._classifyDevice(ip, mac)
          });
        }
      }

      this.lastScanResults = devices;
      this.lastScanTime = new Date().toISOString();

      return {
        timestamp: this.lastScanTime,
        deviceCount: devices.length,
        devices
      };
    } catch (err) {
      return {
        timestamp: new Date().toISOString(),
        deviceCount: 0,
        devices: [],
        error: err.message
      };
    }
  }

  /**
   * Tests reachability and latency via Windows Ping
   */
  async pingHost(host = '8.8.8.8', count = 2) {
    const cleanHost = String(host).replace(/[^a-zA-Z0-9.-]/g, '');
    try {
      const { stdout } = await execAsync(`ping -n ${count} ${cleanHost}`, { timeout: 6000 });
      const reachable = !stdout.includes('unreachable') && !stdout.includes('timed out') && stdout.includes('TTL=');

      // Extract average latency if available
      const avgMatch = stdout.match(/Average\s*=\s*(\d+)ms/i);
      const avgLatencyMs = avgMatch ? parseInt(avgMatch[1], 10) : null;

      return {
        host: cleanHost,
        reachable,
        latencyMs: avgLatencyMs,
        details: reachable ? 'Host responding' : 'Host unreachable or packet loss detected'
      };
    } catch {
      return { host: cleanHost, reachable: false, latencyMs: null, details: 'Ping request failed' };
    }
  }

  /**
   * Tests if a specific TCP port on a target host is open
   */
  scanPort(host = '127.0.0.1', port = 80, timeoutMs = 2000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let status = 'CLOSED';

      socket.setTimeout(timeoutMs);

      socket.on('connect', () => {
        status = 'OPEN';
        socket.destroy();
      });

      socket.on('timeout', () => {
        status = 'TIMEOUT';
        socket.destroy();
      });

      socket.on('error', () => {
        status = 'CLOSED';
      });

      socket.on('close', () => {
        resolve({
          host,
          port,
          isOpen: status === 'OPEN',
          status
        });
      });

      socket.connect(port, host);
    });
  }

  _classifyDevice(ip, mac) {
    if (ip.endsWith('.1')) return 'GATEWAY_ROUTER';
    if (mac.startsWith('B8:27:EB') || mac.startsWith('DC:A6:32') || mac.startsWith('E4:5F:01')) return 'RASPBERRY_PI';
    if (mac.startsWith('24:0A:C4') || mac.startsWith('30:AE:A4') || mac.startsWith('A4:CF:12')) return 'ESP32_IOT';
    if (mac.startsWith('00:00:00')) return 'VIRTUAL_HOST';
    return 'LAN_NODE';
  }
}

export const localNetworkRadar = new LocalNetworkRadar();

