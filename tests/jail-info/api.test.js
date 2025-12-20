import request from 'supertest';
import app from '../../jail-info/index.js';
import { describe, test, expect, beforeAll } from '@jest/globals';

describe('Jail-Info API', () => {
  // Allow time for the async import of the scheduler to complete
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('GET /api/v1/jobs should return a 200 status code and a valid schedule', async () => {
    const response = await request(app).get('/api/v1/jobs');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Job schedule optimized');
    expect(response.body).toHaveProperty('schedule');
    expect(response.body).toHaveProperty('rejections');
    expect(response.body).toHaveProperty('utilization');
    expect(Array.isArray(response.body.schedule)).toBe(true);
    expect(Array.isArray(response.body.rejections)).toBe(true);
    // Check that the high-resource task was rejected as expected
    const rejectedNames = response.body.rejections.map(r => r.task);
    expect(rejectedNames).toContain('user-analytics-pipeline');
  });
});
