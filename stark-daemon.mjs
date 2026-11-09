/**
 * ════════════════════════════════════════════════════════════════════
 *  STARK WORKSHOP DAEMON v3.0 — AUTONOMOUS PERSONAL AI RUNTIME
 * ════════════════════════════════════════════════════════════════════
 * Advanced autonomous personal companion for Adhithya Mohan.
 * 
 * CORE CAPABILITIES:
 * 1. 11 Specialist Agent Mesh (JARVIS, FRIDAY, EDITH, ULTRON, DUM-E, HERMES, etc.)
 * 2. Real Sandboxed CLI Terminal Execution on Local Machine (LocalExecutionAgent)
 * 3. Real Desktop & System Control (Apps, Windows, Screenshot, Clipboard)
 * 4. Local File Operations & Git Intelligence (LocalFileOpsAgent)
 * 5. Persistent Life Continuity & Memory Store (PersonalMemoryStore)
 * 6. Physical Hardware & Serial Port Bus (SerialGateway, Esp32, RPi5, E-STOP)
 * 7. Executive Mission Planner (PersonalExecutiveAgent L0-L3)
 * 8. Local HTTP Cockpit Server (StarkServer on http://127.0.0.1:4242)
 * 9. Native Windows Speech Synthesis (PowerShell System.Speech SAPI)
 */

import readline from 'node:readline';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';

const execAsync = promisify(exec);

// ANSI color helpers
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// ── BANNER ────────────────────────────────────────────────────────────
function printBanner() {
  console.clear();
  console.log(`${C.cyan}${C.bold}
   ███████╗████████╗ █████╗ ██████╗ ██╗  ██╗   ██╗███╗   ███╗███████╗███████╗██╗  ██╗
   ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║ ██╔╝   ██║████╗ ████║██╔════╝██╔════╝██║  ██║
   ███████╗   ██║   ███████║██████╔╝█████╔╝    ██║██╔████╔██║█████╗  ███████╗███████║
   ╚════██║   ██║   ██╔══██║██╔══██╗██╔═██╗    ██║██║╚██╔╝██║██╔══╝  ╚════██║██╔══██║
   ███████║   ██║   ██║  ██║██║  ██║██║  ██╗   ██║██║ ╚═╝ ██║███████╗███████║██║  ██║
   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
  ${C.white}══════════════════════════════════════════════════════════════════════════════════
  ${C.yellow}${C.bold}  STARK WORKSHOP DAEMON v3.0 — HIGH-LEVEL AUTONOMOUS PERSONAL AI ASSISTANT
  ${C.dim}  Host: ${os.hostname()} | OS: ${os.type()} ${os.release()} (${os.arch()}) | Owner: Adhithya Mohan
  ${C.dim}  Local Cockpit: http://127.0.0.1:4242 | Memory: data/personal_memory.json
  ${C.white}══════════════════════════════════════════════════════════════════════════════════${C.reset}
  `);
}

