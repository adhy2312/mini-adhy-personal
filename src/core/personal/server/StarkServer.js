/**
 * ════════════════════════════════════════════════════════════════════
 *  STARK SERVER v3.0 — HIGH-LEVEL LOCAL HTTP API & CYBER HUD COCKPIT
 * ════════════════════════════════════════════════════════════════════
 * Exposes a zero-dependency local HTTP API on port 4242 connecting
 * the workstation, browser, and scripts to Mini-Adhy's core engines:
 * • Telemetry: CPU, RAM, Disk, and Process health
 * • Voice: 100% offline Windows speech synthesis (SAPI)
 * • Vision: Open windows, active focus, and OCR extraction
 * • Network Radar: Subnet device discovery & ping latency
 * • Workspace Guardian: Git integrity across developer folders
 * • Security: Stark Malware Defense Sentinel scanner & quarantine
 */

import http from 'node:http';
import url from 'node:url';

export class StarkServer {
  constructor(daemon, port = 4242) {
    this.daemon = daemon;
    this.port = port;
    this.server = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;

    this.server = http.createServer(async (req, res) => {
      const origin = req.headers.origin;
      const isLocalOrigin = !origin || 
        origin.startsWith('http://localhost') || 
        origin.startsWith('http://127.0.0.1') || 
        origin.startsWith('https://localhost');

      if (origin && isLocalOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:' + this.port);
      } else {
        // Block cross-origin requests from external internet websites
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FORBIDDEN_CROSS_ORIGIN: Local cockpit only accepts loopback origins.' }));
        return;
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const parsedUrl = url.parse(req.url, true);
      const pathname = parsedUrl.pathname;

      try {
        // ── 1. API: STATUS ──
        if (pathname === '/api/status' && req.method === 'GET') {
          const status = {
            status: 'ONLINE',
            daemon: 'Stark Workshop Daemon v3.0',
            uptimeSeconds: Math.floor((Date.now() - this.daemon.sessionStartTime) / 1000),
            agentsOnline: this.daemon.agents.size,
            hardwareDevices: this.daemon.hardwareGateway?.registeredDevices?.size || 0,
            eStopActive: Boolean(this.daemon.hardwareGateway?.emergencyStopEngaged),
            voiceEnabled: Boolean(this.daemon.voiceEnabled),
            timestamp: Date.now()
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(status, null, 2));
          return;
        }

        // ── 2. API: TELEMETRY ──
        if (pathname === '/api/telemetry/system' && req.method === 'GET') {
          const data = this.daemon.telemetry ? await this.daemon.telemetry.getSystemTelemetry() : {};
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data, null, 2));
          return;
        }

        if (pathname === '/api/telemetry/processes' && req.method === 'GET') {
          const limit = parseInt(parsedUrl.query.limit || '10', 10);
          const procs = this.daemon.telemetry ? await this.daemon.telemetry.getTopProcesses(limit) : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ total: procs.length, processes: procs }, null, 2));
          return;
        }

