import request from 'supertest';
import { buildApp } from './helpers';

describe('Health', () => {
  it('GET /api/health returns status', async () => {
    const app = buildApp();

    const res = await request(app).get('/api/health').expect(200);
    expect(res.body).toHaveProperty('status');
  });
});
