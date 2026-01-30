import { z } from 'zod';

export const getCartSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive().optional(),
  }),
});

export const cartItemIdSchema = z.object({
  params: z.object({
    productId: z.string().min(1),
  }),
});

export const removeCartItemSchema = cartItemIdSchema;

export const updateCartItemSchema = z.object({
  params: z.object({
    productId: z.string().min(1),
  }),
  body: z.object({
    quantity: z.coerce.number().int().positive(),
  }),
});

export const checkoutCartSchema = z.object({
  body: z.object({
    deliveryAddress: z.union([
      z.string().min(1),
      z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zip: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    ]),
    paymentMethod: z
      .object({
        type: z.string().min(1),
        paymentIntentId: z.string().optional(),
      })
      .superRefine((val, ctx) => {
        const type = String(val?.type || '').toUpperCase();
        if (type === 'COD') return;
        if (!val.paymentIntentId || String(val.paymentIntentId).trim().length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'paymentIntentId is required for non-COD payments' });
        }
      }),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});
