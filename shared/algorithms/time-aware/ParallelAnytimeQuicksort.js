import { Worker } from 'worker_threads';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ParallelAnytimeQuicksort {
  constructor(deadline, numThreads = os.cpus().length) {
    this.deadline = deadline;
    this.numThreads = numThreads;
    this.startTime = null;
  }

  async sort(arr) {
    this.startTime = performance.now();

    if (arr.length < this.numThreads * 2) {
      // Fallback to sequential for small arrays
      return this.sequentialSort(arr);
    }

    const chunks = this.splitArray(arr, this.numThreads);
    const workerPromises = chunks.map(chunk => this.createWorker(chunk));

    const sortedChunks = await Promise.all(workerPromises);

    const mergedArray = this.merge(sortedChunks);
    const timeElapsed = performance.now() - this.startTime;

    return {
      array: mergedArray,
      quality: this.measureQuality(mergedArray),
      timeElapsed,
      metDeadline: timeElapsed <= this.deadline,
    };
  }

  sequentialSort(arr) {
    const sortedArray = this.recursiveSort([...arr], 0, arr.length - 1);
    const timeElapsed = performance.now() - this.startTime;

    return {
      array: sortedArray,
      quality: this.measureQuality(sortedArray),
      timeElapsed,
      metDeadline: timeElapsed <= this.deadline,
    };
  }

  recursiveSort(arr, lo, hi) {
    if (this.timeExceeded() || lo >= hi) {
      return arr;
    }

    const p = this.partition(arr, lo, hi);

    if (p - lo < hi - p) {
      this.recursiveSort(arr, lo, p - 1);
      this.recursiveSort(arr, p + 1, hi);
    } else {
      this.recursiveSort(arr, p + 1, hi);
      this.recursiveSort(arr, lo, p - 1);
    }
    return arr;
  }

  partition(arr, lo, hi) {
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (this.timeExceeded()) return hi;
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    return i + 1;
  }

  createWorker(chunk) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, 'quicksortWorker.js'));
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
      worker.postMessage({ chunk, deadline: this.deadline, startTime: this.startTime });
    });
  }

  splitArray(arr, numChunks) {
    const chunkSize = Math.ceil(arr.length / numChunks);
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }

  merge(sortedChunks) {
    if (sortedChunks.length === 0) return [];
    if (sortedChunks.length === 1) return sortedChunks[0];

    let result = sortedChunks[0];
    for(let i = 1; i < sortedChunks.length; i++) {
        result = this.mergeTwo(result, sortedChunks[i]);
    }
    return result;
  }

  mergeTwo(arr1, arr2) {
    let result = [];
    let i = 0;
    let j = 0;
    while(i < arr1.length && j < arr2.length) {
        if(arr1[i] < arr2[j]) {
            result.push(arr1[i++]);
        } else {
            result.push(arr2[j++]);
        }
    }
    return result.concat(arr1.slice(i)).concat(arr2.slice(j));
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
