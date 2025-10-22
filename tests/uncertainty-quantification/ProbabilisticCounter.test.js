import ProbabilisticCounter from '../../src/uncertainty-quantification/ProbabilisticCounter.js';

describe('ProbabilisticCounter', () => {
  it('should initialize with zero counts', () => {
    const counter = new ProbabilisticCounter();
    expect(counter.getCount()).toBe(0);
    expect(counter.trials).toBe(0);
  });

  it('should increment the counts correctly', () => {
    const counter = new ProbabilisticCounter();
    counter.increment(true);
    counter.increment(true);
    counter.increment(false);
    expect(counter.getCount()).toBe(2);
    expect(counter.trials).toBe(3);
  });

  it('should calculate the confidence interval correctly', () => {
    const counter = new ProbabilisticCounter();
    for (let i = 0; i < 10; i++) {
      counter.increment(true);
    }
    for (let i = 0; i < 10; i++) {
      counter.increment(false);
    }
    const interval = counter.getConfidenceInterval();
    expect(interval.lower).toBeCloseTo(0.30, 2);
    expect(interval.upper).toBeCloseTo(0.70, 2);
  });
});
