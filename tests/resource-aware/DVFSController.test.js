import DVFSController from '../../shared/algorithms/resource-aware/DVFSController.js';

describe('DVFSController', () => {
  it('should select the lowest energy state that meets the deadline', () => {
    const controller = new DVFSController();
    const workload = 1e9; // 1 billion operations
    const deadline = 0.5; // 500ms
    const result = controller.selectForDeadline(workload, deadline);
    expect(result.state.name).toBe('Low');
    expect(result.meetsDeadline).toBe(true);
  });

  it('should select the fastest state if no state meets the deadline', () => {
    const controller = new DVFSController();
    const workload = 1e10; // 10 billion operations
    const deadline = 0.1; // 100ms
    const result = controller.selectForDeadline(workload, deadline);
    expect(result.state.name).toBe('Turbo');
    expect(result.meetsDeadline).toBe(false);
  });

  it('should select the fastest state that meets the energy budget', () => {
    const controller = new DVFSController();
    const workload = 1e9; // 1 billion operations
    const energyBudget = 10; // 10 Joules
    const result = controller.selectForEnergy(workload, energyBudget);
    expect(result.state.name).toBe('Turbo');
    expect(result.withinBudget).toBe(true);
  });

  it('should adapt to high load by increasing the frequency', () => {
    const controller = new DVFSController();
    const context = { loadPercent: 90, batteryPercent: 100, tempCelsius: 50 };
    const state = controller.adapt(context);
    expect(state.name).toBe('Turbo');
  });

  it('should adapt to low battery by decreasing the frequency', () => {
    const controller = new DVFSController();
    const context = { loadPercent: 50, batteryPercent: 10, tempCelsius: 50 };
    const state = controller.adapt(context);
    expect(state.name).toBe('Eco');
  });

  it('should adapt to high temperature by decreasing the frequency', () => {
    const controller = new DVFSController();
    const context = { loadPercent: 50, batteryPercent: 100, tempCelsius: 90 };
    const state = controller.adapt(context);
    expect(state.name).toBe('Eco');
  });
});
