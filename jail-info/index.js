import express from 'express';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 3000;

// Add middleware to parse JSON bodies
app.use(express.json());

// --- Zod Validation Schema ---
const taskSchema = z.object({
  name: z.string(),
  value: z.number().positive(),
  operations: z.number().positive(),
  dataSize: z.number().positive(),
});

const scheduleRequestSchema = z.object({
  tasks: z.array(taskSchema),
  budgets: z.object({
    cpu: z.number().positive(),
    memory: z.number().positive(),
    energy: z.number().positive(),
  }),
});

// --- Validation Middleware ---
const validateScheduleRequest = (req, res, next) => {
  const result = scheduleRequestSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: result.error.errors,
    });
  }
  // Attach the validated data to the request object
  req.validatedData = result.data;
  next();
};


// Dynamically import the ES Module
let ResourceAwareScheduler;
import('../shared/algorithms/resource-aware/ResourceAwareScheduler.js').then((module) => {
  ResourceAwareScheduler = module.default;
}).catch(err => {
  console.error("Failed to load ResourceAwareScheduler:", err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.send('Welcome to jail-info!');
});

app.post('/api/v1/schedule', validateScheduleRequest, (req, res) => {
  if (!ResourceAwareScheduler) {
    return res.status(503).send({ error: 'Scheduler not available' });
  }

  // Use the validated data from the middleware
  const { tasks, budgets } = req.validatedData;

  // The scheduler expects an `execute` function on each task.
  // The client won't send this, so we add a dummy one.
  const executableTasks = tasks.map(task => ({
    ...task,
    execute: () => 'done'
  }));

  try {
    const scheduler = new ResourceAwareScheduler(budgets, null, 'greedy');
    scheduler.optimizeSchedule(executableTasks).then(({ schedule, rejections }) => {
      res.status(200).json({
          message: 'Job schedule optimized',
          schedule,
          rejections,
          utilization: scheduler.getUtilization()
      });
    }).catch(error => {
      console.error('Error during scheduling:', error);
      res.status(500).json({ error: 'An unexpected error occurred during scheduling.' });
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
