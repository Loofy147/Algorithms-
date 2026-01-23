import AnytimeQuicksort from '../../shared/algorithms/time-aware/AnytimeQuicksort.js';
import ParallelAnytimeQuicksort from '../../shared/algorithms/time-aware/ParallelAnytimeQuicksort.js';

describe('AnytimeQuicksort Performance Benchmark', () => {
  const largeDataset = Array.from({ length: 100000 }, () => Math.random() * 1000 | 0);
  const deadline = 5000; // A more generous deadline to allow for completion

  it('benchmarks the sequential AnytimeQuicksort', () => {
    const sorter = new AnytimeQuicksort(deadline);
    const result = sorter.sort(largeDataset);
    console.log(`Sequential AnytimeQuicksort Time: ${result.timeElapsed.toFixed(2)}ms`);
    expect(result.quality).toBeCloseTo(1);
  });

  it('benchmarks the parallel AnytimeQuicksort', async () => {
    const sorter = new ParallelAnytimeQuicksort(deadline);
    const result = await sorter.sort(largeDataset);
    console.log(`Parallel AnytimeQuicksort Time: ${result.timeElapsed.toFixed(2)}ms`);
    expect(result.quality).toBeCloseTo(1);
  });
});
