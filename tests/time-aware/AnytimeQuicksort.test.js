import AnytimeQuicksort from '../../shared/algorithms/time-aware/AnytimeQuicksort.js';

describe('AnytimeQuicksort', () => {
  it('should sort an array given enough time', () => {
    const sorter = new AnytimeQuicksort(100);
    const data = [5, 2, 8, 1, 9, 4];
    const result = sorter.sort(data);
    expect(result.array).toEqual([1, 2, 4, 5, 8, 9]);
    expect(result.metDeadline).toBe(true);
    expect(result.quality).toBe(1);
  });

  it('should return a partially sorted array if the deadline is too short', () => {
    const sorter = new AnytimeQuicksort(0);
    const data = Array.from({length: 10000}, () => Math.random() * 1000 | 0);
    const result = sorter.sort(data);
    expect(result.metDeadline).toBe(false);
    expect(result.quality).toBeLessThan(1);
  });

  it('should correctly measure the quality of a partially sorted array', () => {
    const sorter = new AnytimeQuicksort(100);
    // This array has two "runs": [5] and [1, 2, 3, 4].
    const partiallySorted = [5, 1, 2, 3, 4];
    const quality = sorter.measureQuality(partiallySorted);
    // For 2 runs in an array of length 5, quality is 1 - ((2-1)/(5-1)) = 0.75
    const expectedQuality = 0.75;
    expect(quality).toBe(expectedQuality);
  });
});
