## 2024-05-20 - Inefficient O(n^2) Calculation in `measureQuality`

**Learning:** The `measureQuality` function in `AnytimeQuicksort.js` used an O(n^2) nested loop to count inversions, creating a performance bottleneck for large arrays. This is a classic example of an inefficient algorithm that can be easily replaced.

**Action:** When profiling, look for nested loops that can be replaced with more efficient algorithms. In this case, a merge-sort-based approach reduced the complexity to O(n log n). Always check for opportunities to replace brute-force calculations with known, optimized algorithms.

## 2025-01-24 - O(1) LFU Cache with LRU Tie-Breaking via JS Set

**Learning:** Implementing a constant-time (O(1)) Least Frequently Used (LFU) cache while maintaining a Least Recently Used (LRU) tie-breaking rule can be elegantly achieved in JavaScript using a combination of Maps and Sets. JavaScript Sets maintain insertion order, so if a key is moved to the end of a frequency-specific Set on every access, the first item in the Set (`set.values().next().value`) is always the least recently used for that frequency.

**Action:** When a performance bottleneck is identified in eviction logic (O(N) search for candidates), use a multi-map strategy (key-to-freq and freq-to-keys) to achieve O(1) performance. Ensure that "move-to-end" logic is applied to the Sets to preserve recency information.
