import { z } from 'zod';

export const createIntentSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const webhookSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.any().optional(),
});
