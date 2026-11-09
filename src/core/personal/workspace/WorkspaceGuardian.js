/**
 * ════════════════════════════════════════════════════════════════════
 *  WORKSPACE GUARDIAN — PROJECT & REPOSITORY INTEGRITY MONITOR
 * ════════════════════════════════════════════════════════════════════
 * Protects Adhithya's active development workspaces:
 * 1. Multi-repository Git status tracking (Branches, uncommitted files, sync state)
 * 2. Uncommitted work alerts before system updates
 * 3. Safe automated snapshot / stash management
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export class WorkspaceGuardian {
  constructor(options = {}) {
    this.trackedWorkspaces = options.trackedWorkspaces || [
      'D:\\portfolio\\portfolio',
      'D:\\portfolio\\mini-adhy-personal'
    ];
  }

  /**
   * Inspects a single repository's Git health and uncommitted changes
   */
  async checkRepoStatus(repoPath) {
    if (!fs.existsSync(repoPath)) {
      return { repoPath, exists: false, error: 'Path not found' };
    }

    const gitDir = path.join(repoPath, '.git');
    if (!fs.existsSync(gitDir)) {
      return { repoPath, isGitRepo: false, message: 'Not a Git repository' };
    }

    try {
      // 1. Current branch
      const { stdout: branchOut } = await execAsync('git branch --show-current', { cwd: repoPath, timeout: 3000 });
      const currentBranch = branchOut.trim() || 'DETACHED_HEAD';

      // 2. Uncommitted changes (short status)
      const { stdout: statusOut } = await execAsync('git status -s', { cwd: repoPath, timeout: 3000 });
      const dirtyFiles = statusOut.trim() ? statusOut.trim().split('\n').map(l => l.trim()) : [];

      // 3. Last commit
      const { stdout: logOut } = await execAsync('git log -n 1 --oneline', { cwd: repoPath, timeout: 3000 });
      const lastCommit = logOut.trim();

      return {
        repoPath,
        isGitRepo: true,
        branch: currentBranch,
        isClean: dirtyFiles.length === 0,
        dirtyCount: dirtyFiles.length,
        dirtyFiles: dirtyFiles.slice(0, 10),
        lastCommit,
        status: dirtyFiles.length === 0 ? 'CLEAN_SYNCHRONIZED' : 'DIRTY_UNCOMMITTED_CHANGES'
      };
    } catch (err) {
      return {
        repoPath,
        isGitRepo: true,
        error: `Git query failed: ${err.message}`
      };
    }
  }

  /**
   * Sweeps all tracked developer workspaces
   */
  async sweepAllWorkspaces() {
    const results = [];
    for (const ws of this.trackedWorkspaces) {
      const res = await this.checkRepoStatus(ws);
      results.push(res);
    }

    const uncommittedTotal = results.reduce((sum, r) => sum + (r.dirtyCount || 0), 0);
    return {
      timestamp: new Date().toISOString(),
      workspaceCount: results.length,
      uncommittedTotal,
      workspaces: results
    };
  }
}

export const workspaceGuardian = new WorkspaceGuardian();
