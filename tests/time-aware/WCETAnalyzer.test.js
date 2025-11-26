import WCETAnalyzer from '../../src/time-aware/WCETAnalyzer.js';

describe('WCETAnalyzer', () => {
  it('should measure the execution time of a function', () => {
    const analyzer = new WCETAnalyzer();
    const testFunction = () => {
      for (let i = 0; i < 1000; i++) {
        // no-op
      }
    };
    analyzer.measure(testFunction, 100);
    expect(analyzer.samples).toHaveLength(100);

    const gumbel = analyzer.fitGumbel(analyzer.samples);
    expect(gumbel.location).toBeDefined();
    expect(gumbel.scale).toBeDefined();
    expect(gumbel.predictWCET(0.999)).toBeGreaterThan(0);
  });
});
