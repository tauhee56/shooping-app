"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app_1 = require("./app");
const socket_1 = require("./realtime/socket");
async function main() {
    const mongoConnected = await (0, db_1.connectMongo)(env_1.env.MONGODB_URI);
    if (mongoConnected) {
        console.log('✅ MongoDB connected');
    }
    else {
        console.warn('⚠️  MongoDB connection failed - using in-memory database');
    }
    const app = (0, app_1.createApp)({ mongoConnected });
    const httpServer = (0, socket_1.createHttpServer)(app);
    (0, socket_1.attachSocketServer)(httpServer);
    httpServer.listen(env_1.env.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.env.PORT}`);
        console.log(`📍 Health: http://localhost:${env_1.env.PORT}/api/health`);
    });
}
main().catch((err) => {
    console.error('Fatal server error:', err);
    process.exit(1);
});
