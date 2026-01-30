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
exports.likeProduct = exports.getLikedProducts = exports.getProductById = exports.getProductsByStore = exports.getFeaturedProducts = exports.getAllProducts = void 0;
const ApiError_1 = require("../../common/http/ApiError");
const asyncHandler_1 = require("../../common/http/asyncHandler");
const productService = __importStar(require("./products.service"));
exports.getAllProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await productService.getAllProducts({
        category: req.query.category,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
    });
    res.json(result);
});
exports.getFeaturedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const products = await productService.getFeaturedProducts();
    res.json(products);
});
exports.getProductsByStore = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const storeIdParam = req.params.storeId;
    const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
    if (!storeId)
        throw new ApiError_1.ApiError(400, 'storeId is required');
    const products = await productService.getProductsByStore(storeId);
    res.json(products);
});
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id)
        throw new ApiError_1.ApiError(400, 'Product id is required');
    const product = await productService.getProductById(id);
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    res.json(product);
});
exports.getLikedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const products = await productService.getLikedProducts(req.user.userId);
    res.json(products);
});
exports.likeProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id)
        throw new ApiError_1.ApiError(400, 'Product id is required');
    const result = await productService.toggleLikeProduct(id, req.user.userId);
    if (!result)
        throw new ApiError_1.ApiError(404, 'Product not found');
    res.json(result);
});
