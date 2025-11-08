import SelfOptimizingCache from '../../src/self-modifying/SelfOptimizingCache.js';

describe('SelfOptimizingCache', () => {
  it('should start with LRU as the default strategy', () => {
    const cache = new SelfOptimizingCache(3);
    expect(cache.currentStrategyName).toBe('LRU');
  });

  it('should switch to the best strategy when exploiting', () => {
    // A deterministic test with epsilon = 0
    const cache = new SelfOptimizingCache(3, { epsilon: 0, evaluationInterval: 20 });

    // Phase 1: Populate cache and establish hot items 'a' and 'b'
    cache.put('a', 1);
    cache.put('b', 2);
    cache.put('c', 3);
    for (let i = 0; i < 10; i++) {
      cache.get('a');
      cache.get('b');
    }

    // Phase 2: Cache pollution workload
    cache.put('d', 4);
    cache.put('e', 5);
    cache.put('f', 6);

    // Phase 3: Access hot items to demonstrate LFU's superiority
    cache.get('a'); // Hit in LFU, Miss in LRU
    cache.get('b'); // Hit in LFU, Miss in LRU

    // Trigger an evaluation by running more operations
    for (let i = 0; i < 20; i++) {
      cache.get('a');
    }

    // With epsilon=0, the cache should have deterministically switched to LFU.
    expect(cache.currentStrategyName).toBe('LFU');
  });

  it('should get and put values correctly', () => {
    const cache = new SelfOptimizingCache(3);
    cache.put('a', 1);
    cache.put('b', 2);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(null);
  });

  it('LFU should handle tie-breaking correctly by evicting the least recently used', () => {
    const lfuCache = new SelfOptimizingCache(2).strategies.LFU;
    lfuCache.put('a', 1); // a: freq 1
    lfuCache.put('b', 2); // b: freq 1

    lfuCache.get('a'); // a: freq 2
    lfuCache.get('b'); // b: freq 2

    lfuCache.put('c', 3); // a and b have same freq, evict a (LRU)
    expect(lfuCache.get('a')).toBeNull();
    expect(lfuCache.get('b')).toBe(2);
    expect(lfuCache.get('c')).toBe(3);
  });
});
