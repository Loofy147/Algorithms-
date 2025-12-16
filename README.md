# Advanced Computational Principles: A Production-Ready Library & Research Toolkit

This project has a dual identity:

1.  **A Production-Ready Library for Time-Aware Computing:** The primary focus of this project is to provide a battle-tested, production-grade library for Time-Aware Computing. This module is intended for use in real-world systems where time-budgeted computation is critical.

2.  **A Research Toolkit for Advanced Computational Principles:** The project also serves as a research toolkit for exploring seven advanced computational principles. These modules are intended for academic and learning purposes, and are not recommended for production deployment.

Our development is guided by a strict **[Professional Working Methodology](./METHODOLOGY.md)**, emphasizing a research-implement-verify workflow to ensure high-quality, understandable code.

## Principles Implemented

Each principle is implemented as a self-contained module. For detailed documentation on the theory and research behind each, please see the `docs/` directory.

| Principle | Key Implementation | Description | Use Case |
| :--- | :--- | :--- | :--- |
| **Time-Aware Computing** | `AnytimeQuicksort`, `AnytimeGzip`, `AnytimeSHA256` | Algorithms that can be stopped at any time to return a result of improving quality, or that can be gracefully interrupted to meet a deadline. | **[Real-time UI](./examples/real-world-anytime-sort.js)**, **[Real-time Compression](./examples/real-world-anytime-gzip.js)**, **[Interruptible Hashing](./examples/real-world-anytime-sha256.js)** |
| **Resource-Aware Computing**| `ResourceAwareScheduler` | A multi-objective scheduler that optimizes for CPU, energy, and carbon. | **[Cloud Cost Management](./examples/resource-aware-use-case.js)** |
| **Adversarial-First Design**| `SecureHashMap` | A hash map resistant to collision-based denial-of-service attacks. | **[Secure Caching Server](./examples/adversarial-first-use-case.js)** |
| **Algebraic Composability**| `composeWithTransaction`| A Saga-pattern orchestrator for building resilient, multi-step transactions. | **[Financial Transaction](./examples/algebraic-composability-use-case.js)** |
| **Causal Reasoning** | `CausalAnalyzer` | A tool for identifying Simpson's Paradox and confounding variables. | **[A/B Test Analysis](./examples/causal-reasoning-use-case.js)** |
| **Self-Modifying Algorithms**| `SelfOptimizingCache`| A cache that uses a multi-armed bandit to dynamically select the best strategy.| **[Adaptive CDN](./examples/self-modifying-use-case.js)** |
| **Uncertainty Quantification**| `ProbabilisticCounter`| A counter that provides statistically sound confidence intervals (Wilson, Agresti-Coull). | **[Real-time Polling](./examples/uncertainty-quantification-use-case.js)** |

## Project Features

This toolkit is built with professional software engineering practices:

- **Centralized Configuration**: All algorithmic parameters are managed in `src/config.js` and can be overridden with environment variables.
- **Structured Logging**: The entire system uses `pino` for structured, leveled logging, which is essential for observability and debugging.
- **Custom Error Handling**: Specific, custom error types (e.g., `TransactionError`) allow for robust and predictable error handling.
- **Comprehensive Testing**: The project is validated with unit, integration, and performance tests.

## Continuous Integration

This project uses a robust CI/CD pipeline to ensure code quality and stability. The pipeline, defined in `.github/workflows/node.js.yml`, includes the following quality gates:

- **Linting**: All code is linted using ESLint to enforce a consistent style and catch common errors.
- **Vulnerability Auditing**: All dependencies are audited for known security vulnerabilities using `npm audit`.
- **Automated Testing**: The full test suite is run on every push and pull request to the `main` branch.

## Versioning

This project uses [Semantic Versioning](https://semver.org/). The version number is automatically updated and a changelog is generated on every release. The release process is automated using `standard-version` and a manual GitHub Actions workflow.

## Getting Started

### Prerequisites

- Node.js >= 18.0
- npm

### Installation

```bash
npm install
```

### Running the Use Cases

The `examples/` directory contains a runnable, real-world use case for each principle.

```bash
# Example: Run the Causal Reasoning use case
node examples/causal-reasoning-use-case.js
```

### Running Tests

The project has a full test suite.

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- tests/time-aware/AnytimeQuicksort.test.js
```

### API Documentation

This project uses JSDoc for all public APIs. You can generate a full API documentation website by running:

```bash
npm run docs:generate
```

This will create a `docs/api` directory with a searchable, navigable website detailing all classes and methods.
