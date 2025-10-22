/**
 * Probabilistic Counter - Tracks a value with confidence bounds
 *
 * Uses the Wilson score interval for a binomial proportion.
 */
export default class ProbabilisticCounter {
  constructor(z = 1.96) {
    // z-score for the desired confidence level (1.96 for 95%)
    this.z = z;
    this.successes = 0;
    this.trials = 0;
  }

  increment(success = true) {
    this.trials++;
    if (success) {
      this.successes++;
    }
  }

  getCount() {
    return this.successes;
  }

  getConfidenceInterval() {
    if (this.trials === 0) {
      return { lower: 0, upper: 1 };
    }
    const n = this.trials;
    const p = this.successes / n;
    const z2 = this.z * this.z;
    const z2_n = z2 / n;

    const center = (p + z2_n / 2) / (1 + z2_n);
    const width = (this.z * Math.sqrt(p * (1 - p) / n + z2_n / (4 * n))) / (1 + z2_n);

    return {
      lower: Math.max(0, center - width),
      upper: Math.min(1, center + width)
    };
  }

  toString() {
    const interval = this.getConfidenceInterval();
    return `${this.successes}/${this.trials} [${interval.lower.toFixed(3)}, ${interval.upper.toFixed(3)}]`;
  }
}
