import { config } from '../config.js';

// --- Generic Genetic Algorithm Engine ---

/**
 * A generic Genetic Algorithm engine.
 *
 * This class is designed to be problem-agnostic. It requires the user to provide
 * the core genetic operators (fitness function, crossover, mutation) and initial
 * gene generation logic. This allows it to be applied to a wide range of
 * optimization problems beyond its original TSP implementation.
 */
export class GeneticAlgorithm {
  /**
   * @param {object} options - Configuration for the GA.
   * @param {function} options.fitnessFunction - A function that takes a 'gene' and returns a numerical fitness score (higher is better).
   * @param {function} options.crossoverFunction - A function that takes two parent genes and returns a new offspring gene.
   * @param {function} options.mutationFunction - A function that takes a gene and returns a mutated version of it.
   * @param {function} options.generateInitialGene - A function that generates a single random gene.
   * @param {number} [options.populationSize=50] - The number of individuals in the population.
   * @param {number} [options.mutationRate=0.01] - The probability of a mutation occurring.
   * @param {number} [options.crossoverRate=0.95] - The probability of a crossover occurring.
   * @param {number} [options.elitismCount=2] - The number of top individuals to carry over to the next generation.
   */
  constructor(options) {
    this.options = {
      populationSize: config.geneticAlgorithm.populationSize || 50,
      mutationRate: config.geneticAlgorithm.mutationRate || 0.01,
      crossoverRate: config.geneticAlgorithm.crossoverRate || 0.95,
      elitismCount: config.geneticAlgorithm.elitismCount || 2,
      ...options
    };

    // Validate that all required functions are provided.
    if (typeof this.options.fitnessFunction !== 'function' ||
        typeof this.options.crossoverFunction !== 'function' ||
        typeof this.options.mutationFunction !== 'function' ||
        typeof this.options.generateInitialGene !== 'function') {
      throw new Error('GA requires fitness, crossover, mutation, and gene generation functions.');
    }

    this.population = this.initializePopulation();
  }

  /**
   * Generates the initial population of individuals.
   * @returns {Array<object>} An array of individuals, each with a 'gene' and a 'fitness' score.
   */
  initializePopulation() {
    const population = [];
    for (let i = 0; i < this.options.populationSize; i++) {
      const gene = this.options.generateInitialGene();
      population.push({
        gene,
        fitness: this.options.fitnessFunction(gene),
      });
    }
    return population;
  }

  /**
   * Selects an individual from the population using tournament selection.
   * @param {number} [tournamentSize=5] - The number of individuals to select for the tournament.
   * @returns {object} The fittest individual from the tournament.
   */
  tournamentSelection(tournamentSize = 5) {
    let best = null;
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      const individual = this.population[randomIndex];
      if (best === null || individual.fitness > best.fitness) {
        best = individual;
      }
    }
    return best;
  }

  /**
   * Evolves the population for one generation.
   * @returns {void}
   */
  evolve() {
    // Sort the population by fitness in descending order.
    this.population.sort((a, b) => b.fitness - a.fitness);

    const newPopulation = [];

    // Apply elitism: carry over the best individuals.
    for (let i = 0; i < this.options.elitismCount; i++) {
      newPopulation.push(this.population[i]);
    }

    // Generate the rest of the new population through selection, crossover, and mutation.
    while (newPopulation.length < this.options.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();

      let offspringGene;
      if (Math.random() < this.options.crossoverRate) {
        offspringGene = this.options.crossoverFunction(parent1.gene, parent2.gene);
      } else {
        offspringGene = parent1.gene; // Pass through one of the parents if no crossover.
      }

      if (Math.random() < this.options.mutationRate) {
        offspringGene = this.options.mutationFunction(offspringGene);
      }

      newPopulation.push({
        gene: offspringGene,
        fitness: this.options.fitnessFunction(offspringGene),
      });
    }

    this.population = newPopulation;
  }

  /**
   * Retrieves the individual with the highest fitness score in the current population.
   * @returns {object} The best individual found so far.
   */
  getFittest() {
    return this.population.reduce((best, current) => {
      return (current.fitness > best.fitness) ? current : best;
    }, this.population[0]);
  }
}
