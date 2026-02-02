import { logger } from '../logger.js';

/**
 * XFetchCache implements the Staleness-Aware Cache Layer with X-Fetch algorithm
 * (Probabilistic Early Expiration) to prevent thundering herd problems (cache stampedes).
 *
 * It uses a probabilistic approach to refresh entries before they hard-expire,
 * spreading the recomputation load across multiple clients and time.
 */
export default class XFetchCache {
  /**
   * @param {number} ttlMs - Hard TTL in milliseconds.
   * @param {number} beta - Non-negative factor (default 1.0). Higher values increase early refresh probability.
   */
  constructor(ttlMs = 60000, beta = 1.0) {
    this.ttlMs = ttlMs;
    this.beta = beta;
    this.cache = new Map();
    this.locks = new Set();
  }

  /**
   * Retrieves a value from the cache or fetches it if missing or probabilistically expired.
   * @param {string} key - Cache key.
   * @param {function} fetcher - Async function to fetch the data on miss or refresh.
   * @returns {Promise<any>} The cached or fetched value.
   */
  async get(key, fetcher) {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug({ key }, 'XFetchCache miss');
      return this._fetchAndUpdate(key, fetcher);
    }

    // Probabilistic Early Expiration check to prevent thundering herd
    // Formula: now - (delta * beta * log(rand())) > expiry
    // delta: time taken to compute the value
    // rand: random number in (0, 1]
    const rand = Math.random() || 0.001; // Avoid log(0)
    const xFetchTrigger = now - (entry.delta * this.beta * Math.log(rand)) > entry.expiry;

    if (xFetchTrigger) {
      if (!this.locks.has(key)) {
        logger.debug({ key, delta: entry.delta }, 'XFetchCache probabilistic early expiration triggered');
        this.locks.add(key);

        // Trigger background refresh
        this._fetchAndUpdate(key, fetcher)
          .catch(err => logger.error({ key, err }, 'Background fetch failed in XFetchCache'))
          .finally(() => {
            this.locks.delete(key);
          });
      }
    }

    return entry.value;
  }

  /**
   * Explicitly set a value in the cache.
   * Useful for pre-population or external updates.
   */
  set(key, value, delta = 0) {
    const start = Date.now();
    const expiry = start + this.ttlMs;
    this.cache.set(key, { value, delta, expiry });
  }

  async _fetchAndUpdate(key, fetcher) {
    const start = Date.now();
    try {
      const value = await fetcher();
      const delta = Date.now() - start;
      const expiry = start + this.ttlMs;

      this.cache.set(key, { value, delta, expiry });
      return value;
    } catch (error) {
      logger.error({ key, error }, 'XFetchCache fetch failed');
      throw error;
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttlMs,
      beta: this.beta
    };
  }

  clear() {
    this.cache.clear();
    this.locks.clear();
  }
}
