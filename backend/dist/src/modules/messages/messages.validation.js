"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageIdSchema = exports.userIdSchema = exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiverId: zod_1.z.string().min(1),
        storeId: zod_1.z.string().optional(),
        content: zod_1.z.string().min(1),
        clientMessageId: zod_1.z.string().optional(),
    }),
});
exports.userIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().min(1),
    }),
});
exports.messageIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        messageId: zod_1.z.string().min(1),
    }),
});
