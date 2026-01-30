"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const deliveryAddressSchema = new mongoose_1.default.Schema({
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zip: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
}, { _id: false });
const paymentMethodSchema = new mongoose_1.default.Schema({
    type: { type: String, default: 'card' },
}, { _id: false });
const statusHistorySchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        required: true,
    },
    at: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, { _id: false });
const orderSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
            product: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: Number,
            price: Number,
        }],
    totalAmount: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        type: deliveryAddressSchema,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: () => [{ status: 'pending', at: new Date() }],
    },
    paymentMethod: {
        type: paymentMethodSchema,
        default: () => ({ type: 'card' }),
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    paymentIntentId: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
