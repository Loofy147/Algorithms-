# Genetic Algorithms

## Theoretical Background

Genetic Algorithms are a class of optimization algorithms inspired by the process of natural selection. They are a subset of the larger field of Evolutionary Computation, and they are particularly well-suited for solving complex optimization problems where traditional methods may fail.

The core concepts of Genetic Algorithms include:

- **Population**: A set of candidate solutions to the problem.
- **Chromosome**: A representation of a single candidate solution.
- **Fitness Function**: a function that evaluates how good a particular solution is.
- **Selection**: The process of choosing which solutions from the current population will be used to create the next generation.
- **Crossover**: The process of combining two parent solutions to create a new offspring solution.
- **Mutation**: The process of randomly changing a solution to introduce new genetic material into the population.

## Key Research

- **A Genetic Algorithm Tutorial - Johns Hopkins Computer Science**: [https://www.cs.jhu.edu/~ayuille/courses/Stat202C-Spring10/ga_tutorial.pdf](https://www.cs.jhu.edu/~ayuille/courses/Stat202C-Spring10/ga_tutorial.pdf)
- **An introduction to genetic algorithms - Max Halford**: [https://maxhalford.github.io/blog/genetic-algorithms-introduction/](https://maxhalford.github.io/blog/genetic-algorithms-introduction/)
- **Genetic Algorithms - GeeksforGeeks**: [https://www.geeksforgeeks.org/dsa/genetic-algorithms/](https://www.geeksforgeeks.org/dsa/genetic-algorithms/)

## Implementation Details

This project will expand the `self-modifying` principle by implementing a genetic algorithm to solve the traveling salesman problem. This will involve:

- **`Population`**: A class to manage a population of candidate solutions.
- **`Chromosome`**: A class to represent a single tour in the traveling salesman problem.
- **`GeneticAlgorithm`**: A class that will orchestrate the process of selection, crossover, and mutation to evolve a population of solutions over time.
