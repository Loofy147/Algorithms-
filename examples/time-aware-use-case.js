import AnytimeQuicksort from '../src/time-aware/AnytimeQuicksort.js';
import ParallelAnytimeQuicksort from '../src/time-aware/ParallelAnytimeQuicksort.js';

/**
 * Use Case: Real-time Data Visualization
 *
 * Imagine a scenario where you need to display a sorted list of items to a user,
 * but the data arrives in real-time and the display must be updated every 100ms.
 * If the dataset is large, a full sort might take longer than the refresh interval,
 * leading to a sluggish UI.
 *
 * AnytimeQuicksort is a perfect solution. We can give it a tight deadline (e.g., 5ms)
 * to ensure the UI remains responsive. It will provide the "best-effort" sorted
 * array it can achieve within that deadline, which is often visually "good enough"
 * for a real-time display, and will improve with each subsequent tick.
 */
async function realTimeDataVisualization() {
  console.log('--- Time-Aware Computing Use Case: Real-time Data Visualization ---');

  const largeDataset = Array.from({ length: 50000 }, () => Math.random() * 1000 | 0);
  const deadline = 5; // 5 milliseconds

  console.log(`\nAttempting to sort a ${largeDataset.length}-item array with a deadline of ${deadline}ms.`);

  console.log('\n--- Sequential AnytimeQuicksort ---');
  const sequentialSorter = new AnytimeQuicksort(deadline);
  const sequentialResult = sequentialSorter.sort(largeDataset);

  console.log(`\nSorting Result:`);
  console.log(`  - Met Deadline: ${sequentialResult.metDeadline}`);
  console.log(`  - Quality (0 is random, 1 is fully sorted): ${sequentialResult.quality.toFixed(4)}`);
  console.log(`  - Time Elapsed: ${sequentialResult.timeElapsed.toFixed(2)}ms`);

  console.log('\n--- Parallel AnytimeQuicksort ---');
  const parallelSorter = new ParallelAnytimeQuicksort(deadline);
  const parallelResult = await parallelSorter.sort(largeDataset);

  console.log(`\nSorting Result:`);
  console.log(`  - Met Deadline: ${parallelResult.metDeadline}`);
  console.log(`  - Quality (0 is random, 1 is fully sorted): ${parallelResult.quality.toFixed(4)}`);
  console.log(`  - Time Elapsed: ${parallelResult.timeElapsed.toFixed(2)}ms`);

  console.log(`\nNote: In this example, the parallel version may be slower due to the overhead of creating worker threads, which is significant for a short deadline.`);

  if (!sequentialResult.metDeadline) {
    console.log('\nConclusion: The sort could not complete in time, but it returned a partially sorted array.');
    console.log('This is ideal for a UI, as it prevents freezing and provides a progressively better result on each frame.');
  } else {
    console.log('\nConclusion: The sort completed within the deadline, providing a fully sorted array.');
  }

  // Displaying a small slice to show the partial sort
  console.log('\nSample of the sequential result (first 20 items):');
  console.log(sequentialResult.array.slice(0, 20).map(n => n.toFixed(0)).join(', '));

  console.log('\nSample of the parallel result (first 20 items):');
  console.log(parallelResult.array.slice(0, 20).map(n => n.toFixed(0)).join(', '));
}

realTimeDataVisualization();
