import mongoose from 'mongoose';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';
import { ApiError } from '../../common/http/ApiError';
import * as orderService from '../orders/orders.service';
import * as paymentsService from '../payments/payments.service';

function computeEffectivePaymentOptions(product: any) {
  const storePo =
    product?.store && typeof product.store === 'object' && product.store.paymentOptions && typeof product.store.paymentOptions === 'object'
      ? product.store.paymentOptions
      : {};

  const storeDefaults = {
    codEnabled: typeof storePo.codEnabled === 'boolean' ? storePo.codEnabled : false,
    stripeEnabled: typeof storePo.stripeEnabled === 'boolean' ? storePo.stripeEnabled : true,
  };

  const override =
    product?.paymentOptionsOverride && typeof product.paymentOptionsOverride === 'object' ? product.paymentOptionsOverride : {};

  return {
    codEnabled: typeof override.codEnabled === 'boolean' ? override.codEnabled : storeDefaults.codEnabled,
    stripeEnabled: typeof override.stripeEnabled === 'boolean' ? override.stripeEnabled : storeDefaults.stripeEnabled,
  };
}

async function populateCart(cart: any) {
  await cart.populate({
    path: 'items.product',
    select: 'name images price store paymentOptionsOverride',
    populate: {
      path: 'store',
      select: 'name logo paymentOptions',
    },
  });
  return cart;
}

function computeTotals(cart: any) {
  const subtotal = (cart.items || []).reduce((sum: number, item: any) => {
    const price =
      item?.product && typeof item.product === 'object' && typeof item.product.price === 'number'
        ? item.product.price
        : typeof item.unitPriceSnapshot === 'number'
          ? item.unitPriceSnapshot
          : 0;

    return sum + price * (item.quantity || 0);
  }, 0);

  return {
    subtotal,
    total: subtotal,
  };
}

function toCartResponse(cart: any) {
  const items = (cart.items || []).map((item: any) => {
    const prod = item?.product;
    if (prod && typeof prod === 'object') {
      (item as any).product = {
        ...(prod?.toObject ? prod.toObject() : prod),
        effectivePaymentOptions: computeEffectivePaymentOptions(prod),
      };
    }
    return item;
  });

  return {
    _id: cart._id,
    items,
    totals: computeTotals(cart),
  };
}

async function getOrCreateCart(ownerId: string) {
  let cart: any = await Cart.findOne({ owner: ownerId });
  if (!cart) {
    cart = new Cart({ owner: ownerId, items: [] });
    await cart.save();
  }
  return cart;
}

