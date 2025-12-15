/**
 * Real-World Example: Compressing Data for Real-Time Network Transfer
 *
 * Problem: An application needs to send a large payload (e.g., a JSON object or
 * a game state update) over the network. To save bandwidth, the data should be
 * compressed. However, to maintain low latency, the entire compress-and-send
 * operation must complete within a strict budget (e.g., 50ms).
 *
 * High-level Gzip compression can be slow. If we try to use the best compression,
 * we might miss our latency budget. If we use the fastest compression, we might
 * use too much bandwidth.
 *
 * Solution: `AnytimeGzip` allows us to get the best of both worlds. We give it
 * the entire latency budget. It will start with the fastest, lowest-quality
 * compression and, if time allows, iteratively improve it. It guarantees that
 * it will return the best possible compression result achieved within the deadline.
 */

import AnytimeGzip from '../src/time-aware/AnytimeGzip.js';
import { Buffer } from 'buffer';

// --- 1. Create a large, compressible payload ---
const payload = {
  timestamp: Date.now(),
  users: Array.from({ length: 1000 }, (_, i) => ({
    id: `user_${i}`,
    status: Math.random() > 0.5 ? 'active' : 'inactive',
    lastSeen: Date.now() - Math.floor(Math.random() * 100000),
    data: 'a'.repeat(500) // Highly compressible string
  })),
};
const payloadBuffer = Buffer.from(JSON.stringify(payload));


// --- 2. Simulate different network conditions (latency budgets) ---

const runSimulation = (name, deadlineMs) => {
  console.log(`\n--- Simulation: ${name} (Deadline: ${deadlineMs}ms) ---`);
  const compressor = new AnytimeGzip(deadlineMs);
  const result = compressor.compress(payloadBuffer);

  console.log(`  - Time Elapsed:       ${result.timeElapsed.toFixed(2)}ms`);
  console.log(`  - Deadline Met:       ${result.metDeadline}`);
  console.log(`  - Compression Level:  ${result.level}`);
  console.log(`  - Compression Quality: ${(result.quality * 100).toFixed(1)}%`);
  console.log(`  - Original Size:      ${(payloadBuffer.length / 1024).toFixed(2)} KB`);
  console.log(`  - Compressed Size:    ${result.buffer ? (result.buffer.length / 1024).toFixed(2) + ' KB' : 'N/A'}`);

  if (result.metDeadline) {
      console.log("  - Outcome: Best compression within the budget was achieved and sent.");
  } else {
      console.log("  - Outcome: The operation was halted to meet the latency budget. The best result found so far was sent.");
  }
};

// Scenario 1: Unstable, high-latency network (very tight budget)
runSimulation('High Latency Network', 5);

// Scenario 2: Average mobile network (moderate budget)
runSimulation('Average Network', 20);

// Scenario 3: Fast, stable network (generous budget)
runSimulation('Fast Network', 100);
