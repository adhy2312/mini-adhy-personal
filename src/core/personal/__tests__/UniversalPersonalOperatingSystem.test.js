/**
 * ════════════════════════════════════════════════════════════════════
 *  UNIVERSAL PERSONAL OPERATING SYSTEM — MASTER VERIFICATION SUITE
 * ════════════════════════════════════════════════════════════════════
 * Validates all universal personal intelligence divisions:
 * - Digital Presence Synapse (Multi-Device Transport)
 * - Universal Expertise Registry & Task Force Assembly
 * - Electronics Engineering & KiCad PCB Automation (ERC/DRC/BOM)
 * - Software Engineering Division (Repo & Architecture Mapping)
 * - IT Operations Division (Diagnostics, SysAdmin, DNS)
 * - Cyber Defense Intelligence (Heuristics, Quarantine, SOC)
 * - Controlled Terminal Operator (Level 0-4 Governance)
 * - Data Intelligence & Global Knowledge RAG
 * - Empathetic Companion & Rational Decision Matrices
 * - Cross-Domain Universal Workflow Pipelines
 */

import path from 'path';
import fs from 'fs';

import { DigitalPresenceSynapse } from '../presence/DigitalPresenceSynapse.js';
import { UniversalExpertiseRegistry } from '../expertise/UniversalExpertiseRegistry.js';
import { ElectronicsEngineeringNexus } from '../engineering/ElectronicsEngineeringNexus.js';
import { PcbDesignAutomation } from '../engineering/PcbDesignAutomation.js';
import { SoftwareEngineeringDivision } from '../software/SoftwareEngineeringDivision.js';
import { ITOperationsDivision } from '../itops/ITOperationsDivision.js';
import { CyberDefenseIntelligence } from '../security/CyberDefenseIntelligence.js';
import { ControlledTerminalOperator, PERMISSION_TIERS } from '../terminal/ControlledTerminalOperator.js';
import { DataIntelligenceEngine } from '../data/DataIntelligenceEngine.js';
import { GlobalKnowledgeEngine, KNOWLEDGE_TIERS } from '../knowledge/GlobalKnowledgeEngine.js';
import { EmpatheticCompanionNexus, CONVERSATION_INTENTS } from '../companion/EmpatheticCompanionNexus.js';
import { DecisionIntelligenceEngine } from '../decision/DecisionIntelligenceEngine.js';
import { UniversalWorkflowEngine } from '../workflows/UniversalWorkflowEngine.js';

jest.setTimeout(35000);

