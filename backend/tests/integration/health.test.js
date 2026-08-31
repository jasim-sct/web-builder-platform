const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, closeTestDB } = require('../helpers/testDatabase');

describe('Health Check API', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('GET /api/health should return status 200 and healthy message', async () => {
    const res = await request(app).get('/api/health').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Backend is healthy');
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.database).toBe('connected');
    expect(res.body.data.uptime).toBeDefined();
    expect(res.body.data.timestamp).toBeDefined();
  });
});
