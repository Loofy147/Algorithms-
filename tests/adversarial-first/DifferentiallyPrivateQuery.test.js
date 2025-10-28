import { DifferentiallyPrivateQuery } from '../../src/adversarial-first/DifferentiallyPrivateQuery.js';

describe('Differential Privacy', () => {
  it('should add noise to the result of a query', () => {
    const query = () => 10;
    const dpQuery = new DifferentiallyPrivateQuery(query, 1, 0.1);

    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(dpQuery.execute());
    }

    const mean = results.reduce((a, b) => a + b) / results.length;
    const variance = results.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / results.length;

    // The mean should be close to the true result.
    expect(mean).toBeCloseTo(10, -1);
    // The variance should be greater than zero.
    expect(variance).toBeGreaterThan(0);
  });
});
