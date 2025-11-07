import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Adversarial-Resistant HashMap
 *
 * Defenses:
 * 1. Randomized hash function (SipHash-style)
 * 2. Collision attack detection
 * 3. Automatic rehashing under attack
 * 4. Constant-time operations (timing attack resistant)
 */
export default class SecureHashMap {
  constructor(capacity = 16) {
    this.capacity = capacity;

    // CRITICAL: Random seed prevents collision attacks
    this.seed1 = this.cryptoRandomInt();
    this.seed2 = this.cryptoRandomInt();

    this.buckets = Array(capacity).fill(null).map(() => []);

    // Attack detection thresholds from config
    this.maxChainLength = config.secureHashMap.maxChainLength;
    this.collisionThreshold = config.secureHashMap.collisionThreshold;
    this.collisionCount = 0;
    this.rehashCount = 0;

    // Timing attack mitigation
    this.constantTimeMode = true;
  }

  cryptoRandomInt() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    }
    throw new Error('Cryptographically secure random not available');
  }

  hash(key) {
    let h = this.seed1;
    const str = String(key);

    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h = this.sipRound(h, c, this.seed2);
    }

    return Math.abs(h) % this.capacity;
  }

  sipRound(v, m, k) {
    v = (v + m) & 0xFFFFFFFF;
    v = (v ^ k) & 0xFFFFFFFF;
    v = ((v << 13) | (v >>> 19)) & 0xFFFFFFFF;
    v = (v + k) & 0xFFFFFFFF;
    return v;
  }

  set(key, value) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];

    if (bucket.length >= this.maxChainLength) {
      this.collisionCount++;
      logger.warn({ bucketIndex: idx, bucketLength: bucket.length }, 'Potential collision attack detected');

      if (this.collisionCount >= this.collisionThreshold) {
        logger.info('Collision threshold exceeded, initiating rehash...');
        this.rehashWithNewSeed();
        return this.set(key, value);
      }
    }

    let foundIdx = -1;
    let found = false;
    if (this.constantTimeMode) {
      for (let i = 0; i < bucket.length; i++) {
        const match = this.constantTimeEquals(bucket[i][0], key);
        foundIdx = match ? i : foundIdx;
        found = found || match;
      }
    } else {
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i][0] === key) {
          found = true;
          foundIdx = i;
          break;
        }
      }
    }

    if (found) {
      bucket[foundIdx][1] = value;
    } else {
      bucket.push([key, value]);
    }

    if (this.loadFactor() > 0.75) {
      this.expand();
    }
  }

  get(key) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];

    if (this.constantTimeMode) {
      let result = undefined;
      for (let i = 0; i < bucket.length; i++) {
        if (this.constantTimeEquals(bucket[i][0], key)) {
          result = bucket[i][1];
        }
      }
      return result;
    } else {
      for (let [k, v] of bucket) {
        if (k === key) return v;
      }
      return undefined;
    }
  }

  constantTimeEquals(a, b) {
    const strA = String(a);
    const strB = String(b);
    const maxLen = Math.max(strA.length, strB.length);
    let diff = strA.length ^ strB.length;
    for (let i = 0; i < maxLen; i++) {
      const charA = i < strA.length ? strA.charCodeAt(i) : 0;
      const charB = i < strB.length ? strB.charCodeAt(i) : 0;
      diff |= charA ^ charB;
    }
    return diff === 0;
  }

  rehashWithNewSeed() {
    this.rehashCount++;
    logger.info({ rehashCount: this.rehashCount }, 'Rehashing with new random seed');

    this.seed1 = this.cryptoRandomInt();
    this.seed2 = this.cryptoRandomInt();

    const oldBuckets = this.buckets;
    this.buckets = Array(this.capacity).fill(null).map(() => []);
    this.collisionCount = 0;

    for (let bucket of oldBuckets) {
      for (let [key, value] of bucket) {
        const newIdx = this.hash(key);
        this.buckets[newIdx].push([key, value]);
      }
    }
  }

  expand() {
    logger.info({ oldCapacity: this.capacity, newCapacity: this.capacity * 2 }, 'Expanding hash map');
    this.capacity *= 2;
    this.rehashWithNewSeed();
  }

  loadFactor() {
    const totalItems = this.buckets.reduce((sum, b) => sum + b.length, 0);
    return totalItems / this.capacity;
  }

  getStats() {
    const chains = this.buckets.map(b => b.length);
    return {
      size: chains.reduce((a, b) => a + b, 0),
      capacity: this.capacity,
      loadFactor: this.loadFactor().toFixed(2),
      maxChain: Math.max(...chains),
      avgChain: (chains.reduce((a, b) => a + b) / chains.length).toFixed(2),
      collisionEvents: this.collisionCount,
      rehashes: this.rehashCount
    };
  }
}
