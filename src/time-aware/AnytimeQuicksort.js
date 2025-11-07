import { logger } from '../logger.js';

/**
 * An implementation of the Anytime Quicksort algorithm.
 */
export default class AnytimeQuicksort {
  constructor(deadline) {
    this.deadline = deadline;
    this.startTime = null;
  }

  sort(arr) {
    this.startTime = performance.now();
    const sortedArray = this.recursiveSort([...arr], 0, arr.length - 1, 0);
    const timeElapsed = performance.now() - this.startTime;

    return {
      array: sortedArray,
      quality: this.measureQuality(sortedArray),
      timeElapsed,
      metDeadline: timeElapsed <= this.deadline,
    };
  }

  recursiveSort(arr, lo, hi, depth) {
    if (this.timeExceeded() || lo >= hi) {
      if (this.timeExceeded()) logger.debug({ depth }, 'AnytimeQuicksort deadline reached');
      return arr;
    }

    const p = this.partition(arr, lo, hi);

    // Heuristic: sort the smaller partition first
    if (p - lo < hi - p) {
      this.recursiveSort(arr, lo, p - 1, depth + 1);
      this.recursiveSort(arr, p + 1, hi, depth + 1);
    } else {
      this.recursiveSort(arr, p + 1, hi, depth + 1);
      this.recursiveSort(arr, lo, p - 1, depth + 1);
    }
    return arr;
  }

  // Lomuto partition scheme
  partition(arr, lo, hi) {
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (this.timeExceeded()) return hi; // Early exit if deadline is met during partitioning
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    return i + 1;
  }

  timeExceeded() {
    return (performance.now() - this.startTime) >= this.deadline;
  }

  measureQuality(arr) {
    if (arr.length < 2) return 1.0;
    let inversions = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    const maxInversions = arr.length * (arr.length - 1) / 2;
    if (maxInversions === 0) return 1.0;
    return 1.0 - (inversions / maxInversions);
  }
}