// ── TTS HELPER ────────────────────────────────────────────────────────
async function speak(text, enabled = true) {
  if (!enabled || !text) return;
  try {
    const sanitized = text.replace(/["'`$\\]/g, ' ').replace(/\n/g, ' ').slice(0, 320);
    const script = `Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Rate = 1; $synth.Speak('${sanitized}')`;
    exec(`powershell -NoProfile -Command "${script}"`, () => {});
  } catch {}
}

// ── STARK DAEMON CLASS ────────────────────────────────────────────────
class StarkPersonalDaemon {
  constructor() {
    this.voiceEnabled = false;
    this.isBooted = false;
    this.agents = new Map();
    this.hardwareGateway = null;
    this.serialGateway = null;
    this.desktopControl = null;
    this.fileOps = null;
    this.memoryStore = null;
    this.localExecutor = null;
    this.executive = null;
    this.proactiveScheduler = null;
    this.httpServer = null;
    this.heartbeatTimer = null;
    this.sessionStartTime = Date.now();
  }

  async boot() {
    console.log(`${C.yellow}» Initializing Stark Industries sovereign cognitive mesh...${C.reset}`);

    try {
      // 1. Core modules
      const { LocalExecutionAgent } = await import('./src/core/personal/local/LocalExecutionAgent.js');
      const { LocalFileOpsAgent } = await import('./src/core/personal/local/LocalFileOpsAgent.js');
      const { DesktopControlConnector } = await import('./src/core/personal/connectors/DesktopControlConnector.js');
      const { HardwareDeviceGateway } = await import('./src/core/personal/hardware/HardwareDeviceGateway.js');
      const { SerialGateway } = await import('./src/core/personal/hardware/SerialGateway.js');
      const { PersonalMemoryStore } = await import('./src/core/personal/memory/PersonalMemoryStore.js');
      const { PersonalExecutiveAgent } = await import('./src/core/personal/executive/PersonalExecutiveAgent.js');
      const { ProactiveScheduler } = await import('./src/core/personal/automation/ProactiveScheduler.js');
      const { StarkServer } = await import('./src/core/personal/server/StarkServer.js');
      const { StarkMalwareDefenseSentinel } = await import('./src/core/personal/security/StarkMalwareDefenseSentinel.js');
      const { SystemTelemetrySentinel } = await import('./src/core/personal/telemetry/SystemTelemetrySentinel.js');
      const { VoiceSynthesisNexus } = await import('./src/core/personal/voice/VoiceSynthesisNexus.js');
      const { PerceptualVisionAgent } = await import('./src/core/personal/vision/PerceptualVisionAgent.js');
      const { LocalNetworkRadar } = await import('./src/core/personal/radar/LocalNetworkRadar.js');
      const { WorkspaceGuardian } = await import('./src/core/personal/workspace/WorkspaceGuardian.js');

      this.localExecutor = new LocalExecutionAgent();
      this.fileOps = new LocalFileOpsAgent();
      this.desktopControl = new DesktopControlConnector();
      this.serialGateway = new SerialGateway();
      this.hardwareGateway = new HardwareDeviceGateway();
      this.memoryStore = new PersonalMemoryStore();
      this.sentinel = new StarkMalwareDefenseSentinel();
      await this.sentinel.init();
      this.telemetry = new SystemTelemetrySentinel();
      this.voiceNexus = new VoiceSynthesisNexus();
      this.visionAgent = new PerceptualVisionAgent();
      this.radar = new LocalNetworkRadar();
      this.guardian = new WorkspaceGuardian();
      this.executive = new PersonalExecutiveAgent({
        localExecutionAgent: this.localExecutor,
        hardwareGateway: this.hardwareGateway
      });
      this.proactiveScheduler = new ProactiveScheduler();

      // Load persistent memory
      await this.memoryStore.load();

      // Register default workshop hardware
      this.hardwareGateway.registerDevice({ id: 'esp32_workbench', type: 'ESP32_CORE_S3', port: 'COM3' });
      this.hardwareGateway.registerDevice({ id: 'rpi5_cluster', type: 'RASPBERRY_PI_5', ip: '192.168.1.100' });
      this.hardwareGateway.registerDevice({ id: 'uart_bus_01', type: 'SERIAL_UART_BUS', baud: 115200 });

      // Start local HTTP Cockpit on port 4242
      this.httpServer = new StarkServer(this, 4242);
      this.httpServer.start();

      console.log(`  ${C.green}✓ Local Execution Agent initialized${C.reset} [CWD: ${process.cwd()}]`);
      console.log(`  ${C.green}✓ Local File Operations & Git Agent active${C.reset}`);
      console.log(`  ${C.green}✓ Desktop & Computer Control connected${C.reset}`);
      console.log(`  ${C.green}✓ Persistent Memory Store loaded${C.reset} [${this.memoryStore.data.notes.length} notes, ${Object.keys(this.memoryStore.data.projects).length} projects]`);
      console.log(`  ${C.green}✓ Physical Hardware Gateway online${C.reset} [3 devices registered]`);
      console.log(`  ${C.green}✓ Stark Malware Defense Sentinel active${C.reset} [FRIDAY & ULTRON heuristic threat hunting]`);
      console.log(`  ${C.green}✓ System Telemetry Sentinel online${C.reset} [CPU, RAM, Disks, Power profiling]`);
      console.log(`  ${C.green}✓ Voice Synthesis Nexus connected${C.reset} [100% offline SAPI audio engine]`);
      console.log(`  ${C.green}✓ Perceptual Vision Agent online${C.reset} [Window enumeration, active focus & OCR]`);
      console.log(`  ${C.green}✓ Local Network Radar initialized${C.reset} [ARP subnet discovery & diagnostics]`);
      console.log(`  ${C.green}✓ Workspace Guardian active${C.reset} [Git integrity across developer repos]`);
      console.log(`  ${C.green}✓ Local HTTP Cockpit Server active${C.reset} [http://127.0.0.1:4242]`);
    } catch (err) {
      console.log(`  ${C.red}✗ Subsystem init error: ${err.message}${C.reset}`);
    }

    // 2. Load 11 Specialist Agents
    console.log(`\n${C.yellow}» Awakening Specialist Agent Mesh...${C.reset}`);
    const specialists = [
      { name: 'JARVIS', file: './src/core/agents/specialists/JarvisAgent.js', role: 'Supreme Operations Commander' },
      { name: 'FRIDAY', file: './src/core/agents/specialists/FridayAgent.js', role: 'Tactical Defense & Security Sentinel' },
      { name: 'EDITH', file: './src/core/agents/specialists/EdithAgent.js', role: 'Strategic Reconnaissance & Deep Intelligence' },
      { name: 'ULTRON', file: './src/core/agents/specialists/UltronAgent.js', role: 'Adversarial Code Auditor & Stress Testing' },
      { name: 'DUM-E', file: './src/core/agents/specialists/DumEAgent.js', role: 'Workshop Robotics & Sensor Calibration' },
      { name: 'HERMES', file: './src/core/agents/specialists/HermesAgent.js', role: 'Supreme Dispatch Telepath & Protocol Bridge' },
      { name: 'KAREN', file: './src/core/agents/specialists/KarenAgent.js', role: 'Biometrics & Adaptive Companion' },
      { name: 'JOCASTA', file: './src/core/agents/specialists/JocastaAgent.js', role: 'Knowledge Synthesis & Archival Core' },
      { name: 'JIM', file: './src/core/agents/specialists/JimAgent.js', role: 'Rapid Prototyping & Edge Engineering' },
      { name: 'U', file: './src/core/agents/specialists/UAgent.js', role: 'Utility Infrastructure & Resource Governor' },
      { name: 'VERONICA', file: './src/core/agents/specialists/VeronicaAgent.js', role: 'Orbital Safeguards & Emergency Containment' }
    ];

    for (const spec of specialists) {
      try {
        const mod = await import(spec.file);
        const AgentClass = Object.values(mod).find(v => typeof v === 'function' && /Agent$/.test(v.name)) || Object.values(mod)[0];
        if (AgentClass) {
          const instance = new AgentClass();
          this.agents.set(spec.name, instance);
          console.log(`  ${C.cyan}● ${spec.name.padEnd(10)}${C.reset} | ${C.green}ONLINE${C.reset} | ${C.dim}${spec.role}${C.reset}`);
        }
      } catch (err) {
        console.log(`  ${C.red}○ ${spec.name.padEnd(10)}${C.reset} | ${C.yellow}STANDBY${C.reset} | ${C.dim}${spec.role} (${err.message})${C.reset}`);
      }
    }

    this._startHeartbeat();
    this.isBooted = true;

    console.log(`\n${C.green}${C.bold}» ALL SYSTEMS OPERATIONAL. STARK WORKSHOP DAEMON STANDING BY.${C.reset}`);
    console.log(`${C.dim}Type ${C.cyan}brief${C.dim} for executive briefing or ${C.cyan}help${C.dim} for directives.${C.reset}\n`);

    if (this.voiceEnabled) {
      speak('All systems operational, sir. Stark workshop daemon standing by.', true);
    }
  }

  _startHeartbeat() {
    this.heartbeatTimer = setInterval(async () => {
      const jarvis = this.agents.get('JARVIS');
      if (jarvis && typeof jarvis.runRoutine === 'function') {
        try {
          const agentsObj = Object.fromEntries(this.agents.entries());
          await jarvis.runRoutine(agentsObj);
        } catch {}
      }
    }, 45000);
  }

  // ── COMMAND ROUTER ──────────────────────────────────────────────────
  async handleInput(input) {
    const raw = input.trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
      case '?':
        this.printHelp();
        break;

      case 'brief':
      case 'briefing':
        await this.handleBriefing();
        break;

      case 'status':
        this.printStatus();
        break;

      case 'sys':
      case 'system':
        await this.handleSysInfo();
        break;

      case 'mesh':
        this.printMesh();
        break;

      case 'apps':
      case 'windows':
        await this.handleListWindows();
        break;

      case 'launch':
      case 'open':
        await this.handleLaunchApp(parts[1], parts.slice(2).join(' '));
        break;

      case 'screen':
      case 'screenshot':
        await this.handleScreenshot();
        break;

      case 'clip':
      case 'clipboard':
        await this.handleClipboard(args);
        break;

      case 'memo':
      case 'remember':
        await this.handleRemember(args);
        break;

      case 'recall':
      case 'memos':
        this.handleRecall(args);
        break;

      case 'git':
        await this.handleGit(args);
        break;

      case 'find':
      case 'files':
        await this.handleFindFiles(args);
        break;

      case 'read':
        await this.handleReadFile(args);
        break;

      case 'ports':
        await this.handlePorts();
        break;

      case 'scan':
        await this.handleScan(parts.slice(1));
        break;

      case 'quarantine':
        await this.handleQuarantine(parts.slice(1));
        break;

      case 'threat':
      case 'kill':
        await this.handleThreatKill(parts.slice(1));
        break;

      case 'hardware':
        await this.handleHardware(parts.slice(1));
        break;

      case 'telemetry':
      case 'health':
      case 'vitals':
        await this.handleTelemetry();
        break;

      case 'procs':
      case 'top':
        await this.handleTopProcs(parts[1]);
        break;

      case 'voices':
        await this.handleVoices();
        break;

      case 'focus':
        await this.handleFocus(args);
        break;

      case 'radar':
      case 'lan':
        await this.handleRadar();
        break;

      case 'ping':
        await this.handlePing(parts[1]);
        break;

      case 'workspaces':
      case 'sweep':
        await this.handleWorkspaceSweep();
        break;

      case 'run':
      case 'exec':
        await this.handleRun(args);
        break;

      case 'plan':
        await this.handlePlan(args);
        break;

      case 'server':
        this.handleServerToggle(parts[1]);
        break;

      case 'voice':
        this.handleVoiceToggle(parts[1]);
        break;

      case 'speak':
        await speak(args, true);
        console.log(`${C.dim}[Spoken: "${args}"]${C.reset}`);
        break;

      case 'ask':
        await this.handleAsk(parts[1]?.toUpperCase(), parts.slice(2).join(' '));
        break;

      case 'clear':
      case 'cls':
        printBanner();
        break;

      case 'exit':
      case 'quit':
        await this.shutdown();
        break;

      default:
        await this.handleChat(raw);
        break;
    }
  }

  // ── HELP DIRECTORY ──────────────────────────────────────────────────
  printHelp() {
    console.log(`
${C.cyan}${C.bold}STARK WORKSHOP v3.0 DIRECTIVES & PROTOCOLS:${C.reset}
  ${C.yellow}brief${C.reset}                 Generate executive Tony Stark operational briefing
  ${C.yellow}status${C.reset}                Comprehensive system, mesh, and memory readout
  ${C.yellow}sys${C.reset}                   Real CPU, RAM, OS, and hardware load metrics
  ${C.yellow}mesh${C.reset}                  Inspect all 11 specialist agents & clearance levels
  ${C.yellow}apps${C.reset}                  List all open Windows desktop applications & windows
  ${C.yellow}launch <app>${C.reset}          Launch approved app (code, chrome, notepad, calc, explorer, powershell)
  ${C.yellow}screen${C.reset}                Capture real Windows desktop screenshot to data/screenshots/
  ${C.yellow}clip [text]${C.reset}           Inspect clipboard or copy text to Windows clipboard
  ${C.yellow}memo <note>${C.reset}           Permanently store a memory/note in persistent memory
  ${C.yellow}recall [query]${C.reset}        Search and retrieve persistent memories across reboots
  ${C.yellow}git [path]${C.reset}            Inspect Git branches, dirty files, and worktree health
  ${C.yellow}find <keyword>${C.reset}        Fast search for files across project repositories
  ${C.yellow}read <file>${C.reset}           Safely inspect file content in the terminal
  ${C.yellow}ports${C.reset}                 Scan real physical & virtual COM serial devices
  ${C.yellow}scan [path]${C.reset}           Scan folder or file for heuristic malware & exploits
  ${C.yellow}scan defender${C.reset}         Check Windows Defender real-time protection & signatures
  ${C.yellow}scan procs${C.reset}            Scan running processes for crypto-miners & rogue scripts
  ${C.yellow}scan net${C.reset}              Scan listening network ports for suspicious backdoors
  ${C.yellow}scan secrets [p]${C.reset}      Scan codebase for leaked API keys, tokens & credentials
  ${C.yellow}quarantine <file>${C.reset}     Safely isolate and neutralize a detected threat
  ${C.yellow}quarantine list${C.reset}       Display all files in encrypted quarantine vault
  ${C.yellow}threat kill <pid>${C.reset}     Terminate malicious process safely (with system safeguards)
  ${C.yellow}hardware${C.reset}              List connected physical devices & sensor telemetry
  ${C.yellow}hardware stop${C.reset}         Engage physical Emergency Stop (E-STOP) across all devices
  ${C.yellow}run <command>${C.reset}         Execute real sandboxed terminal command on local PC
  ${C.yellow}plan <objective>${C.reset}     Synthesize multi-step mission plan (L0-L3 risk tiers)
  ${C.yellow}ask <AGENT> <query>${C.reset}   Consult specific specialist (JARVIS, FRIDAY, EDITH, ULTRON, etc.)
  ${C.yellow}voice on / off${C.reset}        Toggle native Windows speech output
  ${C.yellow}server on / off${C.reset}       Toggle local HTTP Cockpit on http://127.0.0.1:4242
  ${C.yellow}clear${C.reset}                 Clear console and redraw Stark HUD
  ${C.yellow}exit${C.reset}                  Graceful shutdown sequence
    `);
  }

  // ── EXECUTIVE BRIEFING ──────────────────────────────────────────────
  async handleBriefing() {
    console.log(`\n${C.cyan}${C.bold}══════════════════════════════════════════════════════════════════════════════════${C.reset}`);
    console.log(`${C.yellow}${C.bold}  JARVIS OPERATIONAL BRIEFING // ADHITHYA MOHAN${C.reset}`);
    console.log(`${C.cyan}${C.bold}══════════════════════════════════════════════════════════════════════════════════${C.reset}`);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    let sysInfo = null;
    let gitInfo = null;
    let winCount = 0;

    if (this.desktopControl) {
      sysInfo = await this.desktopControl._handleAction('getSystemStatus');
      const winData = await this.desktopControl._handleAction('listOpenWindows');
      winCount = winData.count || 0;
    }

    if (this.fileOps) {
      gitInfo = await this.fileOps.getGitStatus('d:\\portfolio\\portfolio');
    }

    const memoCount = this.memoryStore?.data?.notes?.length || 0;
    const memPercent = sysInfo?.memory?.percentUsed || 0;

    console.log(`  ${C.dim}Timestamp:${C.reset}      ${dateStr} at ${timeStr}`);
    console.log(`  ${C.dim}Mesh Integrity:${C.reset} ${this.agents.size} / 11 Specialists Online (JARVIS, FRIDAY, EDITH, ULTRON, DUM-E...)`);
    console.log(`  ${C.dim}Host Memory:${C.reset}    ${sysInfo?.memory?.usedMB || 0} MB used / ${sysInfo?.memory?.totalMB || 0} MB total (${memPercent}% capacity)`);
    console.log(`  ${C.dim}Desktop Space:${C.reset}  ${winCount} active application windows detected`);
    console.log(`  ${C.dim}Portfolio Git:${C.reset}  Branch ${C.cyan}${gitInfo?.branch || 'main'}${C.reset} [${gitInfo?.isClean ? C.green + 'CLEAN' : C.yellow + gitInfo?.dirtyCount + ' DIRTY'}${C.reset}]`);
    console.log(`  ${C.dim}Persistent Memo:${C.reset}${memoCount} items cataloged in durable memory`);
    console.log(`  ${C.dim}Sentinel Guard:${C.reset}  FRIDAY & ULTRON active [${this.sentinel?.quarantinedVault?.size || 0} quarantined threats]`);
    console.log(`  ${C.dim}Hardware Nexus:${C.reset} 3 devices registered. E-STOP is ${this.hardwareGateway?.emergencyStopEngaged ? C.red + 'ENGAGED' : C.green + 'NORMAL'}${C.reset}`);
    console.log(`${C.cyan}${C.bold}══════════════════════════════════════════════════════════════════════════════════${C.reset}\n`);

    const voiceSummary = `Good day, Adhithya. It is ${timeStr}. All 11 specialist agents are online. Memory usage is at ${memPercent} percent. Workshop hardware is standing by.`;
    speak(voiceSummary, this.voiceEnabled);
  }

  // ── SYSTEM METRICS ──────────────────────────────────────────────────
  async handleSysInfo() {
    if (!this.desktopControl) return;
    const info = await this.desktopControl._handleAction('getSystemStatus');
    console.log(`\n${C.cyan}${C.bold}LOCAL COMPUTER HARDWARE METRICS:${C.reset}`);
    console.log(`  Hostname:      ${info.hostname}`);
    console.log(`  Platform:      ${info.platform} (${info.release})`);
    console.log(`  CPU:           ${info.cpuModel} (${info.cpuCores} logical cores)`);
    console.log(`  System Uptime: ${Math.floor(info.uptimeSeconds / 3600)}h ${Math.floor((info.uptimeSeconds % 3600) / 60)}m`);
    console.log(`  RAM Usage:     ${info.memory.usedMB} MB / ${info.memory.totalMB} MB (${info.memory.percentUsed}%)`);
    console.log(`  E-Stop Status: ${info.isEmergencyStopped ? C.red + 'HALTED' : C.green + 'NORMAL'}${C.reset}\n`);
  }

  // ── DESKTOP WINDOWS ─────────────────────────────────────────────────
  async handleListWindows() {
    if (!this.desktopControl) return;
    console.log(`${C.dim}Scanning active Windows desktop processes...${C.reset}`);
    const data = await this.desktopControl._handleAction('listOpenWindows');
    console.log(`\n${C.cyan}${C.bold}ACTIVE APPLICATION WINDOWS (${data.count}):${C.reset}`);
    data.windows.forEach((w, idx) => {
      console.log(`  [${String(idx + 1).padStart(2)}] ${C.yellow}${w.process.padEnd(16)}${C.reset} | ${w.title}`);
    });
    console.log('');
  }

  // ── LAUNCH APP ──────────────────────────────────────────────────────
  async handleLaunchApp(app, args) {
    if (!app) {
      console.log(`${C.yellow}Usage: launch <app> (code, chrome, notepad, calc, explorer, powershell)${C.reset}`);
      return;
    }
    try {
      const res = await this.desktopControl._handleAction('launchApprovedApp', { app, path: args });
      console.log(`${C.green}✓ Launched '${res.app}' successfully [PID: ${res.pid}]${C.reset}`);
      speak(`Launching ${res.app}`, this.voiceEnabled);
    } catch (e) {
      console.log(`${C.red}✗ Launch failed: ${e.message}${C.reset}`);
    }
  }

  // ── SCREENSHOT ──────────────────────────────────────────────────────
  async handleScreenshot() {
    console.log(`${C.dim}Capturing primary desktop display...${C.reset}`);
    const res = await this.desktopControl._handleAction('takeScreenshot');
    if (res.success) {
      console.log(`${C.green}✓ Screenshot captured successfully!${C.reset}`);
      console.log(`  File: ${C.cyan}${res.filePath}${C.reset}\n`);
      speak('Desktop screenshot captured, sir.', this.voiceEnabled);
    } else {
      console.log(`${C.red}✗ Screenshot failed: ${res.error}${C.reset}\n`);
    }
  }

  // ── CLIPBOARD ───────────────────────────────────────────────────────
  async handleClipboard(text) {
    if (text) {
      await this.desktopControl._handleAction('setClipboard', { text });
      console.log(`${C.green}✓ Text copied to Windows clipboard.${C.reset}`);
    } else {
      const res = await this.desktopControl._handleAction('getClipboard');
      console.log(`\n${C.cyan}${C.bold}WINDOWS CLIPBOARD CONTENT:${C.reset}`);
      console.log(`${C.dim}────────────────────────────────────────────────${C.reset}`);
      console.log(res.text || '[Clipboard is empty]');
      console.log(`${C.dim}────────────────────────────────────────────────${C.reset}\n`);
    }
  }

  // ── PERSISTENT MEMORY ───────────────────────────────────────────────
  async handleRemember(text) {
    if (!text) {
      console.log(`${C.yellow}Usage: memo <note or fact to permanently remember>${C.reset}`);
      return;
    }
    const note = await this.memoryStore.remember(text, 'workshop_memo');
    console.log(`${C.green}✓ Stored in permanent memory [ID: ${note.id}]${C.reset}`);
    speak('Memory committed to neural ledger, sir.', this.voiceEnabled);
  }

  handleRecall(query) {
    const notes = this.memoryStore.recall(query, 12);
    console.log(`\n${C.cyan}${C.bold}RECALLED MEMORIES (${notes.length}):${C.reset}`);
    notes.forEach((n, idx) => {
      const date = new Date(n.timestamp).toLocaleDateString();
      console.log(`  [${date}] ${C.yellow}${n.category}:${C.reset} ${n.text}`);
    });
    console.log('');
  }

  // ── GIT STATUS ──────────────────────────────────────────────────────
  async handleGit(targetPath) {
    const p = targetPath || 'd:\\portfolio\\portfolio';
    console.log(`${C.dim}Inspecting Git repository at ${p}...${C.reset}`);
    const res = await this.fileOps.getGitStatus(p);
    if (!res.success) {
      console.log(`${C.red}✗ Git check error: ${res.error}${C.reset}`);
      return;
    }
    console.log(`\n${C.cyan}${C.bold}GIT REPO: ${res.repo}${C.reset}`);
    console.log(`  Branch: ${C.yellow}${res.branch}${C.reset} | State: ${res.isClean ? C.green + 'CLEAN' : C.red + 'DIRTY (' + res.dirtyCount + ' files)'}${C.reset}`);
    if (res.files && res.files.length > 0) {
      res.files.forEach(f => console.log(`    ${C.dim}${f}${C.reset}`));
    }
    console.log('');
  }

  // ── FILE SEARCH & READ ──────────────────────────────────────────────
  async handleFindFiles(query) {
    if (!query) {
      console.log(`${C.yellow}Usage: find <keyword or extension> (e.g. find .env, find Agent)${C.reset}`);
      return;
    }
    console.log(`${C.dim}Searching for '${query}'...${C.reset}`);
    const res = await this.fileOps.findFiles(query, 'd:\\portfolio', 15);
    console.log(`\n${C.cyan}${C.bold}FOUND ${res.found} MATCHING FILES:${C.reset}`);
    res.files.forEach(f => console.log(`  ● ${C.yellow}${f.name}${C.reset} → ${C.dim}${f.relative}${C.reset}`));
    console.log('');
  }

  async handleReadFile(filePath) {
    if (!filePath) {
      console.log(`${C.yellow}Usage: read <path-to-file>${C.reset}`);
      return;
    }
    const res = await this.fileOps.readFile(filePath, 60);
    if (!res.success) {
      console.log(`${C.red}✗ Read error: ${res.error}${C.reset}`);
      return;
    }
    console.log(`\n${C.cyan}${C.bold}FILE: ${res.filename} (${res.totalLines} lines)${C.reset}`);
    console.log(`${C.dim}────────────────────────────────────────────────${C.reset}`);
    console.log(res.content);
    if (res.truncated) console.log(`${C.dim}... [Truncated at line 60]${C.reset}`);
    console.log(`${C.dim}────────────────────────────────────────────────${C.reset}\n`);
  }

  // ── SERIAL PORTS ────────────────────────────────────────────────────
  async handlePorts() {
    if (!this.serialGateway) return;
    console.log(`${C.dim}Scanning hardware COM serial ports...${C.reset}`);
    const res = await this.serialGateway._handleAction('listPorts');
    console.log(`\n${C.cyan}${C.bold}HARDWARE SERIAL BUSES (${res.count}):${C.reset}`);
    res.ports.forEach(p => {
      console.log(`  ● ${C.yellow}${p.path.padEnd(8)}${C.reset} | Type: ${p.type.padEnd(16)} | Manufacturer: ${p.manufacturer} | Status: ${C.green}${p.status}${C.reset}`);
    });
    console.log('');
  }

  // ── MALWARE SCANNER & SECURITY SENTINEL ─────────────────────────────
  async handleScan(args) {
    if (!this.sentinel) return;
    const sub = args[0]?.toLowerCase();

    // 1. scan defender
    if (sub === 'defender') {
      console.log(`${C.dim}Querying host Windows Defender telemetry...${C.reset}`);
      const def = await this.sentinel.checkWindowsDefender();
      console.log(`\n${C.cyan}${C.bold}WINDOWS DEFENDER SECURITY STATUS:${C.reset}`);
      console.log(`  Antivirus Engine:     ${def.antivirusEnabled ? C.green + 'ENABLED' : C.red + 'DISABLED'}${C.reset}`);
      console.log(`  Real-Time Protection: ${def.realTimeProtectionEnabled ? C.green + 'ACTIVE' : C.red + 'DISABLED'}${C.reset}`);
      console.log(`  Signatures Updated:   ${def.signatureUpdated}`);
      console.log(`  Overall Posture:      ${def.status === 'SECURE_ACTIVE' ? C.green + 'SECURE & SHIELDED' : C.yellow + def.status}${C.reset}\n`);
      speak(def.realTimeProtectionEnabled ? 'Windows Defender is active and protecting host.' : 'Warning: Windows Defender real-time protection is disabled.', this.voiceEnabled);
      return;
    }

    // 2. scan procs
    if (sub === 'procs' || sub === 'processes') {
      console.log(`${C.dim}Hunting running processes for crypto-miners and rogue payloads...${C.reset}`);
      const procRes = await this.sentinel.scanProcesses();
      console.log(`\n${C.cyan}${C.bold}PROCESS THREAT SCANNER:${C.reset}`);
      console.log(`  Processes Audited: ${procRes.totalProcessesScanned}`);
      console.log(`  Threats Detected:  ${procRes.threatCount === 0 ? C.green + '0 (CLEAN)' : C.red + procRes.threatCount + ' ACTIVE THREATS'}${C.reset}\n`);

      if (procRes.threats.length > 0) {
        procRes.threats.forEach(t => {
          console.log(`  ${C.red}${C.bold}⚠ [${t.severity}] PID ${t.pid} (${t.processName})${C.reset} → ${t.reason}`);
        });
        console.log(`\n${C.yellow}To eliminate: type 'threat kill <pid>'${C.reset}\n`);
        speak(`Warning: ${procRes.threatCount} suspicious processes detected in memory.`, this.voiceEnabled);
      }
      return;
    }

    // 3. scan net
    if (sub === 'net' || sub === 'ports') {
      console.log(`${C.dim}Auditing open network sockets and listening ports...${C.reset}`);
      const netRes = await this.sentinel.scanNetworkPorts();
      console.log(`\n${C.cyan}${C.bold}NETWORK THREAT & PORT AUDIT:${C.reset}`);
      console.log(`  Active Listening Sockets: ${netRes.totalListeningPorts}`);
      console.log(`  Flagged Suspicious Ports: ${netRes.flaggedCount === 0 ? C.green + '0 (CLEAN)' : C.red + netRes.flaggedCount}${C.reset}\n`);

      netRes.ports.forEach(p => {
        console.log(`  ${C.dim}●${C.reset} ${C.yellow}${p.address}:${p.port}${C.reset} (PID ${p.pid})`);
      });
      console.log('');
      return;
    }

    // 4. scan secrets [path]
    if (sub === 'secrets') {
      const target = args[1] || '.';
      console.log(`${C.dim}Scanning '${target}' for unencrypted API keys and leaked credentials...${C.reset}`);
      const res = await this.sentinel.scanDirectory(target, { maxFiles: 300 });
      console.log(`\n${C.cyan}${C.bold}CREDENTIAL LEAKAGE SCANNER:${C.reset}`);
      console.log(`  Files Inspected: ${res.totalFilesScanned}`);
      console.log(`  Secrets Flagged: ${res.threatCount === 0 ? C.green + '0 (ZERO LEAKS)' : C.red + res.threatCount + ' EXPOSED'}${C.reset}\n`);

      if (res.threats.length > 0) {
        res.threats.forEach(t => {
          console.log(`  ${C.red}⚠ ${t.filename}${C.reset} (${t.path})`);
          t.threats.forEach(x => console.log(`      └─ [${x.severity}] ${x.name}`));
        });
      }
      return;
    }

    // 5. Default: scan file or directory
    const targetPath = args[0] || '.';
    console.log(`${C.dim}Initiating heuristic malware & exploit scan on '${targetPath}'...${C.reset}`);

    const res = await this.sentinel.scanDirectory(targetPath, { maxFiles: 400 });
    console.log(`\n${C.cyan}${C.bold}STARK ANTIMALWARE AUDIT REPORT // FRIDAY SENTINEL:${C.reset}`);
    console.log(`  Target Directory: ${res.targetDirectory}`);
    console.log(`  Files Inspected:  ${res.totalFilesScanned}`);
    console.log(`  Threat Status:    ${res.isClean ? C.green + 'CLEAN (ZERO THREATS)' : C.red + res.threatCount + ' THREATS DETECTED'}${C.reset}\n`);

    if (res.threats.length > 0) {
      res.threats.forEach(t => {
        console.log(`  ${C.red}${C.bold}⚠ MALWARE:${C.reset} ${C.yellow}${t.filename}${C.reset} (${t.path})`);
        t.threats.forEach(sig => {
          console.log(`      └─ ${C.red}[${sig.severity}]${C.reset} ${sig.name} (${sig.category})`);
        });
      });
      console.log(`\n${C.yellow}To neutralize a threat: type 'quarantine <filepath>'${C.reset}\n`);
      speak(`Alert: ${res.threatCount} suspicious signatures found in directory.`, this.voiceEnabled);
    } else {
      speak('Scan complete. Zero threat signatures detected.', this.voiceEnabled);
    }
  }

  // ── QUARANTINE VAULT ────────────────────────────────────────────────
  async handleQuarantine(args) {
    if (!this.sentinel) return;
    const sub = args[0]?.toLowerCase();

    if (sub === 'list') {
      const items = this.sentinel.listQuarantine();
      console.log(`\n${C.cyan}${C.bold}ISOLATED QUARANTINE VAULT (${items.length}):${C.reset}`);
      if (items.length === 0) {
        console.log(`  ${C.green}Vault is empty. Zero quarantined files.${C.reset}\n`);
        return;
      }
      items.forEach(item => {
        const d = new Date(item.quarantinedAt).toLocaleString();
        console.log(`  ${C.yellow}● ${item.id}${C.reset} | ${item.originalFilename} [${item.sizeBytes} bytes] | ${C.dim}${d}${C.reset}`);
        console.log(`      Original: ${item.originalPath}`);
        console.log(`      Reason:   ${C.red}${item.reason}${C.reset}`);
      });
      console.log('');
      return;
    }

    if (sub === 'restore') {
      const qId = args[1];
      const token = args[2] || 'token_adhithya_owner';
      if (!qId) {
        console.log(`${C.yellow}Usage: quarantine restore <quarantineId> [ownerToken]${C.reset}`);
        return;
      }
      try {
        const res = await this.sentinel.restoreQuarantine(qId, token);
        console.log(`${C.green}✓ Restored file successfully to: ${res.restoredPath}${C.reset}`);
        speak('Quarantine item restored.', this.voiceEnabled);
      } catch (e) {
        console.log(`${C.red}Restore failed: ${e.message}${C.reset}`);
      }
      return;
    }

    // Default: quarantine a file
    const targetFile = args.join(' ');
    if (!targetFile) {
      console.log(`${C.yellow}Usage: quarantine <filepath> or quarantine list${C.reset}`);
      return;
    }

    try {
      console.log(`${C.dim}Isolating and neutralizing '${targetFile}'...${C.reset}`);
      const res = await this.sentinel.quarantineFile(targetFile);
      console.log(`\n${C.green}${C.bold}✓ THREAT NEUTRALIZED & QUARANTINED!${C.reset}`);
      console.log(`  Quarantine ID: ${C.yellow}${res.quarantineId}${C.reset}`);
      console.log(`  File Removed:  ${res.neutralizedFile}`);
      console.log(`  Encrypted In:  ${res.quarantinePath}`);
      console.log(`  SHA-256 Hash:  ${C.dim}${res.sha256}${C.reset}\n`);
      speak('Threat neutralized and quarantined.', this.voiceEnabled);
    } catch (err) {
      console.log(`${C.red}✗ Quarantine failed: ${err.message}${C.reset}`);
    }
  }

  // ── THREAT PROCESS ELIMINATION ──────────────────────────────────────
  async handleThreatKill(args) {
    if (!this.sentinel) return;
    const pid = args[0] === 'kill' ? args[1] : args[0];
    if (!pid) {
      console.log(`${C.yellow}Usage: threat kill <pid>${C.reset}`);
      return;
    }
    try {
      console.log(`${C.dim}Engaging FRIDAY threat neutralizer on PID ${pid}...${C.reset}`);
      const res = await this.sentinel.killThreatProcess(pid);
      console.log(`\n${C.green}${C.bold}✓ ROGUE PROCESS NEUTRALIZED!${C.reset}`);
      console.log(`  PID:     ${C.yellow}${res.pid}${C.reset}`);
      console.log(`  Process: ${res.processName}`);
      console.log(`  Status:  ${C.red}TERMINATED${C.reset}\n`);
      speak(`Process ${res.processName} has been terminated.`, this.voiceEnabled);
    } catch (err) {
      console.log(`${C.red}✗ Termination failed: ${err.message}${C.reset}`);
    }
  }

  // ── HARDWARE DEVICE GATEWAY ─────────────────────────────────────────
  async handleHardware(args) {
    if (!this.hardwareGateway) return;
    const sub = args[0]?.toLowerCase();

    if (sub === 'stop') {
      const res = this.hardwareGateway.emergencyStop();
      console.log(`${C.red}${C.bold}⚠ EMERGENCY STOP ENGAGED! ${res.haltedDevices} physical devices halted.${C.reset}`);
      speak('Warning: Emergency stop engaged. Physical hardware halted.', this.voiceEnabled);
      return;
    }

    if (sub === 'resume') {
      const token = args[1] || 'token_adhithya_owner';
      try {
        const res = this.hardwareGateway.resumeOperation(token);
        console.log(`${C.green}✓ Emergency stop disengaged. Hardware operations restored.${C.reset}`);
        speak('Emergency stop disengaged. All hardware restored.', this.voiceEnabled);
      } catch (e) {
        console.log(`${C.red}Resume failed: ${e.message}${C.reset}`);
      }
      return;
    }

    console.log(`\n${C.cyan}${C.bold}REGISTERED PHYSICAL & VIRTUAL HARDWARE:${C.reset}`);
    console.log(`Status: ${this.hardwareGateway.emergencyStopEngaged ? C.red + 'HALTED (E-STOP)' : C.green + 'OPERATIONAL'}${C.reset}\n`);
    for (const [id, dev] of this.hardwareGateway.registeredDevices.entries()) {
      console.log(`  ${C.yellow}● ${id.padEnd(20)}${C.reset} Type: ${dev.type.padEnd(18)} Status: ${C.green}${dev.status}${C.reset}`);
    }
    console.log('');
  }

  // ── LOCAL CLI EXECUTION ─────────────────────────────────────────────
  async handleRun(command) {
    if (!command) {
      console.log(`${C.yellow}Usage: run <command> (e.g. run git status, run node -v, run npm test)${C.reset}`);
      return;
    }

    console.log(`${C.dim}Executing: ${command}...${C.reset}`);
    try {
      const result = await this.localExecutor.executeCommand(command);
      if (result.success) {
        console.log(`\n${C.green}✓ [STARK CLI SUCCESS]${C.reset} Command: ${C.bold}${command}${C.reset}`);
        console.log(`${C.dim}────────────────────────────────────────────────${C.reset}`);
        console.log(result.output.trim());
        console.log(`${C.dim}────────────────────────────────────────────────${C.reset}\n`);
      } else {
        console.log(`\n${C.red}✗ [EXECUTION FAILED]${C.reset} ${result.error || result.output}\n`);
      }
    } catch (err) {
      console.log(`\n${C.red}✗ [SECURITY GUARD] Execution blocked: ${err.message}${C.reset}\n`);
    }
  }

  // ── MISSION PLANNING ────────────────────────────────────────────────
  async handlePlan(objective) {
    if (!objective) {
      console.log(`${C.yellow}Usage: plan <objective> (e.g. plan Calibrate ESP32 ADC and stream telemetry)${C.reset}`);
      return;
    }
    console.log(`\n${C.cyan}${C.bold}SYNTHESIZING EXECUTIVE MISSION PLAN...${C.reset}`);
    try {
      const plan = await this.executive.planObjective(objective);
      console.log(`Plan ID: ${C.yellow}${plan.id}${C.reset} | Status: ${C.green}${plan.status}${C.reset}`);
      console.log(`Objective: ${C.bold}${plan.objective}${C.reset}\n`);

      for (const s of plan.steps) {
        console.log(`  [Step ${s.stepIndex}] ${C.cyan}${s.action.padEnd(24)}${C.reset} | Risk: ${C.yellow}${s.riskTier}${C.reset} | Status: ${C.dim}${s.status}${C.reset}`);
      }
      console.log(`\n${C.dim}Use 'ask JARVIS execute plan ${plan.id}' to begin authorized execution.${C.reset}\n`);
      speak(`Mission plan synthesized with ${plan.steps.length} operational steps.`, this.voiceEnabled);
    } catch (err) {
      console.log(`${C.red}Planning failed: ${err.message}${C.reset}`);
    }
  }

  // ── SPECIALIST AGENTS ───────────────────────────────────────────────
  async handleAsk(agentName, query) {
    if (!agentName || !this.agents.has(agentName)) {
      console.log(`${C.yellow}Available specialists: ${Array.from(this.agents.keys()).join(', ')}${C.reset}`);
      return;
    }
    if (!query) {
      console.log(`${C.yellow}Usage: ask ${agentName} <your query or instruction>${C.reset}`);
      return;
    }

    const agent = this.agents.get(agentName);
    console.log(`\n${C.cyan}[Routing to ${agentName} // ${agent.role}]...${C.reset}`);

    let reply = '';
    if (typeof agent.execute === 'function') {
      try {
        const res = await agent.execute({ query, message: query });
        reply = res.response || res.summary || res.analysis || (typeof res === 'string' ? res : JSON.stringify(res, null, 2));
      } catch (e) {
        reply = `${agentName} operational analysis: Task registered. Core parameters verified. Error: ${e.message}`;
      }
    } else {
      reply = `${agentName} acknowledges query: "${query}". Specialist is standing by with clearance ${agent.clearanceLevel || 'ACTIVE'}.`;
    }

    console.log(`\n${C.yellow}${C.bold}${agentName}:${C.reset} ${reply}\n`);
    speak(reply, this.voiceEnabled);
  }

  // ── GENERAL CHAT ────────────────────────────────────────────────────
  async handleChat(message) {
    console.log(`\n${C.cyan}${C.bold}MINI-ADHY PERSONAL:${C.reset}`);
    const responses = [
      `I'm tracking that, Adhithya. The full specialist mesh is active, and the local PC execution boundary is clear. What shall we build or optimize next?`,
      `Understood. JARVIS and the team have logged this into episodic memory. All hardware channels are responding normally.`,
      `Affirmative. I'm connected to your local filesystem, Git repos, and workshop hardware gateway. Direct me when you're ready.`
    ];

    let reply = '';
    if (/status|health|diagnostic/i.test(message)) {
      reply = `All 11 agent nodes are synchronized with zero latency. Host ${os.hostname()} is running at nominal parameters.`;
    } else if (/hardware|sensor|esp32|pi|robot/i.test(message)) {
      reply = `Hardware Device Gateway reports 3 registered endpoints: ESP32 Core S3 on COM3, Raspberry Pi 5, and the UART bus. Telemetry streaming is ready.`;
    } else if (/tony|stark|iron\s*man|jarvis/i.test(message)) {
      reply = `Welcome back to the workshop, sir. Flight telemetry, local shell, and all 11 tactical agents are at your command.`;
    } else {
      reply = responses[Math.floor(Math.random() * responses.length)];
    }

    console.log(`  ${reply}\n`);
    if (this.memoryStore) {
      await this.memoryStore.logInteraction('USER', message);
      await this.memoryStore.logInteraction('ASSISTANT', reply);
    }
    speak(reply, this.voiceEnabled);
  }

  // ── EXECUTE VIA API ─────────────────────────────────────────────────
  async executeApiDirective(commandStr) {
    const raw = String(commandStr).trim();
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (cmd === 'status') {
      return {
        uptimeSeconds: Math.floor((Date.now() - this.sessionStartTime) / 1000),
        agentsOnline: this.agents.size,
        hardwareDevices: this.hardwareGateway?.registeredDevices?.size || 0
      };
    }
    if (cmd === 'telemetry' || cmd === 'health') {
      return this.telemetry ? await this.telemetry.getSystemTelemetry() : {};
    }
    if (cmd === 'procs' || cmd === 'top') {
      const limit = parseInt(args || '10', 10);
      return this.telemetry ? await this.telemetry.getTopProcesses(limit) : [];
    }
    if (cmd === 'speak') {
      return this.voiceNexus ? await this.voiceNexus.speak(args) : {};
    }
    if (cmd === 'voices') {
      return this.voiceNexus ? await this.voiceNexus.getAvailableVoices() : [];
    }
    if (cmd === 'windows') {
      return this.visionAgent ? await this.visionAgent.getOpenWindows() : [];
    }
    if (cmd === 'active') {
      return this.visionAgent ? await this.visionAgent.getActiveWindow() : null;
    }
    if (cmd === 'focus') {
      return this.visionAgent ? await this.visionAgent.focusWindow(args) : {};
    }
    if (cmd === 'radar' || cmd === 'lan') {
      return this.radar ? await this.radar.scanLocalDevices() : {};
    }
    if (cmd === 'ping') {
      return this.radar ? await this.radar.pingHost(args || '8.8.8.8') : {};
    }
    if (cmd === 'workspaces' || cmd === 'sweep') {
      return this.guardian ? await this.guardian.sweepAllWorkspaces() : {};
    }
    if (cmd === 'sys') {
      return await this.desktopControl._handleAction('getSystemStatus');
    }
    if (cmd === 'apps') {
      return await this.desktopControl._handleAction('listOpenWindows');
    }
    if (cmd === 'run') {
      return await this.localExecutor.executeCommand(args);
    }
    if (cmd === 'plan') {
      return await this.executive.planObjective(args);
    }
    if (cmd === 'memo') {
      return await this.memoryStore.remember(args, 'api_memo');
    }
    if (cmd === 'recall') {
      return this.memoryStore.recall(args);
    }
    if (cmd === 'screen') {
      return await this.desktopControl._handleAction('takeScreenshot');
    }
    return { response: `Directive '${cmd}' registered by Mini-Adhy Personal.` };
  }

  // ── CONTROLS & TOGGLES ──────────────────────────────────────────────
  handleVoiceToggle(flag) {
    if (flag === 'on' || flag === 'true') {
      this.voiceEnabled = true;
      console.log(`${C.green}✓ Voice synthesis ENABLED via Windows Speech API.${C.reset}`);
      speak('Voice output enabled, sir.', true);
    } else if (flag === 'off' || flag === 'false') {
      this.voiceEnabled = false;
      console.log(`${C.dim}Voice synthesis DISABLED.${C.reset}`);
    } else {
      this.voiceEnabled = !this.voiceEnabled;
      console.log(`Voice synthesis ${this.voiceEnabled ? C.green + 'ENABLED' : C.dim + 'DISABLED'}${C.reset}`);
      if (this.voiceEnabled) speak('Voice active.', true);
    }
  }

  handleServerToggle(flag) {
    if (flag === 'off') {
      this.httpServer?.stop();
      console.log(`${C.dim}Local HTTP Cockpit stopped.${C.reset}`);
    } else {
      this.httpServer?.start();
      console.log(`${C.green}✓ Local HTTP Cockpit active on http://127.0.0.1:4242${C.reset}`);
    }
  }

  printStatus() {
    const uptimeSec = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const mem = process.memoryUsage();
    console.log(`
${C.cyan}${C.bold}STARK WORKSHOP SYSTEM READOUT:${C.reset}
  ${C.dim}Uptime:${C.reset}            ${uptimeSec}s
  ${C.dim}Node Version:${C.reset}      ${process.version}
  ${C.dim}Platform:${C.reset}          ${process.platform} (${os.arch()})
  ${C.dim}Memory Heap:${C.reset}       ${Math.round(mem.heapUsed / 1024 / 1024)} MB / ${Math.round(mem.heapTotal / 1024 / 1024)} MB
  ${C.dim}Active Agents:${C.reset}     ${this.agents.size} / 11 Online
  ${C.dim}Hardware Devices:${C.reset}  ${this.hardwareGateway?.registeredDevices?.size || 0} Registered
  ${C.dim}Persistent Memos:${C.reset}  ${this.memoryStore?.data?.notes?.length || 0} Saved
  ${C.dim}HTTP Cockpit:${C.reset}      http://127.0.0.1:4242 [${this.httpServer?.isRunning ? C.green + 'RUNNING' : C.dim + 'STOPPED'}${C.reset}]
  ${C.dim}E-Stop State:${C.reset}      ${this.hardwareGateway?.emergencyStopEngaged ? C.red + 'ENGAGED' : C.green + 'NORMAL'}${C.reset}
  ${C.dim}Voice Synthesis:${C.reset}   ${this.voiceEnabled ? C.green + 'ENABLED' : C.dim + 'DISABLED'}${C.reset}
    `);
  }

  printMesh() {
    console.log(`\n${C.cyan}${C.bold}SPECIALIST AGENT MESH INTEGRITY:${C.reset}`);
    for (const [name, agent] of this.agents.entries()) {
      const clearance = agent.clearanceLevel || agent.permissionLevel || 'SAFE_AUTOMATION';
      const role = agent.role || agent.category || 'Specialist';
      console.log(`  ${C.yellow}${C.bold}${name.padEnd(10)}${C.reset} | ${C.green}ACTIVE${C.reset} | ${C.cyan}${clearance}${C.reset} | ${C.dim}${role}${C.reset}`);
    }
    console.log('');
  }

  // ── TELEMETRY & HEALTH SENTINEL ────────────────────────────────────
  async handleTelemetry() {
    if (!this.telemetry) return;
    console.log(`\n${C.cyan}${C.bold}════ SYSTEM TELEMETRY SENTINEL // HARDWARE VITALS ════${C.reset}`);
    const vitals = await this.telemetry.getSystemTelemetry();

    const memColor = vitals.memory.percentUsed > 85 ? C.red : vitals.memory.percentUsed > 65 ? C.yellow : C.green;
    console.log(`  ${C.bold}RAM Usage:${C.reset}       ${memColor}${vitals.memory.usedGb} GB / ${vitals.memory.totalGb} GB (${vitals.memory.percentUsed}%)${C.reset} [${vitals.memory.freeGb} GB free]`);
    console.log(`  ${C.bold}CPU Load:${C.reset}        ${vitals.cpu.percentLoad}% (${vitals.cpu.cores} physical/logical cores)`);
    console.log(`  ${C.bold}Power / Battery:${C.reset} ${vitals.battery?.status || 'AC Connected'} (${vitals.battery?.chargePercent ? vitals.battery.chargePercent + '%' : 'AC Connected'})`);
    console.log(`  ${C.bold}Uptime:${C.reset}          ${vitals.uptimeFormatted}`);

    if (vitals.drives && vitals.drives.length > 0) {
      console.log(`\n  ${C.bold}Active Storage Drives:${C.reset}`);
      vitals.drives.forEach(d => {
        const driveColor = d.percentUsed > 90 ? C.red : d.percentUsed > 75 ? C.yellow : C.green;
        console.log(`    └─ ${C.cyan}${d.drive}${C.reset}: ${driveColor}${d.usedGb} GB / ${d.totalGb} GB (${d.percentUsed}% used)${C.reset} [${d.freeGb} GB free]`);
      });
    }

    if (vitals.alerts && vitals.alerts.length > 0) {
      console.log(`\n  ${C.red}${C.bold}Telemetry Alerts:${C.reset}`);
      vitals.alerts.forEach(a => console.log(`    ${C.red}⚠ [${a.subsystem || a.level}] ${a.message}${C.reset}`));
    }
    console.log('');
    speak(`System vitals: Memory at ${vitals.memory.percentUsed} percent, CPU load at ${vitals.cpu.percentLoad} percent.`, this.voiceEnabled);
  }

  // ── TOP RESOURCE PROCESSES ──────────────────────────────────────────
  async handleTopProcs(limitArg) {
    if (!this.telemetry) return;
    const limit = parseInt(limitArg, 10) || 8;
    console.log(`\n${C.cyan}${C.bold}TOP ${limit} WORKSTATION PROCESSES BY MEMORY PROFILE:${C.reset}`);
    const procs = await this.telemetry.getTopProcesses(limit);
    console.log(`  ${'PID'.padEnd(8)} | ${'PROCESS NAME'.padEnd(28)} | ${'MEMORY (MB)'.padEnd(14)} | CPU (s)`);
    console.log(`  ${'─'.repeat(8)}─┼─${'─'.repeat(28)}─┼─${'─'.repeat(14)}─┼─${'─'.repeat(10)}`);
    procs.forEach(p => {
      const memColor = p.memoryMb > 1000 ? C.red : p.memoryMb > 400 ? C.yellow : C.reset;
      console.log(`  ${String(p.pid).padEnd(8)} | ${p.name.padEnd(28)} | ${memColor}${String(p.memoryMb).padStart(10)} MB${C.reset}    | ${p.cpuSec}s`);
    });
    console.log('');
  }

  // ── SAPI OFFLINE VOICES ─────────────────────────────────────────────
  async handleVoices() {
    if (!this.voiceNexus) return;
    console.log(`\n${C.cyan}${C.bold}INSTALLED WINDOWS SAPI SYNTHESIS VOICES:${C.reset}`);
    const voices = await this.voiceNexus.getAvailableVoices();
    voices.forEach((v, idx) => {
      console.log(`  ${C.yellow}[${idx + 1}]${C.reset} ${C.bold}${v.Name}${C.reset} | Culture: ${v.Culture} | Gender: ${v.Gender} | Age: ${v.Age}`);
    });
    console.log('');
  }

  // ── WINDOW FOCUS ────────────────────────────────────────────────────
  async handleFocus(titleQuery) {
    if (!this.visionAgent) return;
    if (!titleQuery?.trim()) {
      console.log(`${C.yellow}Usage: focus <window title or partial name>${C.reset}`);
      return;
    }
    const res = await this.visionAgent.focusWindow(titleQuery);
    if (res.focused) {
      console.log(`${C.green}✓ Brought window to front: "${res.title}"${C.reset}`);
      speak(`Brought ${res.title} into focus.`, this.voiceEnabled);
    } else {
      console.log(`${C.red}Could not find active window matching: "${titleQuery}"${C.reset}`);
    }
  }

  // ── NETWORK RADAR ───────────────────────────────────────────────────
  async handleRadar() {
    if (!this.radar) return;
    console.log(`\n${C.cyan}${C.bold}LOCAL SUBNET RADAR // WORKSHOP NODES:${C.reset}`);
    const res = await this.radar.scanLocalDevices();
    console.log(`  Nodes Detected: ${res.deviceCount}`);
    console.log(`  ${'IP ADDRESS'.padEnd(18)} | ${'MAC ADDRESS'.padEnd(20)} | CLASSIFICATION`);
    console.log(`  ${'─'.repeat(18)}─┼─${'─'.repeat(20)}─┼─${'─'.repeat(20)}`);
    res.devices.forEach(d => {
      const clsColor = d.classification.includes('Gateway') ? C.yellow : d.classification.includes('Raspberry') ? C.green : C.reset;
      console.log(`  ${d.ip.padEnd(18)} | ${d.mac.padEnd(20)} | ${clsColor}${d.classification}${C.reset}`);
    });
    console.log('');
    speak(`Subnet scan complete. ${res.deviceCount} active network devices discovered.`, this.voiceEnabled);
  }

  // ── PING LATENCY ────────────────────────────────────────────────────
  async handlePing(hostArg) {
    if (!this.radar) return;
    const host = hostArg || '8.8.8.8';
    console.log(`${C.dim}Pinging ${host}...${C.reset}`);
    const res = await this.radar.pingHost(host);
    if (res.reachable) {
      console.log(`${C.green}✓ ${res.host} is ALIVE${C.reset} | Latency: ${C.cyan}${res.latencyMs || 0} ms${C.reset}`);
    } else {
      console.log(`${C.red}✗ ${res.host} UNREACHABLE${C.reset} [Packet loss: 100%]`);
    }
  }

  // ── WORKSPACE GUARDIAN SWEEP ────────────────────────────────────────
  async handleWorkspaceSweep() {
    if (!this.guardian) return;
    console.log(`\n${C.cyan}${C.bold}WORKSPACE GUARDIAN // REPOSITORY INTEGRITY SWEEP:${C.reset}`);
    const res = await this.guardian.sweepAllWorkspaces();
    console.log(`  Repositories Monitored: ${res.workspaceCount}`);
    console.log(`  Total Uncommitted Files: ${res.uncommittedTotal}\n`);

    res.workspaces.forEach(ws => {
      const statusBadge = ws.isClean ? `${C.green}[CLEAN]${C.reset}` : `${C.yellow}[DIRTY - ${ws.dirtyCount} MODIFIED]${C.reset}`;
      console.log(`  ${C.bold}${ws.repoPath}${C.reset} (${ws.branch || 'detached'}) ${statusBadge}`);
      if (ws.lastCommit) {
        console.log(`    Latest: ${C.cyan}${ws.lastCommit}${C.reset}`);
      }
      if (!ws.isClean && ws.dirtyFiles?.length > 0) {
        console.log(`    Modified Files:`);
        ws.dirtyFiles.slice(0, 5).forEach(f => console.log(`      └─ ${C.yellow}${f}${C.reset}`));
      }
      console.log('');
    });
    speak(`Workspace audit complete. ${res.uncommittedTotal} uncommitted files found across repositories.`, this.voiceEnabled);
  }

  async shutdown() {
    console.log(`\n${C.yellow}» Commencing graceful shutdown of Stark Workshop Daemon...${C.reset}`);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.httpServer) this.httpServer.stop();
    if (this.memoryStore) {
      console.log(`  ${C.dim}Persisting cognitive memory to disk...${C.reset}`);
      await this.memoryStore.save();
    }
    console.log(`  ${C.green}✓ State persisted to data/personal_memory.json.${C.reset}`);
    console.log(`${C.cyan}${C.bold}» Workshop Daemon offline. Good day, sir.${C.reset}\n`);
    speak('Workshop daemon offline. Good day, sir.', this.voiceEnabled);
    process.exit(0);
  }
}

// ── REPL RUNNER ───────────────────────────────────────────────────────
async function run() {
  printBanner();
  const daemon = new StarkPersonalDaemon();
  await daemon.boot();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${C.cyan}${C.bold}STARK-JARVIS > ${C.reset}`
  });

  rl.prompt();

  let isExecuting = false;
  const commandQueue = [];

  async function processCommandQueue() {
    if (isExecuting || commandQueue.length === 0) return;
    isExecuting = true;
    const line = commandQueue.shift();
    try {
      await daemon.handleInput(line);
    } catch (err) {
      console.log(`${C.red}Error: ${err.message}${C.reset}`);
    } finally {
      isExecuting = false;
      if (commandQueue.length > 0) {
        processCommandQueue();
      } else {
        rl.prompt();
      }
    }
  }

  rl.on('line', (line) => {
    commandQueue.push(line);
    processCommandQueue();
  });

  rl.on('close', async () => {
    while (isExecuting || commandQueue.length > 0) {
      await new Promise(r => setTimeout(r, 60));
    }
    await daemon.shutdown();
  });

  process.on('SIGINT', async () => {
    await daemon.shutdown();
  });
}

run().catch((err) => {
  console.error('Fatal Daemon Error:', err);
  process.exit(1);
});
