import express from 'express';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Dynamically import the ES Module
let ResourceAwareScheduler;
import('../src/resource-aware/ResourceAwareScheduler.js').then((module) => {
  ResourceAwareScheduler = module.default;
}).catch(err => {
  console.error("Failed to load ResourceAwareScheduler:", err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.send('Welcome to jail-info!');
});

app.get('/api/v1/jobs', (req, res) => {
  if (!ResourceAwareScheduler) {
    return res.status(503).send({ error: 'Scheduler not available' });
  }

  const budgets = {
    cpu: 10,
    memory: 1e9,
    energy: 1000,
  };

  const mockTasks = [
    { name: 'video-transcode-4k', value: 100, operations: 5e9, dataSize: 5e8, execute: () => 'done' },
    { name: 'audio-cleanup', value: 50, operations: 1e9, dataSize: 1e8, execute: () => 'done' },
    { name: 'thumbnail-generation', value: 20, operations: 2e8, dataSize: 5e7, execute: () => 'done' },
    { name: 'user-analytics-pipeline', value: 80, operations: 8e9, dataSize: 1e9, execute: () => 'done' } // This one should be rejected
  ];

  try {
    const scheduler = new ResourceAwareScheduler(budgets, null, 'greedy');
    const { schedule, rejections } = scheduler.optimizeSchedule(mockTasks);
    res.status(200).json({
        message: 'Job schedule optimized',
        schedule,
        rejections,
        utilization: scheduler.getUtilization()
    });
  } catch (error) {
    console.error('Error during scheduling:', error);
    res.status(500).json({ error: 'An unexpected error occurred during scheduling.' });
  }
});

// Start the server only if the file is run directly
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
