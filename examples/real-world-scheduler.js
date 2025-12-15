
/**
 * Real-World Example: AWS Lambda Function Scheduler
 *
 * Problem: Schedule 100 Lambda invocations within:
 * - 15-minute timeout
 * - $10 budget
 * - 50 gCO2 carbon budget
 */

import ResourceAwareScheduler from '../src/resource-aware/ResourceAwareScheduler.js';

// Actual AWS Lambda pricing (2024)
const LAMBDA_COST_PER_GB_SECOND = 0.0000166667;

// --- 1. Define the pool of potential Lambda functions ---
const functions = Array.from({ length: 100 }, (_, i) => {
    const type = i % 3;
    if (type === 0) {
        return { name: `image-resize-${i}`, memory: 512, duration: 2.5, value: 100 };
    } else if (type === 1) {
        return { name: `video-transcode-${i}`, memory: 3008, duration: 45, value: 500 };
    } else {
        return { name: `data-etl-${i}`, memory: 1024, duration: 10, value: 200 };
    }
});


// --- 2. Convert functions to the format the scheduler expects ---
const tasks = functions.map(fn => ({
    name: fn.name,
    // The 'operations' field can be an abstract representation of work.
    // Here, we use GB-seconds, a common cloud billing metric.
    operations: (fn.memory / 1024) * fn.duration * 1e9,
    value: fn.value,
    execute: () => { /* In a real scenario, this would trigger the Lambda */ }
}));


// --- 3. Configure the scheduler with resource budgets ---
// The scheduler's budgets are abstract units. We map our real-world
// constraints (dollars, time) to these units.
const scheduler = new ResourceAwareScheduler({
    // CPU budget: 15 minutes = 900 seconds (total execution time)
    cpu: 900,
    // Energy budget: We convert the $10 budget into an "energy" equivalent
    // based on Lambda's GB-second pricing.
    energy: 10 / LAMBDA_COST_PER_GB_SECOND,
    // Carbon budget: 50 gCO2
    carbon: 50
});

console.log('--- Scheduling 100 potential Lambda functions ---');
console.log('Budgets:');
console.log('  - Max Time: 900 seconds');
console.log('  - Max Cost: $10.00');
console.log('  - Max Carbon: 50 gCO2');


// --- 4. Run the optimization ---
const { schedule, rejections } = scheduler.optimizeSchedule(tasks);


// --- 5. Analyze and display the results ---
const totalValue = schedule.reduce((sum, scheduledTask) => {
    const originalTask = tasks.find(t => t.name === scheduledTask.task);
    return sum + (originalTask?.value || 0);
}, 0);

const totalCost = schedule.reduce((sum, s) => sum + (s.resourcesUsed?.energy || 0), 0) * LAMBDA_COST_PER_GB_SECOND;

console.log('\n--- Optimization Complete ---');
console.log(`Scheduled Tasks: ${schedule.length}`);
console.log(`Rejected Tasks:  ${rejections.length}`);
console.log(`Total Value:     ${totalValue}`);
console.log(`Estimated Cost:  $${totalCost.toFixed(2)}`);

console.log('\nTop 5 Scheduled Tasks:');
schedule.slice(0, 5).forEach(t => console.log(`  - ${t.task}`));

console.log('\nTop 5 Rejected Tasks:');
rejections.slice(0, 5).forEach(t => console.log(`  - ${t.task} (Reason: ${t.reason})`));
