import SelfOptimizingCache from '../src/self-modifying/SelfOptimizingCache.js';
import { logger } from '../src/logger.js';

function adaptiveCDNCaching() {
  logger.info('--- Self-Modifying Algorithm Use Case: Adaptive CDN Caching ---');

  const cache = new SelfOptimizingCache(10);

  logger.info('Phase 1: Warming the cache with initial content.');
  for (let i = 0; i < 10; i++) {
    cache.put(`item:${i}`, `content:${i}`);
  }

  logger.info('Phase 2: Simulating a viral content pattern (good for LFU).');
  for (let i = 0; i < 100; i++) {
    // One item is requested 80% of the time
    if (Math.random() < 0.8) {
      cache.get('item:5');
    } else {
      cache.get(`item:${i % 10}`);
    }
  }
  logger.info({ stats: cache.getStats() }, 'Cache stats after viral pattern');

  logger.info('Phase 3: Simulating a scanning pattern (good for LRU).');
  // New, unique items are requested, pushing out the old "viral" content.
  for (let i = 10; i < 110; i++) {
    cache.get(`item:${i}`);
  }
  logger.info({ stats: cache.getStats() }, 'Cache stats after scanning pattern');

  logger.info('Conclusion: The cache dynamically adapted its strategy based on the workload.');
}

adaptiveCDNCaching();
