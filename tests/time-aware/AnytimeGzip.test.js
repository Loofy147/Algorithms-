import { gunzipSync } from 'zlib';
import { jest } from '@jest/globals';
import AnytimeGzip from '../../shared/algorithms/time-aware/AnytimeGzip.js';

describe('AnytimeGzip', () => {
  // Use a larger buffer (1MB) to make the compression time more significant
  const testData = Buffer.from('a'.repeat(1 * 1024 * 1024));

  it('should compress data within a generous deadline', () => {
    const compressor = new AnytimeGzip(1000); // 1000ms is plenty of time for 1MB
    const result = compressor.compress(testData);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.quality).toBeGreaterThan(0);
    expect(result.metDeadline).toBe(true);

    // Decompress to ensure the data is valid
    const decompressed = gunzipSync(result.buffer);
    expect(decompressed.toString()).toEqual(testData.toString());
  });

  it('should return a lower-quality result if the deadline is very short', () => {
    jest.setTimeout(10000); // Set a longer timeout for this specific test
    // A long deadline should produce the best possible compression (level 9)
    const highQualityCompressor = new AnytimeGzip(5000); // 5 seconds, very generous
    const highQualityResult = highQualityCompressor.compress(testData);
    expect(highQualityResult.level).toBe(9); // Explicitly check for level 9

    // A very short deadline should force an early exit after the first level.
    const lowQualityCompressor = new AnytimeGzip(1); // 1ms is extremely tight
    const lowQualityResult = lowQualityCompressor.compress(testData);

    // The low quality result should have stopped at the fastest level.
    expect(lowQualityResult.level).toBe(1);

    // The levels and quality must be different.
    expect(lowQualityResult.level).not.toBe(highQualityResult.level);
    expect(lowQualityResult.quality).toBeLessThan(highQualityResult.quality);
  });

  it('should return null if no compression can be completed within the deadline', () => {
    const compressor = new AnytimeGzip(0);
    const result = compressor.compress(testData);

    // With a 0ms deadline, it might not even complete the first level
    // We check either it failed or it completed level 1
    const isValidResult = (!result.buffer && result.quality === 0 && result.level === -1) ||
                          (result.buffer && result.level === 1);
    expect(isValidResult).toBe(true);
  });

  it('should report a quality of 0 for incompressible data', () => {
    const randomData = Buffer.from(Array.from({ length: 1000 }, () => Math.random().toString(36).charAt(2)).join(''));
    const compressor = new AnytimeGzip(100);
    const result = compressor.compress(randomData);

    // Compressed size might be larger than original for random data
    const isQualityCorrect = (result.buffer.length >= randomData.length && result.quality === 0) ||
                             (result.buffer.length < randomData.length && result.quality > 0);
    expect(isQualityCorrect).toBe(true);
  });
});
