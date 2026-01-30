"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAddressesSchema = exports.updateAddressSchema = exports.createAddressSchema = exports.addressIdSchema = void 0;
const zod_1 = require("zod");
exports.addressIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
});
const addressBodySchema = zod_1.z.object({
    type: zod_1.z.enum(['Home', 'Work', 'Other']).optional(),
    fullName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(1).optional(),
    street: zod_1.z.string().min(1).optional(),
    city: zod_1.z.string().min(1).optional(),
    state: zod_1.z.string().min(1).optional(),
    zip: zod_1.z.string().min(1).optional(),
    country: zod_1.z.string().min(1).optional(),
    isDefault: zod_1.z.boolean().optional(),
});
exports.createAddressSchema = zod_1.z.object({
    body: addressBodySchema.refine((v) => !!v.fullName && !!v.phone && !!v.street && !!v.city && !!v.state && !!v.zip, { message: 'Missing required address fields' }),
});
exports.updateAddressSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1),
    }),
    body: addressBodySchema,
});
exports.listAddressesSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
});
