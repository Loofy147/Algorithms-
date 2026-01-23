import { GeneticAlgorithm } from '../../shared/algorithms/self-modifying/GeneticAlgorithm.js';

describe('GeneticAlgorithm (Generic Engine)', () => {
  // Define a simple optimization problem: evolving a bitstring to all 1s.
  const GENE_LENGTH = 20;

  // Fitness is the number of 1s in the gene. Higher is better.
  const fitnessFunction = (gene) => {
    return gene.reduce((sum, bit) => sum + bit, 0);
  };

  // Generate a random bitstring.
  const generateInitialGene = () => {
    const gene = [];
    for (let i = 0; i < GENE_LENGTH; i++) {
      gene.push(Math.round(Math.random()));
    }
    return gene;
  };

  // Perform single-point crossover.
  const crossoverFunction = (parent1, parent2) => {
    const crossoverPoint = Math.floor(Math.random() * (GENE_LENGTH - 1)) + 1;
    const childGene = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
    return childGene;
  };

  // Flip a single random bit.
  const mutationFunction = (gene) => {
    const mutationPoint = Math.floor(Math.random() * GENE_LENGTH);
    const mutatedGene = [...gene];
    mutatedGene[mutationPoint] = 1 - mutatedGene[mutationPoint]; // Flip the bit
    return mutatedGene;
  };

  it('should evolve a population towards a higher fitness score', () => {
    const ga = new GeneticAlgorithm({
      fitnessFunction,
      generateInitialGene,
      crossoverFunction,
      mutationFunction,
      populationSize: 20,
      mutationRate: 0.05,
    });

    // Calculate the average fitness of the initial, random population.
    const initialFitness = ga.population.reduce((sum, ind) => sum + ind.fitness, 0) / ga.population.length;

    // Evolve the population for a number of generations.
    const generations = 50;
    for (let i = 0; i < generations; i++) {
      ga.evolve();
    }

    // Get the best individual after evolution.
    const bestIndividual = ga.getFittest();

    console.log(`Initial average fitness: ${initialFitness}`);
    console.log(`Final best fitness: ${bestIndividual.fitness}`);

    // Assert that the final best fitness is better than the initial average.
    expect(bestIndividual.fitness).toBeGreaterThan(initialFitness);

    // Assert that the result is close to the optimal solution (a score of GENE_LENGTH).
    // We expect it to be very close, but allow for some randomness.
    expect(bestIndividual.fitness).toBeGreaterThanOrEqual(GENE_LENGTH * 0.9);
  });

  it('should respect the elitism setting', () => {
    const elitismCount = 5;
    const ga = new GeneticAlgorithm({
      fitnessFunction,
      generateInitialGene,
      crossoverFunction,
      mutationFunction,
      populationSize: 50,
      elitismCount,
    });

    // Sort the initial population by fitness to find the top individuals.
    ga.population.sort((a, b) => b.fitness - a.fitness);
    const elite = ga.population.slice(0, elitismCount);

    ga.evolve();

    // Check that all elite individuals from the previous generation are present in the new one.
    elite.forEach(eliteIndividual => {
      const isPresent = ga.population.some(newIndividual =>
        newIndividual.fitness === eliteIndividual.fitness &&
        JSON.stringify(newIndividual.gene) === JSON.stringify(eliteIndividual.gene)
      );
      expect(isPresent).toBe(true);
    });
  });
});
