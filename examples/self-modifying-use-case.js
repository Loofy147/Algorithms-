import SelfOptimizingCache from '../src/self-modifying/SelfOptimizingCache.js';

/**
 * Use Case: Adaptive Content Delivery Network (CDN) Caching
 *
 * A CDN needs to cache content close to users. The optimal caching strategy
 * (e.g., LRU, LFU, FIFO) can change depending on the time of day, the type of
 * content being requested, or sudden viral traffic patterns.
 *
 * A `SelfOptimizingCache` can dynamically adapt to find the best caching
 * strategy. It runs multiple strategies in parallel, measures their hit rates,
 * and automatically shifts traffic to the best-performing one using a
- * multi-armed bandit algorithm. This ensures the CDN always uses the most
 * effective caching logic for the current traffic pattern.
 */
function adaptiveCDNCaching() {
  console.log('--- Self-Modifying Algorithm Use Case: Adaptive CDN Caching ---');

  const cache = new SelfOptimizingCache(10, 0.1); // Capacity 10, Epsilon (exploration) 0.1

  console.log('Phase 1: Initial requests - mixed access pattern.');
  // Simulate some initial traffic
  for (let i = 0; i < 20; i++) {
    cache.get(`item:${i % 10}`); // Access items 0-9 twice
  }
  for (let i = 0; i < 5; i++) {
    cache.get('item:popular'); // Access one item frequently
  }
  console.log('Current best strategy:', cache.getCurrentStrategyName());

  console.log('\nPhase 2: Viral content - LFU becomes optimal.');
  // A single item goes viral, making LFU the best strategy
  for (let i = 0; i < 100; i++) {
    cache.get('item:viral');
    if (i % 20 === 0) {
      console.log(`  - After ${i} viral hits, best strategy is: ${cache.getCurrentStrategyName()}`);
    }
  }

  console.log('\nPhase 3: Scanning pattern - LRU becomes optimal.');
  // A user scans through many unique items, making LRU better
  for (let i = 100; i < 200; i++) {
    cache.get(`item:${i}`);
    if (i % 20 === 0) {
      console.log(`  - After ${i-100} sequential hits, best strategy is: ${cache.getCurrentStrategyName()}`);
    }
  }

  console.log('\n--- Final Cache Stats ---');
  console.log(cache.getStats());

  console.log('\nConclusion: The cache adapted its internal strategy from LRU to LFU and back to LRU');
  console.log('based on the changing access patterns, maximizing the cache hit rate automatically.');
}

adaptiveCDNCaching();
