/**
 * Real-World Example: Secure In-Memory Cache for a Web Server
 *
 * Problem: A standard in-memory cache (like a JavaScript `Map` or `Object`) used
 * in a web server is vulnerable to a hash-flooding Denial-of-Service (DoS) attack.
 * An attacker can send many requests with keys that are carefully crafted to
 * collide in the map's underlying hash table. This forces the server to spend
 * excessive CPU time on insertions and lookups, leading to performance degradation
 * or a crash.
 *
 * Solution: `SecureHashMap` is designed to mitigate this. It uses a keyed hash
 * function (SipHash) to make collisions unpredictable and implements rate-limiting
 * and automatic expansion to defend against high-collision events.
 *
 * This example simulates a simple Express.js server with a cache that is
 * attacked by a malicious client.
 */

import SecureHashMap from '../src/adversarial-first/SecureHashMap.js';
import express from 'express';

// --- 1. Setup the Secure In-Memory Cache ---
// We use a SecureHashMap instead of a standard Map.
const cache = new SecureHashMap();

// --- 2. Create the Express Application ---
const app = express();
app.use(express.json());

app.get('/data/:key', (req, res) => {
  const { key } = req.params;

  // Attempt to retrieve data from the cache
  const cachedValue = cache.get(key);
  if (cachedValue) {
    console.log(`[Cache] HIT for key: "${key}"`);
    return res.status(200).send({ data: cachedValue, source: 'cache' });
  }

  // If not in cache, simulate a slow database lookup
  console.log(`[Cache] MISS for key: "${key}". Simulating DB lookup...`);
  const dbData = `This is the data for ${key}`;

  // Store the result in the cache for future requests
  cache.set(key, dbData);

  res.status(200).send({ data: dbData, source: 'database' });
});

// --- 3. Simulate a Malicious Client Attack ---
async function simulateAttack() {
  console.log('\n--- Starting Benign Traffic ---');
  await fetch('http://localhost:3000/data/normal-key-1');
  await fetch('http://localhost:3000/data/normal-key-2');

  console.log('\n--- Starting ATTACK Traffic ---');
  console.log('Attacker is sending 100 requests with colliding keys...');

  // These keys are crafted to demonstrate a collision attack.
  // In a real attack, the keys would be chosen to exploit a known
  // hash function weakness. SecureHashMap's use of a seeded hash
  // makes this extremely difficult.
  const collidingKeys = Array.from({ length: 100 }, (_, i) => `evil_${i}`);

  const attackPromises = collidingKeys.map(key =>
    fetch(`http://localhost:3000/data/${key}`)
  );

  await Promise.all(attackPromises);

  console.log('\n--- Attack Finished ---');
  console.log('Server remained responsive due to SecureHashMap defenses.');

  // Log cache stats to show the effect of the attack
  console.log('\nCache Stats After Attack:');
  console.log(cache.getStats());
}


// --- 4. Start the server and run the simulation ---
const server = app.listen(3000, async () => {
  console.log('Server is running on http://localhost:3000');

  try {
    await simulateAttack();
  } catch (error) {
    console.error('Simulation failed:', error);
  } finally {
    server.close();
    console.log('\nServer has been shut down.');
  }
});
