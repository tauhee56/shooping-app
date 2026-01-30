import request from 'supertest';
import { buildApp } from './helpers';

describe('Addresses', () => {
  it('CRUD + default endpoint works and maintains single default', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `addr_${ts}@test.com`, password: 'password123', phone: '03000000010' })
      .expect(201);

    const token = reg.body.token as string;
    expect(token).toBeTruthy();

    const a1 = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'Home',
        fullName: 'John Doe',
        phone: '03000000010',
        street: 'Street 1',
        city: 'City',
        state: 'ST',
        zip: '12345',
        country: 'PK',
      })
      .expect(201);

    expect(a1.body).toHaveProperty('_id');
    expect(a1.body).toHaveProperty('isDefault', true);

    const a2 = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'Work',
        fullName: 'John Doe',
        phone: '03000000010',
        street: 'Street 2',
        city: 'City',
        state: 'ST',
        zip: '12345',
        country: 'PK',
        isDefault: true,
      })
      .expect(201);

    expect(a2.body).toHaveProperty('_id');
    expect(a2.body).toHaveProperty('isDefault', true);

    const list = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    const defaults = (list.body as any[]).filter((x: any) => x.isDefault);
    expect(defaults.length).toBe(1);
    expect(String(defaults[0]._id)).toBe(String(a2.body._id));

    const updated = await request(app)
      .put(`/api/addresses/${a1.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ street: 'Street 1 Updated' })
      .expect(200);

    expect(updated.body).toHaveProperty('street', 'Street 1 Updated');

    const setDefault = await request(app)
      .post(`/api/addresses/${a1.body._id}/default`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(setDefault.body).toHaveProperty('isDefault', true);

    const list2 = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const defaults2 = (list2.body as any[]).filter((x: any) => x.isDefault);
    expect(defaults2.length).toBe(1);
    expect(String(defaults2[0]._id)).toBe(String(a1.body._id));

    await request(app)
      .delete(`/api/addresses/${a1.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const list3 = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(list3.body)).toBe(true);
    expect(list3.body.length).toBe(1);
    expect(list3.body[0]).toHaveProperty('isDefault', true);
  });

  it('unauthorized requests are rejected', async () => {
    const app = buildApp();

    await request(app).get('/api/addresses').expect(401);

    await request(app)
      .post('/api/addresses')
      .send({
        type: 'Home',
        fullName: 'John Doe',
        phone: '03000000010',
        street: 'Street 1',
        city: 'City',
        state: 'ST',
        zip: '12345',
        country: 'PK',
      })
      .expect(401);
  });
});
