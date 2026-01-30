import Stripe from 'stripe';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import { ApiError } from '../../common/http/ApiError';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiError(500, 'Stripe is not configured');
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: '2023-10-16',
    } as any);
  }

  return stripeClient;
}

async function computeCartAmount(ownerId: string) {
  const cart: any = await Cart.findOne({ owner: ownerId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  let totalMajor = 0;

  for (const item of cart.items) {
    const rawProduct = (item as any)?.product;
    const productId =
      typeof rawProduct === 'string'
        ? rawProduct
        : rawProduct && typeof rawProduct === 'object' && rawProduct._id
          ? rawProduct._id.toString()
          : rawProduct?.toString?.();

    if (!productId) throw new ApiError(400, 'Invalid productId');

    const quantity = Number((item as any)?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, 'Invalid quantity');

    const product: any = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');

    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'Invalid product price');

    totalMajor += price * quantity;
  }

  const shippingMajorRaw = process.env.SHIPPING_COST ? Number(process.env.SHIPPING_COST) : 5.99;
  const shippingMajor = Number.isFinite(shippingMajorRaw) && shippingMajorRaw >= 0 ? shippingMajorRaw : 0;

  const totalMinor = Math.round((totalMajor + shippingMajor) * 100);
  if (!Number.isFinite(totalMinor) || totalMinor <= 0) {
    throw new ApiError(400, 'Invalid cart amount');
  }

  return totalMinor;
}

export async function createPaymentIntent(ownerId: string) {
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
    throw new ApiError(500, 'Failed to create payment intent');
  }

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
    currency,
  };
}

export async function verifyPaymentIntentSucceeded(paymentIntentId: string) {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!intent || typeof intent !== 'object') {
    throw new ApiError(400, 'Invalid payment intent');
  }

  if (intent.status !== 'succeeded') {
    throw new ApiError(400, `Payment not completed (${intent.status})`);
  }

  return intent;
}

export async function verifyPaymentIntentForCheckout(params: {
  ownerId: string;
  paymentIntentId: string;
  expectedAmount: number;
}) {
  const intent = await verifyPaymentIntentSucceeded(params.paymentIntentId);

  const metaOwner = (intent.metadata || {}).ownerId;
  if (metaOwner && metaOwner !== params.ownerId) {
    throw new ApiError(403, 'Payment intent does not belong to user');
  }

  if (typeof intent.amount === 'number' && intent.amount !== params.expectedAmount) {
    throw new ApiError(400, 'Payment amount mismatch');
  }

  return intent;
}

export async function handleWebhookEvent(event: Stripe.Event) {
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await Order.updateMany(
      { paymentIntentId: pi.id },
      { $set: { paymentStatus: 'completed', updatedAt: new Date() } }
    );
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await Order.updateMany(
      { paymentIntentId: pi.id },
      { $set: { paymentStatus: 'failed', updatedAt: new Date() } }
    );
  }
}

export function constructWebhookEvent(params: {
  rawBody: Buffer;
  signature: string;
}) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiError(500, 'Stripe webhook secret is not configured');
  }

  return stripe.webhooks.constructEvent(params.rawBody, params.signature, secret);
}
