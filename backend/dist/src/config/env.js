"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
function getEnv(name, fallback) {
    const v = process.env[name];
    if (v === undefined || v === '')
        return fallback;
    return v;
}
function requireEnv(name) {
    const v = getEnv(name);
    if (!v) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return v;
}
exports.env = {
    NODE_ENV: getEnv('NODE_ENV', 'development') || 'development',
    PORT: Number(getEnv('PORT', '5000')),
    MONGODB_URI: getEnv('MONGODB_URI'),
    JWT_SECRET: requireEnv('JWT_SECRET'),
    CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
    CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
};