describe('Universal Personal Operating System (Mini-Adhy v3.0)', () => {

  // ── 1. DIGITAL PRESENCE SYNAPSE (MULTI-DEVICE SOUL) ────────────────
  describe('1. Digital Presence Synapse', () => {
    let synapse;
    const testDir = path.resolve('data', 'test_presence');

    beforeAll(() => {
      synapse = new DigitalPresenceSynapse({ rootDir: path.resolve('.') });
    });

    test('should export a verifiable .stark-presence bundle with SHA-256 seal', async () => {
      const mockMemory = {
        data: {
          notes: [{ id: 'n1', title: 'Arc Reactor Schematics', content: 'Mark 85 power cell' }],
          projects: { mark85: { name: 'Mark 85 Armor', phase: 'Prototype' } }
        }
      };

      const result = await synapse.exportPresenceBundle(mockMemory, { archetype: 'STARK_CORE' });
      expect(result.status).toBe('PRESENCE_EXPORTED');
      expect(result.checksum).toBeDefined();
      expect(fs.existsSync(result.filePath)).toBe(true);

      // Verify file contains envelope structure
      const content = JSON.parse(fs.readFileSync(result.filePath, 'utf-8'));
      expect(content.algorithm).toBe('SHA256-DIGITAL-PRESENCE-V3');
      expect(content.payload.memoryPayload.notes.length).toBe(1);

      // Cleanup
      try { fs.unlinkSync(result.filePath); } catch {}
    });

    test('should register peer device nodes and generate presence beacons', () => {
      const beacon = synapse.generatePresenceBeacon();
      expect(beacon.consciousnessState).toBe('ONLINE_ACTIVE');
      expect(beacon.deviceId).toBeDefined();

      const reg = synapse.registerDeviceNode({ id: 'laptop_zenbook', name: 'ASUS Zenbook Mobile' });
      expect(reg.status).toBe('NODE_REGISTERED');
      expect(synapse.knownDevices.has('laptop_zenbook')).toBe(true);
    });
  });

  // ── 2. UNIVERSAL EXPERTISE REGISTRY ─────────────────────────────────
  describe('2. Universal Expertise Registry', () => {
    let registry;

    beforeAll(() => {
      registry = new UniversalExpertiseRegistry();
    });

    test('should register and introspect professional capabilities across all domains', () => {
      const report = registry.getIntrospectionReport();
      expect(report.totalCapabilities).toBeGreaterThanOrEqual(10);
      expect(report.domainsCovered).toBeGreaterThanOrEqual(7);
      expect(report.registry['ELECTRONICS_ENGINEERING']).toBeDefined();
      expect(report.registry['CYBERSECURITY']).toBeDefined();
    });

    test('should dynamically assemble specialist task force under JARVIS command', () => {
      const tf = registry.assembleSpecialistTaskForce('Design a circuit board and verify components', ['ELECTRONICS_ENGINEERING']);
      expect(tf.commander).toContain('JARVIS');
      expect(tf.specialists.length).toBeGreaterThanOrEqual(1);
      expect(tf.specialists.some(s => s.domain === 'ELECTRONICS_ENGINEERING')).toBe(true);
    });
  });

  // ── 3. ELECTRONICS ENGINEERING & KICAD PCB AUTOMATION ───────────────
  describe('3. Engineering & PCB EDA Automation', () => {
    let electronics;
    let pcb;

    beforeAll(() => {
      electronics = new ElectronicsEngineeringNexus();
      pcb = new PcbDesignAutomation();
    });

    test('should accurately calculate voltage divider and power dissipation', () => {
      const res = electronics.calculateVoltageDivider({ vin: 12, r1: 10000, r2: 3300 });
      expect(res.vout).toBeCloseTo(2.9774, 2);
      expect(res.dissipationR1_Watts).toBeGreaterThan(0);
      expect(res.formula).toBeDefined();
    });

    test('should calculate RC filter cutoff and thermal junction temperatures', () => {
      const filter = electronics.calculateRcFilter({ r: 1000, c: 100e-9 });
      expect(filter.cutoffFrequencyHz).toBeCloseTo(1591.55, 1);

      const thermal = electronics.calculateThermalDissipation({
        powerWatts: 1.5,
        ambientTempC: 25,
        thetaJunctionAmbient: 40
      });
      expect(thermal.estimatedJunctionTempC).toBe(85);
      expect(thermal.isSafeThermalDesign).toBe(true);
    });

    test('should generate editable KiCad schematic, layout, and BOM with ERC/DRC verification', async () => {
      const proj = await pcb.generateKiCadProject('test_filter_project', {
        components: [
          { ref: 'R1', value: '10k', footprint: 'Resistor_SMD:R_0805_2012Metric', x: 20, y: 20 },
          { ref: 'R2', value: '3.3k', footprint: 'Resistor_SMD:R_0805_2012Metric', x: 50, y: 20 },
          { ref: 'C1', value: '100nF', footprint: 'Capacitor_SMD:C_0805_2012Metric', x: 20, y: 35 }
        ],
        nets: [
          { name: 'VCC', connections: ['R1.1', 'R2.1'] },
          { name: 'GND', connections: ['R1.2', 'R2.2', 'C1.2'] }
        ]
      });

      expect(proj.status).toBe('KICAD_PROJECT_GENERATED');
      expect(proj.erc.passed).toBe(true);
      expect(proj.drc.passed).toBe(true);
      expect(fs.existsSync(path.join(proj.projectFolder, 'test_filter_project.kicad_sch'))).toBe(true);
      expect(fs.existsSync(path.join(proj.projectFolder, 'test_filter_project.kicad_pcb'))).toBe(true);
      expect(fs.existsSync(path.join(proj.projectFolder, 'test_filter_project_BOM.csv'))).toBe(true);
    });
  });

  // ── 4. SOFTWARE ENGINEERING & IT OPERATIONS ─────────────────────────
  describe('4. Software & IT Operations Divisions', () => {
    let software;
    let itops;

    beforeAll(() => {
      software = new SoftwareEngineeringDivision();
      itops = new ITOperationsDivision();
    });

    test('should inspect repository structure and map architecture layers', async () => {
      const inspection = await software.inspectRepository(path.resolve('.'));
      expect(inspection.status).toBe('REPOSITORY_MAPPED');
      expect(inspection.manifests.nodejs).toBe(true);

      const arch = await software.mapArchitecture(path.resolve('.'));
      expect(arch.architectureLayers.length).toBeGreaterThan(0);
    });

    test('should retrieve computer health diagnostics and network interface data', async () => {
      const health = await itops.diagnoseComputerHealth();
      expect(health.cpuModel).toBeDefined();
      expect(health.memory.percentUsed).toBeGreaterThanOrEqual(0);
      expect(health.recommendations.length).toBeGreaterThan(0);

      const net = await itops.diagnoseNetwork();
      expect(net.hostname).toBeDefined();
      expect(Array.isArray(net.activeInterfaces)).toBe(true);
    });
  });

  // ── 5. CYBER DEFENSE & CONTROLLED TERMINAL ──────────────────────────
  describe('5. Cyber Defense & Controlled Terminal Operator', () => {
    let cyber;
    let terminal;

    beforeAll(() => {
      cyber = new CyberDefenseIntelligence();
      terminal = new ControlledTerminalOperator();
    });

    test('should scan files, detect heuristic malware indicators, and generate SOC posture', async () => {
      // Create a harmless test file containing a flagged signature keyword
      const tmpTestFile = path.resolve('data', 'test_threat_sample.txt');
      fs.writeFileSync(tmpTestFile, 'Harmless test string for mimikatz signature testing.', 'utf-8');

      const scan = await cyber.scanFile(tmpTestFile);
      expect(scan.isThreatDetected).toBe(true);
      expect(scan.threats[0].threat).toBe('CREDENTIAL_DUMPING_UTILITY');

      const qResult = await cyber.quarantineFile(tmpTestFile, 'HEURISTIC_TEST');
      expect(qResult.status).toBe('SAFELY_ISOLATED');
      expect(fs.existsSync(tmpTestFile)).toBe(false);

      const soc = cyber.generateSocDashboard();
      expect(soc.defenseStatus).toBe('DEFENSE_PERIMETER_ACTIVE');
      expect(soc.quarantinedItemsCount).toBeGreaterThanOrEqual(1);

      // Cleanup
      try { fs.unlinkSync(qResult.isolatedPath); } catch {}
    });

    test('should classify commands into Level 0-4 tiers and redact secrets', async () => {
      expect(terminal.classifyCommand('dir')).toBe(PERMISSION_TIERS.LEVEL_0_READONLY);
      expect(terminal.classifyCommand('npm run build')).toBe(PERMISSION_TIERS.LEVEL_2_REVERSIBLE);
      expect(terminal.classifyCommand('net user test pass /add')).toBe(PERMISSION_TIERS.LEVEL_3_PRIVILEGED);
      expect(terminal.classifyCommand('format c:')).toBe(PERMISSION_TIERS.LEVEL_4_HIGH_IMPACT);

      const redacted = terminal.redactSecrets('Authorization: Bearer sk-antigravity998877secret');
      expect(redacted).not.toContain('sk-antigravity998877secret');
      expect(redacted).toContain('***');
    });
  });

  // ── 6. DATA INTELLIGENCE & GLOBAL KNOWLEDGE RAG ─────────────────────
  describe('6. Data Intelligence & Global Knowledge Engine', () => {
    let dataEngine;
    let knowledge;

    beforeAll(() => {
      dataEngine = new DataIntelligenceEngine();
      knowledge = new GlobalKnowledgeEngine();
    });

    test('should profile dataset columns and generate multi-dialect SQL', () => {
      const records = [
        { id: 1, name: 'Arc Reactor A', efficiency: 94.2, active: true },
        { id: 2, name: 'Arc Reactor B', efficiency: 97.8, active: true },
        { id: 3, name: 'Plasma Injector', efficiency: 88.5, active: false }
      ];

      const profile = dataEngine.profileDataset(records);
      expect(profile.totalRows).toBe(3);
      expect(profile.columnSummaries.efficiency.mean).toBeCloseTo(93.5, 1);

      const sql = dataEngine.generateSqlQuery({
        table: 'reactor_telemetry',
        columns: ['id', 'name', 'efficiency'],
        filters: ['active = true', 'efficiency > 90']
      });
      expect(sql.sql).toContain('SELECT id, name, efficiency');
      expect(sql.sql).toContain('WHERE active = true AND efficiency > 90');
    });

    test('should ingest verified technical documentation and execute RAG citation query', () => {
      knowledge.ingestDocument({
        docId: 'doc_kicad_s_expr',
        title: 'KiCad S-Expression PCB Format Specification',
        content: 'The kicad_pcb file format is structured as nested parenthesized lists representing nets, layers, and footprints.',
        tier: KNOWLEDGE_TIERS.TIER_E_VERIFIED_TECHNICAL,
        publisher: 'KiCad Development Team'
      });

      const rag = knowledge.queryKnowledge('kicad nested footprints layers');
      expect(rag.totalMatches).toBeGreaterThan(0);
      expect(rag.citations[0].docId).toBe('doc_kicad_s_expr');
      expect(rag.citations[0].tier).toBe(KNOWLEDGE_TIERS.TIER_E_VERIFIED_TECHNICAL);
    });
  });

  // ── 7. EMPATHETIC COMPANION & DECISION INTELLIGENCE ──────────────────
  describe('7. Empathetic Companion & Decision Intelligence', () => {
    let companion;
    let decision;

    beforeAll(() => {
      companion = new EmpatheticCompanionNexus();
      decision = new DecisionIntelligenceEngine();
    });

    test('should recognize emotional overwhelm and respond with attentive empathy', () => {
      const userMsg = "I feel completely overwhelmed with this project, I'm exhausted.";
      const resp = companion.synthesizeResponse(userMsg);
      expect(resp.analysis.intent).toBe(CONVERSATION_INTENTS.EMOTIONAL_SUPPORT);
      expect(resp.response).toContain("don't need to push any technical commits right now");
    });

    test('should compute weighted decision matrix and provide rational recommendation', () => {
      const res = decision.evaluateDecision({
        objective: 'Select Embedded Microcontroller for Drone Gimbal',
        criteria: [
          { name: 'Compute Power', weight: 4 },
          { name: 'Power Consumption', weight: 3 },
          { name: 'I/O Pin Count', weight: 3 }
        ],
        options: [
          { name: 'STM32F405', scores: { 'Compute Power': 9, 'Power Consumption': 6, 'I/O Pin Count': 9 } },
          { name: 'ESP32-S3', scores: { 'Compute Power': 8, 'Power Consumption': 7, 'I/O Pin Count': 8 } },
          { name: 'ATmega328P', scores: { 'Compute Power': 3, 'Power Consumption': 9, 'I/O Pin Count': 5 } }
        ]
      });

      expect(res.recommendedOption).toBe('STM32F405');
      expect(res.recommendedScore).toBeGreaterThan(7.5);
      expect(res.rationale).toContain('STM32F405');
    });
  });

  // ── 8. UNIVERSAL WORKFLOW ENGINE ────────────────────────────────────
  describe('8. Universal Workflow Engine', () => {
    let workflow;

    beforeAll(() => {
      const electronics = new ElectronicsEngineeringNexus();
      const pcb = new PcbDesignAutomation();
      const software = new SoftwareEngineeringDivision();
      const itops = new ITOperationsDivision();
      const cyber = new CyberDefenseIntelligence();
      const knowledge = new GlobalKnowledgeEngine();
      const decision = new DecisionIntelligenceEngine();

      workflow = new UniversalWorkflowEngine({
        electronics, pcb, software, itops, cyber, knowledge, decision
      });
    });

    test('should execute Workflow A: Build Electronic Product with full ERC/DRC check', async () => {
      const res = await workflow.executeBuildElectronicProductWorkflow('stark_power_nexus', {
        voltageDivider: { vin: 5, r1: 1000, r2: 2000 }
      });

      expect(res.workflow).toBe('WORKFLOW_A_ELECTRONIC_PRODUCT');
      expect(res.allStepsPassed).toBe(true);
      expect(res.outputFiles.length).toBe(4);
    });

    test('should execute Workflow B: Secure Computer (Health & SOC Compilation)', async () => {
      const res = await workflow.executeSecureComputerWorkflow();
      expect(res.workflow).toBe('WORKFLOW_B_SECURE_COMPUTER');
      expect(res.defenseStatus).toBe('DEFENSE_PERIMETER_ACTIVE');
      expect(res.steps.length).toBeGreaterThanOrEqual(2);
    });
  });
});
