/**
 * Centralized Configuration
 *
 * Loads configuration from environment variables with sensible defaults.
 * This allows for easy tuning of algorithmic parameters without changing the code.
 */
import 'dotenv/config';

export const config = {
  // --- Self-Modifying Cache ---
  cache: {
    // The exploration factor (epsilon) for the multi-armed bandit algorithm.
    // A value of 0.1 means 10% of the time, we explore a random strategy.
    epsilon: parseFloat(process.env.CACHE_EPSILON) || 0.1,
    // The default capacity of the cache.
    capacity: parseInt(process.env.CACHE_CAPACITY, 10) || 100,
  },

  // --- Resource-Aware Computing ---
  dvfs: {
    // The default assumed Instructions Per Cycle (IPC) for CPU performance calculations.
    // This value is highly dependent on the workload and CPU architecture.
    ipc: parseFloat(process.env.DVFS_IPC) || 2.0,
  },

  // --- Adversarial-First Design ---
  secureHashMap: {
    // The maximum number of items in a bucket before it's flagged as a potential collision attack.
    maxChainLength: parseInt(process.env.HASHMAP_MAX_CHAIN_LENGTH, 10) || 8,
    // The number of collision events that must occur before a full rehash is triggered.
    collisionThreshold: parseInt(process.env.HASHMAP_COLLISION_THRESHOLD, 10) || 3,
  },

  // --- Genetic Algorithm ---
  geneticAlgorithm: {
    // The probability (0.0 to 1.0) that a crossover will occur between two parents.
    crossoverRate: parseFloat(process.env.GA_CROSSOVER_RATE) || 0.7,
    // The probability (0.0 to 1.0) that a gene will be mutated.
    mutationRate: parseFloat(process.env.GA_MUTATION_RATE) || 0.01,
    // The number of individuals in the population.
    populationSize: parseInt(process.env.GA_POPULATION_SIZE, 10) || 100,
    // The number of generations to run the algorithm.
    generations: parseInt(process.env.GA_GENERATIONS, 10) || 50,
  },

  // --- Propensity Score Matcher ---
  logisticRegression: {
    // The learning rate for the gradient descent algorithm.
    learningRate: parseFloat(process.env.LR_LEARNING_RATE) || 0.01,
    // The number of iterations to run the training.
    iterations: parseInt(process.env.LR_ITERATIONS, 10) || 100,
    // L2 regularization strength to prevent overfitting.
    regularization: parseFloat(process.env.LR_REGULARIZATION) || 0.01,
  },
};
