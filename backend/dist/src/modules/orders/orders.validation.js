"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusSchema = exports.orderIdSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    product: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
    price: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
});
const deliveryAddressSchema = zod_1.z.union([
    zod_1.z.string().min(1),
    zod_1.z.object({
        fullName: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        street: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
        zip: zod_1.z.string().optional(),
        isDefault: zod_1.z.boolean().optional(),
    }),
]);
const paymentMethodSchema = zod_1.z.union([
    zod_1.z.string().min(1),
    zod_1.z.object({
        type: zod_1.z.string().min(1),
    }),
]);
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(orderItemSchema).min(1),
        totalAmount: zod_1.z.number().or(zod_1.z.string().transform((v) => Number(v))),
        deliveryAddress: deliveryAddressSchema,
        paymentMethod: paymentMethodSchema.optional(),
    }),
});
exports.orderIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    }),
});
