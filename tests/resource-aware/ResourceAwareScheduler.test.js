import ResourceAwareScheduler from '../../src/resource-aware/ResourceAwareScheduler.js';

describe('ResourceAwareScheduler', () => {
  it('should schedule tasks that are within the resource budget', () => {
    const scheduler = new ResourceAwareScheduler({
      cpu: 10,
      energy: 100,
      memory: 1e9,
      bandwidth: 1e8
    });
    const tasks = [
      {
        name: 'Task 1',
        operations: 1e9,
        dataSize: 1e7,
        network: false,
        value: 10,
        execute: () => 'task1_complete'
      }
    ];
    const { schedule, rejections } = scheduler.optimizeSchedule(tasks);
    expect(schedule).toHaveLength(1);
    expect(rejections).toHaveLength(0);
    expect(schedule[0].scheduled).toBe(true);
  });

  it('should reject tasks that exceed the resource budget', () => {
    const scheduler = new ResourceAwareScheduler({
      cpu: 1,
      energy: 1,
      memory: 1,
      bandwidth: 1
    });
    const tasks = [
      {
        name: 'Task 1',
        operations: 1e10,
        dataSize: 1e8,
        network: true,
        value: 100,
        execute: () => 'task1_complete'
      }
    ];
    const { schedule, rejections } = scheduler.optimizeSchedule(tasks);
    expect(schedule).toHaveLength(0);
    expect(rejections).toHaveLength(1);
    expect(rejections[0].scheduled).toBe(false);
  });
});
