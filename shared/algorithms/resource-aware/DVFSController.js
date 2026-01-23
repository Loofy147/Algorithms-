import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Manages Dynamic Voltage and Frequency Scaling (DVFS) to balance performance and power consumption.
 * This controller simulates a set of P-states (performance states) and provides methods
 * to select the optimal state based on various constraints and contexts.
 */
export default class DVFSController {
  constructor() {
    /**
     * @property {Array<object>} pStates - The available performance states, from lowest to highest power.
     * @private
     */
    this.pStates = [
      {name: 'Eco', freq: 0.8, voltage: 0.7, power: 2.0},
      {name: 'Low', freq: 1.2, voltage: 0.9, power: 5.0},
      {name: 'Balanced', freq: 1.8, voltage: 1.1, power: 12.0},
      {name: 'Performance', freq: 2.4, voltage: 1.3, power: 25.0},
      {name: 'Turbo', freq: 3.0, voltage: 1.5, power: 45.0}
    ];
    /**
     * @property {number} currentStateIdx - The index of the current P-state.
     * @private
     */
    this.currentStateIdx = 2; // Start balanced
  }

  /**
   * Selects the most energy-efficient P-state that can meet a given deadline.
   * @param {number} workload - The number of operations to complete.
   * @param {number} deadline - The time in seconds by which the workload must be completed.
   * @param {number} [IPC=config.dvfs.ipc] - The Instructions Per Cycle of the CPU.
   * @returns {object} The best P-state candidate, including the state, estimated time, and energy.
   */
  selectForDeadline(workload, deadline, IPC = config.dvfs.ipc) {
    const candidates = this.pStates.map((state) => {
      const time = workload / (state.freq * 1e9 * IPC);
      const energy = state.power * time;
      return { state, time, energy, meetsDeadline: time <= deadline };
    });

    const viable = candidates.filter(c => c.meetsDeadline);
    if (viable.length === 0) {
      logger.warn({ workload, deadline }, 'No P-state can meet the deadline. Selecting fastest state.');
      return candidates[candidates.length - 1];
    }

    const best = viable.reduce((best, curr) => (curr.energy < best.energy ? curr : best));
    logger.debug({ bestState: best.state.name }, 'Selected optimal P-state for deadline');
    return best;
  }

  /**
   * Selects the fastest P-state that can stay within a given energy budget.
   * @param {number} workload - The number of operations to complete.
   * @param {number} energyBudget - The maximum energy in Joules to consume.
   * @param {number} [IPC=config.dvfs.ipc] - The Instructions Per Cycle of the CPU.
   * @returns {object} The best P-state candidate, including the state, estimated time, and energy.
   */
  selectForEnergy(workload, energyBudget, IPC = config.dvfs.ipc) {
    const candidates = this.pStates.map((state) => {
      const time = workload / (state.freq * 1e9 * IPC);
      const energy = state.power * time;
      return { state, time, energy, withinBudget: energy <= energyBudget };
    });

    const viable = candidates.filter(c => c.withinBudget);
    if (viable.length === 0) {
      logger.warn({ workload, energyBudget }, 'No P-state can meet the energy budget. Selecting lowest power state.');
      return candidates[0];
    }

    const best = viable.reduce((best, curr) => (curr.time < best.time ? curr : best));
    logger.debug({ bestState: best.state.name }, 'Selected optimal P-state for energy budget');
    return best;
  }

  /**
   * Adapts the P-state based on the current system context (CPU load, battery, temperature).
   * @param {object} context - The system context.
   * @param {number} context.loadPercent - The current CPU load percentage.
   * @param {number} context.batteryPercent - The current battery percentage.
   * @param {number} context.tempCelsius - The current CPU temperature in Celsius.
   * @returns {object} The new P-state.
   */
  adapt(context) {
    const { loadPercent, batteryPercent, tempCelsius } = context;
    let targetIdx = 2; // Default to 'Balanced'

    if (batteryPercent < 20 || tempCelsius > 85) {
      targetIdx = 0; // 'Eco'
    } else if (batteryPercent < 50 || tempCelsius > 70) {
      targetIdx = 1; // 'Low'
    } else if (loadPercent > 80) {
      targetIdx = 4; // 'Turbo'
    } else if (loadPercent > 60) {
      targetIdx = 3; // 'Performance'
    }

    if (targetIdx !== this.currentStateIdx) {
      const oldState = this.pStates[this.currentStateIdx];
      const newState = this.pStates[targetIdx];
      logger.info({ from: oldState, to: newState, context }, 'DVFS state changed');
      this.currentStateIdx = targetIdx;
    }

    return this.pStates[this.currentStateIdx];
  }

  /**
   * Returns the current P-state.
   * @returns {object} The current P-state.
   */
  getCurrentState() {
    return this.pStates[this.currentStateIdx];
  }
}
