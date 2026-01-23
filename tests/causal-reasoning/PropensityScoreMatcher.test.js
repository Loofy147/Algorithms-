import { PropensityScoreMatcher } from '../../shared/algorithms/causal-reasoning/PropensityScoreMatcher.js';

describe('Propensity Score Matching', () => {
  it('should correctly estimate the treatment effect', () => {
    const dataset = [
      { treatment: 1, outcome: 10, covariate: 1 },
      { treatment: 0, outcome: 5, covariate: 1 },
      { treatment: 1, outcome: 12, covariate: 2 },
      { treatment: 0, outcome: 7, covariate: 2 },
      { treatment: 1, outcome: 8, covariate: 0 },
      { treatment: 0, outcome: 3, covariate: 0 },
    ];

    const psm = new PropensityScoreMatcher(dataset, 'treatment', 'outcome', ['covariate']);
    psm.fit();
    const att = psm.match();

    // The true treatment effect is 5.
    // We'll be happy with an estimate that's close to that.
    expect(att).toBeCloseTo(5, 1);
  });
});
