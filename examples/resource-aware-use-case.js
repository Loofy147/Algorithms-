import ResourceAwareScheduler from '../src/resource-aware/ResourceAwareScheduler.js';
import { SimulatedCarbonIntensityAPI } from '../src/resource-aware/SimulatedCarbonIntensityAPI.js';

/**
 * Use Case: Cloud Cost Management and Carbon-Aware Scheduling
 *
 * Imagine a multi-tenant cloud service that needs to run various jobs for
 * different customers. The service has a limited budget for CPU, energy, and
 * memory, and it also wants to be environmentally responsible by running
 * non-critical jobs when the carbon intensity of the grid is low.
 *
 * The ResourceAwareScheduler can optimize which jobs to run and when, maximizing
 * value while staying within budget and prioritizing green energy usage.
 */
function cloudCostManagement() {
  console.log('--- Resource-Aware Computing Use Case: Cloud Cost Management ---');

  const carbonApi = new SimulatedCarbonIntensityAPI('low'); // Simulate low carbon intensity
  const budgets = {
    cpu: 100,      // CPU-seconds
    energy: 50000, // Joules
    memory: 1e6,   // Bytes
    carbon: 1.0,   // gCO2eq
  };

  const scheduler = new ResourceAwareScheduler(budgets, carbonApi);

  const candidateTasks = [
    { name: 'Critical Analytics Job', value: 100, operations: 5e9, dataSize: 5e4, execute: () => 'done' },
    { name: 'Batch Image Processing (Carbon-Sensitive)', value: 80, operations: 1e10, dataSize: 2e5, carbonSensitive: true, execute: () => 'done' },
    { name: 'Data Backup', value: 40, operations: 1e9, dataSize: 8e5, execute: () => 'done' },
    { name: 'Ad-hoc User Query', value: 60, operations: 2e9, dataSize: 1e4, execute: () => 'done' },
    { name: 'Model Training (Exceeds Budget)', value: 200, operations: 1e11, dataSize: 5e5, execute: () => 'done' },
  ];

  console.log('\nInitial Budgets:', budgets);
  console.log('Carbon Intensity:', carbonApi.getCarbonIntensity(), 'gCO2eq/kWh (Low)');
  console.log('\nScheduling candidate tasks...');

  const schedule = scheduler.optimizeSchedule(candidateTasks);

  console.log('\n--- Scheduling Results ---');
  schedule.forEach(result => {
    if (result.scheduled) {
      console.log(`  ✅ ${result.task}: Scheduled successfully.`);
    } else {
      console.log(`  ❌ ${result.task}: Rejected. Reason: ${result.violations ? Object.keys(result.violations).join(', ') + ' budget exceeded' : 'Unknown'}.`);
    }
  });

  console.log('\n--- Final Resource Utilization ---');
  const utilization = scheduler.getStats().utilization;
  for (const resource in utilization) {
    console.log(`  - ${resource.padEnd(10)}: ${utilization[resource].percent} used (${utilization[resource].used.toFixed(2)} / ${utilization[resource].total})`);
  }

  console.log('\nConclusion: The scheduler prioritized the carbon-sensitive job due to low grid intensity and rejected jobs that would exceed the budget, maximizing value within constraints.');
}

cloudCostManagement();
