import { GeneticAlgorithm, City } from '../../src/self-modifying/GeneticAlgorithm.js';

describe('Genetic Algorithm', () => {
  it('should find a reasonably good solution to the traveling salesman problem', () => {
    const cities = [
      new City(0, 0),
      new City(1, 1),
      new City(2, 0),
      new City(1, -1),
    ];

    const ga = new GeneticAlgorithm(50, 4, 0.015, 0.95, cities);

    let bestDistance = Infinity;
    for (let i = 0; i < 100; i++) {
      ga.evolve();
      const fittest = ga.population.getFittest();
      if (fittest.distance < bestDistance) {
        bestDistance = fittest.distance;
      }
    }

    // The optimal solution is a square with a total distance of 4 * sqrt(2) = 5.65
    // We'll be happy with a solution that's close to that.
    expect(bestDistance).toBeCloseTo(5.65, 1);
  });
});
