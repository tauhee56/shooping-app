"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAsRead = exports.getMessagesWithUser = exports.getConversations = exports.sendMessage = void 0;
const asyncHandler_1 = require("../../common/http/asyncHandler");
const ApiError_1 = require("../../common/http/ApiError");
const messageService = __importStar(require("./messages.service"));
exports.sendMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { receiverId, storeId, content, clientMessageId } = req.body;
    if (!receiverId || !content)
        throw new ApiError_1.ApiError(400, 'Receiver and content are required');
    const message = await messageService.sendMessage({
        senderId: req.user.userId,
        receiverId,
        storeId,
        content,
        clientMessageId,
    });
    res.status(201).json(message);
});
exports.getConversations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const conversations = await messageService.getConversations(req.user.userId);
    res.json(conversations);
});
exports.getMessagesWithUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const messages = await messageService.getMessagesWithUser(req.user.userId, req.params.userId);
    res.json(messages);
});
exports.markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const message = await messageService.markAsRead(req.params.messageId);
    res.json(message);
});
exports.getUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await messageService.getUnreadCount(req.user.userId);
    res.json(result);
});
