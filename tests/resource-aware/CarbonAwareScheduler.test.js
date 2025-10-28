import ResourceAwareScheduler from '../../src/resource-aware/ResourceAwareScheduler.js';
import { SimulatedCarbonIntensityAPI } from '../../src/resource-aware/SimulatedCarbonIntensityAPI.js';

describe('Carbon-Aware Scheduling', () => {
  it('should prioritize carbon-sensitive tasks during periods of low carbon intensity', () => {
    const lowIntensityAPI = new SimulatedCarbonIntensityAPI('test');
    lowIntensityAPI.getCarbonIntensity = () => 100; // gCO2eq/kWh

    const highIntensityAPI = new SimulatedCarbonIntensityAPI('test');
    highIntensityAPI.getCarbonIntensity = () => 500; // gCO2eq/kWh

    const budgets = {
      cpu: 100,
      energy: 1000,
      memory: 10000,
      bandwidth: 10000,
      carbon: 1000,
    };

    const tasks = [
      {
        name: 'High-Value, Carbon-Insensitive',
        value: 100,
        operations: 1e9,
        carbonSensitive: false,
        execute: () => 'done',
      },
      {
        name: 'Low-Value, Carbon-Sensitive',
        value: 50,
        operations: 1e9,
        carbonSensitive: true,
        execute: () => 'done',
      },
    ];

    const lowIntensityScheduler = new ResourceAwareScheduler(budgets, lowIntensityAPI);
    const highIntensityScheduler = new ResourceAwareScheduler(budgets, highIntensityAPI);

    const lowIntensitySchedule = lowIntensityScheduler.optimizeSchedule(tasks);
    const highIntensitySchedule = highIntensityScheduler.optimizeSchedule(tasks);

    // At low intensity, the carbon-sensitive task should be prioritized
    expect(lowIntensitySchedule[0].task).toBe('Low-Value, Carbon-Sensitive');
    // At high intensity, the high-value task should be prioritized
    expect(highIntensitySchedule[0].task).toBe('High-Value, Carbon-Insensitive');
  });
});
