import { z } from 'zod';

export const getAllProductsSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const productsByStoreSchema = z.object({
  params: z.object({
    storeId: z.string().min(1),
  }),
});
