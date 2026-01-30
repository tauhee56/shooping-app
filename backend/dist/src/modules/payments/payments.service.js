"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = createPaymentIntent;
exports.verifyPaymentIntentSucceeded = verifyPaymentIntentSucceeded;
exports.verifyPaymentIntentForCheckout = verifyPaymentIntentForCheckout;
exports.handleWebhookEvent = handleWebhookEvent;
exports.constructWebhookEvent = constructWebhookEvent;
const stripe_1 = __importDefault(require("stripe"));
const Cart_1 = __importDefault(require("../../../models/Cart"));
const Product_1 = __importDefault(require("../../../models/Product"));
const Order_1 = __importDefault(require("../../../models/Order"));
const ApiError_1 = require("../../common/http/ApiError");
let stripeClient = null;
function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new ApiError_1.ApiError(500, 'Stripe is not configured');
    }
    if (!stripeClient) {
        stripeClient = new stripe_1.default(key, {
            apiVersion: '2023-10-16',
        });
    }
    return stripeClient;
}
async function computeCartAmount(ownerId) {
    const cart = await Cart_1.default.findOne({ owner: ownerId });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        throw new ApiError_1.ApiError(400, 'Cart is empty');
    }
    let totalMajor = 0;
    for (const item of cart.items) {
        const rawProduct = item?.product;
        const productId = typeof rawProduct === 'string'
            ? rawProduct
            : rawProduct && typeof rawProduct === 'object' && rawProduct._id
                ? rawProduct._id.toString()
                : rawProduct?.toString?.();
        if (!productId)
            throw new ApiError_1.ApiError(400, 'Invalid productId');
        const quantity = Number(item?.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0)
            throw new ApiError_1.ApiError(400, 'Invalid quantity');
        const product = await Product_1.default.findById(productId);
        if (!product)
            throw new ApiError_1.ApiError(404, 'Product not found');
        const price = Number(product.price);
        if (!Number.isFinite(price) || price < 0)
            throw new ApiError_1.ApiError(400, 'Invalid product price');
        totalMajor += price * quantity;
    }
    const shippingMajorRaw = process.env.SHIPPING_COST ? Number(process.env.SHIPPING_COST) : 5.99;
    const shippingMajor = Number.isFinite(shippingMajorRaw) && shippingMajorRaw >= 0 ? shippingMajorRaw : 0;
    const totalMinor = Math.round((totalMajor + shippingMajor) * 100);
    if (!Number.isFinite(totalMinor) || totalMinor <= 0) {
        throw new ApiError_1.ApiError(400, 'Invalid cart amount');
    }
    return totalMinor;
}
async function createPaymentIntent(ownerId) {
    const stripe = getStripe();
    const amount = await computeCartAmount(ownerId);
    const currency = (process.env.STRIPE_CURRENCY || 'gbp').toLowerCase();
    const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ['card'],
        metadata: {
            ownerId,
        },
    });
    if (!intent.client_secret) {
        throw new ApiError_1.ApiError(500, 'Failed to create payment intent');
    }
    return {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount,
        currency,
    };
}
async function verifyPaymentIntentSucceeded(paymentIntentId) {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!intent || typeof intent !== 'object') {
        throw new ApiError_1.ApiError(400, 'Invalid payment intent');
    }
    if (intent.status !== 'succeeded') {
        throw new ApiError_1.ApiError(400, `Payment not completed (${intent.status})`);
    }
    return intent;
}
async function verifyPaymentIntentForCheckout(params) {
    const intent = await verifyPaymentIntentSucceeded(params.paymentIntentId);
    const metaOwner = (intent.metadata || {}).ownerId;
    if (metaOwner && metaOwner !== params.ownerId) {
        throw new ApiError_1.ApiError(403, 'Payment intent does not belong to user');
    }
    if (typeof intent.amount === 'number' && intent.amount !== params.expectedAmount) {
        throw new ApiError_1.ApiError(400, 'Payment amount mismatch');
    }
    return intent;
}
async function handleWebhookEvent(event) {
    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        await Order_1.default.updateMany({ paymentIntentId: pi.id }, { $set: { paymentStatus: 'completed', updatedAt: new Date() } });
    }
    if (event.type === 'payment_intent.payment_failed') {
        const pi = event.data.object;
        await Order_1.default.updateMany({ paymentIntentId: pi.id }, { $set: { paymentStatus: 'failed', updatedAt: new Date() } });
    }
}
function constructWebhookEvent(params) {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        throw new ApiError_1.ApiError(500, 'Stripe webhook secret is not configured');
    }
    return stripe.webhooks.constructEvent(params.rawBody, params.signature, secret);
}
