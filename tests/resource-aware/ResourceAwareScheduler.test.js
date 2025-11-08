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

  it('should prioritize carbon-sensitive tasks when carbon intensity is low', () => {
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

    const { schedule } = scheduler.optimizeSchedule(tasks);

    // The carbon-sensitive task should be scheduled first because its efficiency
    // is boosted by a factor of 3, making its effective value 30, which is
    // higher than the insensitive task's value of 25.
    expect(schedule[0].task).toBe('Low-Value, Carbon-Sensitive');
  });
});
