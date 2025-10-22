import DVFSController from '../../src/resource-aware/DVFSController.js';

describe('DVFSController', () => {
  it('should select the lowest energy state that meets the deadline', () => {
    const controller = new DVFSController();
    const workload = 1e9; // 1 billion operations
    const deadline = 0.5; // 500ms
    const result = controller.selectForDeadline(workload, deadline);
    expect(result.state.name).toBe('Performance');
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
});
