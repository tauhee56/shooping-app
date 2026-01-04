#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const axios_1 = __importDefault(require("axios"));
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
function log(step, ok = true, extra = '') {
    console.log(`${ok ? '✅' : '❌'} ${step}${extra ? ' - ' + extra : ''}`);
}
(async () => {
    try {
        const ts = Date.now();
        const u1 = { name: 'User One', email: `user1_${ts}@test.com`, password: 'password123', phone: '03000000001' };
        const u2 = { name: 'User Two', email: `user2_${ts}@test.com`, password: 'password123', phone: '03000000002' };
        // Health
        const health = await axios_1.default.get(`${BASE_URL}/health`).then(r => r.data).catch((e) => ({ error: e.message }));
        if (health && health.status)
            log('Health check', true, `${health.status} | DB: ${health.db || 'unknown'}`);
        else
            throw new Error('Health failed');
        // Register two users
        const r1 = await axios_1.default.post(`${BASE_URL}/auth/register`, u1).then(r => r.data);
        const r2 = await axios_1.default.post(`${BASE_URL}/auth/register`, u2).then(r => r.data);
        log('Register users');
        const t1 = r1.token;
        const t2 = r2.token;
        const api1 = axios_1.default.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${t1}` } });
        const api2 = axios_1.default.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${t2}` } });
        // Login to verify
        const l1 = await axios_1.default.post(`${BASE_URL}/auth/login`, { email: u1.email, password: u1.password }).then(r => r.data);
        const l2 = await axios_1.default.post(`${BASE_URL}/auth/login`, { email: u2.email, password: u2.password }).then(r => r.data);
        log('Login users');
        // User1 creates store
        const store = await api1.post('/stores', { name: `Test Store ${ts}`, description: 'Test store', location: 'City' }).then(r => r.data);
        log('Create store');
        // User1 adds product
        const product = await api1.post(`/stores/${store._id}/products`, {
            name: `Soap ${ts}`,
            description: 'Natural handmade soap',
            price: 499,
            originalPrice: 699,
            category: 'Beauty',
            images: ['https://images.unsplash.com/photo-1585386959984-a4155223168f'],
            ingredients: ['Aloe', 'Olive oil'],
            benefits: ['Moisturizing'],
            weight: '100g',
        }).then(r => r.data);
        log('Add product');
        // List products and get detail
        const list = await axios_1.default.get(`${BASE_URL}/products`).then(r => r.data);
        if (!Array.isArray(list) || !list.length)
            throw new Error('Products list empty');
        const detail = await axios_1.default.get(`${BASE_URL}/products/${product._id}`).then(r => r.data);
        if (!detail || !detail._id)
            throw new Error('Product detail failed');
        log('Products list + detail');
        // User2 likes product
        await api2.post(`/products/${product._id}/like`);
        log('Like product');
        // Messaging: user2 -> user1
        await api2.post(`/messages`, { receiverId: r1.user.id, content: 'Hi! Is this available?' });
        const conv = await api1.get('/messages/conversations').then(r => r.data);
        if (!Array.isArray(conv))
            throw new Error('Conversations not array');
        log('Messaging send + conversations');
        // Orders: user2 creates order for product
        const order = await api2.post('/orders', {
            items: [{ product: product._id, quantity: 1, price: product.price }],
            totalAmount: product.price,
            deliveryAddress: {
                fullName: 'User Two', phone: '03000000002', street: 'Main St', city: 'City', state: 'ST', country: 'PK', zip: '12345', isDefault: true,
            },
            paymentMethod: { type: 'COD' },
        }).then(r => r.data);
        if (!order || !order._id)
            throw new Error('Order create failed');
        const myOrders = await api2.get('/orders').then(r => r.data);
        if (!Array.isArray(myOrders))
            throw new Error('Get orders failed');
        log('Create order + list orders');
        console.log('\nAll API checks passed.');
        process.exit(0);
    }
    catch (err) {
        console.error('SMOKE TEST FAILED:', err.response?.data || err.message);
        process.exit(1);
    }
})();
