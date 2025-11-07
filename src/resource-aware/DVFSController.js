import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * DVFS Controller - Runtime frequency adaptation
 */
export default class DVFSController {
  constructor() {
    this.pStates = [
      {name: 'Eco', freq: 0.8, voltage: 0.7, power: 2.0},
      {name: 'Low', freq: 1.2, voltage: 0.9, power: 5.0},
      {name: 'Balanced', freq: 1.8, voltage: 1.1, power: 12.0},
      {name: 'Performance', freq: 2.4, voltage: 1.3, power: 25.0},
      {name: 'Turbo', freq: 3.0, voltage: 1.5, power: 45.0}
    ];
    this.currentStateIdx = 2; // Start balanced
  }

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

  adapt(context) {
    const {loadPercent, batteryPercent, tempCelsius} = context;
    let targetIdx = this.currentStateIdx;

    if (batteryPercent < 20) {
      targetIdx = Math.min(targetIdx, 1); // Force low power
    } else if (tempCelsius > 80) {
      targetIdx = Math.max(targetIdx - 1, 0);
    } else if (loadPercent > 80) {
      targetIdx = Math.min(targetIdx + 1, this.pStates.length - 1);
    } else if (loadPercent < 30) {
      targetIdx = Math.max(targetIdx - 1, 0);
    }

    if (targetIdx !== this.currentStateIdx) {
      const oldState = this.pStates[this.currentStateIdx];
      const newState = this.pStates[targetIdx];
      logger.info({ from: oldState, to: newState, context }, 'DVFS state changed');
      this.currentStateIdx = targetIdx;
    }

    return this.pStates[this.currentStateIdx];
  }

  getCurrentState() {
    return this.pStates[this.currentStateIdx];
  }
}
