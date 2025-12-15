## 2024-05-20 - Inefficient O(n^2) Calculation in `measureQuality`

**Learning:** The `measureQuality` function in `AnytimeQuicksort.js` used an O(n^2) nested loop to count inversions, creating a performance bottleneck for large arrays. This is a classic example of an inefficient algorithm that can be easily replaced.

**Action:** When profiling, look for nested loops that can be replaced with more efficient algorithms. In this case, a merge-sort-based approach reduced the complexity to O(n log n). Always check for opportunities to replace brute-force calculations with known, optimized algorithms.
