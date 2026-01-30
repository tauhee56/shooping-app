import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
    storeId: z.string().optional(),
    content: z.string().min(1),
    clientMessageId: z.string().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});

export const messageIdSchema = z.object({
  params: z.object({
    messageId: z.string().min(1),
  }),
});
