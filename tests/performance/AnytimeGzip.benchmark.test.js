import AnytimeGzip from '../../src/time-aware/AnytimeGzip.js';
import { Buffer } from 'buffer';
import { describe, it } from '@jest/globals';

describe('AnytimeGzip Performance Benchmark', () => {
  // Create a large, highly compressible payload (e.g., repeating string)
  const payloadSize = 5 * 1024 * 1024; // 5MB
  const payloadBuffer = Buffer.alloc(payloadSize, 'a');

  it('should measure compression quality at different deadlines', () => {
    const deadlines = [1, 5, 10, 20, 50, 100]; // in milliseconds

    console.log(`\n--- AnytimeGzip Benchmark (Input Size: ${payloadSize / (1024 * 1024)}MB) ---`);
    console.log('Deadline (ms) | Time Elapsed (ms) | Level | Quality (%) | Compressed Size (KB)');
    console.log('----------------------------------------------------------------------------------');

    for (const deadline of deadlines) {
      const compressor = new AnytimeGzip(deadline);
      const result = compressor.compress(payloadBuffer);

      const timeElapsedStr = result.timeElapsed.toFixed(2).padStart(17);
      const levelStr = String(result.level).padStart(5);
      const qualityStr = (result.quality * 100).toFixed(2).padStart(11);
      const sizeStr = result.buffer ? (result.buffer.length / 1024).toFixed(2).padStart(20) : 'N/A'.padStart(20);
      const deadlineStr = String(deadline).padStart(13);

      console.log(`${deadlineStr} | ${timeElapsedStr} | ${levelStr} | ${qualityStr} | ${sizeStr}`);
    }

    console.log('----------------------------------------------------------------------------------');
    console.log('Benchmark complete. This demonstrates the trade-off between time and compression quality.');
  });
});
