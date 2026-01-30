"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const products_routes_1 = __importDefault(require("./modules/products/products.routes"));
const stores_routes_1 = __importDefault(require("./modules/stores/stores.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const messages_routes_1 = __importDefault(require("./modules/messages/messages.routes"));
const cart_routes_1 = __importDefault(require("./modules/cart/cart.routes"));
const addresses_routes_1 = __importDefault(require("./modules/addresses/addresses.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const logger_1 = require("./common/logging/logger");
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
function createApp(options) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(logger_1.httpLogger);
    app.use(express_1.default.json({
        verify: (req, res, buf) => {
            if (req.originalUrl === '/api/payments/webhook') {
                req.rawBody = buf;
            }
        },
    }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/products', products_routes_1.default);
    app.use('/api/stores', stores_routes_1.default);
    app.use('/api/orders', orders_routes_1.default);
    app.use('/api/messages', messages_routes_1.default);
    app.use('/api/cart', cart_routes_1.default);
    app.use('/api/addresses', addresses_routes_1.default);
    app.use('/api/payments', payments_routes_1.default);
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'Backend is running',
            db: options.mongoConnected ? 'MongoDB' : 'In-Memory Mock DB',
        });
    });
    app.get('/api/db-status', (req, res) => {
        const mockDB = require('../db/mockDB');
        if (options.mongoConnected) {
            res.json({
                database: 'MongoDB',
                status: 'connected',
                mockData: mockDB.stats(),
            });
            return;
        }
        res.json({
            database: 'In-Memory Mock DB',
            status: 'active',
            data: mockDB.stats(),
            note: 'MongoDB not available - using in-memory storage',
        });
    });
    app.use(notFound_1.notFound);
    app.use(errorHandler_1.errorHandler);
    return app;
}
