/**
 * @file PropensityScoreMatcher.js
 * @description An implementation of propensity score matching for causal inference.
 */

/**
 * A class to perform propensity score matching.
 */
export class PropensityScoreMatcher {
  /**
   * @param {object[]} dataset - The dataset to analyze.
   * @param {string} treatment - The name of the treatment variable.
   * @param {string} outcome - The name of the outcome variable.
   * @param {string[]} covariates - An array of covariate names.
   */
  constructor(dataset, treatment, outcome, covariates) {
    this.dataset = dataset;
    this.treatment = treatment;
    this.outcome = outcome;
    this.covariates = covariates;
  }

  /**
   * Fits a logistic regression model to estimate propensity scores.
   * @returns {number[]} An array of propensity scores.
   */
  fit() {
    const { dataset, treatment, covariates } = this;
    const X = dataset.map((d) => [1, ...covariates.map((c) => d[c])]);
    const y = dataset.map((d) => d[treatment]);
    let weights = Array(X[0].length).fill(0);

    const sigmoid = (z) => 1 / (1 + Math.exp(-z));

    for (let i = 0; i < 100; i++) {
      const predictions = X.map((x) => sigmoid(x.reduce((acc, val, j) => acc + val * weights[j], 0)));
      const errors = y.map((val, j) => val - predictions[j]);
      const gradient = X[0].map((_, j) => X.reduce((acc, x, k) => acc + x[j] * errors[k], 0));
      weights = weights.map((w, j) => w + 0.01 * gradient[j]);
    }

    this.propensityScores = X.map((x) => sigmoid(x.reduce((acc, val, j) => acc + val * weights[j], 0)));
    return this.propensityScores;
  }

  /**
   * Matches treated and control subjects and estimates the treatment effect.
   * @returns {number} The Average Treatment Effect on the Treated (ATT).
   */
  match() {
    const { dataset, treatment, outcome, propensityScores } = this;
    const treated = dataset.filter((d) => d[treatment] === 1);
    const control = dataset.filter((d) => d[treatment] === 0);
    const treatedScores = propensityScores.filter((_, i) => dataset[i][treatment] === 1);
    const controlScores = propensityScores.filter((_, i) => dataset[i][treatment] === 0);

    let totalEffect = 0;
    for (let i = 0; i < treated.length; i++) {
      const treatedScore = treatedScores[i];
      let bestMatchIndex = -1;
      let minDistance = Infinity;
      for (let j = 0; j < control.length; j++) {
        const distance = Math.abs(treatedScore - controlScores[j]);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatchIndex = j;
        }
      }
      totalEffect += treated[i][outcome] - control[bestMatchIndex][outcome];
    }

    return totalEffect / treated.length;
  }
}
