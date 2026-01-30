"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsByStoreSchema = exports.productIdSchema = exports.getAllProductsSchema = void 0;
const zod_1 = require("zod");
exports.getAllProductsSchema = zod_1.z.object({
    query: zod_1.z.object({
        category: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().optional(),
    }),
});
exports.productIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
exports.productsByStoreSchema = zod_1.z.object({
    params: zod_1.z.object({
        storeId: zod_1.z.string().min(1),
    }),
});
