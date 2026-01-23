/**
 * Analyzes a dataset to demonstrate Simpson's Paradox.
 *
 * Simpson's Paradox is a phenomenon in probability and statistics in which a
 * trend appears in several different groups of data but disappears or reverses
 * when these groups are combined.
 */
export class CausalAnalyzer {
  /**
   * @param {Array<Object>} data - The dataset to analyze.
   * @param {string} independentVar - The independent variable.
   * @param {string} dependentVar - The dependent variable.
   * @param {string} confoundingVar - The confounding variable.
   */
  constructor(data, independentVar, dependentVar, confoundingVar) {
    this.data = data;
    this.independentVar = independentVar;
    this.dependentVar = dependentVar;
    this.confoundingVar = confoundingVar;
  }

  /**
   * Analyzes the data to reveal Simpson's Paradox.
   * @returns {Object} An analysis report.
   */
  analyze() {
    const overallTrend = this._calculateTrend(this.data);
    const segmentedAnalysis = this._calculateSegmentedTrends();

    return {
      overallTrend,
      segmentedTrends: Object.fromEntries(
        Object.entries(segmentedAnalysis).map(([key, { trend }]) => [key, trend])
      ),
      paradox: this._detectParadox(overallTrend, segmentedAnalysis),
    };
  }

  _calculateTrend(data) {
    if (data.length < 2) return 0;
    const groups = this._groupBy(data, this.independentVar);
    const groupKeys = Object.keys(groups).sort();

    if (groupKeys.length < 2) return 0;

    // For simplicity, trend is calculated between the first two lexicographically sorted groups.
    const successRateA = this._calculateSuccessRate(groups[groupKeys[0]] || []);
    const successRateB = this._calculateSuccessRate(groups[groupKeys[1]] || []);
    return successRateB - successRateA;
  }

  _calculateSegmentedTrends() {
    const segments = this._groupBy(this.data, this.confoundingVar);
    const analysis = {};
    for (const segment in segments) {
      analysis[segment] = {
        trend: this._calculateTrend(segments[segment]),
        size: segments[segment].length
      };
    }
    return analysis;
  }

  _calculateSuccessRate(data) {
    if (data.length === 0) return 0;
    const successes = data.filter((d) => d[this.dependentVar] === 'Success').length;
    return successes / data.length;
  }

  _groupBy(data, key) {
    return data.reduce((acc, row) => {
      (acc[row[key]] = acc[row[key]] || []).push(row);
      return acc;
    }, {});
  }

  _detectParadox(overallTrend, segmentedAnalysis) {
    const overallSign = Math.sign(overallTrend);
    if (overallSign === 0) return false;

    const segments = Object.values(segmentedAnalysis);
    if (segments.length === 0) return false;

    // Strict paradox: trend reverses in ALL segments.
    const allReverse = segments.every(
      ({ trend }) => Math.sign(trend) === -overallSign
    );
    if (allReverse) return true;

    // Weighted paradox: the weighted average of segment trends reverses.
    const totalWeight = segments.reduce((sum, { size }) => sum + size, 0);
    if (totalWeight === 0) return false;

    const weightedTrend = segments.reduce(
      (sum, { trend, size }) => sum + trend * size,
      0
    ) / totalWeight;

    return Math.sign(weightedTrend) === -overallSign;
  }
}
