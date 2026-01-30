import request from 'supertest';
import { buildApp } from './helpers';

describe('Stores + Products', () => {
  it('create store -> add product -> list products', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Seller', email: `seller_${ts}@test.com`, password: 'password123', phone: '03000000001' })
      .expect(201);

    const token = reg.body.token as string;

    const store = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Store ${ts}`, description: 'Test store', location: 'City' })
      .expect(201);

    const storeId = store.body._id as string;
    expect(storeId).toBeTruthy();

    const product = await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Soap ${ts}`,
        description: 'Natural handmade soap',
        price: 499,
        originalPrice: 699,
        category: 'Beauty',
        images: ['https://example.com/img.jpg'],
      })
      .expect(201);

    expect(product.body).toHaveProperty('_id');

    const list = await request(app).get('/api/products');
    if (list.status !== 200) {
      throw new Error(`Expected 200 but got ${list.status}: ${JSON.stringify(list.body)}`);
    }
    const products = Array.isArray(list.body) ? list.body : list.body?.products;

    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });
});
