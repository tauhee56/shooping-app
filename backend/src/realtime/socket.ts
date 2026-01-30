import { createServer } from 'http';
import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import Message from '../../models/Message';
import * as messageService from '../modules/messages/messages.service';

function toStringSafe(v: any): string {
  try {
    return v == null ? '' : String(v);
  } catch {
    return '';
  }
}

function getRoomId(a: string, b: string): string {
  const [x, y] = [toStringSafe(a), toStringSafe(b)].sort();
  return `conv:${x}:${y}`;
}

function extractToken(socket: any): string {
  const authToken = toStringSafe(socket?.handshake?.auth?.token);
  if (authToken) return authToken;

  const header = toStringSafe(socket?.handshake?.headers?.authorization);
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.use((socket: any, next: (err?: any) => void) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error('unauthorized'));

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const userId = decoded?.userId || decoded?.id || decoded?._id;
      if (!userId) return next(new Error('unauthorized'));

      socket.data.userId = String(userId);
      return next();
    } catch {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket: any) => {
    const userId = toStringSafe(socket.data.userId);
    const userRoom = `user:${userId}`;
    socket.join(userRoom);

    socket.on('conversation:join', (payload: any) => {
      const otherUserId = toStringSafe(payload?.otherUserId);
      if (!otherUserId) return;
      socket.join(getRoomId(userId, otherUserId));
    });

    socket.on('conversation:leave', (payload: any) => {
      const otherUserId = toStringSafe(payload?.otherUserId);
      if (!otherUserId) return;
      socket.leave(getRoomId(userId, otherUserId));
    });

    socket.on('message:send', async (payload: any, ack?: (res: any) => void) => {
      try {
        const receiverId = toStringSafe(payload?.receiverId);
        const content = toStringSafe(payload?.content).trim();
        const storeId = payload?.storeId ? toStringSafe(payload.storeId) : undefined;
        const clientMessageId = payload?.clientMessageId ? toStringSafe(payload.clientMessageId) : undefined;

        if (!receiverId || !content) {
          if (typeof ack === 'function') ack({ ok: false, error: 'Invalid payload' });
          return;
        }

        const message: any = await messageService.sendMessage({
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
                await Message.findByIdAndUpdate(message._id, { isRead: true });
                message.isRead = true;
                break;
              }
            }
          }
        }

        io.to(roomId).emit('message:new', { message });

        const unreadCount = await Message.countDocuments({
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

        if (typeof ack === 'function') ack({ ok: true, message });
      } catch {
        if (typeof ack === 'function') ack({ ok: false, error: 'Failed to send message' });
      }
    });
  });

  return io;
}

export function createHttpServer(app: any) {
  return createServer(app);
}
