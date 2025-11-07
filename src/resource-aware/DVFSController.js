/**
 * DVFS Controller - Runtime frequency adaptation
 *
 * Selects optimal CPU frequency based on:
 * - Workload characteristics
 * - Battery level
 * - Thermal constraints
 * - Deadline requirements
 */
export default class DVFSController {
  constructor() {
    // P-states: frequency (GHz), voltage (V), power (W)
    this.pStates = [
      {name: 'Eco', freq: 0.8, voltage: 0.7, power: 2.0},
      {name: 'Low', freq: 1.2, voltage: 0.9, power: 5.0},
      {name: 'Balanced', freq: 1.8, voltage: 1.1, power: 12.0},
      {name: 'Performance', freq: 2.4, voltage: 1.3, power: 25.0},
      {name: 'Turbo', freq: 3.0, voltage: 1.5, power: 45.0}
    ];
    this.currentStateIdx = 2; // Start balanced
  }

  /**
   * Optimize for deadline constraint
   *
   * Minimize energy while meeting deadline
   */
  selectForDeadline(workload, deadline, IPC = 2.0) {
    const candidates = this.pStates.map((state, idx) => {
      const time = workload / (state.freq * 1e9 * IPC);
      const energy = state.power * time;

      return {
        idx,
        state,
        time,
        energy,
        meetsDeadline: time <= deadline
      };
    });

    // Filter viable options
    const viable = candidates.filter(c => c.meetsDeadline);

    if (viable.length === 0) {
      // No option meets deadline - use fastest
      return candidates[candidates.length - 1];
    }

    // Among viable, choose lowest energy
    return viable.reduce((best, curr) =>
      curr.energy < best.energy ? curr : best
    );
  }

  /**
   * Optimize for energy budget
   *
   * Maximize performance within energy constraint
   */
  selectForEnergy(workload, energyBudget, IPC = 2.0) {
    const candidates = this.pStates.map((state, idx) => {
      const time = workload / (state.freq * 1e9 * IPC);
      const energy = state.power * time;

      return {
        idx,
        state,
        time,
        energy,
        withinBudget: energy <= energyBudget
      };
    });

    const viable = candidates.filter(c => c.withinBudget);

    if (viable.length === 0) {
      // No option within budget - use lowest power
      return candidates[0];
    }

    // Among viable, choose fastest
    return viable.reduce((best, curr) =>
      curr.time < best.time ? curr : best
    );
  }

  /**
   * Adaptive frequency scaling
   *
   * Adjust based on runtime conditions
   */
  adapt(context) {
    const {loadPercent, batteryPercent, tempCelsius} = context;
    let targetIdx = this.currentStateIdx;

    // Battery critical
    if (batteryPercent < 20) {
      targetIdx = Math.min(targetIdx, 1); // Force low power
    }
    // Thermal throttling
    else if (tempCelsius > 80) {
      targetIdx = Math.max(targetIdx - 1, 0);
    }
    // High load
    else if (loadPercent > 80) {
      targetIdx = Math.min(targetIdx + 1, this.pStates.length - 1);
    }
    // Low load
    else if (loadPercent < 30) {
      targetIdx = Math.max(targetIdx - 1, 0);
    }

    if (targetIdx !== this.currentStateIdx) {
      const oldState = this.pStates[this.currentStateIdx];
      const newState = this.pStates[targetIdx];

      console.log(`DVFS: ${oldState.name} (${oldState.freq}GHz, ${oldState.power}W) → ${newState.name} (${newState.freq}GHz, ${newState.power}W)`);

      this.currentStateIdx = targetIdx;
    }

    return this.pStates[this.currentStateIdx];
  }

  getCurrentState() {
    return this.pStates[this.currentStateIdx];
  }
}
