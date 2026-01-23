// --- Caching Strategies ---

/**
 * Base class for a cache with a fixed size.
 */
class BaseCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    return null;
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
}

/**
 * Least Recently Used (LRU) Cache
 */
export class LRUCache extends BaseCache {
  get(key) {
    const value = super.get(key);
    if (value !== null) {
      // Move to end to mark as recently used
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

/**
 * First-In, First-Out (FIFO) Cache
 */
export class FIFOCache extends BaseCache {
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.set(key, value); // Update existing
    } else {
      if (this.cache.size >= this.capacity) {
        // Evict the first item that was added
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(key, value);
    }
  }
}

/**
 * Least Frequently Used (LFU) Cache
 *
 * BOLT OPTIMIZATION: Optimized to O(1) complexity for all operations using a
 * frequency-to-keys mapping and maintaining a minFreq pointer. Tie-breaking
 * uses recency (LRU) within the same frequency bucket, achieved via JS Set's
 * insertion order.
 */
export class LFUCache extends BaseCache {
  constructor(capacity) {
    super(capacity);
    this.keyToFreq = new Map();
    this.freqToKeys = new Map();
    this.minFreq = 0;
  }

  get(key) {
    const value = super.get(key);
    if (value !== null) {
      this._updateFrequency(key);
    }
    return value;
  }

  put(key, value) {
    if (this.capacity === 0) return;

    if (this.cache.has(key)) {
      this.cache.set(key, value); // Update value
      this._updateFrequency(key);
      return;
    }

    if (this.cache.size >= this.capacity) {
      // Evict the least frequently used item.
      // Tie-breaking: JS Set maintains insertion order, so the first item
      // in the set is the least recently used among those with minFreq.
      const keysAtMinFreq = this.freqToKeys.get(this.minFreq);
      const lruKey = keysAtMinFreq.values().next().value;

      keysAtMinFreq.delete(lruKey);
      if (keysAtMinFreq.size === 0) {
        this.freqToKeys.delete(this.minFreq);
      }

      this.cache.delete(lruKey);
      this.keyToFreq.delete(lruKey);
    }

    // Add new item
    this.cache.set(key, value);
    this.keyToFreq.set(key, 1);
    this.minFreq = 1;

    if (!this.freqToKeys.has(1)) {
      this.freqToKeys.set(1, new Set());
    }
    this.freqToKeys.get(1).add(key);
  }

  _updateFrequency(key) {
    const freq = this.keyToFreq.get(key);
    const newFreq = freq + 1;

    this.keyToFreq.set(key, newFreq);

    const keysAtFreq = this.freqToKeys.get(freq);
    keysAtFreq.delete(key);

    if (keysAtFreq.size === 0) {
      this.freqToKeys.delete(freq);
      if (this.minFreq === freq) {
        this.minFreq++;
      }
    }

    if (!this.freqToKeys.has(newFreq)) {
      this.freqToKeys.set(newFreq, new Set());
    }
    this.freqToKeys.get(newFreq).add(key);
  }
}
