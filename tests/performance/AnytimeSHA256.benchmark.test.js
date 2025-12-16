import AnytimeSHA256 from '../../src/time-aware/AnytimeSHA256.js';
import { Buffer } from 'buffer';
import { describe, it, jest } from '@jest/globals';

describe('AnytimeSHA256 Performance Benchmark', () => {
  const dataSize = 50 * 1024 * 1024; // 50MB
  const dataBuffer = Buffer.alloc(dataSize, 'x');

  // Increase the timeout for this long-running test
  jest.setTimeout(30000); // 30 seconds

  it('should measure hashing throughput at different deadlines', async () => {
    const deadlines = [5, 10, 20, 50, 100]; // in milliseconds

    console.log(`\n--- AnytimeSHA256 Benchmark (Input Size: ${dataSize / (1024 * 1024)}MB) ---`);
    console.log('Deadline (ms) | Total Time (ms) | Throughput (MB/s) | Result');
    console.log('-------------------------------------------------------------------');

    for (const deadline of deadlines) {
      const hasher = new AnytimeSHA256(deadline);
      const result = await hasher.hash(dataBuffer);
      const totalTime = result.timeElapsed;
      const throughput = dataSize / (totalTime / 1000) / (1024 * 1024);

      const deadlineStr = String(deadline).padStart(13);
      const totalTimeStr = totalTime.toFixed(2).padStart(15);
      const throughputStr = throughput.toFixed(2).padStart(17);
      const resultStr = result.hash ? 'Success' : 'Aborted';

      console.log(`${deadlineStr} | ${totalTimeStr} | ${throughputStr} | ${resultStr}`);
    }

    console.log('-------------------------------------------------------------------');
    console.log('Benchmark complete. This shows how chunking affects total time and throughput.');
  });
});
