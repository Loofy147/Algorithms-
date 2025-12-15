/**
 * Real-World Example: Live Opinion Polling with Confidence Intervals
 *
 * Problem: When displaying results from a live poll, especially with a small
 * number of votes, simply showing the percentage is misleading. If the results
 * are "Candidate A: 52%, Candidate B: 48%" with only 100 total votes, the race
 * is statistically a dead heat. Presenting this without a margin of error is
 * deceptive.
 *
 * Solution: `ProbabilisticCounter` uses statistical methods (like the Wilson score
 * interval) to calculate a confidence interval for the true proportion of votes.
 * Instead of just saying "52%", it can say "Candidate A has between 42% and 62%
 * of the vote, with 95% confidence." This provides a much more honest and
 * accurate representation of the data.
 */

import { ProbabilisticCounter } from '../src/uncertainty-quantification/ProbabilisticCounter.js';

// --- 1. Initialize Counters for Each Candidate ---
// We'll track the number of 'yes' votes for each. The total votes will be the sum.
const candidateA = new ProbabilisticCounter();
const candidateB = new ProbabilisticCounter();

let totalVotes = 0;

// --- Helper function to simulate votes and display results ---
const simulateVotes = (votesA, votesB) => {
  for (let i = 0; i < votesA; i++) {
    candidateA.increment();
  }
  for (let i = 0; i < votesB; i++) {
    candidateB.increment();
  }
  totalVotes += votesA + votesB;
};

const displayResults = () => {
  // Get the confidence interval for each candidate's proportion of the vote.
  // The second argument to getConfidenceInterval is the total number of trials (votes).
  const intervalA = candidateA.getConfidenceInterval(totalVotes, 'wilson');
  const intervalB = candidateB.getConfidenceInterval(totalVotes, 'wilson');

  const percentageA = (candidateA.getCount() / totalVotes) * 100;
  const percentageB = (candidateB.getCount() / totalVotes) * 100;

  console.log(`\n--- Poll Results after ${totalVotes} votes ---`);
  console.log(`Candidate A: ${percentageA.toFixed(1)}% (95% CI: [${(intervalA.lower * 100).toFixed(1)}%, ${(intervalA.upper * 100).toFixed(1)}%])`);
  console.log(`Candidate B: ${percentageB.toFixed(1)}% (95% CI: [${(intervalB.lower * 100).toFixed(1)}%, ${(intervalB.upper * 100).toFixed(1)}%])`);

  // Check if the confidence intervals overlap
  if (Math.max(intervalA.lower, intervalB.lower) < Math.min(intervalA.upper, intervalB.upper)) {
    console.log("Verdict: The race is too close to call. The confidence intervals overlap.");
  } else if (intervalA.lower > intervalB.upper) {
    console.log("Verdict: Candidate A has a statistically significant lead.");
  } else {
    console.log("Verdict: Candidate B has a statistically significant lead.");
  }
};


// --- 2. Simulate the Poll in Stages ---

// Stage 1: Very few votes - high uncertainty
simulateVotes(10, 8);
displayResults();

// Stage 2: More votes, but still a close race - uncertainty narrows
simulateVotes(42, 40);
displayResults();

// Stage 3: A large number of votes - confidence intervals become very tight
simulateVotes(500, 400);
displayResults();
