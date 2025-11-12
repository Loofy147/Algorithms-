import request from 'supertest';
import { app, server as runningServer } from '../../src/services/resourceAwareSchedulerService.js';

describe('ResourceAwareScheduler Service API', () => {
  let server;

  beforeAll((done) => {
    if (runningServer) {
      runningServer.close(() => {
        server = app.listen(0, done);
      });
    } else {
      server = app.listen(0, done);
    }
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return an optimized schedule for a valid request', async () => {
    const budgets = {
      cpu: 10,
      energy: 100,
      memory: 1e9,
      bandwidth: 1e8,
    };

    const tasks = [
      { name: 'ML_Training', operations: 1e10, dataSize: 1e8, network: true, value: 100 },
      { name: 'Video_Encode', operations: 5e9, dataSize: 5e8, network: false, value: 50 },
    ];

    const res = await request(server)
      .post('/schedule')
      .send({ budgets, tasks });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('schedule');
    expect(res.body).toHaveProperty('rejections');
    expect(res.body.schedule).toBeInstanceOf(Array);
    expect(res.body.rejections).toBeInstanceOf(Array);
  });

  it('should return a 400 error for a request with missing budgets', async () => {
    const tasks = [{ name: 'Test_Task', operations: 1e8, dataSize: 1e6, value: 10 }];
    const res = await request(server)
      .post('/schedule')
      .send({ tasks });
    expect(res.statusCode).toEqual(400);
  });

  it('should return a 400 error for a request with missing tasks', async () => {
    const budgets = { cpu: 1, energy: 1, memory: 1, bandwidth: 1 };
    const res = await request(server)
      .post('/schedule')
      .send({ budgets });
    expect(res.statusCode).toEqual(400);
  });
});
