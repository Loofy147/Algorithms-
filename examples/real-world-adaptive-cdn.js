/**
 * Real-World Example: Adaptive CDN Edge Cache
 *
 * Problem: A Content Delivery Network (CDN) edge server caches assets (images,
 * videos, etc.) to serve users quickly. The optimal caching strategy depends on
 * the traffic pattern, which can change rapidly.
 *
 *   - **Recency Pattern**: A news site's traffic focuses on the latest articles.
 *     Recently accessed content is likely to be requested again. (Favors LRU)
 *   - **Frequency Pattern**: A viral video or a popular library (like jQuery) is
 *     accessed far more often than other content. (Favors LFU)
 *   - **Streaming Pattern**: Users watching a live stream request each video
 *     segment once in sequence. There are no repeat hits. (Favors FIFO)
 *
 * A static caching strategy (e.g., always using LRU) would perform poorly when
 * the traffic pattern doesn't match its strengths.
 *
 * Solution: `SelfOptimizingCache` uses a multi-armed bandit algorithm to
 * continuously evaluate different caching strategies (LRU, LFU, FIFO) and
 * dynamically switch to the one that performs best for the current traffic
 * pattern.
 */

import SelfOptimizingCache from '../src/self-modifying/SelfOptimizingCache.js';

// --- 1. Initialize the Adaptive Cache ---
// We configure it to re-evaluate its strategy every 100 operations.
const cache = new SelfOptimizingCache(50, { // Cache size of 50
  evaluationInterval: 100, // Check performance every 100 operations
  epsilon: 0.1, // 10% chance to explore a random strategy
});

// --- Helper function to simulate requests and print stats ---
const runSimulationPhase = (name, trafficPattern) => {
  console.log(`\n--- Phase: ${name} ---`);
  console.log(`Simulating 500 requests with a ${name.toLowerCase()} pattern...`);

  trafficPattern();

  const stats = cache.getStats();
  console.log(`  - Dominant Strategy: ${stats.currentStrategy}`);
  console.log(`  - Overall Hit Rate:  ${(stats.totalHitRate * 100).toFixed(1)}%`);
  console.log('  - Strategy Performance:');
  for (const key in stats.strategies) {
    const s = stats.strategies[key];
    console.log(`    - ${key}: ${(s.hitRate * 100).toFixed(1)}% hit rate over ${s.evaluations} evaluations`);
  }
};


// --- 2. Simulate Phase 1: Recency-Based Traffic (News Articles) ---
const simulateRecencyPattern = () => {
  for (let i = 0; i < 500; i++) {
    // Access items in a sliding window (e.g., keys 0-9, then 1-10, etc.)
    const key = `article_${(i % 50) + Math.floor(i / 50)}`;
    cache.get(key);
    cache.put(key, `Content for ${key}`);
  }
};
runSimulationPhase('Recency (LRU should win)', simulateRecencyPattern);


// --- 3. Simulate Phase 2: Frequency-Based Traffic (Viral Video) ---
const simulateFrequencyPattern = () => {
  const hotKeys = ['viral_video_1', 'popular_image.jpg', 'main.css'];
  for (let i = 0; i < 500; i++) {
    let key;
    if (Math.random() < 0.8) { // 80% of traffic hits the hot keys
      key = hotKeys[i % hotKeys.length];
    } else { // 20% is long-tail content
      key = `other_content_${i}`;
    }
    cache.get(key);
    cache.put(key, `Content for ${key}`);
  }
};
runSimulationPhase('Frequency (LFU should win)', simulateFrequencyPattern);


// --- 4. Simulate Phase 3: Streaming Traffic (Live Video) ---
const simulateStreamingPattern = () => {
  for (let i = 0; i < 500; i++) {
    // Each key is unique and accessed only once
    const key = `video_segment_${i}`;
    cache.get(key);
    cache.put(key, `Content for ${key}`);
  }
};
runSimulationPhase('Streaming (FIFO should win)', simulateStreamingPattern);

console.log("\n--- Simulation Complete ---");
console.log("The cache successfully adapted its strategy to match the changing traffic patterns.");
