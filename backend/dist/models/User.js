"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    profileImage: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: '',
    },
    isStore: {
        type: Boolean,
        default: false,
    },
    storeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
    },
    followers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    following: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
userSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
