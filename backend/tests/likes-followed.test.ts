import request from 'supertest';
import { buildApp } from './helpers';

describe('Phase 1 - Likes + Followed', () => {
  it('like toggles, liked products list, followed stores list', async () => {
    const app = buildApp();
    const ts = Date.now();

    // Seller
    const sellerReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Seller', email: `seller_${ts}@test.com`, password: 'password123', phone: '03000000001' })
      .expect(201);

    const sellerToken = sellerReg.body.token as string;

    const storeRes = await request(app)
      .post('/api/stores')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: `Test Store ${ts}`, description: 'Test store', location: 'City' })
      .expect(201);

    const storeId = storeRes.body._id as string;
    expect(storeId).toBeTruthy();

    const productRes = await request(app)
      .post(`/api/stores/${storeId}/products`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: `Soap ${ts}`,
        description: 'Natural handmade soap',
        price: 499,
        originalPrice: 699,
        category: 'Beauty',
        images: ['https://example.com/img.jpg'],
      })
      .expect(201);

    const productId = productRes.body._id as string;
    expect(productId).toBeTruthy();

    // Buyer
    const buyerReg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer', email: `buyer_${ts}@test.com`, password: 'password123', phone: '03000000002' })
      .expect(201);

    const buyerToken = buyerReg.body.token as string;

    // Follow store
    const followRes = await request(app)
      .post(`/api/stores/${storeId}/follow`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(followRes.body).toHaveProperty('isFollowing', true);

    const followedList = await request(app)
      .get('/api/stores/followed')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(Array.isArray(followedList.body)).toBe(true);
    expect(followedList.body.length).toBe(1);
    expect(String(followedList.body[0]._id || '')).toBe(storeId);

    // Like product (toggle on)
    const likeOn = await request(app)
      .post(`/api/products/${productId}/like`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(likeOn.body).toHaveProperty('isLiked', true);
    expect(likeOn.body).toHaveProperty('likes', 1);

    const likedList1 = await request(app)
      .get('/api/products/liked')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(Array.isArray(likedList1.body)).toBe(true);
    expect(likedList1.body.length).toBe(1);
    expect(String(likedList1.body[0]._id || '')).toBe(productId);

    // Like product again (toggle off)
    const likeOff = await request(app)
      .post(`/api/products/${productId}/like`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(likeOff.body).toHaveProperty('isLiked', false);
    expect(likeOff.body).toHaveProperty('likes', 0);

    const likedList2 = await request(app)
      .get('/api/products/liked')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(Array.isArray(likedList2.body)).toBe(true);
    expect(likedList2.body.length).toBe(0);
  });
});
