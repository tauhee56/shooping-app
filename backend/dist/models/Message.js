"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    store: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Store',
        default: null,
    },
    content: {
        type: String,
        required: true,
    },
    clientMessageId: {
        type: String,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
messageSchema.index({ sender: 1, clientMessageId: 1 }, { unique: true, sparse: true });
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
