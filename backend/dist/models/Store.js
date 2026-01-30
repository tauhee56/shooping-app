"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const storeSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    paymentOptions: {
        codEnabled: {
            type: Boolean,
            default: false,
        },
        stripeEnabled: {
            type: Boolean,
            default: true,
        },
    },
    storeType: {
        type: String,
        default: '',
    },
    tags: {
        type: [String],
        default: [],
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    logo: {
        type: String,
        default: null,
    },
    banner: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        default: '',
    },
    followers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    products: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Product',
        }],
    rating: {
        type: Number,
        default: 0,
    },
    totalSales: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Store = mongoose_1.default.model('Store', storeSchema);
exports.default = Store;
