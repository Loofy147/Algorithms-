import { SimulatedCarbonIntensityAPI } from './SimulatedCarbonIntensityAPI.js';
import { InfeasibleScheduleError } from '../errors.js';
import { logger } from '../logger.js';

/**
 * Multi-Objective Task Scheduler
 */
export default class ResourceAwareScheduler {
  constructor(budgets, carbonIntensityAPI) {
    this.budgets = budgets;
    this.consumed = Object.keys(budgets).reduce((acc, k) => ({...acc, [k]: 0}), {});
    this.tasks = [];
    this.carbonIntensityAPI = carbonIntensityAPI || new SimulatedCarbonIntensityAPI('default');
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

  scheduleTask(task) {
    const check = this.canSchedule(task);
    if (!check.feasible) {
      throw new InfeasibleScheduleError(`Task "${task.name}" violates resource constraints`, check.violations);
    }

    const startTime = performance.now();
    const result = task.execute();
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

  optimizeSchedule(candidateTasks) {
    const carbonIntensity = this.carbonIntensityAPI.getCarbonIntensity();
    const lowCarbonThreshold = 200;

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
      return {task, efficiency, cost};
    });

    scored.sort((a, b) => b.efficiency - a.efficiency);

    const schedule = [];
    const rejections = [];
    for (let {task} of scored) {
      try {
        const result = this.scheduleTask(task);
        schedule.push({ task: task.name, scheduled: true, ...result });
      } catch (error) {
        if (error instanceof InfeasibleScheduleError) {
          logger.warn({ taskName: task.name, violations: error.violations }, 'Task rejected due to resource constraints');
          rejections.push({ task: task.name, scheduled: false, reason: error.message, violations: error.violations });
        } else {
          logger.error({ err: error, taskName: task.name }, 'An unexpected error occurred during scheduling');
          rejections.push({ task: task.name, scheduled: false, reason: 'Unexpected error' });
        }
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
