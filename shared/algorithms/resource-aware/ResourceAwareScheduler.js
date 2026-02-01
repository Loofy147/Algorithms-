import {
  SimulatedCarbonIntensityAPI
} from './SimulatedCarbonIntensityAPI.js';
import {
  InfeasibleScheduleError
} from '../errors.js';
import {
  logger
} from '../logger.js';
import {
  config
} from '../config.js';
import {
  GeneticAlgorithm
} from '../self-modifying/GeneticAlgorithm.js';

/**
 * Multi-Objective Task Scheduler
 */
export default class ResourceAwareScheduler {
  constructor(budgets, carbonIntensityAPI, strategy = 'greedy') {
    this.budgets = budgets;
    this.consumed = Object.keys(budgets).reduce((acc, k) => ({...acc, [k]: 0}), {});
    this.tasks = [];
    this.carbonIntensityAPI = carbonIntensityAPI || new SimulatedCarbonIntensityAPI('default');
    this.strategy = strategy;
  }

  estimateCost(task) {
    const ops = task.operations || 1e6;
    const dataSize = task.dataSize || 1e3;
    const baseEnergyPerOp = 50e-12; // 50 pJ
    const memoryAccessEnergy = (dataSize / 64) * 5e-9; // 5nJ per cache line
    const energy = (ops * baseEnergyPerOp) + memoryAccessEnergy;
    const carbonIntensity = this.carbonIntensityAPI.getCarbonIntensity();
    const carbon = (energy / 3.6e6) * carbonIntensity;

    return {
      cpu: ops / 1e9,
      energy: energy,
      memory: dataSize,
      bandwidth: task.network ? dataSize : 0,
      carbon: carbon,
    };
  }

  canSchedule(task) {
    const cost = this.estimateCost(task);
    const violations = {};

    for (let resource in cost) {
      if (!this.budgets[resource]) continue;
      const required = cost[resource];
      const available = this.budgets[resource] - this.consumed[resource];
      if (required > available) {
        violations[resource] = { required, available, deficit: required - available };
      }
    }

    return {
      feasible: Object.keys(violations).length === 0,
      violations,
      cost,
    };
  }

  async scheduleTask(task) {
    const check = this.canSchedule(task);
    if (!check.feasible) {
      throw new InfeasibleScheduleError(`Task "${task.name}" violates resource constraints`, check.violations);
    }

    const startTime = performance.now();
    const result = await Promise.resolve(task.execute());
    const actualTime = performance.now() - startTime;

    for (let resource in check.cost) {
      if (this.consumed[resource] !== undefined) {
        this.consumed[resource] += check.cost[resource];
      }
    }

    this.tasks.push({ name: task.name, cost: check.cost, actualTime, result });
    logger.info({ taskName: task.name, cost: check.cost }, 'Task scheduled successfully');
    return { scheduled: true, result, resourcesUsed: check.cost };
  }

  _greedyOptimize(candidateTasks) {
    const carbonIntensity = this.carbonIntensityAPI.getCarbonIntensity();
    const { lowCarbonThreshold } = config.scheduler;

    const scored = candidateTasks.map(task => {
      const cost = this.estimateCost(task);
      const normalizedCost = Object.keys(cost).reduce((sum, resource) => {
        if (!this.budgets[resource]) return sum;
        return sum + (cost[resource] / this.budgets[resource]);
      }, 0);
      let efficiency = (task.value || 1) / (normalizedCost + 1e-6);
      if (task.carbonSensitive && carbonIntensity < lowCarbonThreshold) {
        efficiency *= 3.0;
      }
      return { task, efficiency, cost };
    });

    scored.sort((a, b) => b.efficiency - a.efficiency);

    const optimalSchedule = [];
    const tempConsumed = Object.keys(this.budgets).reduce((acc, k) => ({ ...acc, [k]: 0 }), {});

    for (const { task, cost } of scored) {
      let feasible = true;
      for (const resource in cost) {
        if (!this.budgets[resource]) continue;
        if ((tempConsumed[resource] + cost[resource]) > this.budgets[resource] + 1e-9) {
          feasible = false;
          break;
        }
      }
      if (feasible) {
        optimalSchedule.push(task);
        for (const resource in cost) {
          if (tempConsumed[resource] !== undefined) {
            tempConsumed[resource] += cost[resource];
          }
        }
      }
    }
    return optimalSchedule;
  }

