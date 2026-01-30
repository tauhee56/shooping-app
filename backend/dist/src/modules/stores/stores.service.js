"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStores = listStores;
exports.getFollowedStores = getFollowedStores;
exports.createStore = createStore;
exports.listMyStores = listMyStores;
exports.uploadStoreLogo = uploadStoreLogo;
exports.uploadStoreBanner = uploadStoreBanner;
exports.uploadProductImages = uploadProductImages;
exports.getStoreById = getStoreById;
exports.getMyStore = getMyStore;
exports.updateStore = updateStore;
exports.addProductToStore = addProductToStore;
exports.followStore = followStore;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const Store_1 = __importDefault(require("../../../models/Store"));
const Product_1 = __importDefault(require("../../../models/Product"));
const User_1 = __importDefault(require("../../../models/User"));
const ApiError_1 = require("../../common/http/ApiError");
const env_1 = require("../../config/env");
const cloudinary_1 = require("cloudinary");
async function listStores() {
    const stores = await Store_1.default.find()
        .sort({ createdAt: -1 })
        .select('name description location storeType tags logo banner rating products followers createdAt')
        .lean();
    return stores;
}
async function getFollowedStores(userId) {
    const stores = await Store_1.default.find({ followers: userId })
        .sort({ createdAt: -1 })
        .select('name description location storeType tags logo banner rating products followers createdAt')
        .lean();
    return stores;
}
async function createStore(userId, input) {
    const store = new Store_1.default({
        name: input.name,
        storeType: input?.storeType,
        tags: input?.tags,
        owner: userId,
        description: input.description,
        location: input.location,
        logo: input?.logo,
        banner: input?.banner,
    });
    await store.save();
    const user = await User_1.default.findById(userId).select('isStore storeId');
    const update = { isStore: true };
    if (!user?.storeId) {
        update.storeId = store._id;
    }
    await User_1.default.findByIdAndUpdate(userId, update);
    return store;
}
async function listMyStores(userId) {
    const stores = await Store_1.default.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate('products')
        .select('name description location storeType tags logo banner rating products followers createdAt')
        .lean();
    return stores;
}
function ensureCloudinaryConfigured() {
    if (!env_1.env.CLOUDINARY_CLOUD_NAME || !env_1.env.CLOUDINARY_API_KEY || !env_1.env.CLOUDINARY_API_SECRET) {
        throw new ApiError_1.ApiError(500, 'Cloudinary not configured');
    }
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET,
    });
}
async function uploadBufferToCloudinary(input) {
    ensureCloudinaryConfigured();
    const { buffer, folder, publicId } = input;
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: 'image',
        }, (error, result) => {
            if (error || !result?.secure_url) {
                reject(error || new Error('Cloudinary upload failed'));
                return;
            }
            resolve(result.secure_url);
        });
        stream.end(buffer);
    });
}
async function uploadStoreAsset(userId, file, opts) {
    if (!userId)
        throw new ApiError_1.ApiError(401, 'Unauthorized');
    if (!file?.buffer)
        throw new ApiError_1.ApiError(400, 'Missing image file');
    if (file?.mimetype && !file.mimetype.startsWith('image/')) {
        throw new ApiError_1.ApiError(400, 'Invalid file type');
    }
    const targetStoreId = typeof opts.storeId === 'string' && opts.storeId.trim() ? opts.storeId.trim() : '';
    const store = targetStoreId ? await Store_1.default.findOne({ _id: targetStoreId, owner: userId }) : null;
    const publicId = store
        ? `${String(store._id)}-${opts.kind}`
        : `${String(userId)}-${opts.kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const url = await uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: 'store-assets',
        publicId,
    });
    if (store) {
        store[opts.kind] = url;
        await store.save();
    }
    return url;
}
async function uploadStoreLogo(userId, file, storeId) {
    return uploadStoreAsset(userId, file, { kind: 'logo', storeId });
}
async function uploadStoreBanner(userId, file, storeId) {
    return uploadStoreAsset(userId, file, { kind: 'banner', storeId });
}
async function uploadProductImages(userId, files, storeId) {
    if (!userId)
        throw new ApiError_1.ApiError(401, 'Unauthorized');
    if (!Array.isArray(files) || files.length === 0)
        throw new ApiError_1.ApiError(400, 'Missing image files');
    let store = null;
    if (typeof storeId === 'string' && storeId.trim()) {
        store = await Store_1.default.findOne({ _id: storeId.trim(), owner: userId });
    }
    else {
        store = await getMyStore(userId);
    }
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    for (const file of files) {
        if (!file?.buffer)
            throw new ApiError_1.ApiError(400, 'Missing image file');
        if (file?.mimetype && !file.mimetype.startsWith('image/')) {
            throw new ApiError_1.ApiError(400, 'Invalid file type');
        }
    }
    const urls = await Promise.all(files.map((file) => uploadBufferToCloudinary({
        buffer: file.buffer,
        folder: 'product-images',
        publicId: `${String(store._id)}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    })));
    return urls;
}
async function getStoreById(id) {
    const store = await Store_1.default.findById(id).populate('owner', 'name profileImage bio').populate('products');
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    return store;
}
async function getMyStore(userId) {
    const user = await User_1.default.findById(userId).select('storeId');
    const storeId = user?.storeId ? String(user.storeId) : '';
    if (storeId) {
        const byId = await Store_1.default.findOne({ _id: storeId, owner: userId }).populate('products');
        if (byId)
            return byId;
    }
    const store = await Store_1.default.findOne({ owner: userId }).sort({ createdAt: -1 }).populate('products');
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    return store;
}
async function updateStore(userId, storeId, updates) {
    const store = await Store_1.default.findOne({ _id: storeId, owner: userId });
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    store.name = updates.name || store.name;
    store.description = updates.description !== undefined ? updates.description : store.description;
    store.location = updates.location !== undefined ? updates.location : store.location;
    store.banner = updates.banner !== undefined ? updates.banner : store.banner;
    store.logo = updates.logo !== undefined ? updates.logo : store.logo;
    store.storeType = updates.storeType !== undefined ? updates.storeType : store.storeType;
    store.tags = updates.tags !== undefined ? updates.tags : store.tags;
    if (updates && typeof updates === 'object' && updates.paymentOptions && typeof updates.paymentOptions === 'object') {
        store.paymentOptions = store.paymentOptions || {};
        if (typeof updates.paymentOptions.codEnabled === 'boolean') {
            store.paymentOptions.codEnabled = updates.paymentOptions.codEnabled;
        }
        if (typeof updates.paymentOptions.stripeEnabled === 'boolean') {
            store.paymentOptions.stripeEnabled = updates.paymentOptions.stripeEnabled;
        }
    }
    await store.save();
    return store;
}
async function addProductToStore(userId, storeId, input) {
    const store = await Store_1.default.findOne({ _id: storeId, owner: userId });
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    const product = new Product_1.default({
        name: input.name,
        description: input.description,
        price: input.price,
        originalPrice: input.originalPrice,
        category: input.category,
        images: input.images,
        ingredients: input.ingredients,
        benefits: input.benefits,
        weight: input.weight,
        freeDelivery: input.freeDelivery,
        stock: input.stock,
        paymentOptionsOverride: input?.paymentOptionsOverride,
        store: store._id,
    });
    await product.save();
    store.products.push(product._id);
    await store.save();
    return product;
}
async function followStore(storeId, userId) {
    const store = await Store_1.default.findById(storeId);
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    const followerIds = (store.followers || []).map((f) => f.toString());
    const alreadyFollowing = followerIds.includes(userId);
    if (alreadyFollowing) {
        store.followers = (store.followers || []).filter((f) => f.toString() !== userId);
    }
    else {
        store.followers.push(userId);
    }
    await store.save();
    return {
        message: alreadyFollowing ? 'Store unfollowed' : 'Store followed',
        followers: store.followers.length,
        isFollowing: !alreadyFollowing,
    };
}
async function updateProduct(userId, storeId, productId, updates) {
    const sid = String(storeId || '').trim();
    if (!sid)
        throw new ApiError_1.ApiError(400, 'Invalid store');
    const store = await Store_1.default.findOne({ _id: sid, owner: userId });
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    const product = await Product_1.default.findOne({ _id: productId, store: store._id });
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    product.name = updates.name || product.name;
    product.description = updates.description || product.description;
    product.price = updates.price !== undefined ? updates.price : product.price;
    product.originalPrice = updates.originalPrice !== undefined ? updates.originalPrice : product.originalPrice;
    product.category = updates.category || product.category;
    product.images = updates.images || product.images;
    product.freeDelivery = updates.freeDelivery !== undefined ? updates.freeDelivery : product.freeDelivery;
    product.stock = updates.stock !== undefined ? updates.stock : product.stock;
    if (updates && typeof updates === 'object' && updates.paymentOptionsOverride && typeof updates.paymentOptionsOverride === 'object') {
        product.paymentOptionsOverride = product.paymentOptionsOverride || {};
        if (typeof updates.paymentOptionsOverride.codEnabled === 'boolean') {
            product.paymentOptionsOverride.codEnabled = updates.paymentOptionsOverride.codEnabled;
        }
        if (typeof updates.paymentOptionsOverride.stripeEnabled === 'boolean') {
            product.paymentOptionsOverride.stripeEnabled = updates.paymentOptionsOverride.stripeEnabled;
        }
    }
    await product.save();
    return product;
}
async function deleteProduct(userId, storeId, productId) {
    const sid = String(storeId || '').trim();
    if (!sid)
        throw new ApiError_1.ApiError(400, 'Invalid store');
    const store = await Store_1.default.findOne({ _id: sid, owner: userId });
    if (!store)
        throw new ApiError_1.ApiError(404, 'Store not found');
    const product = await Product_1.default.findOne({ _id: productId, store: store._id });
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    await Product_1.default.findByIdAndDelete(productId);
    store.products = store.products.filter((p) => p.toString() !== productId);
    await store.save();
    return { message: 'Product deleted' };
}
