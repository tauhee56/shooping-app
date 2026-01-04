"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByStore = exports.getFeaturedProducts = exports.likeProduct = exports.getProductById = exports.getAllProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const getAllProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        let query = {};
        if (category)
            query.category = category;
        if (search)
            query.name = { $regex: search, $options: 'i' };
        const numLimit = typeof limit === 'string' ? parseInt(limit) : Number(limit);
        const numPage = typeof page === 'string' ? parseInt(page) : Number(page);
        const products = await Product_1.default.find(query)
            .populate('store', 'name logo')
            .limit(numLimit)
            .skip((numPage - 1) * numLimit)
            .sort({ createdAt: -1 });
        const total = await Product_1.default.countDocuments(query);
        res.json({
            products,
            total,
            pages: Math.ceil(total / numLimit),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .populate('store', 'name logo followers')
            .populate('reviews.user', 'name profileImage');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductById = getProductById;
const likeProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const likeIds = product.likes.map((l) => l.toString());
        if (!likeIds.includes(req.user.userId)) {
            product.likes.push(req.user.userId);
            await product.save();
        }
        res.json({ message: 'Product liked', likes: product.likes.length });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.likeProduct = likeProduct;
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product_1.default.find()
            .populate('store', 'name logo')
            .sort({ likes: -1 })
            .limit(5);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getFeaturedProducts = getFeaturedProducts;
const getProductsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const products = await Product_1.default.find({ store: storeId })
            .populate('store', 'name logo')
            .sort({ createdAt: -1 });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductsByStore = getProductsByStore;
