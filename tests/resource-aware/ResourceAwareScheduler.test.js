import ResourceAwareScheduler from '../../shared/algorithms/resource-aware/ResourceAwareScheduler.js';

describe('ResourceAwareScheduler', () => {
  it('should schedule tasks that are within the resource budget', async () => {
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
    const { schedule, rejections } = await scheduler.optimizeSchedule(tasks);
    expect(schedule).toHaveLength(1);
    expect(rejections).toHaveLength(0);
    expect(schedule[0].scheduled).toBe(true);
  });

  it('should reject tasks that exceed the resource budget', async () => {
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
    const { schedule, rejections } = await scheduler.optimizeSchedule(tasks);
    expect(schedule).toHaveLength(0);
    expect(rejections).toHaveLength(1);
    expect(rejections[0].scheduled).toBe(false);
  });

  it('should prioritize carbon-sensitive tasks when carbon intensity is low', async () => {
    // Mock the CarbonIntensityAPI to control the carbon intensity value
    const mockCarbonApi = {
      getCarbonIntensity: () => 50 // Low carbon intensity
    };

    const scheduler = new ResourceAwareScheduler({ cpu: 10, energy: 1000 }, mockCarbonApi);

    const tasks = [
      {
        name: 'High-Value, Carbon-Insensitive',
        value: 25,
        carbonSensitive: false,
        operations: 1e9,
        execute: () => 'insensitive_complete'
      },
      {
        name: 'Low-Value, Carbon-Sensitive',
        value: 10, // Lower value, but should be prioritized due to carbon sensitivity
        carbonSensitive: true,
        operations: 1e9,
        execute: () => 'sensitive_complete'
      }
    ];

    const { schedule } = await scheduler.optimizeSchedule(tasks);

    // The carbon-sensitive task should be scheduled first because its efficiency
    // is boosted by a factor of 3, making its effective value 30, which is
    // higher than the insensitive task's value of 25.
    expect(schedule[0].task).toBe('Low-Value, Carbon-Sensitive');
  });

  it('should produce a valid and high-value schedule using the Genetic Algorithm', async () => {
    const budgets = { cpu: 10, memory: 100 };
    const tasks = [
        { name: 'Task A', value: 80, operations: 6e9, dataSize: 60, execute: () => {} },
        { name: 'Task B', value: 50, operations: 4e9, dataSize: 40, execute: () => {} },
    ];

    // Run with the genetic algorithm scheduler
    const gaScheduler = new ResourceAwareScheduler(budgets, null, 'genetic');
    const { schedule: gaSchedule } = await gaScheduler.optimizeSchedule(tasks);
    const gaValue = gaSchedule.reduce((sum, task) => sum + tasks.find(t => t.name === task.task).value, 0);

    // The optimal solution for this setup is to schedule both tasks A and B for a total value of 130.
    expect(gaValue).toBe(130);
    expect(gaSchedule.some(t => t.task === 'Task A')).toBe(true);
    expect(gaSchedule.some(t => t.task === 'Task B')).toBe(true);
  });
});
