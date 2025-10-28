/**
 * @file GeneticAlgorithm.js
 * @description An implementation of a genetic algorithm to solve the traveling salesman problem.
 */

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
  constructor(populationSize, numCities, mutationRate, crossoverRate, cities) {
    this.population = new Population(populationSize, numCities, cities);
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.cities = cities;
  }

  evolve() {
    const newChromosomes = [];
    newChromosomes.push(this.population.getFittest());

    for (let i = 1; i < this.population.chromosomes.length; i++) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      const offspring = this.crossover(parent1, parent2);
      this.mutate(offspring);
      newChromosomes.push(offspring);
    }

    this.population.chromosomes = newChromosomes;
  }

  tournamentSelection() {
    const tournamentSize = 5;
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
    const offspringGenes = [];
    if (Math.random() < this.crossoverRate) {
      const start = Math.floor(Math.random() * parent1.genes.length);
      const end = Math.floor(Math.random() * (parent1.genes.length - start)) + start;
      offspringGenes.push(...parent1.genes.slice(start, end));
      for (const gene of parent2.genes) {
        if (!offspringGenes.includes(gene)) {
          offspringGenes.push(gene);
        }
      }
    } else {
      offspringGenes.push(...parent1.genes);
    }
    return new Chromosome(offspringGenes, this.cities);
  }

  mutate(chromosome) {
    for (let i = 0; i < chromosome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        const j = Math.floor(Math.random() * chromosome.genes.length);
        [chromosome.genes[i], chromosome.genes[j]] = [chromosome.genes[j], chromosome.genes[i]];
      }
    }
  }
}
