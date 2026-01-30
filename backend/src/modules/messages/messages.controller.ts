import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import { ApiError } from '../../common/http/ApiError';
import * as messageService from './messages.service';

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { receiverId, storeId, content, clientMessageId } = req.body;
  if (!receiverId || !content) throw new ApiError(400, 'Receiver and content are required');

  const message = await messageService.sendMessage({
    senderId: req.user.userId,
    receiverId,
    storeId,
    content,
    clientMessageId,
  });

  res.status(201).json(message);
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await messageService.getConversations(req.user.userId);
  res.json(conversations);
});

export const getMessagesWithUser = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.getMessagesWithUser(req.user.userId, req.params.userId as any);
  res.json(messages);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.markAsRead(req.params.messageId as any);
  res.json(message);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const result = await messageService.getUnreadCount(req.user.userId);
  res.json(result);
});
