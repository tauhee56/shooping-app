import { z } from 'zod';

const orderItemSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().int().positive().optional().or(z.string().transform((v) => Number(v)).optional()),
  price: z.number().optional().or(z.string().transform((v) => Number(v)).optional()),
});

const deliveryAddressSchema = z.union([
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
]);

const paymentMethodSchema = z.union([
  z.string().min(1),
  z.object({
    type: z.string().min(1),
  }),
]);

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).min(1),
    totalAmount: z.number().or(z.string().transform((v) => Number(v))),
    deliveryAddress: deliveryAddressSchema,
    paymentMethod: paymentMethodSchema.optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  }),
});
