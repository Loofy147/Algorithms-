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
const LAMBDA_CARBON_PER_GB_SECOND = 0.00012; // gCO2

const functions = [
    { name: 'image-resize', memory: 512, duration: 2.5, value: 100 },
    { name: 'video-transcode', memory: 3008, duration: 45, value: 500 },
    { name: 'data-etl', memory: 1024, duration: 10, value: 200 },
    // ... 97 more
];

// Convert to scheduler tasks
const tasks = functions.map(fn => ({
    name: fn.name,
    operations: fn.memory * fn.duration * 1e6,
    value: fn.value,
    execute: () => {} // No-op for example
}));

const scheduler = new ResourceAwareScheduler({
    cpu: 900, // 15 minutes in seconds
    energy: 10 / LAMBDA_COST_PER_GB_SECOND,
    carbon: 50
});

const { schedule, rejections } = scheduler.optimizeSchedule(tasks);
console.log(`Scheduled: ${schedule.length}, Rejections: ${rejections.length}`);
