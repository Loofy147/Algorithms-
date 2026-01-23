/**
 * @file DifferentiallyPrivateQuery.js
 * @description An implementation of a differentially private query wrapper.
 */

/**
 * A class to wrap a query function and make it differentially private.
 */
export class DifferentiallyPrivateQuery {
  /**
   * @param {function} query - The query function to wrap.
   * @param {number} sensitivity - The sensitivity of the query.
   * @param {number} epsilon - The privacy budget.
   */
  constructor(query, sensitivity, epsilon) {
    this.query = query;
    this.sensitivity = sensitivity;
    this.epsilon = epsilon;
  }

  /**
   * Executes the query and adds Laplace noise to the result.
   * @returns {number} The result of the query with added noise.
   */
  execute() {
    const result = this.query();
    const scale = this.sensitivity / this.epsilon;
    const u = 0.5 - Math.random();
    const noise = -Math.sign(u) * scale * Math.log(1 - 2 * Math.abs(u));
    return result + noise;
  }
}
