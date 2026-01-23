import { parentPort } from 'worker_threads';

class AnytimeQuicksortWorker {
    constructor(deadline, startTime) {
        this.deadline = deadline;
        this.startTime = startTime;
    }

    sort(arr) {
        return this.recursiveSort([...arr], 0, arr.length - 1);
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

    timeExceeded() {
        return (performance.now() - this.startTime) >= this.deadline;
    }
}


parentPort.on('message', ({ chunk, deadline, startTime }) => {
    const sorter = new AnytimeQuicksortWorker(deadline, startTime);
    const result = sorter.sort(chunk);
    parentPort.postMessage(result);
    parentPort.close();
});
