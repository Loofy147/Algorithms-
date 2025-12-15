import { createHash } from 'crypto';
import { logger } from '../logger.js';

/**
 * An interruptible SHA256 hashing algorithm that aborts if it exceeds a
 * specified time budget (deadline).
 *
 * This is not a true "anytime" algorithm as it does not produce a result of
 * improving quality. The result is binary: either the full hash is computed,
 * or no result is returned. It demonstrates time-budgeted computation.
 */
export default class AnytimeSHA256 {
  constructor(deadline) {
    this.deadline = deadline;
    this.startTime = null;
  }

  /**
   * Hashes the input data buffer. It processes the data in chunks,
   * checking the deadline after each chunk.
   * @param {Buffer} inputBuffer The data to hash.
   * @param {number} [chunkSize=65536] The size of each chunk in bytes.
   * @returns {{
   *   hash: string | null,
   *   quality: number,
   *   timeElapsed: number,
   *   metDeadline: boolean
   * }} The hashing result.
   */
  hash(inputBuffer, chunkSize = 65536) {
    this.startTime = Date.now();
    const hash = createHash('sha256');
    let offset = 0;

    while (offset < inputBuffer.length) {
      if (this.timeExceeded()) {
        logger.debug({ timeElapsed: this.timeElapsed() }, 'AnytimeSHA256 deadline reached, aborting.');
        const timeElapsed = this.timeElapsed();
        return {
          hash: null,
          quality: 0.0,
          timeElapsed,
          metDeadline: false,
        };
      }

      const end = Math.min(offset + chunkSize, inputBuffer.length);
      const chunk = inputBuffer.slice(offset, end);
      hash.update(chunk);
      offset += chunkSize;
    }

    const finalHash = hash.digest('hex');
    const timeElapsed = this.timeElapsed();

    return {
      hash: finalHash,
      quality: 1.0,
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
