import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Implements Propensity Score Matching for causal inference.
 */
export class PropensityScoreMatcher {
  constructor(dataset, treatment, outcome, covariates) {
    this.dataset = dataset;
    this.treatment = treatment;
    this.outcome = outcome;
    this.covariates = covariates;
    this.propensityScores = null;
  }

  /**
   * Fits a logistic regression model to estimate propensity scores.
   * This implementation uses gradient descent with L2 regularization and a convergence check.
   */
  fit() {
    const { learningRate, iterations, regularization, convergenceThreshold = 1e-6 } = config.logisticRegression;

    const X = this.dataset.map(d => [1, ...this.covariates.map(c => d[c])]); // Add bias term
    const y = this.dataset.map(d => d[this.treatment]);
    let weights = Array(X[0].length).fill(0);
    let lastCost = Infinity;

    const sigmoid = z => 1 / (1 + Math.exp(-z));

    for (let i = 0; i < iterations; i++) {
      const predictions = X.map(x => sigmoid(x.reduce((acc, val, j) => acc + val * weights[j], 0)));

      // Calculate cost (log-likelihood with L2 regularization)
      const cost = -y.reduce((sum, yi, k) =>
        sum + (yi * Math.log(predictions[k]) + (1 - yi) * Math.log(1 - predictions[k])), 0) / y.length +
        (regularization / (2 * y.length)) * weights.slice(1).reduce((sum, w) => sum + w * w, 0);

      // Check for convergence
      if (Math.abs(lastCost - cost) < convergenceThreshold && i > 0) {
        logger.info({ iteration: i, cost }, 'Logistic regression converged');
        break;
      }
      lastCost = cost;

      const errors = y.map((val, j) => predictions[j] - val);

      const gradient = X[0].map((_, j) =>
        X.reduce((sum, x, k) => sum + x[j] * errors[k], 0) / y.length
      );

      // Update weights with regularization (don't regularize bias term)
      weights = weights.map((w, j) =>
        w - learningRate * (gradient[j] + (j > 0 ? (regularization / y.length) * w : 0))
      );

      if (i === iterations - 1) {
        logger.warn('Logistic regression reached max iterations without converging.');
      }
    }

    this.propensityScores = X.map(x => sigmoid(x.reduce((acc, val, j) => acc + val * weights[j], 0)));
    return this.propensityScores;
  }

  /**
   * Matches treated and control subjects using nearest-neighbor matching on propensity scores.
   * @returns {number} The Average Treatment Effect on the Treated (ATT).
   */
  match() {
    if (!this.propensityScores) {
      throw new Error('You must call fit() before match().');
    }

    const treatedIndices = this.dataset.map((d, i) => d[this.treatment] === 1 ? i : -1).filter(i => i !== -1);
    const controlIndices = this.dataset.map((d, i) => d[this.treatment] === 0 ? i : -1).filter(i => i !== -1);

    if (treatedIndices.length === 0 || controlIndices.length === 0) {
        logger.warn('Dataset contains no treated or no control subjects. Cannot calculate ATT.');
        return 0;
    }

    let totalEffect = 0;
    for (const i of treatedIndices) {
      const treatedScore = this.propensityScores[i];
      let bestMatchIndex = -1;
      let minDistance = Infinity;

      for (const j of controlIndices) {
        const distance = Math.abs(treatedScore - this.propensityScores[j]);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatchIndex = j;
        }
      }

      if (bestMatchIndex !== -1) {
        totalEffect += this.dataset[i][this.outcome] - this.dataset[bestMatchIndex][this.outcome];
      }
    }

    return totalEffect / treatedIndices.length;
  }
}
