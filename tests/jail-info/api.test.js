import request from 'supertest';
import app from '../../jail-info/index.js';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Jail-Info API', () => {
  // Allow time for the async import of the scheduler to complete
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('POST /api/v1/schedule with a valid body should return a 200 status code', async () => {
    const requestBody = {
      tasks: [
        { name: 'video-transcode-4k', value: 100, operations: 5e9, dataSize: 5e8 },
        { name: 'audio-cleanup', value: 50, operations: 1e9, dataSize: 1e8 },
      ],
      budgets: {
        cpu: 10,
        memory: 1e9,
        energy: 1000,
      },
    };

    const response = await request(app)
      .post('/api/v1/schedule')
      .send(requestBody);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Job schedule optimized');
    expect(response.body).toHaveProperty('schedule');
    expect(response.body).toHaveProperty('rejections');
    expect(response.body).toHaveProperty('utilization');
    expect(Array.isArray(response.body.schedule)).toBe(true);
    expect(Array.isArray(response.body.rejections)).toBe(true);
  });

  test('POST /api/v1/schedule with an invalid body should return a 400 status code', async () => {
    const requestBody = {
      // Missing 'tasks' and 'budgets'
    };

    const response = await request(app)
      .post('/api/v1/schedule')
      .send(requestBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid request body');
  });
});
