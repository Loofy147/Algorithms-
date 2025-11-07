import ResourceAwareScheduler from '../src/resource-aware/ResourceAwareScheduler.js';
import { SimulatedCarbonIntensityAPI } from '../src/resource-aware/SimulatedCarbonIntensityAPI.js';
import { logger } from '../src/logger.js';

function cloudCostManagement() {
  logger.info('--- Resource-Aware Computing Use Case: Cloud Cost Management ---');

  const carbonApi = new SimulatedCarbonIntensityAPI('low');
  const budgets = { cpu: 100, energy: 50000, memory: 1e6, carbon: 1.0 };
  const scheduler = new ResourceAwareScheduler(budgets, carbonApi);

  const candidateTasks = [
    { name: 'Critical Analytics Job', value: 100, operations: 5e9, dataSize: 5e4, execute: () => 'done' },
    { name: 'Batch Image Processing (Carbon-Sensitive)', value: 80, operations: 1e10, dataSize: 2e5, carbonSensitive: true, execute: () => 'done' },
    { name: 'Data Backup', value: 40, operations: 1e9, dataSize: 8e5, execute: () => 'done' },
    { name: 'Ad-hoc User Query', value: 60, operations: 2e9, dataSize: 1e4, execute: () => 'done' },
    { name: 'Model Training (Exceeds Budget)', value: 200, operations: 1e11, dataSize: 5e5, execute: () => 'done' },
  ];

  logger.info({ budgets, carbonIntensity: `${carbonApi.getCarbonIntensity()} gCO2eq/kWh (Low)` }, 'Initial state');
  logger.info('Scheduling candidate tasks...');

  const { schedule, rejections } = scheduler.optimizeSchedule(candidateTasks);

  logger.info('--- Scheduling Results ---');
  schedule.forEach(result => {
    logger.info(`✅ ${result.task}: Scheduled successfully.`);
  });
  rejections.forEach(result => {
    logger.warn(`❌ ${result.task}: Rejected. Reason: ${result.reason}.`);
  });

  logger.info('--- Final Resource Utilization ---');
  const utilization = scheduler.getStats().utilization;
  for (const resource in utilization) {
    logger.info(`  - ${resource.padEnd(10)}: ${utilization[resource].percent} used (${utilization[resource].used.toFixed(2)} / ${utilization[resource].total})`);
  }

  logger.info('Conclusion: The scheduler prioritized the carbon-sensitive job due to low grid intensity and rejected jobs that would exceed the budget, maximizing value within constraints.');
}

cloudCostManagement();
