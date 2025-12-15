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

    // A more efficient O(n log n) method to count inversions using a merge-sort based approach.
    // The previous implementation was O(n^2), which is slow for large arrays.
    const countInversions = (a) => {
      let count = 0;
      const mergeSort = (arr) => {
        if (arr.length < 2) {
          return arr;
        }
        const middle = Math.floor(arr.length / 2);
        const left = arr.slice(0, middle);
        const right = arr.slice(middle);

        return merge(mergeSort(left), mergeSort(right));
      };

      const merge = (left, right) => {
        const result = [];
        let i = 0;
        let j = 0;
        while (i < left.length && j < right.length) {
          if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
          } else {
            result.push(right[j]);
            j++;
            count += left.length - i;
          }
        }
        return result.concat(left.slice(i)).concat(right.slice(j));
      };

      mergeSort(a);
      return count;
    };

    const inversions = countInversions([...arr]);
    const maxInversions = arr.length * (arr.length - 1) / 2;
    if (maxInversions === 0) return 1.0;
    return 1.0 - (inversions / maxInversions);
  }
}
