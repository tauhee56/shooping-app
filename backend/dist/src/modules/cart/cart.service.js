"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addItem = addItem;
exports.checkout = checkout;
exports.updateItem = updateItem;
exports.removeItem = removeItem;
const mongoose_1 = __importDefault(require("mongoose"));
const Cart_1 = __importDefault(require("../../../models/Cart"));
const Product_1 = __importDefault(require("../../../models/Product"));
const ApiError_1 = require("../../common/http/ApiError");
const orderService = __importStar(require("../orders/orders.service"));
const paymentsService = __importStar(require("../payments/payments.service"));
function computeEffectivePaymentOptions(product) {
    const storePo = product?.store && typeof product.store === 'object' && product.store.paymentOptions && typeof product.store.paymentOptions === 'object'
        ? product.store.paymentOptions
        : {};
    const storeDefaults = {
        codEnabled: typeof storePo.codEnabled === 'boolean' ? storePo.codEnabled : false,
        stripeEnabled: typeof storePo.stripeEnabled === 'boolean' ? storePo.stripeEnabled : true,
    };
    const override = product?.paymentOptionsOverride && typeof product.paymentOptionsOverride === 'object' ? product.paymentOptionsOverride : {};
    return {
        codEnabled: typeof override.codEnabled === 'boolean' ? override.codEnabled : storeDefaults.codEnabled,
        stripeEnabled: typeof override.stripeEnabled === 'boolean' ? override.stripeEnabled : storeDefaults.stripeEnabled,
    };
}
async function populateCart(cart) {
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
function computeTotals(cart) {
    const subtotal = (cart.items || []).reduce((sum, item) => {
        const price = item?.product && typeof item.product === 'object' && typeof item.product.price === 'number'
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
function toCartResponse(cart) {
    const items = (cart.items || []).map((item) => {
        const prod = item?.product;
        if (prod && typeof prod === 'object') {
            item.product = {
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
async function getOrCreateCart(ownerId) {
    let cart = await Cart_1.default.findOne({ owner: ownerId });
    if (!cart) {
        cart = new Cart_1.default({ owner: ownerId, items: [] });
        await cart.save();
    }
    return cart;
}
function assertValidObjectId(id, label) {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.ApiError(400, `Invalid ${label}`);
    }
}
async function getCart(ownerId) {
    const cart = await getOrCreateCart(ownerId);
    await populateCart(cart);
    return toCartResponse(cart);
}
async function addItem(ownerId, input) {
    assertValidObjectId(input.productId, 'productId');
    const quantity = input.quantity ?? 1;
    if (!Number.isInteger(quantity) || quantity <= 0)
        throw new ApiError_1.ApiError(400, 'Invalid quantity');
    const product = await Product_1.default.findById(input.productId);
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    const cart = await getOrCreateCart(ownerId);
    const idx = (cart.items || []).findIndex((i) => {
        const pid = i?.product;
        if (!pid)
            return false;
        if (typeof pid === 'string')
            return pid === input.productId;
        if (typeof pid === 'object' && pid._id)
            return pid._id.toString() === input.productId;
        return pid.toString() === input.productId;
    });
    if (idx >= 0) {
        cart.items[idx].quantity = (cart.items[idx].quantity || 0) + quantity;
    }
    else {
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
async function checkout(ownerId, input) {
    const cart = await Cart_1.default.findOne({ owner: ownerId });
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        throw new ApiError_1.ApiError(400, 'Cart is empty');
    }
    const paymentType = input && input.paymentMethod && typeof input.paymentMethod === 'object'
        ? String(input.paymentMethod.type || '')
        : '';
    const paymentTypeNorm = paymentType.trim().toUpperCase();
    const isCOD = paymentTypeNorm === 'COD';
    const isStripe = !isCOD;
    const paymentIntentId = isStripe
        ? input && input.paymentMethod && typeof input.paymentMethod === 'object'
            ? String(input.paymentMethod.paymentIntentId || '')
            : ''
        : '';
    if (isStripe && !paymentIntentId) {
        throw new ApiError_1.ApiError(400, 'Missing paymentIntentId');
    }
    const orderItems = [];
    let totalAmount = 0;
    let codAllowedForAll = true;
    let stripeAllowedForAll = true;
    for (const item of cart.items) {
        const rawProduct = item?.product;
        const productId = typeof rawProduct === 'string'
            ? rawProduct
            : rawProduct && typeof rawProduct === 'object' && rawProduct._id
                ? rawProduct._id.toString()
                : rawProduct?.toString?.();
        if (!productId)
            throw new ApiError_1.ApiError(400, 'Invalid productId');
        assertValidObjectId(productId, 'productId');
        const quantity = Number(item?.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0)
            throw new ApiError_1.ApiError(400, 'Invalid quantity');
        const product = await Product_1.default.findById(productId).populate('store', 'paymentOptions');
        if (!product)
            throw new ApiError_1.ApiError(404, 'Product not found');
        const effective = computeEffectivePaymentOptions(product);
        codAllowedForAll = codAllowedForAll && !!effective.codEnabled;
        stripeAllowedForAll = stripeAllowedForAll && !!effective.stripeEnabled;
        const price = Number(product.price);
        if (!Number.isFinite(price) || price < 0)
            throw new ApiError_1.ApiError(400, 'Invalid product price');
        orderItems.push({ product: productId, quantity, price });
        totalAmount += price * quantity;
    }
    const shippingMajorRaw = process.env.SHIPPING_COST ? Number(process.env.SHIPPING_COST) : 5.99;
    const shippingMajor = Number.isFinite(shippingMajorRaw) && shippingMajorRaw >= 0 ? shippingMajorRaw : 0;
    totalAmount += shippingMajor;
    const expectedAmountMinor = Math.round(totalAmount * 100);
    if (isCOD) {
        if (!codAllowedForAll) {
            throw new ApiError_1.ApiError(400, 'Cash on Delivery is not available for one or more items in your cart');
        }
    }
    else {
        if (!stripeAllowedForAll) {
            throw new ApiError_1.ApiError(400, 'Card payment is not available for one or more items in your cart');
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
async function updateItem(ownerId, productId, quantity) {
    assertValidObjectId(productId, 'productId');
    if (!Number.isInteger(quantity) || quantity <= 0)
        throw new ApiError_1.ApiError(400, 'Invalid quantity');
    const product = await Product_1.default.findById(productId);
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    const cart = await getOrCreateCart(ownerId);
    const idx = (cart.items || []).findIndex((i) => {
        const pid = i?.product;
        if (!pid)
            return false;
        if (typeof pid === 'string')
            return pid === productId;
        if (typeof pid === 'object' && pid._id)
            return pid._id.toString() === productId;
        return pid.toString() === productId;
    });
    if (idx < 0)
        throw new ApiError_1.ApiError(404, 'Cart item not found');
    cart.items[idx].quantity = quantity;
    await cart.save();
    await populateCart(cart);
    return toCartResponse(cart);
}
async function removeItem(ownerId, productId) {
    assertValidObjectId(productId, 'productId');
    const product = await Product_1.default.findById(productId);
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    const cart = await getOrCreateCart(ownerId);
    const before = (cart.items || []).length;
    cart.items = (cart.items || []).filter((i) => {
        const pid = i?.product;
        if (!pid)
            return true;
        if (typeof pid === 'string')
            return pid !== productId;
        if (typeof pid === 'object' && pid._id)
            return pid._id.toString() !== productId;
        return pid.toString() !== productId;
    });
    if (before === cart.items.length)
        throw new ApiError_1.ApiError(404, 'Cart item not found');
    await cart.save();
    await populateCart(cart);
    return toCartResponse(cart);
}
