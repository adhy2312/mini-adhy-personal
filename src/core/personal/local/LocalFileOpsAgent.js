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
    this.baseDirectory = resolve(options.baseDirectory || 'd:\\portfolio');
    this.allowedRoots = (options.allowedRoots || [this.baseDirectory, process.cwd?.() || '.']).map(r => resolve(r));
    this.backupsEnabled = options.backupsEnabled !== false;
  }

  /**
   * Strictly validates path containment against authorized workspace roots,
   * detecting directory traversal tokens and resolving symlinks to prevent escapes.
   */
  async validatePathContainment(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return { allowed: false, reason: 'File path must be a non-empty string.' };
    }

    const resolved = resolve(filePath);

    // 1. Check if canonical path starts with any allowed root
    const matchesRoot = this.allowedRoots.some(root => {
      const rel = relative(root, resolved);
      return !rel.startsWith('..') && !rel.startsWith('/');
    });

    if (!matchesRoot) {
      return {
        allowed: false,
        reason: `Access Denied: Path '${resolved}' is outside authorized workspace boundaries.`
      };
    }

    // 2. Symlink escape detection via fs.realpath
    try {
      const real = await fs.realpath(resolved);
      const realMatchesRoot = this.allowedRoots.some(root => {
        const rel = relative(root, real);
        return !rel.startsWith('..') && !rel.startsWith('/');
      });
      if (!realMatchesRoot) {
        return {
          allowed: false,
          reason: `Security Escape Blocked: Symlink resolves outside authorized workspace ('${real}').`
        };
      }
    } catch (err) {
      // If file doesn't exist yet, verify parent directory containment
      if (err.code === 'ENOENT') {
        const parentDir = resolve(resolved, '..');
        try {
          const realParent = await fs.realpath(parentDir);
          const parentMatchesRoot = this.allowedRoots.some(root => {
            const rel = relative(root, realParent);
            return !rel.startsWith('..') && !rel.startsWith('/');
          });
          if (!parentMatchesRoot) {
            return {
              allowed: false,
              reason: `Security Escape Blocked: Target directory resolves outside authorized workspace.`
            };
          }
        } catch {}
      }
    }

    return { allowed: true, path: resolved };
  }

  /**
   * Search for files matching keyword or extension
   */
  async findFiles(keyword, searchDir = this.baseDirectory, maxResults = 25) {
    const containment = await this.validatePathContainment(searchDir);
    if (!containment.allowed) {
      return { query: keyword, found: 0, files: [], error: containment.reason };
    }

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
   * Read file content safely with line limits and containment verification
   */
  async readFile(filePath, maxLines = 150) {
    try {
      const containment = await this.validatePathContainment(filePath);
      if (!containment.allowed) {
        return { success: false, error: containment.reason, path: filePath };
      }

      const fullPath = containment.path;
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
   * Write or edit a file with backup and containment verification
   */
  async writeFile(filePath, content, options = {}) {
    try {
      const containment = await this.validatePathContainment(filePath);
      if (!containment.allowed) {
        return { success: false, error: containment.reason, path: filePath };
      }

      const fullPath = containment.path;

      // Create backup before modification if file exists
      let backupPath = null;
      if (this.backupsEnabled) {
        try {
          await fs.access(fullPath);
          backupPath = `${fullPath}.stark_bak_${Date.now()}`;
          await fs.copyFile(fullPath, backupPath);
        } catch {}
      }

      await fs.writeFile(fullPath, content, 'utf8');
      return {
        success: true,
        path: fullPath,
        backupCreated: Boolean(backupPath),
        backupPath,
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

