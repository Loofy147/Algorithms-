import { gzipSync } from 'zlib';
import { z } from 'zod';
import { logger } from '../logger.js';

const deadlineSchema = z.number().nonnegative({ message: 'Deadline must be a non-negative number.' });
const bufferSchema = z.instanceof(Buffer, { message: 'Input must be a Buffer.' });

/**
 * An "anytime" Gzip compression algorithm that progressively improves
 * compression quality within a given time budget (deadline).
 */
export default class AnytimeGzip {
  constructor(deadline) {
    deadlineSchema.parse(deadline);
    this.deadline = deadline;
    this.startTime = null;
  }

  /**
   * Compresses the input data buffer. It starts with the fastest compression
   * level and iteratively improves it if time allows.
   * @param {Buffer} inputBuffer The data to compress.
   * @returns {{
   *   buffer: Buffer | null,
   *   quality: number,
   *   level: number,
   *   timeElapsed: number,
   *   metDeadline: boolean
   * }} The compression result.
   */
  compress(inputBuffer) {
    bufferSchema.parse(inputBuffer);
    this.startTime = Date.now();
    let bestBuffer = null;
    let bestLevel = -1;

    // To simplify the anytime behavior and make it more predictable, we will
    // only use the fastest and best compression levels.
    const levels = [1, 9];

    for (const level of levels) {
      if (this.timeExceeded()) {
        logger.debug({ level, timeElapsed: this.timeElapsed() }, 'AnytimeGzip deadline reached, stopping further compression.');
        break;
      }

      logger.debug({ level }, `Attempting compression at level ${level}`);
      const currentBuffer = gzipSync(inputBuffer, { level });

      // The first result is always the "best" so far.
      // Subsequent results are only better if they are smaller.
      if (!bestBuffer || currentBuffer.length < bestBuffer.length) {
        bestBuffer = currentBuffer;
        bestLevel = level;
      }
    }

    const timeElapsed = this.timeElapsed();
    const quality = bestBuffer ? 1 - (bestBuffer.length / inputBuffer.length) : 0;

    return {
      buffer: bestBuffer,
      quality: Math.max(0, quality), // Quality can't be negative
      level: bestLevel,
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
