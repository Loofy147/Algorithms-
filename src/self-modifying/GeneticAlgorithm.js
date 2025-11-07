import { config } from '../config.js';

export class City {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  distanceTo(city) {
    const xDistance = Math.abs(this.x - city.x);
    const yDistance = Math.abs(this.y - city.y);
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
  }
}

export class Chromosome {
  constructor(genes, cities) {
    this.genes = genes;
    this.cities = cities;
    this.distance = this.calculateDistance();
  }
  calculateDistance() {
    let totalDistance = 0;
    for (let i = 0; i < this.genes.length - 1; i++) {
      totalDistance += this.cities[this.genes[i]].distanceTo(this.cities[this.genes[i + 1]]);
    }
    totalDistance += this.cities[this.genes[this.genes.length - 1]].distanceTo(this.cities[this.genes[0]]);
    return totalDistance;
  }
}

export class Population {
  constructor(populationSize, numCities, cities) {
    this.chromosomes = [];
    this.cities = cities;
    for (let i = 0; i < populationSize; i++) {
      this.chromosomes.push(this.createRandomChromosome(numCities));
    }
  }
  createRandomChromosome(numCities) {
    const genes = [...Array(numCities).keys()];
    for (let i = genes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [genes[i], genes[j]] = [genes[j], genes[i]];
    }
    return new Chromosome(genes, this.cities);
  }
  getFittest() {
    return this.chromosomes.reduce((a, b) => (a.distance < b.distance ? a : b));
  }
}

export class GeneticAlgorithm {
  constructor(numCities, cities, options = {}) {
    const {
      populationSize = config.geneticAlgorithm.populationSize,
      mutationRate = config.geneticAlgorithm.mutationRate,
      crossoverRate = config.geneticAlgorithm.crossoverRate
    } = options;
    this.population = new Population(populationSize, numCities, cities);
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.cities = cities;
  }

  evolve() {
    const newChromosomes = [this.population.getFittest()]; // Elitism
    while (newChromosomes.length < this.population.chromosomes.length) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      const offspring = this.crossover(parent1, parent2);
      this.mutate(offspring);
      newChromosomes.push(offspring);
    }
    this.population.chromosomes = newChromosomes;
  }

  tournamentSelection(tournamentSize = 5) {
    let fittest = null;
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.chromosomes.length);
      const chromosome = this.population.chromosomes[randomIndex];
      if (fittest === null || chromosome.distance < fittest.distance) {
        fittest = chromosome;
      }
    }
    return fittest;
  }

  crossover(parent1, parent2) {
    if (Math.random() > this.crossoverRate) {
      // No crossover, return a clone of the first parent
      return new Chromosome([...parent1.genes], this.cities);
    }

    const start = Math.floor(Math.random() * parent1.genes.length);
    const end = Math.floor(Math.random() * (parent1.genes.length - start)) + start + 1;

    const offspringGenes = parent1.genes.slice(start, end);
    const parent2Genes = parent2.genes.filter(gene => !offspringGenes.includes(gene));

    const finalGenes = [...offspringGenes, ...parent2Genes];

    // This ensures the offspring is always a valid permutation
    if (finalGenes.length !== parent1.genes.length) {
        // Fallback in case of logic error, though the above should be correct.
        return new Chromosome([...parent1.genes], this.cities);
    }

    return new Chromosome(finalGenes, this.cities);
  }

  mutate(chromosome) {
    for (let i = 0; i < chromosome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        const j = Math.floor(Math.random() * chromosome.genes.length);
        [chromosome.genes[i], chromosome.genes[j]] = [chromosome.genes[j], chromosome.genes[i]];
      }
    }
    // After mutation, the distance needs to be recalculated.
    chromosome.distance = chromosome.calculateDistance();
  }
}
