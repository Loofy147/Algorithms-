import { ProbabilisticCounter } from '../../shared/algorithms/uncertainty-quantification/ProbabilisticCounter.js';

describe('ProbabilisticCounter', () => {
  it('should initialize with zero counts', () => {
    const counter = new ProbabilisticCounter();
    const counts = counter.getCounts();
    expect(counts.successes).toBe(0);
    expect(counts.trials).toBe(0);
  });

  it('should increment the counts correctly', () => {
    const counter = new ProbabilisticCounter();
    counter.increment(true);
    counter.increment(true);
    counter.increment(false);
    const counts = counter.getCounts();
    expect(counts.successes).toBe(2);
    expect(counts.trials).toBe(3);
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
