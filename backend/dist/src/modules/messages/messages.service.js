"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getConversations = getConversations;
exports.getMessagesWithUser = getMessagesWithUser;
exports.markAsRead = markAsRead;
exports.getUnreadCount = getUnreadCount;
const Message_1 = __importDefault(require("../../../models/Message"));
async function sendMessage(input) {
    if (input.clientMessageId) {
        const existing = await Message_1.default.findOne({
            sender: input.senderId,
            clientMessageId: input.clientMessageId,
        });
        if (existing) {
            await existing.populate('sender', 'name profileImage');
            await existing.populate('receiver', 'name profileImage');
            await existing.populate('store', 'name logo');
            return existing;
        }
    }
    const message = await Message_1.default.create({
        sender: input.senderId,
        receiver: input.receiverId,
        store: input.storeId || null,
        content: input.content,
        clientMessageId: input.clientMessageId || null,
    });
    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');
    await message.populate('store', 'name logo');
    return message;
}
async function getConversations(userId) {
    const messages = await Message_1.default.find({
        $or: [{ sender: userId }, { receiver: userId }],
    })
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .populate('store', 'name logo')
        .sort({ createdAt: -1 });
    const conversationsMap = new Map();
    messages.forEach((message) => {
        const partnerId = message.sender._id.equals(userId)
            ? message.receiver._id.toString()
            : message.sender._id.toString();
        if (!conversationsMap.has(partnerId)) {
            const partner = message.sender._id.equals(userId) ? message.receiver : message.sender;
            conversationsMap.set(partnerId, {
                user: partner,
                store: message.store,
                lastMessage: message.content,
                lastMessageTime: message.createdAt,
                unreadCount: 0,
            });
        }
        if (!message.isRead && message.receiver._id.equals(userId)) {
            conversationsMap.get(partnerId).unreadCount++;
        }
    });
    return Array.from(conversationsMap.values());
}
async function getMessagesWithUser(currentUserId, otherUserId) {
    const messages = await Message_1.default.find({
        $or: [
            { sender: currentUserId, receiver: otherUserId },
            { sender: otherUserId, receiver: currentUserId },
        ],
    })
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .populate('store', 'name logo')
        .sort({ createdAt: 1 });
    await Message_1.default.updateMany({ sender: otherUserId, receiver: currentUserId, isRead: false }, { isRead: true });
    return messages;
}
async function markAsRead(messageId) {
    return await Message_1.default.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
}
async function getUnreadCount(userId) {
    const count = await Message_1.default.countDocuments({ receiver: userId, isRead: false });
    return { count };
}
