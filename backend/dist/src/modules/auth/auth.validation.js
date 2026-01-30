"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUserSchema = exports.updateProfileSchema = exports.firebaseAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        phone: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1),
    }),
});
exports.firebaseAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(1),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        bio: zod_1.z.string().optional(),
        profileImage: zod_1.z.string().optional(),
    }),
});
exports.followUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().min(1),
    }),
});
