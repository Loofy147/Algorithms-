# Advanced Computational Principles

This project provides production-ready implementations of seven fundamental computational principles that are often overlooked in traditional computer science education. These principles are essential for building robust, efficient, and secure real-world systems.

## Principles Implemented

### 1. Time-Aware Computing
- **`AnytimeQuicksort`**: A quicksort algorithm that can be interrupted at any time and will return the best result it has found so far.
- **`WCETAnalyzer`**: A tool for analyzing the worst-case execution time of a function.

### 2. Resource-Aware Computing
- **`ResourceAwareScheduler`**: A multi-objective scheduler that can optimize for CPU, energy, memory, and bandwidth.
- **`DVFSController`**: A controller for dynamic voltage and frequency scaling.

### 3. Adversarial-First Design
- **`SecureHashMap`**: A hash map that is resistant to collision and timing attacks.

### 4. Algebraic Composability
- **`ComposableOperation`**: A class that represents an operation with a defined input and output schema using `zod`.
- **`compose`**: A utility for composing multiple `ComposableOperation`s into a single pipeline.

### 5. Uncertainty Quantification
- **`ProbabilisticCounter`**: A counter that tracks a value with confidence bounds using the Wilson score interval.

### 6. Self-Modifying Algorithms
- **`SelfOptimizingCache`**: A cache that uses a multi-armed bandit algorithm (Epsilon-Greedy) to dynamically select the best caching strategy.

### 7. Causal Reasoning
- **`CausalAnalyzer`**: A tool for analyzing a dataset to demonstrate Simpson's Paradox.

## Getting Started

To install the dependencies, run:

```bash
npm install
```

To run the tests, run:

```bash
npm test
```
