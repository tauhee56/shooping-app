"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.followUser = exports.uploadProfileImage = exports.updateProfile = exports.getProfile = exports.firebaseAuth = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../../common/http/asyncHandler");
const authService = __importStar(require("./auth.service"));
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await authService.loginUser(req.body);
    res.json(result);
});
exports.firebaseAuth = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await authService.firebaseAuth(req.body);
    res.json(result);
});
exports.getProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await authService.getProfile(req.user.userId);
    res.json(user);
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await authService.updateProfile(req.user.userId, req.body);
    res.json(user);
});
exports.uploadProfileImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const file = req.file;
    const url = await authService.uploadProfileImage(req.user.userId, file);
    res.json({ url });
});
exports.followUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await authService.followUser(req.user.userId, req.params.userId);
    res.json(result);
});
