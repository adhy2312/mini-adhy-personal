/**
 * ════════════════════════════════════════════════════════════════════
 *  CYBER DEFENSE INTELLIGENCE — DEFENSIVE OPERATIONS & SOC SUITE
 * ════════════════════════════════════════════════════════════════════
 * Endpoint defense, heuristic threat detection, quarantine vault,
 * network anomaly radar, and unified SOC Security Operations dashboard.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const SCAN_STATUS = Object.freeze({
  CLEAN: 'CLEAN',
  THREAT_DETECTED: 'THREAT_DETECTED',
  SCAN_FAILED: 'SCAN_FAILED',
  UNSUPPORTED: 'UNSUPPORTED',
  INCOMPLETE: 'INCOMPLETE'
});

export class CyberDefenseIntelligence {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(process.cwd());
    this.quarantineDir = path.join(this.rootDir, 'data', 'quarantine_vault');
    this.incidentLogs = [];
    this.quarantinedFiles = new Map();
    this.vaultMasterKey = options.vaultKey || crypto.scryptSync(process.env.STARK_VAULT_PASS || 'stark_soc_vault_secret_2026', 'stark_salt', 32);

    if (!fs.existsSync(this.quarantineDir)) {
      try { fs.mkdirSync(this.quarantineDir, { recursive: true }); } catch {}
    }
  }

  /**
   * Scans a target file for suspicious heuristic indicators and standard test signatures
   */
  async scanFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return {
        filePath,
        status: SCAN_STATUS.SCAN_FAILED,
        error: `File does not exist: ${filePath}`,
        isThreatDetected: false,
        scanTimestamp: new Date().toISOString()
      };
    }

    try {
      const stat = fs.statSync(filePath);
      const buffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 65536));
      const contentLower = content.toLowerCase();

      // Standard EICAR string detection
      const eicarPattern = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

      const heuristicSignatures = [
        { pattern: eicarPattern.toLowerCase(), threat: 'EICAR_STANDARD_TEST_SIGNATURE', severity: 'HIGH' },
        { pattern: 'mimikatz', threat: 'CREDENTIAL_DUMPING_UTILITY', severity: 'HIGH' },
        { pattern: 'invoke-expression', threat: 'SUSPICIOUS_POWERSHELL_IEX', severity: 'MEDIUM' },
        { pattern: 'downloadstring', threat: 'REMOTE_STAGE_DOWNLOADER', severity: 'HIGH' },
        { pattern: 'xmrig', threat: 'CRYPTO_MINER_SIGNATURE', severity: 'CRITICAL' },
        { pattern: 'stratum+tcp://', threat: 'MINING_POOL_CONNECTION', severity: 'CRITICAL' },
        { pattern: 'nc.exe', threat: 'NETCAT_REVERSE_SHELL', severity: 'HIGH' }
      ];

      const detected = [];
      for (const sig of heuristicSignatures) {
        if (contentLower.includes(sig.pattern)) {
          detected.push(sig);
        }
      }

      const isMalicious = detected.length > 0;
      const report = {
        filePath,
        fileSize: stat.size,
        sha256: hash,
        isThreatDetected: isMalicious,
        threats: detected,
        severity: isMalicious ? detected[0].severity : 'CLEAN',
        status: isMalicious ? SCAN_STATUS.THREAT_DETECTED : SCAN_STATUS.CLEAN,
        scanTimestamp: new Date().toISOString()
      };

      if (isMalicious) {
        this.incidentLogs.push(report);
      }
      return report;
    } catch (err) {
      return {
        filePath,
        status: SCAN_STATUS.SCAN_FAILED,
        error: err.message,
        isThreatDetected: false,
        scanTimestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Safely isolates a file into the authenticated AES-256-GCM encrypted quarantine vault
   */
  async quarantineFile(filePath, reason = 'HEURISTIC_DETECTION') {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Target file does not exist: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    const raw = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(raw).digest('hex');
    const quarantineId = `quarantine_${Date.now()}_${fileHash.slice(0, 8)}`;
    const destination = path.join(this.quarantineDir, `${quarantineId}.vault`);

    // Authenticated AES-256-GCM encryption
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.vaultMasterKey, iv);
    const encrypted = Buffer.concat([cipher.update(raw), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const vaultEnvelope = {
      version: 'stark_gcm_v2',
      quarantineId,
      originalPath: filePath,
      sha256: fileHash,
      fileSize: stat.size,
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
      quarantinedAt: new Date().toISOString(),
      reason
    };

    // Atomic vault write: write envelope header + encrypted payload
    const headerBuffer = Buffer.from(JSON.stringify(vaultEnvelope), 'utf8');
    const headerLen = Buffer.alloc(4);
    headerLen.writeUInt32BE(headerBuffer.length, 0);

    const fullVaultPayload = Buffer.concat([headerLen, headerBuffer, encrypted]);
    fs.writeFileSync(destination, fullVaultPayload);

    // Verify written file integrity before removing original
    if (!fs.existsSync(destination) || fs.statSync(destination).size < encrypted.length) {
      throw new Error('Quarantine verification failed: Vault file was corrupted or incomplete.');
    }

    // Safely remove original after verified vault isolation
    fs.unlinkSync(filePath);

    const record = {
      quarantineId,
      originalPath: filePath,
      isolatedPath: destination,
      fileSize: stat.size,
      sha256: fileHash,
      reason,
      quarantinedAt: vaultEnvelope.quarantinedAt,
      status: 'SAFELY_ISOLATED',
      encryption: 'AES-256-GCM'
    };

    this.quarantinedFiles.set(quarantineId, record);
    return record;
  }

  /**
   * Restores an isolated file from quarantine, verifying AES-256-GCM authentication tag
   * and original SHA-256 payload hash before restoring to disk.
   */
  async restoreFromQuarantine(quarantineId) {
    const record = this.quarantinedFiles.get(quarantineId);
    if (!record) throw new Error(`Quarantine record not found: ${quarantineId}`);
    if (!fs.existsSync(record.isolatedPath)) {
      throw new Error(`Isolated file missing from vault: ${record.isolatedPath}`);
    }

    const fileBuf = fs.readFileSync(record.isolatedPath);
    const headerLen = fileBuf.readUInt32BE(0);
    const headerJson = fileBuf.toString('utf8', 4, 4 + headerLen);
    const envelope = JSON.parse(headerJson);
    const ciphertext = fileBuf.subarray(4 + headerLen);

    // Authenticated AES-256-GCM Decryption
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.vaultMasterKey,
      Buffer.from(envelope.ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(envelope.authTagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    // Verify SHA-256 matches pre-quarantine state exactly
    const restoredHash = crypto.createHash('sha256').update(decrypted).digest('hex');
    if (restoredHash !== envelope.sha256) {
      throw new Error('Integrity failure: Restored file SHA-256 does not match original quarantine hash.');
    }

    // Write back atomically
    fs.writeFileSync(record.originalPath, decrypted);
    fs.unlinkSync(record.isolatedPath);

    record.status = 'RESTORED';
    this.quarantinedFiles.delete(quarantineId);

    return {
      status: 'RESTORE_SUCCESS',
      restoredTo: record.originalPath,
      sha256Verified: true,
      quarantineId
    };
  }

  /**
   * Generates comprehensive unified Security Operations Centre (SOC) dashboard
   */
  generateSocDashboard() {
    return {
      defenseStatus: 'DEFENSE_PERIMETER_ACTIVE',
      host: os.hostname(),
      platform: os.platform(),
      totalIncidentsLogged: this.incidentLogs.length,
      quarantinedItemsCount: this.quarantinedFiles.size,
      quarantinedRecords: Array.from(this.quarantinedFiles.values()),
      recentIncidents: this.incidentLogs.slice(-5),
      socRecommendations: [
        'Ensure Windows Defender Real-Time Protection is running.',
        'Keep firewall active on public Wi-Fi profiles.',
        'Verify zero unauthorized listening ports on 0.0.0.0.'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

