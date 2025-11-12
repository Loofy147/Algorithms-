import ParallelAnytimeQuicksort from '../../src/time-aware/ParallelAnytimeQuicksort.js';

describe('ParallelAnytimeQuicksort', () => {
  it('should sort an array given enough time', async () => {
    const sorter = new ParallelAnytimeQuicksort(100);
    const data = [5, 2, 8, 1, 9, 4];
    const result = await sorter.sort(data);
    expect(result.array).toEqual([1, 2, 4, 5, 8, 9]);
    expect(result.metDeadline).toBe(true);
    expect(result.quality).toBe(1);
  });

  it('should return a partially sorted array if the deadline is too short', async () => {
    const sorter = new ParallelAnytimeQuicksort(0);
    const data = Array.from({length: 10000}, () => Math.random() * 1000 | 0);
    const result = await sorter.sort(data);
    expect(result.metDeadline).toBe(false);
    expect(result.quality).toBeLessThan(1);
  });

  it('should correctly measure the quality of a partially sorted array', async () => {
    const sorter = new ParallelAnytimeQuicksort(100);
    const partiallySorted = [5, 1, 2, 3, 4]; // 4 inversions: (5,1), (5,2), (5,3), (5,4)
    const quality = sorter.measureQuality(partiallySorted);
    const maxInversions = partiallySorted.length * (partiallySorted.length - 1) / 2; // 10
    const expectedQuality = 1.0 - (4 / maxInversions);
    expect(quality).toBe(expectedQuality);
  });
});
