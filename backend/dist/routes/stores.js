"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, storeController_1.createStore);
router.get('/my', auth_1.default, storeController_1.getMyStore);
router.get('/:id', storeController_1.getStoreById);
router.put('/:id', auth_1.default, storeController_1.updateStore);
router.post('/:id/products', auth_1.default, storeController_1.addProductToStore);
router.put('/:id/products/:productId', auth_1.default, storeController_1.updateProduct);
router.delete('/:id/products/:productId', auth_1.default, storeController_1.deleteProduct);
router.post('/:id/follow', auth_1.default, storeController_1.followStore);
exports.default = router;
