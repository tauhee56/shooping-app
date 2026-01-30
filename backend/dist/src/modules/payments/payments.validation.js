"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookSchema = exports.createIntentSchema = void 0;
const zod_1 = require("zod");
exports.createIntentSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
});
exports.webhookSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.any().optional(),
    query: zod_1.z.any().optional(),
});
