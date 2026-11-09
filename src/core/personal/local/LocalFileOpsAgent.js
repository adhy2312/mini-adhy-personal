/**
 * ════════════════════════════════════════════════════════════════════
 *  LOCAL FILE OPS AGENT — CODEBASE & WORKSPACE INTELLIGENCE
 * ════════════════════════════════════════════════════════════════════
 * Gives Mini-Adhy Personal direct, high-level file system and Git tools:
 * - Search files across projects
 * - Read code and configs
 * - Write/edit documents safely
 * - Check Git branch and worktree health
 */

import { promises as fs } from 'node:fs';
import { resolve, relative, join, basename } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export class LocalFileOpsAgent {
  constructor(options = {}) {
    this.name = 'LocalFileOpsAgent';
    this.baseDirectory = options.baseDirectory || 'd:\\portfolio';
  }

  /**
   * Search for files matching keyword or extension
   */
  async findFiles(keyword, searchDir = this.baseDirectory, maxResults = 25) {
    const results = [];
    const term = String(keyword || '').toLowerCase();

    async function walk(dir) {
      if (results.length >= maxResults) return;
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const ent of entries) {
          if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'build' || ent.name === 'dist') {
            continue;
          }
          const full = join(dir, ent.name);
          if (ent.isDirectory()) {
            await walk(full);
          } else if (ent.name.toLowerCase().includes(term) || full.toLowerCase().includes(term)) {
            results.push({
              name: ent.name,
              path: full,
              relative: relative(searchDir, full)
            });
            if (results.length >= maxResults) break;
          }
        }
      } catch {}
    }

    await walk(searchDir);
    return { query: keyword, found: results.length, files: results };
  }

  /**
   * Read file content safely with line limits
   */
  async readFile(filePath, maxLines = 150) {
    try {
      const fullPath = resolve(filePath);
      const text = await fs.readFile(fullPath, 'utf8');
      const lines = text.split('\n');
      const truncated = lines.length > maxLines;
      const preview = lines.slice(0, maxLines).join('\n');

      return {
        success: true,
        path: fullPath,
        filename: basename(fullPath),
        totalLines: lines.length,
        truncated,
        content: preview
      };
    } catch (err) {
      return { success: false, error: err.message, path: filePath };
    }
  }

  /**
   * Write or edit a file
   */
  async writeFile(filePath, content, options = {}) {
    try {
      const fullPath = resolve(filePath);
      await fs.writeFile(fullPath, content, 'utf8');
      return {
        success: true,
        path: fullPath,
        bytesWritten: Buffer.byteLength(content, 'utf8'),
        timestamp: Date.now()
      };
    } catch (err) {
      return { success: false, error: err.message, path: filePath };
    }
  }

  /**
   * Inspect Git status of a repository
   */
  async getGitStatus(repoPath = this.baseDirectory) {
    try {
      const { stdout: statusOut } = await execAsync('git status -s', { cwd: repoPath, timeout: 5000 });
      const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: repoPath, timeout: 3000 });
      const dirtyFiles = statusOut.trim().split(/\r?\n/).filter(Boolean);

      return {
        success: true,
        repo: repoPath,
        branch: branchOut.trim() || 'main',
        isClean: dirtyFiles.length === 0,
        dirtyCount: dirtyFiles.length,
        files: dirtyFiles.slice(0, 15)
      };
    } catch (err) {
      return { success: false, error: err.message, repo: repoPath };
    }
  }

  /**
   * List directory contents with metadata
   */
  async listDirectory(dirPath = this.baseDirectory) {
    try {
      const full = resolve(dirPath);
      const entries = await fs.readdir(full, { withFileTypes: true });
      const items = await Promise.all(
        entries.map(async (e) => {
          let size = 0;
          try {
            const stat = await fs.stat(join(full, e.name));
            size = stat.size;
          } catch {}
          return {
            name: e.name,
            isDirectory: e.isDirectory(),
            size
          };
        })
      );
      return { path: full, totalItems: items.length, items };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default LocalFileOpsAgent;

