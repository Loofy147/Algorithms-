/**
 * DecisionMatrix implements the weighted scoring and efficiency formula
 * from docs/PRECOMPUTATION_LOGIC.json to determine if pre-computation is beneficial.
 */
export class DecisionMatrix {
  /**
   * Calculates the computational efficiency of a pre-computation strategy.
   * Formula: Efficiency = (Freq_Read * Cost_Read) - (Freq_Write * Cost_Write)
   *
   * @param {number} freqRead - Frequency of read operations.
   * @param {number} costRead - Computational cost saved per read by pre-computing.
   * @param {number} freqWrite - Frequency of write (re-computation) operations.
   * @param {number} costWrite - Computational cost of the pre-computation itself.
   * @returns {number} The efficiency score. Positive means pre-computation saves resources.
   */
  static calculateEfficiency(freqRead, costRead, freqWrite, costWrite) {
    return (freqRead * costRead) - (freqWrite * costWrite);
  }

  /**
   * Scores a pre-computation opportunity based on weighted factors defined in PRECOMPUTATION_LOGIC.json.
   *
   * @param {object} factors - Factors to weigh.
   * @param {number} factors.readWriteRatio - Ratio of reads to writes (e.g., 100 for 100:1).
   * @param {number} factors.volatilityTtl - Expected TTL in seconds.
   * @param {number} factors.computeCost - Original compute cost in milliseconds.
   * @returns {number} Normalized score between 0 and 1.
   */
  static score(factors) {
    const weights = {
      readWriteRatio: 0.45,
      volatilityTtl: 0.30,
      computeCost: 0.25
    };

    // Normalization based on "Optimal Condition" defined in the reference JSON
    // Read/Write: > 50:1
    const normalizedRW = Math.min(factors.readWriteRatio / 50, 1.0);
    // Volatility: > 300s TTL
    const normalizedTTL = Math.min(factors.volatilityTtl / 300, 1.0);
    // Compute Cost: > 100ms
    const normalizedCost = Math.min(factors.computeCost / 100, 1.0);

    return (normalizedRW * weights.readWriteRatio) +
           (normalizedTTL * weights.volatilityTtl) +
           (normalizedCost * weights.computeCost);
  }

  /**
   * Recommends a strategy based on the calculated score.
   * @param {number} score - Normalized score.
   * @returns {string} Strategy recommendation: 'Pre-compute', 'Lazy-Compute', or 'On-Demand'.
   */
  static recommend(score) {
    if (score > 0.75) return 'Pre-compute';
    if (score >= 0.30) return 'Lazy-Compute';
    return 'On-Demand';
  }
}
