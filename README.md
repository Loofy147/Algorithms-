# Advanced Computational Principles: A Production-Ready Toolkit

This project provides production-ready JavaScript implementations of seven advanced computational principles. These concepts, often confined to academic papers, are essential for building robust, efficient, and secure real-world systems. This toolkit is designed not just for learning, but as a reliable foundation for production use.

Our development is guided by a strict **[Professional Working Methodology](./METHODOLOGY.md)**, emphasizing a research-implement-verify workflow to ensure the highest quality.

## Principles Implemented

Each principle is implemented as a self-contained, professional-grade module. For detailed documentation on the theory and research behind each, please see the `docs/` directory.

| Principle | Key Implementation | Description | Use Case |
| :--- | :--- | :--- | :--- |
| **Time-Aware Computing** | `AnytimeQuicksort` | An algorithm that provides the best possible result within a strict time budget. | **[Real-time UI](./examples/time-aware-use-case.js)** |
| **Resource-Aware Computing**| `ResourceAwareScheduler` | A multi-objective scheduler that optimizes for CPU, energy, and carbon. | **[Cloud Cost Management](./examples/resource-aware-use-case.js)** |
| **Adversarial-First Design**| `SecureHashMap` | A hash map resistant to collision-based denial-of-service attacks. | **[Secure Caching Server](./examples/adversarial-first-use-case.js)** |
| **Algebraic Composability**| `composeWithTransaction`| A Saga-pattern orchestrator for building resilient, multi-step transactions. | **[Financial Transaction](./examples/algebraic-composability-use-case.js)** |
| **Causal Reasoning** | `CausalAnalyzer` | A tool for identifying Simpson's Paradox and confounding variables. | **[A/B Test Analysis](./examples/causal-reasoning-use-case.js)** |
| **Self-Modifying Algorithms**| `SelfOptimizingCache`| A cache that uses a multi-armed bandit to dynamically select the best strategy.| **[Adaptive CDN](./examples/self-modifying-use-case.js)** |
| **Uncertainty Quantification**| `ProbabilisticCounter`| A counter that provides statistically sound confidence intervals (Wilson, Agresti-Coull). | **[Real-time Polling](./examples/uncertainty-quantification-use-case.js)** |

## Production-Ready Features

This is more than a reference implementation. It's a professional toolkit built with:

- **Centralized Configuration**: All algorithmic parameters are managed in `src/config.js` and can be overridden with environment variables.
- **Structured Logging**: The entire system uses `pino` for structured, leveled logging, essential for production observability.
- **Custom Error Handling**: Specific, custom error types (e.g., `TransactionError`) allow for robust and predictable error handling.
- **Comprehensive Testing**: The project is validated with unit, integration, and performance tests.

## Microservices Architecture

This project is evolving into a microservices-based system. Each of the core computational principles is being refactored into a standalone, deployable service with a RESTful API.

### Available Services

| Service | Description | Port | Start Command |
| :--- | :--- | :--- | :--- |
| **SecureHashMap** | A remote, secure caching service. | `3000` | `npm run start:hashmap` |
| **ResourceAwareScheduler** | An API for optimizing task schedules based on resource constraints. | `3001` | `npm run start:scheduler` |

## Getting Started

### Prerequisites

- Node.js >= 18.0
- npm
- Docker (optional, for containerized deployment)

### Installation

```bash
npm install
```

### Running the Services

You can run any of the available services using the `npm run` command:

```bash
# Start the SecureHashMap service
npm run start:hashmap

# In a separate terminal, start the ResourceAwareScheduler service
npm run start:scheduler
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

### Deployment

This project can be deployed as a containerized application. For detailed instructions on deploying to a cloud environment, see the **[Hugging Face Deployment Guide](./DEPLOY_TO_HUGGINGFACE.md)**.
