import { z } from 'zod';
import { logger } from '../logger.js';

const deadlineSchema = z.number().nonnegative({ message: 'Deadline must be a non-negative number.' });
const arraySchema = z.array(z.any(), { message: 'Input must be an array.' });

/**
 * An implementation of the Anytime Quicksort algorithm.
 */
export default class AnytimeQuicksort {
  constructor(deadline) {
    deadlineSchema.parse(deadline);
    this.deadline = deadline;
    this.startTime = null;
  }

  sort(arr) {
    arraySchema.parse(arr);
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

    // Measure "runs" of sorted elements (better metric than inversions)
    let runs = 1;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            runs++;
        }
    }

    // Quality = (1 - (runs-1)/(n-1))
    // Perfect sort: 1 run → quality = 1.0
    // Reverse sort: n runs → quality = 0.0
    return 1.0 - ((runs - 1) / (arr.length - 1));
  }
}
