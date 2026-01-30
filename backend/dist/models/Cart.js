"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cartItemSchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
    unitPriceSnapshot: {
        type: Number,
        default: null,
    },
}, { _id: false });
const cartSchema = new mongoose_1.default.Schema({
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
cartSchema.pre('save', function () {
    this.updatedAt = new Date();
});
const Cart = mongoose_1.default.model('Cart', cartSchema);
exports.default = Cart;