function assertValidObjectId(id: string, label: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

export async function getCart(ownerId: string) {
  const cart = await getOrCreateCart(ownerId);
  await populateCart(cart);
  return toCartResponse(cart);
}

export async function addItem(ownerId: string, input: { productId: string; quantity?: number }) {
  assertValidObjectId(input.productId, 'productId');
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, 'Invalid quantity');

  const product: any = await Product.findById(input.productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart: any = await getOrCreateCart(ownerId);

  const idx = (cart.items || []).findIndex((i: any) => {
    const pid = i?.product;
    if (!pid) return false;
    if (typeof pid === 'string') return pid === input.productId;
    if (typeof pid === 'object' && pid._id) return pid._id.toString() === input.productId;
    return pid.toString() === input.productId;
  });
  if (idx >= 0) {
    cart.items[idx].quantity = (cart.items[idx].quantity || 0) + quantity;
  } else {
    cart.items.push({
      product: input.productId,
      quantity,
      addedAt: new Date(),
      unitPriceSnapshot: typeof product.price === 'number' ? product.price : null,
    });
  }

  await cart.save();
  await populateCart(cart);
  return toCartResponse(cart);
}

export async function checkout(
  ownerId: string,
  input: { deliveryAddress: any; paymentMethod?: any }
) {
  const cart: any = await Cart.findOne({ owner: ownerId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const paymentType =
    input && input.paymentMethod && typeof input.paymentMethod === 'object'
      ? String((input.paymentMethod as any).type || '')
      : '';

  const paymentTypeNorm = paymentType.trim().toUpperCase();
  const isCOD = paymentTypeNorm === 'COD';
  const isStripe = !isCOD;

  const paymentIntentId = isStripe
    ? input && input.paymentMethod && typeof input.paymentMethod === 'object'
      ? String((input.paymentMethod as any).paymentIntentId || '')
      : ''
    : '';

  if (isStripe && !paymentIntentId) {
    throw new ApiError(400, 'Missing paymentIntentId');
  }

  const orderItems: Array<{ product: string; quantity: number; price: number }> = [];
  let totalAmount = 0;

  let codAllowedForAll = true;
  let stripeAllowedForAll = true;

  for (const item of cart.items) {
    const rawProduct = (item as any)?.product;
    const productId =
      typeof rawProduct === 'string'
        ? rawProduct
        : rawProduct && typeof rawProduct === 'object' && rawProduct._id
          ? rawProduct._id.toString()
          : rawProduct?.toString?.();

    if (!productId) throw new ApiError(400, 'Invalid productId');
    assertValidObjectId(productId, 'productId');

    const quantity = Number((item as any)?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, 'Invalid quantity');

    const product: any = await Product.findById(productId).populate('store', 'paymentOptions');
    if (!product) throw new ApiError(404, 'Product not found');

    const effective = computeEffectivePaymentOptions(product);

    codAllowedForAll = codAllowedForAll && !!effective.codEnabled;
    stripeAllowedForAll = stripeAllowedForAll && !!effective.stripeEnabled;

    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(400, 'Invalid product price');

    orderItems.push({ product: productId, quantity, price });
    totalAmount += price * quantity;
  }

  const shippingMajorRaw = process.env.SHIPPING_COST ? Number(process.env.SHIPPING_COST) : 5.99;
  const shippingMajor = Number.isFinite(shippingMajorRaw) && shippingMajorRaw >= 0 ? shippingMajorRaw : 0;
  totalAmount += shippingMajor;

  const expectedAmountMinor = Math.round(totalAmount * 100);

  if (isCOD) {
    if (!codAllowedForAll) {
      throw new ApiError(400, 'Cash on Delivery is not available for one or more items in your cart');
    }
  } else {
    if (!stripeAllowedForAll) {
      throw new ApiError(400, 'Card payment is not available for one or more items in your cart');
    }
    await paymentsService.verifyPaymentIntentForCheckout({
      ownerId,
      paymentIntentId,
      expectedAmount: expectedAmountMinor,
    });
  }

  const order = await orderService.createOrder(ownerId, {
    items: orderItems,
    totalAmount,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    paymentIntentId: isStripe ? paymentIntentId : '',
    paymentStatus: isStripe ? 'completed' : 'pending',
  });

  cart.items = [];
  await cart.save();

  return order;
}

export async function updateItem(ownerId: string, productId: string, quantity: number) {
  assertValidObjectId(productId, 'productId');
  if (!Number.isInteger(quantity) || quantity <= 0) throw new ApiError(400, 'Invalid quantity');

  const product: any = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart: any = await getOrCreateCart(ownerId);
  const idx = (cart.items || []).findIndex((i: any) => {
    const pid = i?.product;
    if (!pid) return false;
    if (typeof pid === 'string') return pid === productId;
    if (typeof pid === 'object' && pid._id) return pid._id.toString() === productId;
    return pid.toString() === productId;
  });
  if (idx < 0) throw new ApiError(404, 'Cart item not found');

  cart.items[idx].quantity = quantity;
  await cart.save();
  await populateCart(cart);
  return toCartResponse(cart);
}

export async function removeItem(ownerId: string, productId: string) {
  assertValidObjectId(productId, 'productId');

  const product: any = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');

  const cart: any = await getOrCreateCart(ownerId);
  const before = (cart.items || []).length;
  cart.items = (cart.items || []).filter((i: any) => {
    const pid = i?.product;
    if (!pid) return true;
    if (typeof pid === 'string') return pid !== productId;
    if (typeof pid === 'object' && pid._id) return pid._id.toString() !== productId;
    return pid.toString() !== productId;
  });

  if (before === cart.items.length) throw new ApiError(404, 'Cart item not found');

  await cart.save();
  await populateCart(cart);
  return toCartResponse(cart);
}
