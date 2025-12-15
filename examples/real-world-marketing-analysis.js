/**
 * Real-World Example: Analyzing Marketing Campaign Effectiveness
 *
 * Problem: A marketing team runs an A/B test for a new ad campaign. They collect
 * data on which users saw the new ad (`variation` B) versus the old ad (`variation` A)
 * and whether they converted (e.g., made a purchase).
 *
 * A simple analysis shows that the overall conversion rate for the new ad is
 * LOWER than the old one, suggesting the campaign is a failure.
 *
 * However, a deeper look reveals a confounding variable: mobile users were shown
 * the new ad more often, and mobile users naturally have a lower conversion rate.
 * This creates a Simpson's Paradox, where the overall trend is misleading.
 *
 * Solution: `CausalAnalyzer` can be used to segment the data by the confounding
 * variable (`device`) to reveal the true, underlying trend. It shows that for
 * BOTH mobile and desktop users, the new ad actually performs BETTER than the old one.
 */

import { CausalAnalyzer } from '../src/causal-reasoning/CausalAnalyzer.js';

// --- 1. Generate a dataset exhibiting Simpson's Paradox ---
const generateData = () => {
  const data = [];
  // Desktop Users: High conversion rate, mostly shown the OLD ad
  for (let i = 0; i < 200; i++) {
    data.push({
      device: 'desktop',
      variation: 'A', // Old ad
      converted: Math.random() < 0.7 ? 'yes' : 'no', // 70% conversion
    });
  }
  for (let i = 0; i < 50; i++) {
    data.push({
      device: 'desktop',
      variation: 'B', // New ad
      converted: Math.random() < 0.8 ? 'yes' : 'no', // 80% conversion
    });
  }

  // Mobile Users: Low conversion rate, mostly shown the NEW ad
  for (let i = 0; i < 50; i++) {
    data.push({
      device: 'mobile',
      variation: 'A', // Old ad
      converted: Math.random() < 0.2 ? 'yes' : 'no', // 20% conversion
    });
  }
  for (let i = 0; i < 200; i++) {
    data.push({
      device: 'mobile',
      variation: 'B', // New ad
      converted: Math.random() < 0.3 ? 'yes' : 'no', // 30% conversion
    });
  }
  return data;
};

const marketingData = generateData();

// --- 2. Perform the causal analysis ---
const analyzer = new CausalAnalyzer(
  marketingData,
  'variation', // Treatment variable (A vs. B)
  'converted', // Outcome variable (yes vs. no)
  'device'     // Confounding variable (desktop vs. mobile)
);

const analysis = analyzer.analyze();


// --- 3. Interpret the results ---
console.log('--- Marketing Campaign Causal Analysis ---');

// Overall Trend (Misleading)
console.log('\n--- 1. Overall Trend ---');
const overallA = analysis.summary['A'].conversionRate;
const overallB = analysis.summary['B'].conversionRate;
console.log(`Overall Conversion Rate (Old Ad 'A'): ${(overallA * 100).toFixed(1)}%`);
console.log(`Overall Conversion Rate (New Ad 'B'): ${(overallB * 100).toFixed(1)}%`);
if (overallB < overallA) {
  console.log('❌ Conclusion: The new ad appears to be WORSE than the old one.');
} else {
  console.log('✅ Conclusion: The new ad appears to be BETTER than the old one.');
}


// Simpson's Paradox Detection
console.log('\n--- 2. Simpson\'s Paradox Detection ---');
if (analysis.paradox) {
  console.log('🚨 Simpson\'s Paradox DETECTED!');
  console.log('The overall trend is misleading because of a confounding variable.');
} else {
  console.log('No paradox detected. The overall trend is likely reliable.');
}


// Segmented Trends (The Truth)
console.log('\n--- 3. Segmented Trends (by Device) ---');
for (const segment in analysis.segmentedTrends) {
  const trend = analysis.segmentedTrends[segment];
  const segmentA = trend.summary['A'].conversionRate;
  const segmentB = trend.summary['B'].conversionRate;

  console.log(`\n  Segment: ${segment}`);
  console.log(`    Conversion Rate (Old Ad 'A'): ${(segmentA * 100).toFixed(1)}%`);
  console.log(`    Conversion Rate (New Ad 'B'): ${(segmentB * 100).toFixed(1)}%`);

  if (segmentB > segmentA) {
    console.log(`    ✅ Conclusion: For ${segment} users, the new ad is BETTER.`);
  } else {
    console.log(`    ❌ Conclusion: For ${segment} users, the new ad is WORSE.`);
  }
}

console.log('\n--- Final Recommendation ---');
console.log('The new ad campaign is actually more effective across all user segments.');
console.log('The initial overall numbers were skewed by the user device distribution.');
