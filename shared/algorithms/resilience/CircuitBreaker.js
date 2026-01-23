import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * @enum {string}
 * @private
 */
const C_STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

/**
 * Implements the Circuit Breaker pattern to prevent cascading failures.
 */
export class CircuitBreaker {
  /**
   * @param {object} [options] - Configuration options for the circuit breaker.
   * @param {number} [options.failureThreshold] - The number of failures required to trip the circuit.
   * @param {number} [options.resetTimeout] - The time in ms to wait before transitioning to HALF_OPEN.
   */
  constructor(options = {}) {
    this.state = C_STATE.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;

    this.failureThreshold = options.failureThreshold || config.circuitBreaker.failureThreshold;
    this.resetTimeout = options.resetTimeout || config.circuitBreaker.resetTimeout;
  }

  /**
   * Executes an asynchronous function wrapped in the circuit breaker.
   * @param {function(): Promise<any>} asyncFunction - The asynchronous function to execute.
   * @returns {Promise<any>} A promise that resolves with the result of the function, or rejects if the circuit is open or the function fails.
   */
  async execute(asyncFunction) {
    if (this.state === C_STATE.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = C_STATE.HALF_OPEN;
        logger.info('Circuit breaker is now HALF_OPEN.');
      } else {
        throw new Error('Circuit breaker is open.');
      }
    }

    if (this.state === C_STATE.HALF_OPEN) {
      try {
        const result = await asyncFunction();
        this.reset();
        logger.info('Circuit breaker is now CLOSED.');
        return result;
      } catch (error) {
        this.trip();
        throw error;
      }
    }

    try {
      const result = await asyncFunction();
      this.reset();
      return result;
    } catch (error) {
      if (this.lastFailureTime && (Date.now() - this.lastFailureTime) > this.resetTimeout) {
        this.failureCount = 1;
      } else {
        this.failureCount++;
      }
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.failureThreshold) {
        this.trip();
      }
      throw error;
    }
  }

  /**
   * Trips the circuit breaker, opening the circuit.
   * @private
   */
  trip() {
    this.state = C_STATE.OPEN;
    this.lastFailureTime = Date.now();
    logger.warn('Circuit breaker is now OPEN.');
  }

  /**
   * Resets the circuit breaker, closing the circuit.
   * @private
   */
  reset() {
    this.state = C_STATE.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}
