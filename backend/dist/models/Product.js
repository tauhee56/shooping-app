"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    paymentOptionsOverride: {
        codEnabled: {
            type: Boolean,
            default: undefined,
        },
        stripeEnabled: {
            type: Boolean,
            default: undefined,
        },
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: null,
    },
    store: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    images: [{
            type: String,
        }],
    category: {
        type: String,
        default: '',
    },
    tags: [String],
    stock: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: [{
            user: mongoose_1.default.Schema.Types.ObjectId,
            rating: Number,
            comment: String,
            createdAt: Date,
        }],
    ingredients: [String],
    benefits: [String],
    weight: {
        type: String,
        default: '',
    },
    deliveryTime: {
        type: String,
        default: 'Standard delivery',
    },
    freeDelivery: {
        type: Boolean,
        default: false,
    },
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
}, {
    timestamps: true,
});
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
