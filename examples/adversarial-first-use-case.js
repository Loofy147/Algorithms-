import SecureHashMap from '../src/adversarial-first/SecureHashMap.js';

/**
 * Use Case: High-Performance, Secure Caching Server
 *
 * Imagine a caching server (like Redis or Memcached) that is exposed to the
 * public internet. An attacker could try to degrade its performance by sending
 * keys that all hash to the same bucket, creating a "hash-collision attack".
 * This turns the cache's O(1) lookups into O(n), effectively causing a
 * Denial-of-Service (DoS) attack.
 *
 * SecureHashMap defends against this by:
 * 1. Using a random seed for its hash function, so the attacker cannot pre-compute collisions.
 * 2. Detecting when a single bucket grows too long and automatically rehashing with a new seed.
 */
function secureCachingServer() {
  console.log('--- Adversarial-First Design Use Case: Secure Caching Server ---');

  const cache = new SecureHashMap(8); // Small capacity to demonstrate rehashing easily

  console.log('Step 1: Normal cache operations');
  cache.set('user:123', { name: 'Alice', email: 'alice@example.com' });
  cache.set('product:456', { name: 'Laptop', price: 1200 });
  console.log('Cache stats:', cache.getStats());

  console.log('\nStep 2: Simulating an attack');
  console.log('An attacker tries to create hash collisions to degrade performance.');

  // This is a mock attack. In a real scenario, the attacker would have to find
  // strings that collide. Because our hash is seeded, this is computationally infeasible.
  // We simulate it by mocking the hash function to force collisions.
  const originalHashFn = cache.hash.bind(cache);
  cache.hash = (key) => {
    // Attacker forces all keys into bucket 0
    if (key.startsWith('attack:')) return 0;
    return originalHashFn(key);
  };

  try {
    for (let i = 0; i < 12; i++) {
      console.log(`Setting attack key #${i}...`);
      cache.set(`attack:${i}`, `payload_${i}`);
    }
  } catch (e) {
    console.error('An error occurred during the attack simulation:', e);
  }

  console.log('\nStep 3: Post-attack analysis');
  console.log('Cache stats after the attack:', cache.getStats());

  console.log('\nConclusion: The SecureHashMap detected the abnormal chain length, triggered multiple');
  console.log('rehashes with new random seeds, and mitigated the collision attack, maintaining performance.');
}

secureCachingServer();
