import { z } from 'zod';

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    location: z.string().optional(),
    logo: z.string().optional(),
    banner: z.string().optional(),
    storeType: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1)).max(20).optional(),
  }),
});

export const storeIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateStoreSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    banner: z.string().optional(),
    logo: z.string().optional(),
    storeType: z.string().trim().optional(),
    tags: z.array(z.string().trim().min(1)).max(20).optional(),
    paymentOptions: z
      .object({
        codEnabled: z.boolean().optional(),
        stripeEnabled: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const addProductToStoreSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().or(z.string().transform((v) => Number(v))),
    originalPrice: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    ingredients: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    weight: z.string().optional(),
    freeDelivery: z.boolean().optional(),
    stock: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
    paymentOptionsOverride: z
      .object({
        codEnabled: z.boolean().optional(),
        stripeEnabled: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const storeProductIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    productId: z.string().min(1),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    productId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
    originalPrice: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
    category: z.string().optional(),
    images: z.array(z.string()).optional(),
    freeDelivery: z.boolean().optional(),
    stock: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
    paymentOptionsOverride: z
      .object({
        codEnabled: z.boolean().optional(),
        stripeEnabled: z.boolean().optional(),
      })
      .optional(),
  }),
});
