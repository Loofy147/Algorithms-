/**
 * A counter that provides statistically sound confidence intervals for a binomial proportion.
 * Useful for tracking success rates or proportions from a sample.
 */
export class ProbabilisticCounter {
  /**
   * @param {number} [z=1.96] - The z-score for the desired confidence level (1.96 corresponds to 95%).
   */
  constructor(z = 1.96) {
    this.z = z;
    this.successes = 0;
    this.trials = 0;
  }

  /**
   * Records a new trial.
   * @param {boolean} [success=true] - Whether the trial was a success.
   */
  increment(success = true) {
    this.trials++;
    if (success) {
      this.successes++;
    }
  }

  /**
   * Returns the current counts.
   * @returns {{successes: number, trials: number}}
   */
  getCounts() {
    return { successes: this.successes, trials: this.trials };
  }

  /**
   * Calculates the simple proportion of successes.
   * @returns {number} The proportion (p-hat).
   */
  getEstimate() {
    if (this.trials === 0) return 0;
    return this.successes / this.trials;
  }

  /**
   * Calculates the confidence interval using the Wilson score method.
   * Excellent for small sample sizes and proportions near 0 or 1.
   * @returns {{lower: number, upper: number}} The confidence interval.
   */
  getWilsonInterval() {
    if (this.trials === 0) return { lower: 0, upper: 1 };

    const n = this.trials;
    const p = this.getEstimate();
    const z2 = this.z * this.z;
    const z2_n = z2 / n;

    const center = (p + z2_n / 2) / (1 + z2_n);
    const width = (this.z * Math.sqrt(p * (1 - p) / n + z2_n / (4 * n))) / (1 + z2_n);

    return {
      lower: Math.max(0, center - width),
      upper: Math.min(1, center + width),
    };
  }

  /**
   * Calculates the confidence interval using the Agresti-Coull method.
   * A simpler, yet highly effective alternative to the Wilson interval.
   * @returns {{lower: number, upper: number}} The confidence interval.
   */
  getAgrestiCoullInterval() {
    if (this.trials === 0) return { lower: 0, upper: 1 };

    const z2 = this.z * this.z;
    const n_tilde = this.trials + z2;
    const p_tilde = (this.successes + z2 / 2) / n_tilde;

    const width = this.z * Math.sqrt(p_tilde * (1 - p_tilde) / n_tilde);

    return {
      lower: Math.max(0, p_tilde - width),
      upper: Math.min(1, p_tilde + width),
    };
  }

  /**
   * @deprecated Use getWilsonInterval() instead.
   */
  getConfidenceInterval() {
    return this.getWilsonInterval();
  }
}
