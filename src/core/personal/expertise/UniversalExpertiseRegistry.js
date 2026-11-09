/**
 * ════════════════════════════════════════════════════════════════════
 *  UNIVERSAL EXPERTISE REGISTRY & TASK FORCE ORCHESTRATOR
 * ════════════════════════════════════════════════════════════════════
 * Centralized registry of verified professional capabilities and dynamic
 * specialist team synthesizer across Engineering, Software, IT, Cyber,
 * Data, Research, and Creative domains.
 */

export class UniversalExpertiseRegistry {
  constructor() {
    this.capabilities = new Map();
    this.taskForces = new Map();
    this._initializeDefaultCapabilities();
    this._initializePredefinedTaskForces();
  }

  /**
   * Registers a professional capability with rigorous metadata
   */
  registerCapability(capability) {
    if (!capability.capabilityId || !capability.domain) {
      throw new Error('Capability requires capabilityId and domain');
    }
    this.capabilities.set(capability.capabilityId, {
      ...capability,
      registeredAt: new Date().toISOString(),
      implementationStatus: capability.implementationStatus || 'ACTIVE'
    });
    return this.capabilities.get(capability.capabilityId);
  }

  getCapability(id) {
    return this.capabilities.get(id);
  }

  listCapabilities(filter = {}) {
    let list = Array.from(this.capabilities.values());
    if (filter.domain) {
      list = list.filter(c => c.domain.toLowerCase() === filter.domain.toLowerCase());
    }
    if (filter.status) {
      list = list.filter(c => c.implementationStatus === filter.status);
    }
    return list;
  }

