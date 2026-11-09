/**
 * ════════════════════════════════════════════════════════════════════
 *  PROACTIVE SCHEDULER — AUTONOMOUS TEMPORAL AUTOMATION
 * ════════════════════════════════════════════════════════════════════
 * Coordinates recurring scheduled tasks, morning cognitive briefs,
 * study reviews, and background memory maintenance without continuous polling.
 */

export class ProactiveScheduler {
  constructor(options = {}) {
    this.name = 'ProactiveScheduler';
    this.scheduledJobs = new Map();
    this.isRunning = false;
    this.timerIds = new Map();
    this.executionLog = [];
  }

  /**
   * Register a scheduled routine
   * @param {Object} job
   * @param {string} job.id - Unique routine ID
   * @param {string} job.name - Human-readable name
   * @param {number} job.intervalMs - Execution interval in milliseconds
   * @param {Function} job.handler - Async function to execute
   */
  registerJob(job) {
    if (!job.id || !job.intervalMs || typeof job.handler !== 'function') {
      throw new Error('[ProactiveScheduler] id, intervalMs, and handler function are required.');
    }
    this.scheduledJobs.set(job.id, {
      ...job,
      lastRun: null,
      runCount: 0,
      enabled: job.enabled !== false
    });
    return true;
  }

  unregisterJob(jobId) {
    this.stopJob(jobId);
    return this.scheduledJobs.delete(jobId);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    for (const [id, job] of this.scheduledJobs.entries()) {
      if (job.enabled) {
        this._startJobTimer(id, job);
      }
    }
  }

  stop() {
    this.isRunning = false;
    for (const timerId of this.timerIds.values()) {
      clearInterval(timerId);
    }
    this.timerIds.clear();
  }

  _startJobTimer(id, job) {
    if (this.timerIds.has(id)) {
      clearInterval(this.timerIds.get(id));
    }
    const timer = setInterval(async () => {
      await this.runJobNow(id);
    }, job.intervalMs);
    this.timerIds.set(id, timer);
  }

  stopJob(id) {
    if (this.timerIds.has(id)) {
      clearInterval(this.timerIds.get(id));
      this.timerIds.delete(id);
    }
  }

  async runJobNow(id) {
    const job = this.scheduledJobs.get(id);
    if (!job) throw new Error(`[ProactiveScheduler] Job '${id}' not found.`);

    const record = {
      jobId: id,
      startTime: Date.now(),
      status: 'EXECUTING'
    };

    try {
      const result = await job.handler();
      record.status = 'SUCCESS';
      record.endTime = Date.now();
      record.result = result;
      job.lastRun = record.endTime;
      job.runCount++;
    } catch (err) {
      record.status = 'FAILED';
      record.endTime = Date.now();
      record.error = err.message;
    }

    this.executionLog.push(record);
    if (this.executionLog.length > 200) this.executionLog.shift();
    return record;
  }

  listJobs() {
    return Array.from(this.scheduledJobs.values()).map(j => ({
      id: j.id,
      name: j.name,
      intervalMs: j.intervalMs,
      enabled: j.enabled,
      lastRun: j.lastRun,
      runCount: j.runCount,
      activeTimer: this.timerIds.has(j.id)
    }));
  }
}

export default ProactiveScheduler;

