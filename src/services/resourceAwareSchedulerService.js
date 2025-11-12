import express from 'express';
import ResourceAwareScheduler from '../resource-aware/ResourceAwareScheduler.js';
import { logger } from '../logger.js';

const app = express();
app.use(express.json());

app.post('/schedule', (req, res) => {
  const { budgets, tasks } = req.body;

  if (!budgets || !tasks) {
    return res.status(400).json({ error: 'Budgets and tasks are required' });
  }

  try {
    const scheduler = new ResourceAwareScheduler(budgets);

    // The scheduler expects tasks to have an `execute` method.
    // For the service, we can add a no-op `execute` method to each task.
    const executableTasks = tasks.map(task => ({
      ...task,
      execute: () => 'scheduled',
    }));

    const result = scheduler.optimizeSchedule(executableTasks);
    res.status(200).json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Error creating schedule');
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.SCHEDULER_PORT || 3001;

let server;
if (import.meta.url === `file://${process.argv[1]}`) {
  server = app.listen(port, () => {
    logger.info(`ResourceAwareScheduler service listening on port ${port}`);
  });
}

export { app, server };
