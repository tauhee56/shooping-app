"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectMongo(mongoUri) {
    const uri = mongoUri || 'mongodb://localhost:27017/test';
    try {
        await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
        return true;
    }
    catch {
        return false;
    }
}
