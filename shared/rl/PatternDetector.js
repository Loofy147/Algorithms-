import { ProbabilisticCounter } from './uncertainty-quantification/ProbabilisticCounter.js';

/**
 * ENHANCED: Pattern Detector with Uncertainty Quantification
 * Uses the Wilson Score interval to provide conservative confidence scores for detected patterns.
 */
export class PatternDetector {
  constructor(threshold = 0.6) {
    this.threshold = threshold;
    this.patterns = new Map();
  }

  /**
   * Observe an action and update pattern confidence
   */
  observe(userId, action, metadata = {}) {
    const key = `${userId}:${action}`;
    if (!this.patterns.has(key)) {
      this.patterns.set(key, new ProbabilisticCounter());
    }

    // In a real system, we'd have logic to determine if this action reinforces a pattern
    const isReinforcing = metadata.isReinforcing !== false;
    this.patterns.get(key).increment(isReinforcing);
  }

  /**
   * Get the conservative confidence score for a pattern
   */
  getConfidence(userId, action) {
    const key = `${userId}:${action}`;
    const counter = this.patterns.get(key);
    if (!counter) return 0;

    // Wilson interval lower bound is excellent for conservative confidence
    return counter.getWilsonInterval().lower;
  }

  /**
   * Get all patterns for a user that exceed the confidence threshold
   */
  getDetectedPatterns(userId) {
    const detected = [];
    for (const [key, counter] of this.patterns.entries()) {
      if (key.startsWith(`${userId}:`)) {
        const action = key.split(':')[1];
        const confidence = counter.getWilsonInterval().lower;

        if (confidence >= this.threshold) {
          detected.push({
            action,
            confidence,
            stats: counter.getCounts()
          });
        }
      }
    }

    return detected.sort((a, b) => b.confidence - a.confidence);
  }
}
