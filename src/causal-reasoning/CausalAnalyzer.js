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
    const segmentedTrends = this._calculateSegmentedTrends();

    return {
      overallTrend,
      segmentedTrends,
      paradox: this._detectParadox(overallTrend, segmentedTrends),
    };
  }

  _calculateTrend(data) {
    if (data.length === 0) return 0;
    const groups = this._groupBy(data, this.independentVar);
    const successRateA = this._calculateSuccessRate(groups['A'] || []);
    const successRateB = this._calculateSuccessRate(groups['B'] || []);
    return successRateB - successRateA;
  }

  _calculateSegmentedTrends() {
    const segments = this._groupBy(this.data, this.confoundingVar);
    const trends = {};
    for (const segment in segments) {
      trends[segment] = this._calculateTrend(segments[segment]);
    }
    return trends;
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

  _detectParadox(overallTrend, segmentedTrends) {
    const overallSign = Math.sign(overallTrend);
    const segmentSigns = Object.values(segmentedTrends).map(Math.sign);
    return segmentSigns.every((sign) => sign !== 0 && sign !== overallSign);
  }
}
