import sharp from 'sharp';
import { z } from 'zod';
import { logger } from '../logger.js';

const deadlineSchema = z.number().nonnegative({ message: 'Deadline must be a non-negative number.' });
const resizeOptionsSchema = z.object({
  width: z.number().int().positive({ message: 'Width must be a positive integer.' }),
  height: z.number().int().positive({ message: 'Height must be a positive integer.' }),
});
const bufferSchema = z.instanceof(Buffer, { message: 'Input must be a Buffer.' });

/**
 * An "anytime" image resizing algorithm that progressively improves
 * image quality within a given time budget (deadline).
 */
export default class AnytimeImageResize {
  constructor(deadline) {
    deadlineSchema.parse(deadline);
    this.deadline = deadline;
    this.startTime = null;
  }

  /**
   * Resizes the input image buffer. It starts with the fastest resizing
   * kernel and iteratively improves it if time allows.
   * @param {Buffer} inputBuffer The image data to resize.
   * @param {object} options The resize options.
   * @param {number} options.width The target width.
   * @param {number} options.height The target height.
   * @returns {Promise<{
   *   buffer: Buffer | null,
   *   quality: number,
   *   kernel: string,
   *   timeElapsed: number,
   *   metDeadline: boolean
   * }>} The resizing result.
   */
  async resize(inputBuffer, options) {
    bufferSchema.parse(inputBuffer);
    resizeOptionsSchema.parse(options);
    this.startTime = Date.now();
    let bestBuffer = null;
    let bestKernel = 'none';

    // Sharp kernels from fastest to highest quality
    const kernels = ['nearest', 'linear', 'cubic', 'mitchell', 'lanczos2', 'lanczos3'];

    for (const kernel of kernels) {
      if (this.timeExceeded()) {
        logger.debug({ kernel, timeElapsed: this.timeElapsed() }, 'AnytimeImageResize deadline reached, stopping further resizing.');
        break;
      }

      logger.debug({ kernel }, `Attempting resize with kernel ${kernel}`);
      const currentBuffer = await sharp(inputBuffer)
        .resize({
          width: options.width,
          height: options.height,
          kernel: sharp.kernel[kernel],
        })
        .toBuffer();

      bestBuffer = currentBuffer;
      bestKernel = kernel;
    }

    const timeElapsed = this.timeElapsed();
    // Quality is subjective, so we'll use the kernel index as a proxy
    const quality = bestBuffer ? (kernels.indexOf(bestKernel) + 1) / kernels.length : 0;

    return {
      buffer: bestBuffer,
      quality: Math.max(0, quality),
      kernel: bestKernel,
      timeElapsed,
      metDeadline: timeElapsed <= this.deadline,
    };
  }

  timeElapsed() {
    return Date.now() - this.startTime;
  }

  timeExceeded() {
    return this.timeElapsed() >= this.deadline;
  }
}
