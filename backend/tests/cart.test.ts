import request from 'supertest';
import { buildApp } from './helpers';

describe('Cart', () => {
  it('register -> create store -> add product -> cart CRUD lifecycle', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `buyer_${ts}@test.com`, password: 'password123', phone: '03000000002' })
      .expect(201);

    const token = reg.body.token as string;
    expect(token).toBeTruthy();

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

    const productId = product.body._id as string;
    expect(productId).toBeTruthy();

    // GET empty cart
    const empty = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(empty.body).toHaveProperty('items');
    expect(Array.isArray(empty.body.items)).toBe(true);

    // Add item
    const added = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })
      .expect(200);

    expect(Array.isArray(added.body.items)).toBe(true);
    expect(added.body.items.length).toBe(1);
    expect(added.body.items[0]).toHaveProperty('quantity', 2);

    // Update quantity
    const updated = await request(app)
      .put(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 3 })
      .expect(200);

    expect(updated.body.items.length).toBe(1);
    expect(updated.body.items[0]).toHaveProperty('quantity', 3);

    // Delete item
    const removed = await request(app)
      .delete(`/api/cart/items/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(removed.body.items)).toBe(true);
    expect(removed.body.items.length).toBe(0);
  });

  it('checkout creates order and clears cart', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `buyer_checkout_${ts}@test.com`, password: 'password123', phone: '03000000004' })
      .expect(201);

    const token = reg.body.token as string;

    const store = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Store ${ts}`, description: 'Test store', location: 'City' })
      .expect(201);

    const storeId = store.body._id as string;

    const product = await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: `Soap ${ts}`,
        description: 'Natural handmade soap',
        price: 100,
        category: 'Beauty',
        images: ['https://example.com/img.jpg'],
      })
      .expect(201);

    const productId = product.body._id as string;

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 2 })
      .expect(200);

    const checkout = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ deliveryAddress: 'Street 1', paymentMethod: { type: 'card' } })
      .expect(201);

    expect(checkout.body).toHaveProperty('_id');
    expect(checkout.body).toHaveProperty('items');
    expect(Array.isArray(checkout.body.items)).toBe(true);
    expect(checkout.body.items.length).toBeGreaterThan(0);

    const cartAfter = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(cartAfter.body.items)).toBe(true);
    expect(cartAfter.body.items.length).toBe(0);
  });

  it('cannot checkout with empty cart', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `buyer_empty_${ts}@test.com`, password: 'password123', phone: '03000000005' })
      .expect(201);

    const token = reg.body.token as string;

    await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ deliveryAddress: 'Street 1' })
      .expect(400);
  });

  it('invalid productId format returns 400', async () => {
    const app = buildApp();
    const ts = Date.now();

    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `buyer2_${ts}@test.com`, password: 'password123', phone: '03000000003' })
      .expect(201);

    const token = reg.body.token as string;

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'not-an-objectid', quantity: 1 })
      .expect(400);
  });
});
