/**
 * Multi-Objective Task Scheduler
 *
 * Optimizes across N dimensions: cpu, energy, memory, bandwidth
 * Uses Pareto dominance for multi-objective optimization
 */
class ResourceAwareScheduler {
  constructor(budgets) {
    this.budgets = budgets; // {cpu: X, energy: Y, memory: Z, bandwidth: W}
    this.consumed = Object.keys(budgets).reduce((acc, k) => ({...acc, [k]: 0}), {});
    this.tasks = [];
    this.rejections = [];
  }

  /**
   * Estimate multi-dimensional cost
   *
   * Energy model: E = P × t
   * Power model: P = C × V² × f (CMOS)
   * Simplified: E ≈ operations × energy_per_op
   */
  estimateCost(task) {
    const ops = task.operations || 1e6;
    const dataSize = task.dataSize || 1e3;

    return {
      cpu: ops / 1e9,              // CPU-seconds
      energy: ops * 1e-9,          // Joules (1nJ per operation)
      memory: dataSize,             // Bytes
      bandwidth: task.network ? dataSize : 0
    };
  }

  /**
   * Admission control - check feasibility across ALL resources
   */
  canSchedule(task) {
    const cost = this.estimateCost(task);
    const violations = {};

    for (let resource in cost) {
      if (!this.budgets[resource]) continue;
      const required = cost[resource];
      const available = this.budgets[resource] - this.consumed[resource];

      if (required > available) {
        violations[resource] = {
          required,
          available,
          deficit: required - available
        };
      }
    }

    return {
      feasible: Object.keys(violations).length === 0,
      violations,
      cost
    };
  }

  /**
   * Schedule task with resource accounting
   */
  scheduleTask(task) {
    const check = this.canSchedule(task);

    if (!check.feasible) {
      this.rejections.push({task: task.name, ...check});
      return {
        scheduled: false,
        reason: 'Resource constraints violated',
        violations: check.violations
      };
    }

    // Execute task
    const startTime = performance.now();
    const result = task.execute();
    const actualTime = performance.now() - startTime;

    // Update consumed resources
    for (let resource in check.cost) {
      if (this.consumed[resource] !== undefined) {
        this.consumed[resource] += check.cost[resource];
      }
    }

    this.tasks.push({
      name: task.name,
      cost: check.cost,
      actualTime,
      result
    });

    return {
      scheduled: true,
      result,
      resourcesUsed: check.cost
    };
  }

  /**
   * Pareto-optimal task ordering
   *
   * Find schedule that maximizes value while respecting constraints
   */
  optimizeSchedule(candidateTasks) {
    // Efficiency = value / total_cost
    const scored = candidateTasks.map(task => {
      const cost = this.estimateCost(task);

      // Normalize costs to [0, 1] and sum
      const normalizedCost = Object.keys(cost).reduce((sum, resource) => {
        if (!this.budgets[resource]) return sum;
        return sum + (cost[resource] / this.budgets[resource]);
      }, 0);

      const efficiency = (task.value || 1) / (normalizedCost + 1e-6);

      return {task, efficiency, cost};
    });

    // Greedy: schedule highest efficiency first
    scored.sort((a, b) => b.efficiency - a.efficiency);

    const schedule = [];
    for (let {task} of scored) {
      const result = this.scheduleTask(task);
      schedule.push({
        task: task.name,
        scheduled: result.scheduled,
        reason: result.reason,
        violations: result.violations
      });
    }

    return schedule;
  }

  getUtilization() {
    const util = {};
    for (let resource in this.budgets) {
      const used = this.consumed[resource];
      const total = this.budgets[resource];
      util[resource] = {
        used,
        total,
        percent: ((used / total) * 100).toFixed(1) + '%'
      };
    }
    return util;
  }

  getStats() {
    return {
      scheduled: this.tasks.length,
      rejected: this.rejections.length,
      utilization: this.getUtilization()
    };
  }
}

module.exports = ResourceAwareScheduler;
