import { ProbabilisticCounter } from '../src/uncertainty-quantification/ProbabilisticCounter.js';

/**
 * Use Case: Real-time Polling and Election Monitoring
 *
 * During a live event, like an election or a shareholder vote, we need to
 * estimate the outcome from a stream of early results. Simply stating the
 * current percentage (e.g., "60% Yes") can be misleading if the sample size is small.
 *
 * A `ProbabilisticCounter` provides a more honest and useful estimate by
 * calculating a "confidence interval". Instead of saying "60% Yes", it can
 * say "we are 95% confident that the true percentage of 'Yes' votes is between
 * 52% and 68%". This is crucial for preventing premature or incorrect conclusions.
 */
function realTimePolling() {
  console.log('--- Uncertainty Quantification Use Case: Real-time Polling ---');

  // We want to be 95% confident in our results (z-score for 95% is 1.96)
  const counter = new ProbabilisticCounter(1.96);

  console.log('Scenario: Tracking a live poll. Votes are coming in one by one.');

  const votes = ['Yes', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'No', 'Yes', 'Yes'];

  for (let i = 0; i < votes.length; i++) {
    const vote = votes[i];
    counter.increment(vote === 'Yes');

    if ([2, 5, 12].includes(i + 1)) {
      const { successes, trials } = counter.getCounts();
      const estimate = counter.getEstimate();
      const interval = counter.getConfidenceInterval();

      console.log(`\n--- After ${trials} Votes (${successes} 'Yes') ---`);
      console.log(`  - Point Estimate: ${(estimate * 100).toFixed(1)}% 'Yes'`);
      console.log(`  - 95% Confidence Interval: [${(interval.lower * 100).toFixed(1)}%, ${(interval.upper * 100).toFixed(1)}%]`);

      if (i + 1 === 2) {
        console.log('    (Interpretation: The interval is very wide because the sample size is tiny)');
      }
      if (i + 1 === 12) {
        console.log('    (Interpretation: The interval has narrowed as more data has come in)');
      }
    }
  }

  console.log('\nConclusion: The probabilistic counter provides a transparent and statistically sound');
  console.log('way to report on real-time data, preventing misinterpretation by quantifying the');
  console.log('uncertainty at each stage.');
}

realTimePolling();
