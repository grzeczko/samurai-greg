const DEFAULT_PAUSE_REASON = 'manual';

function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

export class RunTimer {
  constructor() {
    this.reset();
  }

  startRun() {
    if (this.isStarted && !this.isStopped) {
      return this.getElapsedMs();
    }

    this.isStarted = true;
    this.isStopped = false;
    this.accumulatedMs = 0;
    this.activeStartedAt = this.pauseReasons.size === 0 ? nowMs() : null;

    return 0;
  }

  pauseRun(reason = DEFAULT_PAUSE_REASON) {
    this.pauseReasons.add(reason);

    if (!this.isStarted || this.isStopped || this.activeStartedAt === null) {
      return this.getElapsedMs();
    }

    this.accumulatedMs += nowMs() - this.activeStartedAt;
    this.activeStartedAt = null;

    return this.getElapsedMs();
  }

  resumeRun(reason = DEFAULT_PAUSE_REASON) {
    this.pauseReasons.delete(reason);

    if (!this.isStarted || this.isStopped || this.pauseReasons.size > 0) {
      return this.getElapsedMs();
    }

    if (this.activeStartedAt === null) {
      this.activeStartedAt = nowMs();
    }

    return this.getElapsedMs();
  }

  stopRun() {
    if (!this.isStarted || this.isStopped) {
      return this.getElapsedMs();
    }

    if (this.activeStartedAt !== null) {
      this.accumulatedMs += nowMs() - this.activeStartedAt;
    }

    this.activeStartedAt = null;
    this.isStopped = true;

    return this.getElapsedMs();
  }

  getElapsedMs() {
    const activeMs = this.isStarted && !this.isStopped && this.activeStartedAt !== null
      ? nowMs() - this.activeStartedAt
      : 0;

    return Math.max(0, Math.round(this.accumulatedMs + activeMs));
  }

  formatElapsedTime(milliseconds = this.getElapsedMs()) {
    const totalCentiseconds = Math.floor(milliseconds / 10);
    const centiseconds = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
  }

  reset() {
    this.isStarted = false;
    this.isStopped = false;
    this.accumulatedMs = 0;
    this.activeStartedAt = null;
    this.pauseReasons = new Set();
  }
}
