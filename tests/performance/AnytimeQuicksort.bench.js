import AnytimeQuicksort from '../../shared/algorithms/time-aware/AnytimeQuicksort.js';
import { performance } from 'perf_hooks';

/**
 * Performance Benchmark for AnytimeQuicksort
 *
 * This test establishes a performance baseline for the AnytimeQuicksort algorithm.
 * It is not a test of correctness, but a measure of how much work the algorithm
 * can do within a given time budget. This helps detect performance regressions.
 */
describe('AnytimeQuicksort Performance', () => {
  const dataSize = 100000;
  const dataset = Array.from({ length: dataSize }, () => Math.random());
  const deadline = 10; // 10ms

  it(`should sort approximately ${dataSize} items with a ${deadline}ms deadline`, () => {
    const sorter = new AnytimeQuicksort(deadline);

    const startTime = performance.now();
    const result = sorter.sort([...dataset]);
    const endTime = performance.now();

    const timeElapsed = endTime - startTime;

    console.log(`\n--- AnytimeQuicksort Benchmark (${dataSize} items, ${deadline}ms deadline) ---`);
    console.log(`  Time Elapsed: ${timeElapsed.toFixed(2)}ms`);
    console.log(`  Quality Score: ${result.quality.toFixed(4)}`);
    console.log(`  Met Deadline: ${result.metDeadline}`);

    // We expect the algorithm to run for approximately the deadline.
    // It might be slightly more due to the final check, but it should be close.
    expect(timeElapsed).toBeLessThan(deadline + 5); // Allow a small margin

    // The quality should be greater than 0, indicating some sorting was done.
    expect(result.quality).toBeGreaterThan(0);
  });
});
