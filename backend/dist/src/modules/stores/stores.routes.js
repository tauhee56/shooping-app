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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const validate_1 = require("../../common/http/validate");
const controller = __importStar(require("./stores.controller"));
const stores_validation_1 = require("./stores.validation");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.get('/', controller.listStores);
router.post('/', auth_1.default, (0, validate_1.validate)(stores_validation_1.createStoreSchema), controller.createStore);
router.get('/followed', auth_1.default, controller.getFollowedStores);
router.get('/mine', auth_1.default, controller.listMyStores);
router.get('/my', auth_1.default, controller.getMyStore);
router.post('/upload-logo', auth_1.default, upload.single('image'), controller.uploadStoreLogo);
router.post('/upload-banner', auth_1.default, upload.single('image'), controller.uploadStoreBanner);
router.post('/upload-product-images', auth_1.default, upload.array('images', 6), controller.uploadProductImages);
router.get('/:id', (0, validate_1.validate)(stores_validation_1.storeIdSchema), controller.getStoreById);
router.put('/:id', auth_1.default, (0, validate_1.validate)(stores_validation_1.updateStoreSchema), controller.updateStore);
router.post('/:id/products', auth_1.default, (0, validate_1.validate)(stores_validation_1.addProductToStoreSchema), controller.addProductToStore);
router.put('/:id/products/:productId', auth_1.default, (0, validate_1.validate)(stores_validation_1.updateProductSchema), controller.updateProduct);
router.delete('/:id/products/:productId', auth_1.default, (0, validate_1.validate)(stores_validation_1.storeProductIdSchema), controller.deleteProduct);
router.post('/:id/follow', auth_1.default, (0, validate_1.validate)(stores_validation_1.storeIdSchema), controller.followStore);
exports.default = router;
