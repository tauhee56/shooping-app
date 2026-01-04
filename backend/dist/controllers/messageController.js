"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAsRead = exports.getMessagesWithUser = exports.getConversations = exports.sendMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
// Send message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, storeId, content } = req.body;
        if (!content || !receiverId) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }
        const message = await Message_1.default.create({
            sender: req.user.userId,
            receiver: receiverId,
            store: storeId || null,
            content,
        });
        await message.populate('sender', 'name profileImage');
        await message.populate('receiver', 'name profileImage');
        res.status(201).json(message);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.sendMessage = sendMessage;
// Get conversations
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get unique conversation partners
        const messages = await Message_1.default.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .populate('sender', 'name profileImage')
            .populate('receiver', 'name profileImage')
            .populate('store', 'name logo')
            .sort({ createdAt: -1 });
        // Group by conversation partner
        const conversationsMap = new Map();
        messages.forEach(message => {
            const partnerId = message.sender._id.equals(userId)
                ? message.receiver._id.toString()
                : message.sender._id.toString();
            if (!conversationsMap.has(partnerId)) {
                const partner = message.sender._id.equals(userId)
                    ? message.receiver
                    : message.sender;
                conversationsMap.set(partnerId, {
                    user: partner,
                    store: message.store,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: 0,
                });
            }
            // Count unread messages
            if (!message.isRead && message.receiver._id.equals(userId)) {
                conversationsMap.get(partnerId).unreadCount++;
            }
        });
        const conversations = Array.from(conversationsMap.values());
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getConversations = getConversations;
// Get messages with a user
const getMessagesWithUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.userId;
        const messages = await Message_1.default.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .populate('sender', 'name profileImage')
            .populate('receiver', 'name profileImage')
            .populate('store', 'name logo')
            .sort({ createdAt: 1 });
        // Mark messages as read
        await Message_1.default.updateMany({ sender: userId, receiver: currentUserId, isRead: false }, { isRead: true });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMessagesWithUser = getMessagesWithUser;
// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message_1.default.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.markAsRead = markAsRead;
// Get unread count
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message_1.default.countDocuments({
            receiver: req.user.userId,
            isRead: false,
        });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUnreadCount = getUnreadCount;
