"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const crypto_1 = require("crypto");
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
});
exports.httpLogger = (0, pino_http_1.default)({
    logger: exports.logger,
    genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const headerId = Array.isArray(existing) ? existing[0] : existing;
        const id = headerId || (0, crypto_1.randomUUID)();
        res.setHeader('x-request-id', id);
        return id;
    },
});
