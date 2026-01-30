"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home',
    },
    fullName: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    street: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    zip: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    isDefault: {
        type: Boolean,
        default: false,
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
addressSchema.index({ user: 1, isDefault: 1 });
const Address = mongoose_1.default.model('Address', addressSchema);
exports.default = Address;
