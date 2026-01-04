"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Database Connection
let mongoConnected = false;
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', { serverSelectionTimeoutMS: 5000 })
    .then(() => {
    mongoConnected = true;
    console.log('✅ MongoDB connected');
})
    .catch((err) => {
    console.warn('⚠️  MongoDB connection failed - using in-memory database');
    console.warn('Error:', err.message);
    // In-memory DB will be used as fallback
});
// Routes
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/products', require('./routes/products').default);
app.use('/api/stores', require('./routes/stores').default);
app.use('/api/orders', require('./routes/orders').default);
app.use('/api/messages', require('./routes/messages').default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Backend is running',
        db: mongoConnected ? 'MongoDB' : 'In-Memory Mock DB'
    });
});
// DB status endpoint
app.get('/api/db-status', (req, res) => {
    if (mongoConnected) {
        const mockDB = require('./db/mockDB');
        res.json({
            database: 'MongoDB',
            status: 'connected',
            mockData: mockDB.stats(),
        });
    }
    else {
        const mockDB = require('./db/mockDB');
        res.json({
            database: 'In-Memory Mock DB',
            status: 'active',
            data: mockDB.stats(),
            note: 'MongoDB not available - using in-memory storage',
        });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});
exports.default = app;