        // ── 3. API: VOICE SYNTHESIS ──
        if (pathname === '/api/voice/speak' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const text = data.text || data.message;
              if (!text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing text parameter.' }));
                return;
              }
              const result = this.daemon.voiceNexus 
                ? await this.daemon.voiceNexus.speak(text, data)
                : { success: false, error: 'Voice Nexus not initialized.' };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result, null, 2));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        if (pathname === '/api/voice/voices' && req.method === 'GET') {
          const voices = this.daemon.voiceNexus ? await this.daemon.voiceNexus.getAvailableVoices() : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ count: voices.length, voices }, null, 2));
          return;
        }

        // ── 4. API: VISION & WINDOWS ──
        if (pathname === '/api/vision/windows' && req.method === 'GET') {
          const windows = this.daemon.visionAgent ? await this.daemon.visionAgent.getOpenWindows() : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ count: windows.length, windows }, null, 2));
          return;
        }

        if (pathname === '/api/vision/active' && req.method === 'GET') {
          const win = this.daemon.visionAgent ? await this.daemon.visionAgent.getActiveWindow() : null;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ activeWindow: win }, null, 2));
          return;
        }

        // ── 5. API: LOCAL NETWORK RADAR ──
        if (pathname === '/api/radar/scan' && req.method === 'GET') {
          const radarData = this.daemon.radar ? await this.daemon.radar.scanLocalDevices() : {};
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(radarData, null, 2));
          return;
        }

        if (pathname === '/api/radar/ping' && req.method === 'GET') {
          const host = parsedUrl.query.host || '8.8.8.8';
          const pingResult = this.daemon.radar ? await this.daemon.radar.pingHost(host) : {};
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(pingResult, null, 2));
          return;
        }

        // ── 6. API: WORKSPACE GUARDIAN ──
        if (pathname === '/api/workspace/status' && req.method === 'GET') {
          const status = this.daemon.guardian ? await this.daemon.guardian.sweepAllWorkspaces() : {};
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(status, null, 2));
          return;
        }

        // ── 7. API: MALWARE DEFENSE SENTINEL ──
        if (pathname === '/api/security/scan' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const targetPath = data.path || process.cwd();
              const scanResult = this.daemon.sentinel ? await this.daemon.sentinel.scanPath(targetPath) : {};
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(scanResult, null, 2));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        if (pathname === '/api/security/quarantine' && req.method === 'GET') {
          const list = this.daemon.sentinel ? this.daemon.sentinel.listQuarantined() : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ count: list.length, items: list }, null, 2));
          return;
        }

        // ── 8. API: AGENTS MESH ──
        if (pathname === '/api/agents' && req.method === 'GET') {
          const mesh = [];
          for (const [name, agent] of this.daemon.agents.entries()) {
            mesh.push({
              name,
              status: 'ONLINE',
              role: agent.role || 'Specialist',
              clearance: agent.clearanceLevel || 'SAFE_AUTOMATION',
              rank: agent.rank || 'Specialist'
            });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ total: mesh.length, agents: mesh }, null, 2));
          return;
        }

        // ── 9. API: MEMORIES ──
        if (pathname === '/api/memories' && req.method === 'GET') {
          const q = parsedUrl.query.q || '';
          const notes = this.daemon.memoryStore ? this.daemon.memoryStore.recall(q, 20) : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ query: q, count: notes.length, notes }, null, 2));
          return;
        }

        // ── 10. API: DIRECTIVE COMMAND (POST) ──
        if (pathname === '/api/command' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const cmd = data.command;
              if (!cmd) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing command parameter.' }));
                return;
              }
              const result = await this.daemon.executeApiDirective(cmd);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, command: cmd, result }, null, 2));
            } catch (cmdErr) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: cmdErr.message }));
            }
          });
          return;
        }

        // ── 11. API v1: COMPUTER OPERATOR & SYSTEM AUTOMATION (PHASE 1) ──
        if (pathname === '/api/v1/system/telemetry' && req.method === 'GET') {
          const telemetry = this.daemon.computerOperator
            ? await this.daemon.computerOperator.getSystemTelemetry()
            : (this.daemon.telemetry ? await this.daemon.telemetry.getSystemTelemetry() : {});
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ version: '1.0', telemetry }, null, 2));
          return;
        }

        if (pathname === '/api/v1/system/emergency-stop' && req.method === 'POST') {
          const stopResult = this.daemon.computerOperator
            ? this.daemon.computerOperator.emergencyStop()
            : { status: 'EMERGENCY_STOP_RECORDED' };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, action: 'EMERGENCY_STOP', result: stopResult }, null, 2));
          return;
        }

        if (pathname === '/api/v1/applications/launch' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const app = data.application || data.app;
              if (!app) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing application name.' }));
                return;
              }
              const result = this.daemon.computerOperator
                ? await this.daemon.computerOperator.launchApplication(app, data.args || [])
                : { success: false, error: 'ComputerOperator not available.' };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result, null, 2));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── 12. DEFAULT: CYBER HUD COCKPIT HTML ──
        if (pathname === '/' && req.method === 'GET') {
          const html = this._generateHudHtml();
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
          return;
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Endpoint not found.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    this.server.listen(this.port, '127.0.0.1', () => {
      this.isRunning = true;
    });

    this.server.on('error', (e) => {
      console.warn(`[StarkServer] Port ${this.port} unavailable: ${e.message}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.isRunning = false;
    }
  }

  _generateHudHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>STARK WORKSHOP COCKPIT v3.0 // MINI-ADHY</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
    body { background: #030712; color: #e0f2fe; padding: 24px; min-height: 100vh; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(14,165,233,0.3); padding-bottom:16px; margin-bottom:24px; }
    .title { font-size:1.35rem; font-weight:800; color:#38bdf8; letter-spacing:0.08em; display:flex; align-items:center; gap:10px; }
    .badge { padding:4px 14px; background:rgba(14,165,233,0.15); border:1px solid #38bdf8; border-radius:9999px; font-size:0.75rem; font-weight:700; color:#38bdf8; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:18px; margin-bottom:24px; }
    .card { background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:18px; box-shadow:0 8px 24px rgba(0,0,0,0.4); position:relative; overflow:hidden; }
    .card h3 { font-size:0.8rem; color:#0284c7; letter-spacing:0.08em; margin-bottom:10px; display:flex; justify-content:space-between; }
    .stat { font-size:1.6rem; font-weight:800; color:#ffffff; }
    .stat-sub { font-size:0.72rem; color:#94a3b8; margin-top:4px; }
    .voice-box { display:flex; gap:10px; margin-bottom:18px; background:rgba(15,23,42,0.6); padding:14px; border-radius:12px; border:1px solid rgba(56,189,248,0.2); }
    .input-box { display:flex; gap:10px; margin-bottom:18px; }
    input { flex:1; background:rgba(15,23,42,0.9); border:1px solid #0284c7; border-radius:8px; padding:12px 16px; color:#ffffff; font-size:0.88rem; outline:none; }
    input:focus { border-color:#38bdf8; box-shadow:0 0 10px rgba(56,189,248,0.3); }
    button { background:#0284c7; color:#fff; border:none; border-radius:8px; padding:12px 20px; font-weight:700; cursor:pointer; transition:all 0.15s ease; font-size:0.82rem; }
    button:hover { background:#0369a1; transform:translateY(-1px); }
    .btn-voice { background:#10b981; }
    .btn-voice:hover { background:#059669; }
    .btn-sec { background:#dc2626; }
    .btn-sec:hover { background:#b91c1c; }
    pre { background:#020617; padding:14px; border-radius:10px; border:1px solid rgba(56,189,248,0.2); font-size:0.78rem; overflow:auto; max-height:260px; color:#7dd3fc; line-height:1.45; }
    .hud-tabs { display:flex; gap:8px; margin-bottom:12px; }
    .tab { padding:6px 14px; border-radius:6px; background:rgba(255,255,255,0.06); font-size:0.75rem; font-weight:700; cursor:pointer; color:#94a3b8; border:1px solid transparent; }
    .tab:hover, .tab.active { background:rgba(14,165,233,0.2); color:#38bdf8; border-color:rgba(56,189,248,0.3); }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">⚡ STARK WORKSHOP COCKPIT v3.0 // MINI-ADHY</div>
    <div class="badge">● ONLINE // 127.0.0.1:4242</div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>SPECIALIST MESH <span>JARVIS &amp; ULTRON</span></h3>
      <div class="stat">${this.daemon.agents.size} AGENTS</div>
      <div class="stat-sub">Sovereign autonomous coordination</div>
    </div>
    <div class="card">
      <h3>HARDWARE NEXUS <span>UART / GPIO</span></h3>
      <div class="stat">${this.daemon.hardwareGateway?.registeredDevices?.size || 0} DEVICES</div>
      <div class="stat-sub">ESP32 Core S3, Raspberry Pi 5</div>
    </div>
    <div class="card">
      <h3>MALWARE SENTINEL <span>DEFENSE</span></h3>
      <div class="stat" id="statQuarantine">ACTIVE</div>
      <div class="stat-sub">Heuristic sweep &amp; XOR quarantine</div>
    </div>
    <div class="card">
      <h3>PERSISTENT MEMORY <span>SEMANTIC</span></h3>
      <div class="stat">${this.daemon.memoryStore?.data?.notes?.length || 0} MEMOS</div>
      <div class="stat-sub">Long-term life continuity store</div>
    </div>
  </div>

  <!-- Voice Synthesis Nexus -->
  <div class="voice-box">
    <input id="voiceInput" type="text" placeholder="Type words for Jarvis to speak out loud through PC speakers..." />
    <button class="btn-voice" onclick="speakText()">🔊 SPEAK (SAPI)</button>
  </div>

  <!-- Directive Command Form -->
  <div class="input-box">
    <input id="cmdInput" type="text" placeholder="Type directive (e.g. status, telemetry, scan, sweep, windows, memo Meeting at 3pm)..." />
    <button onclick="sendCmd()">EXECUTE DIRECTIVE</button>
  </div>

  <!-- HUD Action Bar -->
  <div class="hud-tabs">
    <button class="tab active" onclick="fetchApi('/api/telemetry/system')">💻 Telemetry</button>
    <button class="tab" onclick="fetchApi('/api/telemetry/processes?limit=8')">⚡ Top Processes</button>
    <button class="tab" onclick="fetchApi('/api/vision/windows')">🪟 Open Windows</button>
    <button class="tab" onclick="fetchApi('/api/radar/scan')">📡 Network Radar</button>
    <button class="tab" onclick="fetchApi('/api/workspace/status')">📁 Workspaces</button>
    <button class="tab" onclick="fetchApi('/api/security/quarantine')">🛡️ Quarantine Vault</button>
  </div>

  <pre id="output">Jarvis Standby Feed. Standing by for directives or telemetry queries...</pre>

  <script>
    async function sendCmd() {
      const input = document.getElementById('cmdInput');
      const val = input.value.trim();
      if(!val) return;
      document.getElementById('output').textContent = 'Executing directive: ' + val + '...';
      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ command: val })
        });
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data.result || data, null, 2);
      } catch(e) {
        document.getElementById('output').textContent = 'Error: ' + e.message;
      }
    }

    async function speakText() {
      const input = document.getElementById('voiceInput');
      const val = input.value.trim();
      if(!val) return;
      document.getElementById('output').textContent = 'Speaking through PC speakers: "' + val + '"...';
      try {
        const res = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text: val })
        });
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
      } catch(e) {
        document.getElementById('output').textContent = 'Speech error: ' + e.message;
      }
    }

    async function fetchApi(endpoint) {
      document.getElementById('output').textContent = 'Querying ' + endpoint + '...';
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
      } catch(e) {
        document.getElementById('output').textContent = 'API Error: ' + e.message;
      }
    }

    document.getElementById('cmdInput').addEventListener('keydown', (e) => {
      if(e.key === 'Enter') sendCmd();
    });
    document.getElementById('voiceInput').addEventListener('keydown', (e) => {
      if(e.key === 'Enter') speakText();
    });
  </script>
</body>
</html>`;
  }
}

export default StarkServer;
