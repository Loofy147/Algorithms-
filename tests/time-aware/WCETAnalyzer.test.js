const WCETAnalyzer = require('../../src/time-aware/WCETAnalyzer');

describe('WCETAnalyzer', () => {
  it('should measure the execution time of a function', () => {
    const analyzer = new WCETAnalyzer();
    const testFunction = () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
    };
    const analysis = analyzer.measure(testFunction, 100);
    expect(analysis.samples).toBe(100);
    expect(analysis.mean).toBeGreaterThan(0);
    expect(analysis.wcet_estimate).toBeGreaterThan(0);
  });
});
