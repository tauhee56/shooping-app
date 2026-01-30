"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.toggleLikeProduct = toggleLikeProduct;
exports.getLikedProducts = getLikedProducts;
exports.getFeaturedProducts = getFeaturedProducts;
exports.getProductsByStore = getProductsByStore;
const Product_1 = __importDefault(require("../../../models/Product"));
function getStoreDefaults(store) {
    const po = store?.paymentOptions && typeof store.paymentOptions === 'object' ? store.paymentOptions : {};
    return {
        codEnabled: typeof po.codEnabled === 'boolean' ? po.codEnabled : false,
        stripeEnabled: typeof po.stripeEnabled === 'boolean' ? po.stripeEnabled : true,
    };
}
function computeEffectivePaymentOptions(product) {
    const storeDefaults = getStoreDefaults(product?.store);
    const override = product?.paymentOptionsOverride && typeof product.paymentOptionsOverride === 'object'
        ? product.paymentOptionsOverride
        : {};
    return {
        codEnabled: typeof override.codEnabled === 'boolean' ? override.codEnabled : storeDefaults.codEnabled,
        stripeEnabled: typeof override.stripeEnabled === 'boolean' ? override.stripeEnabled : storeDefaults.stripeEnabled,
    };
}
function withEffectivePaymentOptions(product) {
    if (!product)
        return product;
    const obj = product?.toObject ? product.toObject() : product;
    obj.effectivePaymentOptions = computeEffectivePaymentOptions(obj);
    return obj;
}
async function getAllProducts(input) {
    const { category, search } = input;
    const limit = input.limit ?? 10;
    const page = input.page ?? 1;
    const query = {};
    if (category)
        query.category = category;
    if (search)
        query.name = { $regex: search, $options: 'i' };
    const products = await Product_1.default.find(query)
        .populate('store', 'name logo paymentOptions')
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
    const total = await Product_1.default.countDocuments(query);
    return {
        products: products.map(withEffectivePaymentOptions),
        total,
        pages: Math.ceil(total / limit),
    };
}
async function getProductById(id) {
    const product = await Product_1.default.findById(id)
        .populate('store', 'name logo followers paymentOptions')
        .populate('reviews.user', 'name profileImage');
    return withEffectivePaymentOptions(product);
}
async function toggleLikeProduct(id, userId) {
    const product = await Product_1.default.findById(id);
    if (!product)
        return null;
    const likeIds = (product.likes || []).map((l) => l.toString());
    const alreadyLiked = likeIds.includes(userId);
    if (alreadyLiked) {
        product.likes = (product.likes || []).filter((l) => l.toString() !== userId);
    }
    else {
        product.likes.push(userId);
    }
    await product.save();
    return {
        message: alreadyLiked ? 'Product unliked' : 'Product liked',
        isLiked: !alreadyLiked,
        likes: (product.likes || []).length,
    };
}
async function getLikedProducts(userId) {
    const products = await Product_1.default.find({ likes: userId })
        .populate('store', 'name logo paymentOptions')
        .sort({ createdAt: -1 });
    return products.map(withEffectivePaymentOptions);
}
async function getFeaturedProducts() {
    const products = await Product_1.default.find()
        .populate('store', 'name logo paymentOptions')
        .sort({ likes: -1 })
        .limit(5);
    return products.map(withEffectivePaymentOptions);
}
async function getProductsByStore(storeId) {
    const products = await Product_1.default.find({ store: storeId })
        .populate('store', 'name logo paymentOptions')
        .sort({ createdAt: -1 });
    return products.map(withEffectivePaymentOptions);
}
