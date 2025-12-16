import AnytimeSHA256 from '../../src/time-aware/AnytimeSHA256.js';
import { createHash } from 'crypto';

describe('AnytimeSHA256', () => {
  // Create a large buffer (10MB) to make the hashing process take time
  const testData = Buffer.alloc(10 * 1024 * 1024, 'a');
  const expectedHash = createHash('sha256').update(testData).digest('hex');

  it('should compute the correct hash within a generous deadline', () => {
    const hasher = new AnytimeSHA256(200); // 200ms is more than enough time
    const result = hasher.hash(testData);

    expect(result.hash).toBe(expectedHash);
    expect(result.quality).toBe(1.0);
    expect(result.metDeadline).toBe(true);
  });

  it('should abort and return null if the deadline is too short', () => {
    const hasher = new AnytimeSHA256(1); // 1ms is too short
    const result = hasher.hash(testData);

    expect(result.hash).toBeNull();
    expect(result.quality).toBe(0.0);
    expect(result.metDeadline).toBe(false);
  });

  it('should complete successfully with a deadline of exactly the time it takes', () => {
    // First, time how long it takes with a generous deadline
    const timer = new AnytimeSHA256(500);
    const timedResult = timer.hash(testData);
    const actualTime = timedResult.timeElapsed;

    // Now, run it again with that exact time as the deadline
    const hasher = new AnytimeSHA256(actualTime);
    const result = hasher.hash(testData);

    expect(result.hash).toBe(expectedHash);
    expect(result.metDeadline).toBe(true);
  });
});
