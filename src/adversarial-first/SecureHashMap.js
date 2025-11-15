import { config } from '../config.js';
import { logger } from '../logger.js';
import crypto from 'crypto';

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
    this.rehashCount = 0;
    // Rate-limiting for collision detection
    this.collisionTimestamps = [];
    this.rateLimitConfig = {
        maxEvents: 10, // Max collisions
        timeWindow: 1000 // Per 1 second
    };
    this.constantTimeMode = true;
  }

  cryptoRandomBigInt() {
    // Node.js crypto module for CSPRNG
    const buf = crypto.randomBytes(8);
    return buf.readBigUInt64LE(0);
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
        const now = Date.now();
        this.collisionTimestamps.push(now);
        // Evict timestamps older than the time window
        this.collisionTimestamps = this.collisionTimestamps.filter(
            ts => now - ts < this.rateLimitConfig.timeWindow
        );
        logger.warn({ bucketIndex: idx, bucketLength: bucket.length, recentCollisions: this.collisionTimestamps.length }, 'Potential collision detected');
        // Check if the rate of collisions exceeds the configured threshold
        if (this.collisionTimestamps.length >= this.rateLimitConfig.maxEvents) {
            logger.error('High-rate collision attack detected, expanding map to mitigate...');
            this.expand();
            this.collisionTimestamps = []; // Reset after expansion
            return this.set(key, value); // Retry the operation
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

    if (this.loadFactor() >= 0.75) {
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

  delete(key) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    let foundIdx = -1;
    let found = false;

    // Constant-time search: iterate through the entire bucket
    for (let i = 0; i < bucket.length; i++) {
        const match = this.constantTimeEquals(bucket[i][0], key);
        // Branchless assignment to avoid timing leaks
        foundIdx = match ? i : foundIdx;
        found = found || match;
    }

    // Perform the deletion outside the loop
    if (found) {
        // To keep the operation constant time, we can replace the found element
        // with the last element and pop, which is faster than splice.
        // However, for simplicity and since the bucket size is small, splice is acceptable
        // as long as the search part is constant time.
        // A more rigorous approach would involve a constant-time splice.
        if (foundIdx !== bucket.length - 1) {
            bucket[foundIdx] = bucket[bucket.length - 1];
        }
        bucket.pop();
    }

    return found;
  }

  constantTimeEquals(a, b) {
    const strA = String(a);
    const strB = String(b);

    // Use SHA-256 to create fixed-length, collision-resistant hashes.
    const hashA = crypto.createHash('sha256').update(strA).digest();
    const hashB = crypto.createHash('sha256').update(strB).digest();

    // crypto.timingSafeEqual requires buffers of the same length.
    // Our hashes are always the same length (32 bytes for SHA-256).
    return crypto.timingSafeEqual(hashA, hashB);
  }

  expand() {
    this.rehashCount++;
    const oldCapacity = this.capacity;
    const newCapacity = oldCapacity * 2;
    logger.info({ oldCapacity, newCapacity, rehashCount: this.rehashCount }, 'Expanding hash map');

    const newSeed_k0 = this.cryptoRandomBigInt();
    const newSeed_k1 = this.cryptoRandomBigInt();
    const newBuckets = Array(newCapacity).fill(null).map(() => []);

    // Helper function to hash with the new context
    const newHash = (key) => {
        const textEncoder = new TextEncoder();
        const keyBytes = textEncoder.encode(String(key));
        const hashValue = siphash24(keyBytes, newSeed_k0, newSeed_k1);
        return Number(hashValue % BigInt(newCapacity));
    };

    // Re-hash all existing items into the new buckets
    for (const bucket of this.buckets) {
        for (const [key, value] of bucket) {
            const newIdx = newHash(key);
            newBuckets[newIdx].push([key, value]);
        }
    }

    // Atomically swap to the new state
    this.capacity = newCapacity;
    this.buckets = newBuckets;
    this.seed_k0 = newSeed_k0;
    this.seed_k1 = newSeed_k1;
    this.collisionTimestamps = []; // Reset rate-limiter
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
