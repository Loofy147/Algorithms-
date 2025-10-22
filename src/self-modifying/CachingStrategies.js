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
 */
export class LFUCache extends BaseCache {
  constructor(capacity) {
    super(capacity);
    this.freq = new Map();
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
      this.cache.set(key, value);
      this._updateFrequency(key);
      return;
    }

    if (this.cache.size >= this.capacity) {
      let minFreq = Infinity;
      let keysToDelete = [];
      for (const [key, freq] of this.freq.entries()) {
        if (freq < minFreq) {
          minFreq = freq;
          keysToDelete = [key];
        } else if (freq === minFreq) {
          keysToDelete.push(key);
        }
      }

      // Tie-breaking: Evict the least recently used (first in insertion order)
      for (const key of this.cache.keys()) {
        if (keysToDelete.includes(key)) {
          this.cache.delete(key);
          this.freq.delete(key);
          break;
        }
      }
    }

    this.cache.set(key, value);
    this.freq.set(key, 1);
  }

  _updateFrequency(key) {
    const currentFreq = this.freq.get(key) || 0;
    this.freq.set(key, currentFreq + 1);
  }
}
