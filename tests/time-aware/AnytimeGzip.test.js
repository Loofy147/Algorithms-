import { gunzipSync } from 'zlib';
import AnytimeGzip from '../../src/time-aware/AnytimeGzip.js';

describe('AnytimeGzip', () => {
  const testData = Buffer.from('a'.repeat(10000)); // Highly compressible data

  it('should compress data within a generous deadline', () => {
    const compressor = new AnytimeGzip(100); // 100ms is plenty of time
    const result = compressor.compress(testData);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.quality).toBeGreaterThan(0);
    expect(result.metDeadline).toBe(true);

    // Decompress to ensure the data is valid
    const decompressed = gunzipSync(result.buffer);
    expect(decompressed.toString()).toEqual(testData.toString());
  });

  it('should return a lower-quality result if the deadline is very short', () => {
    // A long deadline should produce the best possible compression
    const highQualityCompressor = new AnytimeGzip(200);
    const highQualityResult = highQualityCompressor.compress(testData);

    // A very short deadline should force it to stop at a lower compression level
    const lowQualityCompressor = new AnytimeGzip(1); // 1ms is very tight
    const lowQualityResult = lowQualityCompressor.compress(testData);

    expect(lowQualityResult.level).not.toBe(highQualityResult.level);
    expect(lowQualityResult.quality).toBeLessThan(highQualityResult.quality);
  });

  it('should return null if no compression can be completed within the deadline', () => {
    const compressor = new AnytimeGzip(0);
    const result = compressor.compress(testData);

    // With a 0ms deadline, it might not even complete the first level
    if (!result.buffer) {
        expect(result.quality).toBe(0);
        expect(result.level).toBe(-1);
    } else {
        // If it did complete, it should be the lowest quality
        expect(result.level).toBe(1);
    }
  });

  it('should report a quality of 0 for incompressible data', () => {
    const randomData = Buffer.from(Array.from({ length: 1000 }, () => Math.random().toString(36).charAt(2)).join(''));
    const compressor = new AnytimeGzip(100);
    const result = compressor.compress(randomData);

    // Compressed size might be larger than original for random data
    if (result.buffer.length >= randomData.length) {
      expect(result.quality).toBe(0);
    } else {
      expect(result.quality).toBeGreaterThan(0);
    }
  });
});
