import { config } from '../config.js';
import { logger } from '../logger.js';

// Helper for 64-bit BigInt rotation.
const rotl64 = (x, b) => (x << b) | (x >> (64n - b));

function siphash24(msg, k0, k1) {
    let v0 = 0x736f6d6570736575n ^ k0;
    let v1 = 0x646f72616e646f6dn ^ k1;
    let v2 = 0x6c7967656e657261n ^ k0;
    let v3 = 0x7465646279746573n ^ k1;

    const sipRound = () => {
        v0 = (v0 + v1) & 0xFFFFFFFFFFFFFFFFn; v1 = rotl64(v1, 13n); v1 ^= v0; v0 = rotl64(v0, 32n);
        v2 = (v2 + v3) & 0xFFFFFFFFFFFFFFFFn; v3 = rotl64(v3, 16n); v3 ^= v2;
        v0 = (v0 + v3) & 0xFFFFFFFFFFFFFFFFn; v3 = rotl64(v3, 21n); v3 ^= v0;
        v2 = (v2 + v1) & 0xFFFFFFFFFFFFFFFFn; v1 = rotl64(v1, 17n); v1 ^= v2; v2 = rotl64(v2, 32n);
    };

    const len = msg.length;
    const paddedLen = len + (8 - (len % 8));
    const paddedMsg = new Uint8Array(paddedLen);
    paddedMsg.set(msg);
    paddedMsg[len] = len & 0xff;

    const view = new DataView(paddedMsg.buffer);
    for (let i = 0; i < paddedLen; i += 8) {
        const mi = view.getBigUint64(i, true);
        v3 ^= mi;
        sipRound();
        sipRound();
        v0 ^= mi;
    }

    v2 ^= 255n;
    sipRound();
    sipRound();
    sipRound();
    sipRound();

    return (v0 ^ v1 ^ v2 ^ v3) & 0xFFFFFFFFFFFFFFFFn;
}

export default class SecureHashMap {
  constructor(capacity = 16) {
    this.capacity = capacity;
    this.seed_k0 = this.cryptoRandomBigInt();
    this.seed_k1 = this.cryptoRandomBigInt();
    this.buckets = Array(capacity).fill(null).map(() => []);
    this.maxChainLength = config.secureHashMap.maxChainLength;
    this.collisionThreshold = config.secureHashMap.collisionThreshold;
    this.collisionCount = 0;
    this.rehashCount = 0;
    this.constantTimeMode = true;
  }

  cryptoRandomBigInt() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new BigUint64Array(1);
        crypto.getRandomValues(arr);
        return arr[0];
    }
    throw new Error('Cryptographically secure random BigInt not available');
  }

  hash(key) {
    const textEncoder = new TextEncoder();
    const keyBytes = textEncoder.encode(String(key));
    const hashValue = siphash24(keyBytes, this.seed_k0, this.seed_k1);
    return Number(hashValue % BigInt(this.capacity));
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
    this.seed_k0 = this.cryptoRandomBigInt();
    this.seed_k1 = this.cryptoRandomBigInt();
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
      rehashes: this.rehashCount,
    };
  }
}
