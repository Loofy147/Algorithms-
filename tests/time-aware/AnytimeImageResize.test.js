import { jest } from '@jest/globals';
import sharp from 'sharp';
import AnytimeImageResize from '../../src/time-aware/AnytimeImageResize.js';

describe('AnytimeImageResize', () => {
  let testImage;

  beforeAll(async () => {
    // Create a dummy 100x100 image for testing
    testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    }).png().toBuffer();
  });

  it('should resize an image within a generous deadline', async () => {
    const resizer = new AnytimeImageResize(1000); // 1 second deadline
    const result = await resizer.resize(testImage, { width: 50, height: 50 });

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.quality).toBe(1.0); // Should complete all kernels
    expect(result.kernel).toBe('lanczos3');
    expect(result.metDeadline).toBe(true);

    const metadata = await sharp(result.buffer).metadata();
    expect(metadata.width).toBe(50);
    expect(metadata.height).toBe(50);
  });

  it('should return a lower-quality result if the deadline is very short', async () => {
    jest.setTimeout(10000);
    // A generous deadline should produce the best possible quality
    const highQualityResizer = new AnytimeImageResize(5000);
    const highQualityResult = await highQualityResizer.resize(testImage, { width: 50, height: 50 });
    expect(highQualityResult.kernel).toBe('lanczos3');

    // A very short deadline should force an early exit
    const lowQualityResizer = new AnytimeImageResize(1); // 1ms deadline
    const lowQualityResult = await lowQualityResizer.resize(testImage, { width: 50, height: 50 });

    expect(lowQualityResult.kernel).not.toBe(highQualityResult.kernel);
    expect(lowQualityResult.quality).toBeLessThan(highQualityResult.quality);
  });

  it('should return a null buffer if no resizing can be completed', async () => {
    const resizer = new AnytimeImageResize(0);
    const result = await resizer.resize(testImage, { width: 50, height: 50 });
    expect(result.buffer).toBeNull();
    expect(result.quality).toBe(0);
    expect(result.kernel).toBe('none');
  });
});
