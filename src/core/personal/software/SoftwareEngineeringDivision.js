/**
 * ════════════════════════════════════════════════════════════════════
 *  SOFTWARE ENGINEERING DIVISION — REPOSITORY & ARCHITECTURE ENGINE
 * ════════════════════════════════════════════════════════════════════
 * Repository-aware coding intelligence: scans multi-language codebases,
 * maps architectures, diagnoses errors, plans refactoring, and runs tests.
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SoftwareEngineeringDivision {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(process.cwd());
  }

  /**
   * Deeply inspects an existing repository and categorizes its ecosystem
   */
  async inspectRepository(repoPath = this.rootDir) {
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository path not found: ${repoPath}`);
    }

    const files = fs.readdirSync(repoPath);
    const manifests = {
      nodejs: files.includes('package.json'),
      rust: files.includes('Cargo.toml'),
      golang: files.includes('go.mod'),
      python: files.includes('requirements.txt') || files.includes('pyproject.toml'),
      git: files.includes('.git')
    };

    let packageData = null;
    if (manifests.nodejs) {
      try {
        packageData = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf-8'));
      } catch {}
    }

    // Survey file count by extension
    const extensionTally = {};
    this._walkDirectory(repoPath, (file) => {
      const ext = path.extname(file).toLowerCase() || 'no_ext';
      extensionTally[ext] = (extensionTally[ext] || 0) + 1;
    }, 2); // depth limit to stay fast

    return {
      repoPath,
      manifests,
      primaryFramework: packageData?.name || 'polyglot_system',
      version: packageData?.version || '1.0.0',
      scriptsAvailable: Object.keys(packageData?.scripts || {}),
      languageBreakdown: extensionTally,
      gitReady: manifests.git,
      status: 'REPOSITORY_MAPPED'
    };
  }

  /**
   * Synthesizes an architecture map of key modules and entry points
   */
  async mapArchitecture(repoPath = this.rootDir) {
    const inspection = await this.inspectRepository(repoPath);
    const keyPaths = ['src', 'bin', 'scripts', 'tests', 'data'];
    const discoveredModules = [];

    for (const kp of keyPaths) {
      const full = path.join(repoPath, kp);
      if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
        const subItems = fs.readdirSync(full);
        discoveredModules.push({
          module: kp,
          subItemsCount: subItems.length,
          sampleFiles: subItems.slice(0, 5)
        });
      }
    }

    return {
      repoPath,
      primaryEcosystem: inspection.manifests,
      architectureLayers: discoveredModules,
      recommendedTestRunner: this._detectTestRunner(inspection.manifests),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Executes automated tests with timeout and diagnostic capture
   */
  async runAutomatedTests(repoPath = this.rootDir, customCmd = null) {
    const inspection = await this.inspectRepository(repoPath);
    const runner = customCmd || this._detectTestRunner(inspection.manifests);
    if (!runner) {
      return { status: 'NO_TEST_RUNNER_CONFIGURED', passed: false, durationMs: 0 };
    }

    const start = Date.now();
    try {
      const { stdout, stderr } = await execAsync(runner, { cwd: repoPath, timeout: 60000 });
      return {
        status: 'TESTS_PASSED',
        passed: true,
        command: runner,
        durationMs: Date.now() - start,
        outputSummary: (stdout + '\n' + stderr).slice(-800)
      };
    } catch (err) {
      return {
        status: 'TESTS_FAILED',
        passed: false,
        command: runner,
        durationMs: Date.now() - start,
        exitCode: err.code,
        errorExcerpt: (err.stdout || '' + '\n' + err.stderr || '' + '\n' + err.message).slice(-1000)
      };
    }
  }

  _detectTestRunner(manifests) {
    if (manifests.nodejs) return 'npm test -- --watchAll=false';
    if (manifests.rust) return 'cargo test';
    if (manifests.golang) return 'go test ./...';
    if (manifests.python) return 'pytest';
    return null;
  }

  _walkDirectory(dir, callback, maxDepth = 2, currentDepth = 0) {
    if (currentDepth > maxDepth) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'target') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this._walkDirectory(full, callback, maxDepth, currentDepth + 1);
        } else {
          callback(full);
        }
      }
    } catch {}
  }
}
