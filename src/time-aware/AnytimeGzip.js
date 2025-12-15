import { constants, gzipSync } from 'zlib';
import { logger } from '../logger.js';

/**
 * An "anytime" Gzip compression algorithm that progressively improves
 * compression quality within a given time budget (deadline).
 */
export default class AnytimeGzip {
  constructor(deadline) {
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
    this.startTime = Date.now();
    let bestBuffer = null;
    let bestLevel = -1;

    // zlib compression levels range from 1 (best speed) to 9 (best compression).
    // We iterate from fastest to slowest through a few representative levels.
    const levels = [
      constants.Z_BEST_SPEED, // Level 1
      3,
      constants.Z_DEFAULT_COMPRESSION, // Level 6
      constants.Z_BEST_COMPRESSION, // Level 9
    ];

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
