"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.storeProductIdSchema = exports.addProductToStoreSchema = exports.updateStoreSchema = exports.storeIdSchema = exports.createStoreSchema = void 0;
const zod_1 = require("zod");
exports.createStoreSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        logo: zod_1.z.string().optional(),
        banner: zod_1.z.string().optional(),
        storeType: zod_1.z.string().trim().optional(),
        tags: zod_1.z.array(zod_1.z.string().trim().min(1)).max(20).optional(),
    }),
});
exports.storeIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.updateStoreSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        banner: zod_1.z.string().optional(),
        logo: zod_1.z.string().optional(),
        storeType: zod_1.z.string().trim().optional(),
        tags: zod_1.z.array(zod_1.z.string().trim().min(1)).max(20).optional(),
        paymentOptions: zod_1.z
            .object({
            codEnabled: zod_1.z.boolean().optional(),
            stripeEnabled: zod_1.z.boolean().optional(),
        })
            .optional(),
    }),
});
exports.addProductToStoreSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().min(1),
        price: zod_1.z.number().or(zod_1.z.string().transform((v) => Number(v))),
        originalPrice: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
        category: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        ingredients: zod_1.z.array(zod_1.z.string()).optional(),
        benefits: zod_1.z.array(zod_1.z.string()).optional(),
        weight: zod_1.z.string().optional(),
        freeDelivery: zod_1.z.boolean().optional(),
        stock: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
        paymentOptionsOverride: zod_1.z
            .object({
            codEnabled: zod_1.z.boolean().optional(),
            stripeEnabled: zod_1.z.boolean().optional(),
        })
            .optional(),
    }),
});
exports.storeProductIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
        productId: zod_1.z.string().min(1),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
        productId: zod_1.z.string().min(1),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
        originalPrice: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
        category: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        freeDelivery: zod_1.z.boolean().optional(),
        stock: zod_1.z.number().optional().or(zod_1.z.string().transform((v) => Number(v)).optional()),
        paymentOptionsOverride: zod_1.z
            .object({
            codEnabled: zod_1.z.boolean().optional(),
            stripeEnabled: zod_1.z.boolean().optional(),
        })
            .optional(),
    }),
});
