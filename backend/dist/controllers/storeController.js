"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.followStore = exports.addProductToStore = exports.updateStore = exports.getMyStore = exports.getStoreById = exports.createStore = void 0;
const Store_1 = __importDefault(require("../models/Store"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const createStore = async (req, res) => {
    try {
        const { name, description, location } = req.body;
        let store = await Store_1.default.findOne({ owner: req.user.userId });
        if (store) {
            return res.status(400).json({ message: 'You already have a store' });
        }
        store = new Store_1.default({
            name,
            owner: req.user.userId,
            description,
            location,
        });
        await store.save();
        // Update user as store owner
        await User_1.default.findByIdAndUpdate(req.user.userId, {
            isStore: true,
            storeId: store._id,
        });
        res.status(201).json(store);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createStore = createStore;
const getStoreById = async (req, res) => {
    try {
        const store = await Store_1.default.findById(req.params.id)
            .populate('owner', 'name profileImage bio')
            .populate('products');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getStoreById = getStoreById;
const getMyStore = async (req, res) => {
    try {
        const store = await Store_1.default.findOne({ owner: req.user.userId })
            .populate('products');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyStore = getMyStore;
const updateStore = async (req, res) => {
    try {
        const { name, description, location, banner, logo } = req.body;
        let store = await Store_1.default.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        store.name = name || store.name;
        store.description = description || store.description;
        store.location = location || store.location;
        store.banner = banner || store.banner;
        store.logo = logo || store.logo;
        await store.save();
        res.json(store);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateStore = updateStore;
const addProductToStore = async (req, res) => {
    try {
        const { name, description, price, originalPrice, category, images, ingredients, benefits, weight } = req.body;
        const store = await Store_1.default.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const product = new Product_1.default({
            name,
            description,
            price,
            originalPrice,
            category,
            images,
            ingredients,
            benefits,
            weight,
            store: store._id,
        });
        await product.save();
        store.products.push(product._id);
        await store.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addProductToStore = addProductToStore;
const followStore = async (req, res) => {
    try {
        const store = await Store_1.default.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const followerIds = store.followers.map((f) => f.toString());
        if (!followerIds.includes(req.user.userId)) {
            store.followers.push(req.user.userId);
            await store.save();
        }
        res.json({ message: 'Store followed', followers: store.followers.length });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.followStore = followStore;
const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, originalPrice, category, images } = req.body;
        const store = await Store_1.default.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const product = await Product_1.default.findOne({ _id: productId, store: store._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price !== undefined ? price : product.price;
        product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
        product.category = category || product.category;
        product.images = images || product.images;
        await product.save();
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const store = await Store_1.default.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const product = await Product_1.default.findOne({ _id: productId, store: store._id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await Product_1.default.findByIdAndDelete(productId);
        store.products = store.products.filter(p => p.toString() !== productId);
        await store.save();
        res.json({ message: 'Product deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
