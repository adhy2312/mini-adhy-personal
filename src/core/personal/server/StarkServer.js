/**
 * ════════════════════════════════════════════════════════════════════
 *  STARK SERVER — LOCAL HTTP API & CYBER HUD COCKPIT
 * ════════════════════════════════════════════════════════════════════
 * Exposes a lightweight, zero-dependency local HTTP API on port 4242
 * so Adhithya can interact with Mini-Adhy via CLI, browser, or scripts.
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
      // CORS headers for local cockpit integration
      res.setHeader('Access-Control-Allow-Origin', '*');
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
            daemon: 'Stark Workshop Daemon v2.5',
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

        // ── 2. API: AGENTS MESH ──
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

        // ── 3. API: MEMORIES ──
        if (pathname === '/api/memories' && req.method === 'GET') {
          const q = parsedUrl.query.q || '';
          const notes = this.daemon.memoryStore ? this.daemon.memoryStore.recall(q, 20) : [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ query: q, count: notes.length, notes }, null, 2));
          return;
        }

        // ── 4. API: COMMAND EXECUTION (POST) ──
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

        // ── 5. DEFAULT: STARK CYBER HUD HTML ──
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
  <title>STARK WORKSHOP COCKPIT // MINI-ADHY</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; }
    body { background: #050b14; color: #e0f2fe; padding: 24px; min-height: 100vh; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(14,165,233,0.3); padding-bottom:16px; margin-bottom:24px; }
    .title { font-size:1.4rem; font-weight:800; color:#38bdf8; letter-spacing:0.1em; }
    .badge { padding:4px 12px; background:rgba(14,165,233,0.2); border:1px solid #38bdf8; border-radius:9999px; font-size:0.75rem; font-weight:700; color:#38bdf8; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; }
    .card { background:rgba(15,23,42,0.85); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:20px; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
    .card h3 { font-size:0.85rem; color:#0284c7; letter-spacing:0.08em; margin-bottom:12px; }
    .stat { font-size:1.8rem; font-weight:800; color:#ffffff; }
    .input-box { display:flex; gap:10px; margin-top:24px; }
    input { flex:1; background:rgba(15,23,42,0.9); border:1px solid #0284c7; border-radius:8px; padding:12px 16px; color:#ffffff; font-size:0.9rem; outline:none; }
    button { background:#0284c7; color:#fff; border:none; border-radius:8px; padding:12px 24px; font-weight:700; cursor:pointer; }
    button:hover { background:#0369a1; }
    pre { background:#030712; padding:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); font-size:0.8rem; overflow:auto; max-height:220px; color:#7dd3fc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">⚡ STARK WORKSHOP COCKPIT // MINI-ADHY</div>
    <div class="badge">● ONLINE // LOCALHOST:4242</div>
  </div>
  <div class="grid">
    <div class="card">
      <h3>SPECIALIST MESH</h3>
      <div class="stat">${this.daemon.agents.size} AGENTS</div>
      <p style="font-size:0.75rem; color:#94a3b8; margin-top:6px;">JARVIS, FRIDAY, EDITH, ULTRON, DUM-E, HERMES, etc.</p>
    </div>
    <div class="card">
      <h3>PHYSICAL HARDWARE</h3>
      <div class="stat">${this.daemon.hardwareGateway?.registeredDevices?.size || 0} DEVICES</div>
      <p style="font-size:0.75rem; color:#94a3b8; margin-top:6px;">ESP32 Core S3, Raspberry Pi 5, UART Bus</p>
    </div>
    <div class="card">
      <h3>PERSISTENT MEMORY</h3>
      <div class="stat">${this.daemon.memoryStore?.data?.notes?.length || 0} MEMOS</div>
      <p style="font-size:0.75rem; color:#94a3b8; margin-top:6px;">Durable episodic and semantic state</p>
    </div>
  </div>
  <div class="input-box">
    <input id="cmdInput" type="text" placeholder="Type a directive (e.g. status, brief, run git status, memo Buy STM32) ..." />
    <button onclick="sendCmd()">EXECUTE</button>
  </div>
  <div style="margin-top:20px;">
    <h3 style="font-size:0.8rem; color:#0284c7; margin-bottom:8px;">TERMINAL FEED</h3>
    <pre id="output">Standing by for directives...</pre>
  </div>
  <script>
    async function sendCmd() {
      const input = document.getElementById('cmdInput');
      const out = document.getElementById('output');
      const val = input.value.trim();
      if(!val) return;
      out.textContent = 'Executing: ' + val + '...';
      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ command: val })
        });
        const data = await res.json();
        out.textContent = JSON.stringify(data.result || data, null, 2);
      } catch(e) {
        out.textContent = 'Error: ' + e.message;
      }
    }
    document.getElementById('cmdInput').addEventListener('keydown', (e) => {
      if(e.key === 'Enter') sendCmd();
    });
  </script>
</body>
</html>`;
  }
}

export default StarkServer;

