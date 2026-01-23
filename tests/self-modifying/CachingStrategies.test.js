import { LFUCache } from '../../shared/algorithms/self-modifying/CachingStrategies.js';

describe('LFUCache Tie-Breaking Logic', () => {
  it('should evict the true LRU item when frequencies are tied', () => {
    const cache = new LFUCache(2);
    cache.put('a', 1); // Freq: a:1. Order: [a]
    cache.put('b', 2); // Freq: a:1, b:1. Order: [a, b]. LRU is 'a'.

    // Access 'b', then 'a'. This makes 'b' the Least Recently Used item
    // among those that will have the same frequency.
    cache.get('b');    // Freq: a:1, b:2. Correct Order: [a, b].
    cache.get('a');    // Freq: a:2, b:2. Correct Order: [b, a]. LRU is now 'b'.

    // Add a new item to trigger eviction.
    // Both 'a' and 'b' have frequency 2, creating a tie.
    // The cache should evict the LRU item, which is 'b'.
    cache.put('c', 3);

    // With the bug, the order is never updated from [a, b].
    // The tie-breaker incorrectly finds 'a' as the LRU and evicts it.

    // VERIFY: The fix should ensure 'b' is evicted, not 'a'.
    expect(cache.get('a')).not.toBeNull(); // 'a' should still be in the cache.
    expect(cache.get('b')).toBeNull();     // 'b' should have been evicted.
    expect(cache.get('c')).not.toBeNull(); // 'c' should be in the cache.
  });
});
