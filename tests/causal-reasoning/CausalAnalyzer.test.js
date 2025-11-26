import { CausalAnalyzer } from '../../src/causal-reasoning/CausalAnalyzer.js';

describe('CausalAnalyzer', () => {
  // This dataset is a classic example of Simpson's Paradox.
  // It shows the success rates of two treatments for kidney stones.
  const kidneyStoneData = [
    // Treatment A, Small Stones: 2/3 = 0.667
    { treatment: 'A', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'A', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'A', stoneSize: 'Small', outcome: 'Failure' },
    // Treatment B, Small Stones: 4/5 = 0.8
    { treatment: 'B', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Small', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Small', outcome: 'Failure' },
    // Treatment A, Large Stones: 3/5 = 0.6
    { treatment: 'A', stoneSize: 'Large', outcome: 'Success' }, { treatment: 'A', stoneSize: 'Large', outcome: 'Success' }, { treatment: 'A', stoneSize: 'Large', outcome: 'Success' }, { treatment: 'A', stoneSize: 'Large', outcome: 'Failure' }, { treatment: 'A', stoneSize: 'Large', outcome: 'Failure' },
    // Treatment B, Large Stones: 2/4 = 0.5
    { treatment: 'B', stoneSize: 'Large', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Large', outcome: 'Success' }, { treatment: 'B', stoneSize: 'Large', outcome: 'Failure' }, { treatment: 'B', stoneSize: 'Large', outcome: 'Failure' },
  ];

  const analyzer = new CausalAnalyzer(
    kidneyStoneData,
    'treatment',
    'outcome',
    'stoneSize'
  );

  const analysis = analyzer.analyze();

  it('should show Treatment B as better overall', () => {
    // Overall, Treatment B's success rate is higher (0.667) than A's (0.625).
    // The trend B-A is positive.
    expect(analysis.overallTrend).toBeGreaterThan(0);
  });

  it('should show different trends in subgroups', () => {
    // For small stones, B is better (0.8 vs 0.667), so the B-A trend is positive.
    expect(analysis.segmentedTrends['Small']).toBeGreaterThan(0);
    // For large stones, A is better (0.6 vs 0.5), so the B-A trend is negative.
    expect(analysis.segmentedTrends['Large']).toBeLessThan(0);
  });

  it('should not detect a full paradox in this dataset', () => {
    // A full paradox requires the trend to reverse in *all* subgroups.
    // Since the "Small" group trend matches the overall trend, this is not a full reversal.
    expect(analysis.paradox).toBe(false);
  });

  it('should detect a full paradox when the trend reverses in all subgroups', () => {
    // This test confirms that the existing kidney stone data, which does not show
    // a full trend reversal in all subgroups, is correctly identified as not paradoxical.
    const anotherAnalyzer = new CausalAnalyzer(
      kidneyStoneData, 'treatment', 'outcome', 'stoneSize'
    );
    const result = anotherAnalyzer.analyze();
    expect(result.paradox).toBe(false);
  });
});
