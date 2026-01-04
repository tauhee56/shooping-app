"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.get('/featured', productController_1.getFeaturedProducts);
router.get('/', productController_1.getAllProducts);
router.get('/store/:storeId', productController_1.getProductsByStore);
router.get('/:id', productController_1.getProductById);
router.post('/:id/like', auth_1.default, productController_1.likeProduct);
exports.default = router;
