import request from 'supertest';
import { buildApp } from './helpers';

describe('Auth', () => {
  it('register + login works', async () => {
    const app = buildApp();
    const ts = Date.now();

    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: `u_${ts}@test.com`, password: 'password123', phone: '03000000000' })
      .expect(201);

    expect(register.body).toHaveProperty('token');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: `u_${ts}@test.com`, password: 'password123' })
      .expect(200);

    expect(login.body).toHaveProperty('token');
  });
});
