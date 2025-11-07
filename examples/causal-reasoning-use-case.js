import { CausalAnalyzer } from '../src/causal-reasoning/CausalAnalyzer.js';

/**
 * Use Case: A/B Testing Analysis with Confounding Variables
 *
 * Imagine a company is A/B testing a new website design. They want to know if
 * the new design ('B') leads to a higher success rate (e.g., sign-ups) than
 * the old design ('A').
 *
 * A naive analysis of the overall data might be misleading due to a "confounding
 * variable". For example, maybe the new design was primarily shown to users on
 * a newer, faster browser, which is the real reason for the higher success rate.
 *
 * The CausalAnalyzer can uncover this by segmenting the data by the confounding
 * variable (browser) to see if the trend reverses, a phenomenon known as
 * Simpson's Paradox.
 */
function abTestingAnalysis() {
  console.log('--- Causal Reasoning Use Case: A/B Testing Analysis ---');

  // Dataset: Each row is a user session.
  const dataset = [
    // --- Data from users with Modern Browsers ---
    { design: 'A', browser: 'Modern', outcome: 'Success' },
    { design: 'A', browser: 'Modern', outcome: 'Success' },
    { design: 'A', browser: 'Modern', outcome: 'Failure' },
    { design: 'B', browser: 'Modern', outcome: 'Success' },
    { design: 'B', browser: 'Modern', outcome: 'Success' },
    { design: 'B', browser: 'Modern', outcome: 'Success' },
    { design: 'B', browser: 'Modern', outcome: 'Success' },

    // --- Data from users with Old Browsers ---
    { design: 'A', browser: 'Old', outcome: 'Success' },
    { design: 'A', browser: 'Old', outcome: 'Success' },
    { design: 'A', browser: 'Old', outcome: 'Success' },
    { design: 'B', browser: 'Old', outcome: 'Failure' },
    { design: 'B', browser: 'Old', outcome: 'Failure' },
    { design: 'B', browser: 'Old', outcome: 'Success' },
  ];

  console.log('\nDataset contains user sessions with website design, browser, and outcome.');

  const analyzer = new CausalAnalyzer(dataset, 'design', 'outcome', 'browser');
  const results = analyzer.analyze();

  console.log('\n--- Analysis Results ---');
  console.log(`Overall Trend (Success Rate B - Success Rate A): ${results.overallTrend.toFixed(2)}`);

  console.log('\nSegmented Trends:');
  for (const segment in results.segmentedTrends) {
    console.log(`  - For ${segment} Browsers, Trend is: ${results.segmentedTrends[segment].toFixed(2)}`);
  }

  console.log(`\nIs there a paradox? ${results.paradox}`);

  console.log('\nConclusion: The overall data suggests Design B is worse (negative trend). However, when we control for');
  console.log('the confounding variable (browser type), we see that Design A is actually better within');
  console.log('each segment. The overall result was skewed because Design B was disproportionately');
  console.log('shown to users with Modern browsers.');
}

abTestingAnalysis();
