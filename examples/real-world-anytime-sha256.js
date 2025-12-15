/**
 * Real-World Example: Interruptible File Integrity Checking
 *
 * Problem: A desktop application or a server needs to verify the integrity of a
 * large file (e.g., a downloaded update, a user upload) by hashing it. A
 * synchronous, blocking hash of a multi-gigabyte file could take several seconds,
 * freezing the application's UI or making a server unresponsive.
 *
 * This operation needs to be performed without blocking the main event loop for
 * more than a few milliseconds at a time to maintain responsiveness.
 *
 * Solution: `AnytimeSHA256` can be used to perform the hashing in an
 * interruptible manner. By giving it a very short deadline, we can ensure that
 * it only processes a small chunk of the file before yielding back to the event
 * loop. We can then repeatedly call it until the entire file is processed.
 *
 * This example simulates this non-blocking hashing process.
 */

import AnytimeSHA256 from '../src/time-aware/AnytimeSHA256.js';
import { Buffer } from 'buffer';

// --- 1. Create a large file buffer to simulate the data ---
const FILE_SIZE_MB = 50;
console.log(`Simulating a ${FILE_SIZE_MB}MB file...`);
// Note: In a real app, you would read the file in chunks from disk.
const largeFileBuffer = Buffer.alloc(FILE_SIZE_MB * 1024 * 1024, 'x');

// --- 2. Set a very short deadline to ensure non-blocking behavior ---
// A short deadline forces the hasher to process only one chunk at a time
// and then return, allowing other events to be processed.
const DEADLINE_MS = 10;
const hasher = new AnytimeSHA256(DEADLINE_MS);

// --- 3. Process the file hash in a cooperative, non-blocking loop ---
async function nonBlockingHash(fileBuffer) {
  console.log(`Starting non-blocking hash with a deadline of ${DEADLINE_MS}ms per chunk...`);

  let result = null;
  let totalTime = 0;

  // This loop simulates cooperatively giving up the main thread.
  // In a real UI app, you'd use `requestIdleCallback` or `setTimeout`.
  while (true) {
    result = hasher.hash(fileBuffer);
    totalTime += result.timeElapsed;

    if (result.quality === 1.0) {
      // The hash is complete
      break;
    }

    // If the hash is not complete, it means the deadline was hit.
    // We can "yield" to the event loop and continue later.
    console.log(`  - Processed a chunk in ${result.timeElapsed.toFixed(2)}ms. Yielding...`);
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to event loop
  }

  console.log('\n--- Hashing Complete ---');
  console.log(`Final Hash:    ${result.hash.substring(0, 48)}...`);
  console.log(`Total CPU Time:  ${totalTime.toFixed(2)}ms`);
  console.log('The application remained responsive throughout the hashing process.');

  return result;
}

nonBlockingHash(largeFileBuffer);
