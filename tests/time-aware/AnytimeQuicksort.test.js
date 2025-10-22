import AnytimeQuicksort from '../../src/time-aware/AnytimeQuicksort.js';

describe('AnytimeQuicksort', () => {
  it('should sort an array given enough time', () => {
    const sorter = new AnytimeQuicksort(100);
    const data = [5, 2, 8, 1, 9, 4];
    const result = sorter.sort(data);
    expect(result.data).toEqual([1, 2, 4, 5, 8, 9]);
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
});
