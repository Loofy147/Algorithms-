/**
 * Real-World Example: Real-Time UI Rendering with AnytimeQuicksort
 *
 * Problem: Imagine a web application dashboard that needs to display a leaderboard
 * of the top 10 users from a list of 50,000. To maintain a smooth 60fps user
 * experience, all rendering logic for a single frame must complete within ~16ms.
 *
 * A full sort of 50,000 items would take too long and cause the UI to stutter.
 * Instead, we can use AnytimeQuicksort with a tight deadline (e.g., 8ms) to get a
 * partially sorted list that is "good enough" to display the most relevant users
 * almost instantly.
 */

import AnytimeQuicksort from '../src/time-aware/AnytimeQuicksort.js';

// --- 1. Create a large, unsorted dataset ---
// (Simulating 50,000 users with scores)
const USER_COUNT = 50000;
const users = Array.from({ length: USER_COUNT }, (_, i) => ({
  id: `user_${i}`,
  score: Math.floor(Math.random() * 1000000),
}));

// --- 2. Set a strict deadline for the sorting operation ---
// We allocate 8ms for sorting to leave time for other rendering tasks.
const DEADLINE_MS = 8;
const sorter = new AnytimeQuicksort(DEADLINE_MS);

console.log(`Attempting to sort ${USER_COUNT} users within ${DEADLINE_MS}ms...`);

// --- 3. Run the anytime sort ---
const result = sorter.sort(users.map(u => u.score)); // Sort by score

// --- 4. Analyze the result ---
console.log(`\n--- Sort completed ---`);
console.log(`Time elapsed:      ${result.timeElapsed.toFixed(2)}ms`);
console.log(`Deadline met:      ${result.metDeadline}`);
console.log(`Sortedness quality:  ${(result.quality * 100).toFixed(1)}%`);

// --- 5. Use the partially sorted data in the UI ---
// Even if the sort is incomplete, the first few elements are likely to be the
// highest scores, which is good enough for a real-time leaderboard.
const top10Scores = result.array.slice(0, 10);
console.log(`\nTop 10 scores from the partially sorted array:`);
console.log(top10Scores);

const isFullySorted = result.quality === 1.0;
console.log(`\nIs the full list sorted? ${isFullySorted}`);
if (!isFullySorted) {
  console.log("The full array is not perfectly sorted, but the top results are available immediately.");
  console.log("A full sort could be completed in the background for subsequent views.");
}