  _geneticAlgorithmOptimize(candidateTasks) {
    // BOLT: Pre-calculate costs and values into flat arrays for O(1) access during fitness evaluation
    // Expected impact: -40% execution time for large populations
    const resourceKeys = Object.keys(this.budgets);
    const numResources = resourceKeys.length;
    const numTasks = candidateTasks.length;

    const taskValues = new Float64Array(numTasks);
    const taskCostsMatrix = new Float64Array(numTasks * numResources);
    const budgetValues = new Float64Array(numResources);

    for (let j = 0; j < numResources; j++) {
      budgetValues[j] = this.budgets[resourceKeys[j]];
    }

    for (let i = 0; i < numTasks; i++) {
      const task = candidateTasks[i];
      taskValues[i] = task.value || 1;
      const cost = this.estimateCost(task);
      for (let j = 0; j < numResources; j++) {
        taskCostsMatrix[i * numResources + j] = cost[resourceKeys[j]] || 0;
      }
    }

    const fitnessFunction = (scheduleGene) => {
        let totalValue = 0;
        // BOLT: Use Float64Array for consumption tracking to avoid object allocation pressure
        const consumed = new Float64Array(numResources);

        for (let i = 0; i < numTasks; i++) {
            if (scheduleGene[i] === 1) {
                totalValue += taskValues[i];
                const offset = i * numResources;
                for (let j = 0; j < numResources; j++) {
                    consumed[j] += taskCostsMatrix[offset + j];
                }
            }
        }

        let penalty = 0;
        // BOLT: Use a standard loop instead of Object.keys().reduce() for performance
        for (let j = 0; j < numResources; j++) {
            const budget = budgetValues[j];
            // Added small epsilon to account for floating point noise in budget checks
            if (consumed[j] > budget + 1e-9) {
                const violation = consumed[j] - budget;
                const relativeViolation = violation / budget;
                penalty += relativeViolation * 1000; // Gradient penalty
            }
        }

        return Math.max(0, totalValue - penalty);
    };

    const generateInitialGene = () => {
      return candidateTasks.map(() => Math.random() > 0.5 ? 1 : 0);
    };

    const crossoverFunction = (parent1, parent2) => {
      const midpoint = Math.floor(Math.random() * parent1.length);
      const child = parent1.slice(0, midpoint).concat(parent2.slice(midpoint));
      return child;
    };

    const mutationFunction = (gene) => {
      const newGene = [...gene];
      const index = Math.floor(Math.random() * newGene.length);
      newGene[index] = newGene[index] === 1 ? 0 : 1;
      return newGene;
    };

    const ga = new GeneticAlgorithm({
      fitnessFunction,
      crossoverFunction,
      mutationFunction,
      generateInitialGene,
      populationSize: 100, // Increased population size
      mutationRate: 0.05, // Increased mutation rate
      crossoverRate: 0.9,
      elitismCount: 2
    });

    // Evolution loop
    const maxGenerations = 500;
    let stableGenerations = 0;
    let lastBestFitness = -1;
    const convergenceThreshold = 50; // Number of generations without improvement to consider converged

    for (let i = 0; i < maxGenerations; i++) {
      ga.evolve();
      const currentBestFitness = ga.getFittest().fitness;
      if (currentBestFitness > lastBestFitness) {
        lastBestFitness = currentBestFitness;
        stableGenerations = 0;
      } else {
        stableGenerations++;
      }

      if (stableGenerations >= convergenceThreshold) {
        logger.info({ generation: i, fitness: currentBestFitness }, 'Genetic algorithm converged.');
        break;
      }
    }

    const bestGene = ga.getFittest().gene;
    const optimalSchedule = candidateTasks.filter((_, i) => bestGene[i] === 1);

    return optimalSchedule;
  }

  async optimizeSchedule(candidateTasks) {
    let optimalSchedulePlan;
    switch (this.strategy) {
      case 'genetic':
        optimalSchedulePlan = this._geneticAlgorithmOptimize(candidateTasks);
        break;
      case 'greedy':
      default:
        optimalSchedulePlan = this._greedyOptimize(candidateTasks);
        break;
    }

    const schedule = [];
    const rejections = [];
    const scheduledTaskNames = new Set(optimalSchedulePlan.map(t => t.name));

    // Execute the planned schedule
    for (const task of optimalSchedulePlan) {
      try {
        const result = await this.scheduleTask(task);
        schedule.push({ task: task.name, scheduled: true, ...result });
      } catch (error) {
        logger.error({ err: error, taskName: task.name }, 'Task from optimal plan failed to schedule');
        rejections.push({ task: task.name, scheduled: false, reason: 'Failed execution despite being in optimal plan', violations: error.violations });
      }
    }

    // Identify tasks that were not in the final plan
    for (const task of candidateTasks) {
      if (!scheduledTaskNames.has(task.name)) {
        rejections.push({ task: task.name, scheduled: false, reason: 'Not selected by optimization strategy' });
      }
    }

    return { schedule, rejections };
  }

  getUtilization() {
    const util = {};
    for (let resource in this.budgets) {
      const used = this.consumed[resource];
      const total = this.budgets[resource];
      util[resource] = { used, total, percent: ((used / total) * 100).toFixed(1) + '%' };
    }
    return util;
  }

  getStats() {
    return {
      scheduled: this.tasks.length,
      utilization: this.getUtilization()
    };
  }
}
