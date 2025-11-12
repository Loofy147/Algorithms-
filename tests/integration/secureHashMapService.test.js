import request from 'supertest';
import { app, server as runningServer } from '../../src/services/secureHashMapService.js';

describe('SecureHashMap Service API', () => {
  let server;

  beforeAll((done) => {
    // If the server is already running, close it before starting the test server
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

  it('should set a value', async () => {
    const res = await request(server)
      .post('/set')
      .send({ key: 'testKey', value: 'testValue' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should get a value', async () => {
    await request(server)
      .post('/set')
      .send({ key: 'testKey', value: 'testValue' });

    const res = await request(server).get('/get/testKey');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('value', 'testValue');
  });

  it('should return 404 for a non-existent key', async () => {
    const res = await request(server).get('/get/nonExistentKey');
    expect(res.statusCode).toEqual(404);
  });

  it('should delete a value', async () => {
    await request(server)
      .post('/set')
      .send({ key: 'testKeyToDelete', value: 'testValue' });

    const res = await request(server).delete('/delete/testKeyToDelete');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);

    const getRes = await request(server).get('/get/testKeyToDelete');
    expect(getRes.statusCode).toEqual(404);
  });
});
