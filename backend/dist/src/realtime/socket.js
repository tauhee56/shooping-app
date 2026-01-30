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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachSocketServer = attachSocketServer;
exports.createHttpServer = createHttpServer;
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Message_1 = __importDefault(require("../../models/Message"));
const messageService = __importStar(require("../modules/messages/messages.service"));
function toStringSafe(v) {
    try {
        return v == null ? '' : String(v);
    }
    catch {
        return '';
    }
}
function getRoomId(a, b) {
    const [x, y] = [toStringSafe(a), toStringSafe(b)].sort();
    return `conv:${x}:${y}`;
}
function extractToken(socket) {
    const authToken = toStringSafe(socket?.handshake?.auth?.token);
    if (authToken)
        return authToken;
    const header = toStringSafe(socket?.handshake?.headers?.authorization);
    const match = header.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : '';
}
function attachSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });
    io.use((socket, next) => {
        try {
            const token = extractToken(socket);
            if (!token)
                return next(new Error('unauthorized'));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const userId = decoded?.userId || decoded?.id || decoded?._id;
            if (!userId)
                return next(new Error('unauthorized'));
            socket.data.userId = String(userId);
            return next();
        }
        catch {
            return next(new Error('unauthorized'));
        }
    });
    io.on('connection', (socket) => {
        const userId = toStringSafe(socket.data.userId);
        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        socket.on('conversation:join', (payload) => {
            const otherUserId = toStringSafe(payload?.otherUserId);
            if (!otherUserId)
                return;
            socket.join(getRoomId(userId, otherUserId));
        });
        socket.on('conversation:leave', (payload) => {
            const otherUserId = toStringSafe(payload?.otherUserId);
            if (!otherUserId)
                return;
            socket.leave(getRoomId(userId, otherUserId));
        });
        socket.on('message:send', async (payload, ack) => {
            try {
                const receiverId = toStringSafe(payload?.receiverId);
                const content = toStringSafe(payload?.content).trim();
                const storeId = payload?.storeId ? toStringSafe(payload.storeId) : undefined;
                const clientMessageId = payload?.clientMessageId ? toStringSafe(payload.clientMessageId) : undefined;
                if (!receiverId || !content) {
                    if (typeof ack === 'function')
                        ack({ ok: false, error: 'Invalid payload' });
                    return;
                }
                const message = await messageService.sendMessage({
                    senderId: userId,
                    receiverId,
                    storeId,
                    content,
                    clientMessageId,
                });
                const roomId = getRoomId(userId, receiverId);
                const room = io.sockets.adapter.rooms.get(roomId);
                const receiverUserRoom = `user:${receiverId}`;
                if (room && room.size > 0) {
                    const receiverSockets = io.sockets.adapter.rooms.get(receiverUserRoom);
                    if (receiverSockets) {
                        for (const sid of receiverSockets) {
                            if (room.has(sid)) {
                                await Message_1.default.findByIdAndUpdate(message._id, { isRead: true });
                                message.isRead = true;
                                break;
                            }
                        }
                    }
                }
                io.to(roomId).emit('message:new', { message });
                const unreadCount = await Message_1.default.countDocuments({
                    sender: userId,
                    receiver: receiverId,
                    isRead: false,
                });
                io.to(`user:${userId}`).emit('conversation:update', {
                    conversation: {
                        user: message.receiver,
                        store: message.store,
                        lastMessage: message.content,
                        lastMessageTime: message.createdAt,
                        unreadCount: 0,
                    },
                });
                io.to(`user:${receiverId}`).emit('conversation:update', {
                    conversation: {
                        user: message.sender,
                        store: message.store,
                        lastMessage: message.content,
                        lastMessageTime: message.createdAt,
                        unreadCount,
                    },
                });
                if (typeof ack === 'function')
                    ack({ ok: true, message });
            }
            catch {
                if (typeof ack === 'function')
                    ack({ ok: false, error: 'Failed to send message' });
            }
        });
    });
    return io;
}
function createHttpServer(app) {
    return (0, http_1.createServer)(app);
}
