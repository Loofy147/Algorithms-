import { LRUCache, LFUCache, FIFOCache } from './CachingStrategies.js';

/**
 * A self-optimizing cache that uses a multi-armed bandit algorithm (Epsilon-Greedy)
 * to dynamically select the best caching strategy.
 */
export default class SelfOptimizingCache {
  constructor(capacity, { epsilon = 0.1, evaluationInterval = 100 } = {}) {
    this.capacity = capacity;
    this.epsilon = epsilon;
    this.evaluationInterval = evaluationInterval;
    this.operationCount = 0;

    this.strategies = {
      LRU: new LRUCache(capacity),
      LFU: new LFUCache(capacity),
      FIFO: new FIFOCache(capacity),
    };

    this.currentStrategyName = 'LRU';
  }

  get(key) {
    this._onOperation();
    let result = null;
    for (const name in this.strategies) {
      const value = this.strategies[name].get(key);
      if (name === this.currentStrategyName) {
        result = value;
      }
    }
    return result;
  }

  put(key, value) {
    this._onOperation();
    // Mirror the put operation across all strategies to keep their content in sync.
    for (const name in this.strategies) {
      this.strategies[name].put(key, value);
    }
  }

  _onOperation() {
    this.operationCount++;
    if (this.operationCount % this.evaluationInterval === 0) {
      this._selectStrategy();
    }
  }

  /**
   * Epsilon-Greedy strategy selection.
   */
  _selectStrategy() {
    // With probability epsilon, explore a random strategy.
    if (Math.random() < this.epsilon) {
      const strategyNames = Object.keys(this.strategies);
      this.currentStrategyName = strategyNames[Math.floor(Math.random() * strategyNames.length)];
      console.log(`Exploring new strategy: ${this.currentStrategyName}`);
    } else {
      // Otherwise, exploit the strategy with the best hit rate.
      let bestStrategyName = 'LRU';
      let bestHitRate = -1;
      for (const name in this.strategies) {
        const hitRate = this.strategies[name].getHitRate();
        if (hitRate > bestHitRate) {
          bestHitRate = hitRate;
          bestStrategyName = name;
        }
      }
      if (this.currentStrategyName !== bestStrategyName) {
        console.log(`Switching to best strategy: ${bestStrategyName} (Hit Rate: ${bestHitRate.toFixed(2)})`);
        this.currentStrategyName = bestStrategyName;
      }
    }
  }

  getStats() {
    const stats = {};
    for (const name in this.strategies) {
      stats[name] = {
        hits: this.strategies[name].hits,
        misses: this.strategies[name].misses,
        hitRate: this.strategies[name].getHitRate(),
      };
    }
    return {
      currentStrategy: this.currentStrategyName,
      operationCount: this.operationCount,
      strategies: stats,
    };
  }
}