  /**
   * Dynamically assembles a specialist team coordinated by JARVIS for a complex objective
   */
  assembleSpecialistTaskForce(objective, domainHints = []) {
    const matchedCaps = [];
    const query = objective.toLowerCase();

    for (const [id, cap] of this.capabilities.entries()) {
      const matchInId = id.toLowerCase().includes(query);
      const matchInDesc = cap.description.toLowerCase().includes(query);
      const matchInDomain = domainHints.some(h => cap.domain.toLowerCase().includes(h.toLowerCase()));
      const keywordMatch = (cap.requiredKnowledge || []).some(k => query.includes(k.toLowerCase()));

      if (matchInId || matchInDesc || matchInDomain || keywordMatch) {
        matchedCaps.push(cap);
      }
    }

    // Default to core operational mesh if specific keywords not hit
    if (matchedCaps.length === 0) {
      matchedCaps.push(
        this.getCapability('SYSTEMS_ADMINISTRATION'),
        this.getCapability('CODEBASE_INTELLIGENCE'),
        this.getCapability('DEFENSIVE_CYBERSECURITY')
      );
    }

    const taskForce = {
      taskForceId: `tf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      objective,
      commander: 'JARVIS (Supreme Executive Intelligence)',
      specialists: matchedCaps.filter(Boolean).map(c => ({
        id: c.capabilityId,
        domain: c.domain,
        role: c.description,
        tools: c.availableTools,
        verification: c.verificationProcedures
      })),
      assembledAt: new Date().toISOString()
    };

    this.taskForces.set(taskForce.taskForceId, taskForce);
    return taskForce;
  }

  /**
   * Introspection: "What can you do?"
   */
  getIntrospectionReport() {
    const domains = {};
    for (const cap of this.capabilities.values()) {
      if (!domains[cap.domain]) {
        domains[cap.domain] = [];
      }
      domains[cap.domain].push({
        id: cap.capabilityId,
        description: cap.description,
        status: cap.implementationStatus,
        tools: cap.availableTools
      });
    }

    return {
      totalCapabilities: this.capabilities.size,
      domainsCovered: Object.keys(domains).length,
      registry: domains,
      version: '3.0.0-UNIVERSAL-OPERATING-SYSTEM'
    };
  }

  _initializeDefaultCapabilities() {
    // ── ENGINEERING & PCB AUTOMATION ──────────────────────────────
    this.registerCapability({
      capabilityId: 'ELECTRONICS_CIRCUIT_ANALYSIS',
      domain: 'ELECTRONICS_ENGINEERING',
      description: 'Analog/digital circuit analysis, component sizing, Ohm/Thevenin/RC/RLC derivations, and power/thermal modeling',
      requiredKnowledge: ['Analog circuits', 'Ohm law', 'Op-Amps', 'Filters', 'Thermals', 'Power dissipation'],
      availableTools: ['ElectronicsEngineeringNexus', 'SPICE_NetlistGenerator', 'ThermalEstimator'],
      inputRequirements: ['Circuit specifications or topology parameters'],
      outputRequirements: ['Mathematical derivations, component values, tolerance evaluation'],
      safetyRestrictions: ['High voltage warning, no lethal hardware recommendations without verification'],
      verificationProcedures: ['Mathematical dimension checks, SPICE verification where available'],
      requiredPermissions: 'LEVEL_0_READONLY',
      implementationStatus: 'ACTIVE'
    });

    this.registerCapability({
      capabilityId: 'PCB_EDA_AUTOMATION_KICAD',
      domain: 'ELECTRONICS_ENGINEERING',
      description: 'Automated KiCad schematic (.kicad_sch) and PCB layout (.kicad_pcb) generation, ERC/DRC verification, and BOM export',
      requiredKnowledge: ['KiCad S-expression syntax', 'PCB stackups', 'ERC/DRC rules', 'Footprints', 'Gerber outputs'],
      availableTools: ['PcbDesignAutomation', 'KiCad_CLI_Bridge', 'BOM_Compiler'],
      inputRequirements: ['Netlist or functional schematic definition, mechanical board constraints'],
      outputRequirements: ['Valid KiCad project files, clearance reports, bill of materials'],
      safetyRestrictions: ['Design rule clearance verification mandatory before physical manufacturing'],
      verificationProcedures: ['Automated DRC collision checks, netlist completeness validation'],
      requiredPermissions: 'LEVEL_2_REVERSIBLE',
      implementationStatus: 'ACTIVE'
    });

    // ── SOFTWARE ENGINEERING ──────────────────────────────────────
    this.registerCapability({
      capabilityId: 'CODEBASE_INTELLIGENCE',
      domain: 'SOFTWARE_ENGINEERING',
      description: 'Repository-aware code comprehension, AST analysis, automated bug fixing, unit testing, and Git branch management',
      requiredKnowledge: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'C/C++', 'Git', 'Testing frameworks'],
      availableTools: ['SoftwareEngineeringDivision', 'ControlledTerminalOperator', 'GitIntegrityAgent'],
      inputRequirements: ['Source repository path, task or bug description'],
      outputRequirements: ['Code edits, diff summaries, automated test verification reports'],
      safetyRestrictions: ['Never commit secrets, test before deployment, isolate in branch'],
      verificationProcedures: ['CI test suite execution, syntax validation, build pass confirmation'],
      requiredPermissions: 'LEVEL_2_REVERSIBLE',
      implementationStatus: 'ACTIVE'
    });

    // ── IT OPERATIONS & INFRASTRUCTURE ─────────────────────────────
    this.registerCapability({
      capabilityId: 'SYSTEMS_ADMINISTRATION',
      domain: 'IT_OPERATIONS',
      description: 'Windows and Linux system administration, process management, hardware load profiling, and service monitoring',
      requiredKnowledge: ['PowerShell', 'Bash', 'System services', 'Disk/Memory/CPU monitoring', 'Event logs'],
      availableTools: ['ITOperationsDivision', 'SystemTelemetrySentinel', 'ControlledTerminalOperator'],
      inputRequirements: ['Host machine target, diagnostic request or service name'],
      outputRequirements: ['System health snapshot, service action logs, diagnostic remediation'],
      safetyRestrictions: ['No destructive disk operations or OS service deletion without Level 4 token'],
      verificationProcedures: ['Pre-and-post process health check'],
      requiredPermissions: 'LEVEL_1_LOW_RISK',
      implementationStatus: 'ACTIVE'
    });

    this.registerCapability({
      capabilityId: 'NETWORK_ENGINEERING',
      domain: 'IT_OPERATIONS',
      description: 'LAN/WAN diagnostics, IP subnetting, DNS/DHCP inspection, port scanning, and topology mapping',
      requiredKnowledge: ['TCP/IP', 'Subnet masks', 'DNS', 'Routing', 'ARP', 'Socket states'],
      availableTools: ['LocalNetworkRadar', 'stark-sentinel.exe', 'NetworkDiagnosticsNexus'],
      inputRequirements: ['Target host or subnet CIDR'],
      outputRequirements: ['Port scan results, open socket telemetry, network topology map'],
      safetyRestrictions: ['Only scan authorized local subnets and loopback addresses'],
      verificationProcedures: ['Socket connection verification, ping latency tests'],
      requiredPermissions: 'LEVEL_1_LOW_RISK',
      implementationStatus: 'ACTIVE'
    });

    // ── DEFENSIVE CYBERSECURITY ────────────────────────────────────
    this.registerCapability({
      capabilityId: 'DEFENSIVE_CYBERSECURITY',
      domain: 'CYBERSECURITY',
      description: 'Host endpoint defense, YARA/heuristic threat detection, quarantine vault management, and SOC security dashboard',
      requiredKnowledge: ['Malware signatures', 'Crypto-miners', 'Quarantine isolation', 'Process memory scanning'],
      availableTools: ['StarkMalwareDefenseSentinel', 'stark-vault.exe', 'CyberDefenseIntelligence'],
      inputRequirements: ['File path or running process PID to inspect'],
      outputRequirements: ['Threat audit report, quarantine status, remediation advice'],
      safetyRestrictions: ['Never delete files permanently without confirmation; quarantine first'],
      verificationProcedures: ['SHA-256 hash lookup, entropy analysis, process signature scan'],
      requiredPermissions: 'LEVEL_3_PRIVILEGED',
      implementationStatus: 'ACTIVE'
    });

    // ── DATA & AI RESEARCH ─────────────────────────────────────────
    this.registerCapability({
      capabilityId: 'DATA_INTELLIGENCE_ANALYTICS',
      domain: 'DATA_SCIENCE',
      description: 'Exploratory data analysis (EDA), data cleaning, statistical summarization, and SQL query generation',
      requiredKnowledge: ['SQL', 'Data cleaning', 'Pandas/Parquet', 'Statistical distributions', 'Missing value imputation'],
      availableTools: ['DataIntelligenceEngine', 'SQL_Dialect_Generator'],
      inputRequirements: ['Structured dataset (CSV, JSON, SQL database)'],
      outputRequirements: ['Summary statistics, cleaned dataset, analytical insights'],
      safetyRestrictions: ['No unvetted external database writes'],
      verificationProcedures: ['Schema validation, data type verification'],
      requiredPermissions: 'LEVEL_1_LOW_RISK',
      implementationStatus: 'ACTIVE'
    });

    // ── RESEARCH & GLOBAL KNOWLEDGE ────────────────────────────────
    this.registerCapability({
      capabilityId: 'GLOBAL_KNOWLEDGE_ENGINE',
      domain: 'RESEARCH_AND_KNOWLEDGE',
      description: 'Continuously expanding RAG knowledge engine with source quality scoring, citation tracking, and technical synthesis',
      requiredKnowledge: ['RAG architecture', 'Information retrieval', 'Citation verification', 'Fact-checking'],
      availableTools: ['GlobalKnowledgeEngine', 'PaulBettanyNeuralNexus'],
      inputRequirements: ['Research query, technical topic, or document bundle'],
      outputRequirements: ['Synthesized research paper with citations and confidence tier'],
      safetyRestrictions: ['Distinguish verified facts from AI model speculation; cite primary sources'],
      verificationProcedures: ['Multi-source consensus checking, date verification'],
      requiredPermissions: 'LEVEL_0_READONLY',
      implementationStatus: 'ACTIVE'
    });

    // ── CREATIVE & DESIGN ──────────────────────────────────────────
    this.registerCapability({
      capabilityId: 'CREATIVE_DESIGN_SYSTEMS',
      domain: 'CREATIVE_INTELLIGENCE',
      description: 'UI/UX design architecture, design tokens, responsive typography, and editable SVG/wireframe generation',
      requiredKnowledge: ['Design systems', 'Typography', 'Color theory', 'SVG syntax', 'Figma/Web standards'],
      availableTools: ['CreativeIntelligenceNexus'],
      inputRequirements: ['Brand guidelines, user flow description, or interface objective'],
      outputRequirements: ['Design system tokens (JSON/CSS), editable wireframe assets'],
      safetyRestrictions: ['Produce editable project specs rather than non-reusable static images'],
      verificationProcedures: ['Contrast accessibility ratios (WCAG AA/AAA)'],
      requiredPermissions: 'LEVEL_0_READONLY',
      implementationStatus: 'ACTIVE'
    });

    // ── PERSONAL COMPANION & DECISION INTELLIGENCE ─────────────────
    this.registerCapability({
      capabilityId: 'DECISION_INTELLIGENCE',
      domain: 'PERSONAL_INTELLIGENCE',
      description: 'Multi-criteria decision matrices, scenario modeling, trade-off analysis, and risk-weighted recommendations',
      requiredKnowledge: ['Decision theory', 'Risk matrices', 'Sensitivity analysis', 'Trade-off modeling'],
      availableTools: ['DecisionIntelligenceEngine', 'PersonalMemoryStore'],
      inputRequirements: ['Decision context, candidate choices, constraints, goals'],
      outputRequirements: ['Ranked recommendations with pros/cons, risk score, and sensitivity factors'],
      safetyRestrictions: ['Do not provide licensed financial, medical, or legal certification'],
      verificationProcedures: ['Constraint satisfaction check, weight normalization'],
      requiredPermissions: 'LEVEL_0_READONLY',
      implementationStatus: 'ACTIVE'
    });

    this.registerCapability({
      capabilityId: 'EMPATHETIC_COMPANION',
      domain: 'PERSONAL_INTELLIGENCE',
      description: 'Consistent personal support, reflective active listening, emotional context recognition, and life continuity',
      requiredKnowledge: ['Active listening', 'Emotional support', 'Socratic questioning', 'Contextual empathy'],
      availableTools: ['EmpatheticCompanionNexus', 'PersonalMemoryStore'],
      inputRequirements: ['User thoughts, personal challenges, conversational reflections'],
      outputRequirements: ['Considerate, thoughtful responses without unsolicited productivity lecturing'],
      safetyRestrictions: ['Do not claim human consciousness or replace certified professional mental health support'],
      verificationProcedures: ['Tone appropriateness assessment'],
      requiredPermissions: 'LEVEL_0_READONLY',
      implementationStatus: 'ACTIVE'
    });
  }

  _initializePredefinedTaskForces() {
    this.taskForces.set('PCB_DESIGN_TEAM', {
      taskForceId: 'PCB_DESIGN_TEAM',
      objective: 'End-to-end electronics design and KiCad PCB project generation',
      commander: 'JARVIS',
      specialists: [
        { role: 'Electronics Engineer', capability: 'ELECTRONICS_CIRCUIT_ANALYSIS' },
        { role: 'PCB Layout & DRC Specialist', capability: 'PCB_EDA_AUTOMATION_KICAD' },
        { role: 'Component & BOM Compiler', capability: 'PCB_EDA_AUTOMATION_KICAD' }
      ]
    });

    this.taskForces.set('CYBER_INCIDENT_RESPONSE', {
      taskForceId: 'CYBER_INCIDENT_RESPONSE',
      objective: 'Autonomous computer security scan, threat isolation, and incident reporting',
      commander: 'FRIDAY & ULTRON',
      specialists: [
        { role: 'Threat Hunter', capability: 'DEFENSIVE_CYBERSECURITY' },
        { role: 'Network Radar', capability: 'NETWORK_ENGINEERING' },
        { role: 'Systems Operator', capability: 'SYSTEMS_ADMINISTRATION' }
      ]
    });
  }
}
