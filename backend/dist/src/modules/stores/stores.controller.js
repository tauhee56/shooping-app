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
exports.uploadProductImages = exports.uploadStoreBanner = exports.uploadStoreLogo = exports.followStore = exports.deleteProduct = exports.updateProduct = exports.addProductToStore = exports.updateStore = exports.getStoreById = exports.getFollowedStores = exports.listMyStores = exports.getMyStore = exports.createStore = exports.listStores = void 0;
const asyncHandler_1 = require("../../common/http/asyncHandler");
const storeService = __importStar(require("./stores.service"));
exports.listStores = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const stores = await storeService.listStores();
    res.json(stores);
});
exports.createStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const store = await storeService.createStore(req.user.userId, req.body);
    res.status(201).json(store);
});
exports.getMyStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const store = await storeService.getMyStore(req.user.userId);
    res.json(store);
});
exports.listMyStores = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stores = await storeService.listMyStores(req.user.userId);
    res.json(stores);
});
exports.getFollowedStores = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stores = await storeService.getFollowedStores(req.user.userId);
    res.json(stores);
});
exports.getStoreById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const store = await storeService.getStoreById(req.params.id);
    res.json(store);
});
exports.updateStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const store = await storeService.updateStore(req.user.userId, req.params.id, req.body);
    res.json(store);
});
exports.addProductToStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await storeService.addProductToStore(req.user.userId, req.params.id, req.body);
    res.status(201).json(product);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await storeService.updateProduct(req.user.userId, req.params.id, req.params.productId, req.body);
    res.json(product);
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await storeService.deleteProduct(req.user.userId, req.params.id, req.params.productId);
    res.json(result);
});
exports.followStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await storeService.followStore(req.params.id, req.user.userId);
    res.json(result);
});
exports.uploadStoreLogo = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const file = req.file;
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const url = await storeService.uploadStoreLogo(req.user.userId, file, storeId);
    res.json({ url });
});
exports.uploadStoreBanner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const file = req.file;
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const url = await storeService.uploadStoreBanner(req.user.userId, file, storeId);
    res.json({ url });
});
exports.uploadProductImages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files || [];
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const urls = await storeService.uploadProductImages(req.user.userId, files, storeId);
    res.json({ urls });
});
