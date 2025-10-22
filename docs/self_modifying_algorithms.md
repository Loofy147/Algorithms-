# Self-Modifying Algorithms

## Theoretical Background

Self-Modifying Algorithms, also known as adaptive algorithms, are algorithms that can change their own behavior in response to changes in their environment or in the data they are processing. This is a powerful concept that allows for the creation of systems that can learn and improve over time.

A key concept in this area is the **Multi-Armed Bandit** problem. This is a classic reinforcement learning problem in which a gambler must choose which of a number of slot machines (bandits) to play, each with a different unknown probability of winning. The goal is to maximize the total winnings by finding a balance between **exploration** (trying new machines to see which one is best) and **exploitation** (playing the machine that is currently thought to be the best).

## Key Research

- **Multi-armed bandit - Wikipedia**: [https://en.wikipedia.org/wiki/Multi-armed_bandit](https://en.wikipedia.org/wiki/Multi-armed_bandit)
- **Algorithms for multi-armed bandit problems**: [https://www.researchgate.net/publication/260367055_Algorithms_for_multi-armed_bandit_problems](https://www.researchgate.net/publication/260367055_Algorithms_for_multi-armed_bandit_problems)

## Implementation Details

This project implements a `SelfOptimizingCache` to demonstrate Self-Modifying Algorithms. This is a cache that uses a **Multi-Armed Bandit** algorithm to dynamically select the best caching strategy.

The cache has a set of different caching strategies (LRU, LFU, and FIFO), and it treats each of these as a "bandit". It uses an **Epsilon-Greedy** algorithm to decide which strategy to use for each operation. With a probability of `epsilon`, it will choose a random strategy (exploration). With a probability of `1 - epsilon`, it will choose the strategy that has the best hit rate so far (exploitation).

This allows the cache to adapt to changing workloads. If the access patterns of the data change, the cache will eventually detect this and switch to the strategy that is best suited to the new workload.
