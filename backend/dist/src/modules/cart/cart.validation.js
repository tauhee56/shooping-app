"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutCartSchema = exports.updateCartItemSchema = exports.removeCartItemSchema = exports.cartItemIdSchema = exports.addCartItemSchema = exports.getCartSchema = void 0;
const zod_1 = require("zod");
exports.getCartSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
});
exports.addCartItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1),
        quantity: zod_1.z.coerce.number().int().positive().optional(),
    }),
});
exports.cartItemIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1),
    }),
});
exports.removeCartItemSchema = exports.cartItemIdSchema;
exports.updateCartItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        quantity: zod_1.z.coerce.number().int().positive(),
    }),
});
exports.checkoutCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        deliveryAddress: zod_1.z.union([
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
        ]),
        paymentMethod: zod_1.z
            .object({
            type: zod_1.z.string().min(1),
            paymentIntentId: zod_1.z.string().optional(),
        })
            .superRefine((val, ctx) => {
            const type = String(val?.type || '').toUpperCase();
            if (type === 'COD')
                return;
            if (!val.paymentIntentId || String(val.paymentIntentId).trim().length === 0) {
                ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'paymentIntentId is required for non-COD payments' });
            }
        }),
    }),
    params: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
});
