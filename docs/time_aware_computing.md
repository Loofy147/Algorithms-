# Time-Aware Computing

## Theoretical Background

Time-Aware Computing is a paradigm that treats time not just as a performance metric, but as a primary constraint for computation. In many real-world systems, especially in robotics, autonomous vehicles, and embedded systems, the correctness of a computation depends not only on the logical result, but also on the time at which that result is produced.

This principle is built on two key concepts:

1.  **Anytime Algorithms**: These are algorithms that can be interrupted at any point and will return a result of a certain quality. The longer they run, the better the quality of the result. This is in contrast to traditional algorithms, which may not produce any useful output until they have run to completion.

2.  **Worst-Case Execution Time (WCET) Analysis**: This is the process of determining the maximum possible execution time of a piece of code on a specific hardware platform. WCET analysis is crucial for real-time systems, as it allows for provable guarantees about the timing behavior of the system.

## Key Research

- **Effective anytime algorithm for multiobjective combinatorial optimization problems**: [https://arxiv.org/abs/2403.08807](https://arxiv.org/abs/2403.08807)
- **Efficient anytime algorithms to solve the bi-objective Next Release Problem**: [https://arxiv.org/pdf/2402.04586](https://arxiv.org/pdf/2402.04586)
- **Worst-case execution time - Wikipedia**: [https://en.wikipedia.org/wiki/Worst-case_execution_time](https://en.wikipedia.org/wiki/Worst-case_execution_time)
- **Complete Worst-Case Execution Time Analysis of Straight-line Hard Real-Time Programs**: [https://www.researchgate.net/publication/223682566_Complete_Worst-Case_Execution_Time_Analysis_of_Straight-line_Hard_Real-Time_Programs](https://www.researchgate.net/publication/223682566_Complete_Worst-Case_Execution_Time_Analysis_of_Straight-line_Hard_Real-Time_Programs)

## Implementation Details

This project implements two components to demonstrate Time-Aware Computing:

- **`AnytimeQuicksort`**: A modified version of the quicksort algorithm that can be interrupted by a deadline. If the deadline is reached, it returns a partially sorted array, with a "quality" score that represents how close it is to being fully sorted.

- **`WCETAnalyzer`**: A tool that uses statistical methods to estimate the worst-case execution time of a function. It runs the function many times, collects timing data, and then uses that data to calculate a probabilistic upper bound on the execution time.
