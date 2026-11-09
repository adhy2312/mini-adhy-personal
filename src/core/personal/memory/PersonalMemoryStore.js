/**
 * ════════════════════════════════════════════════════════════════════
 *  PERSONAL MEMORY STORE — PERSISTENT CONTINUITY FOR MINI-ADHY
 * ════════════════════════════════════════════════════════════════════
 * Provides durable file-backed memory across daemon reboots:
 * - Episodic session memories (what happened, conversations, commands)
 * - Semantic knowledge & notes (hardware pinouts, project context, preferences)
 * - Active missions & goals
 * - Automatic atomic JSON persistence
 */

import { promises as fs } from 'node:fs';
import { resolve, dirname } from 'node:path';

export class PersonalMemoryStore {
  constructor(options = {}) {
    this.filePath = options.filePath || resolve(process.cwd(), 'data', 'personal_memory.json');
    this.data = {
      version: '2.0',
      owner: 'Adhithya Mohan',
      createdAt: Date.now(),
      lastSaved: Date.now(),
      preferences: {
        voiceFeedback: true,
        defaultDomain: 'embedded_systems_and_fullstack',
        tone: 'stark_industries_executive'
      },
      projects: {
        portfolio: {
          path: 'd:\\portfolio\\portfolio',
          description: 'Official portfolio website & sovereign AI showroom',
          activeTasks: ['Production hardening verified', 'Glassmorphic live cognition updated']
        },
        mini_adhy_personal: {
          path: 'd:\\portfolio\\mini-adhy-personal',
          description: 'Autonomous personal AI companion & workshop daemon',
          activeTasks: ['Stark daemon operational', 'Hardware gateway integration']
        }
      },
      notes: [],
      episodicLog: [],
      missions: []
    };
    this.isLoaded = false;
  }

  async load() {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content);
      this.data = { ...this.data, ...parsed };
      this.isLoaded = true;
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist yet, save default
        await this.save();
        this.isLoaded = true;
        return true;
      }
      console.warn('[PersonalMemoryStore] Could not load memory file, using in-memory state:', err.message);
      return false;
    }
  }

  async save() {
    try {
      this.data.lastSaved = Date.now();
      await fs.mkdir(dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.warn('[PersonalMemoryStore] Save failed:', err.message);
      return false;
    }
  }

  // ── NOTE & FACT STORAGE ──────────────────────────────────────────────
  async remember(text, category = 'general', tags = []) {
    if (!text) return null;
    const note = {
      id: `memo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      text: String(text).trim(),
      category,
      tags: Array.isArray(tags) ? tags : [tags],
      timestamp: Date.now()
    };
    this.data.notes.push(note);
    if (this.data.notes.length > 500) {
      this.data.notes.shift();
    }
    await this.save();
    return note;
  }

  recall(query = '', limit = 10) {
    if (!query) {
      return this.data.notes.slice(-limit).reverse();
    }
    const q = query.toLowerCase();
    return this.data.notes
      .filter(n => n.text.toLowerCase().includes(q) || n.category.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)))
      .slice(-limit)
      .reverse();
  }

  // ── PROJECT CONTEXT ──────────────────────────────────────────────────
  getProject(key) {
    return this.data.projects[key] || null;
  }

  async setProject(key, details) {
    this.data.projects[key] = {
      ...(this.data.projects[key] || {}),
      ...details,
      updatedAt: Date.now()
    };
    await this.save();
    return this.data.projects[key];
  }

  listProjects() {
    return Object.entries(this.data.projects).map(([key, val]) => ({
      key,
      ...val
    }));
  }

  // ── EPISODIC AUDIT LOG ───────────────────────────────────────────────
  async logInteraction(role, message) {
    this.data.episodicLog.push({
      id: `ep_${Date.now()}`,
      role,
      message: String(message).slice(0, 500),
      timestamp: Date.now()
    });
    if (this.data.episodicLog.length > 300) {
      this.data.episodicLog.shift();
    }
    // Periodic save on every 5 interactions
    if (this.data.episodicLog.length % 5 === 0) {
      await this.save();
    }
  }

  getRecentLogs(count = 10) {
    return this.data.episodicLog.slice(-count);
  }

  // ── MISSIONS ─────────────────────────────────────────────────────────
  async addMission(title, steps = [], priority = 'HIGH') {
    const mission = {
      id: `msn_${Date.now()}`,
      title,
      steps: steps.map((s, idx) => ({ index: idx + 1, task: s, status: 'PENDING' })),
      priority,
      status: 'ACTIVE',
      createdAt: Date.now()
    };
    this.data.missions.push(mission);
    await this.save();
    return mission;
  }

  getActiveMissions() {
    return this.data.missions.filter(m => m.status === 'ACTIVE');
  }

  async completeMission(id) {
    const m = this.data.missions.find(x => x.id === id);
    if (m) {
      m.status = 'COMPLETED';
      m.completedAt = Date.now();
      await this.save();
      return true;
    }
    return false;
  }
}

export default PersonalMemoryStore;

