import { logger } from '../logger.js';

/**
 * Provides probabilistic timing analysis for code execution using Extreme Value Theory (EVT).
 * This class can be used to estimate the Worst-Case Execution Time (WCET) of a function.
 */
export default class WCETAnalyzer {
  constructor() {
    this.samples = [];
  }

  /**
   * Measures the execution time of a function over many iterations to collect samples.
   * @param {Function} fn - The function to measure.
   * @param {number} iterations - The number of times to run the function.
   * @returns {object} A statistical summary of the execution times.
   */
  measure(fn, iterations = 1000) {
    const times = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      times.push(performance.now() - start);
    }
    times.sort((a, b) => a - b);
    this.samples = times;
    // ... (statistical summary remains the same)
    return { /* ... */ };
  }

  /**
   * Fits a Gumbel distribution to the sample data using Maximum Likelihood Estimation (MLE).
   * This is more robust than the method-of-moments for skewed distributions.
   * @param {number[]} times - The sample execution times.
   * @param {object} [options] - Options for the MLE solver.
   * @param {number} [options.learningRate=1e-5] - The learning rate for the optimizer.
   * @param {number} [options.iterations=1000] - The number of iterations for the optimizer.
   * @returns {object} The fitted Gumbel parameters and a prediction function.
   */
  fitGumbel(times, { learningRate = 1e-5, iterations = 1000, convergenceThreshold = 1e-7 } = {}) {
    // Initial guess using method-of-moments
    const n = times.length;
    const mean = times.reduce((a, b) => a + b) / n;
    const variance = times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / n;
    let beta = Math.sqrt(6 * variance) / Math.PI; // scale
    let mu = mean - 0.5772 * beta;              // location

    // Gradient ascent to maximize the log-likelihood function
    let lastLogLikelihood = -Infinity;
    for (let i = 0; i < iterations; i++) {
      const expTerm = times.map(t => Math.exp(-(t - mu) / beta));

      // Partial derivatives of the log-likelihood function
      const dMu = (1 / beta) * (expTerm.reduce((a, b) => a + b, 0) - n);
      const dBeta = (1 / beta) * (times.reduce((sum, t, j) => sum + (t - mu) * expTerm[j], 0) / beta - n + times.reduce((sum, t) => sum + (t - mu), 0) / beta);

      // Update parameters
      mu += learningRate * dMu;
      beta += learningRate * dBeta;

      // Check for convergence
      const logLikelihood = -n * Math.log(beta) - times.reduce((sum, t) => sum + (t - mu) / beta, 0) - expTerm.reduce((sum, val) => sum + val, 0);
      if (Math.abs(logLikelihood - lastLogLikelihood) < convergenceThreshold) {
        logger.info({ iteration: i }, 'Gumbel MLE converged');
        break;
      }
      lastLogLikelihood = logLikelihood;
    }

    return {
      location: mu,
      scale: beta,
      predictWCET: (probability) => mu - beta * Math.log(-Math.log(probability)),
    };
  }
}
