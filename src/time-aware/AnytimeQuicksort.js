/**
 * Anytime Quicksort - Returns best result within deadline
 *
 * Properties:
 * - Monotone improving: quality increases with time
 * - Interruptible: can stop at any moment
 * - Predictable degradation: partial results are useful
 */
export default class AnytimeQuicksort {
  constructor(deadline) {
    this.deadline = deadline; // milliseconds
    this.startTime = null;
    this.partialResults = [];
  }

  sort(arr) {
    this.startTime = performance.now();
    this.partialResults = [];

    const result = this.recursiveSort([...arr], 0, arr.length - 1, 0);

    return {
      data: result,
      quality: this.measureQuality(result),
      timeUsed: performance.now() - this.startTime,
      metDeadline: (performance.now() - this.startTime) <= this.deadline
    };
  }

  recursiveSort(arr, lo, hi, depth) {
    // CRITICAL: Check time budget before recursion
    if (this.timeExceeded()) {
      console.log(`⏱️  Deadline reached at depth ${depth}`);
      return arr; // Return best-effort result
    }

    if (lo >= hi) return arr;

    // Partition (standard quicksort)
    const pivot = arr[hi];
    let i = lo - 1;

    for (let j = lo; j < hi; j++) {
      // Even check time in inner loop for hard real-time
      if (this.timeExceeded()) return arr;

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    const p = i + 1;

    // OPTIMIZATION: Sort smaller partition first
    // Gives better partial results if interrupted
    const leftSize = p - lo;
    const rightSize = hi - p;

    if (leftSize < rightSize) {
      this.recursiveSort(arr, lo, p - 1, depth + 1);
      this.recursiveSort(arr, p + 1, hi, depth + 1);
    } else {
      this.recursiveSort(arr, p + 1, hi, depth + 1);
      this.recursiveSort(arr, lo, p - 1, depth + 1);
    }

    return arr;
  }

  timeExceeded() {
    return (performance.now() - this.startTime) >= this.deadline;
  }

  measureQuality(arr) {
    // Inversions metric: 1.0 = fully sorted, 0.0 = reverse sorted
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) inversions++;
    }
    return 1 - (inversions / arr.length);
  }
}
