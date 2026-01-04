"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default, orderController_1.createOrder);
router.get('/', auth_1.default, orderController_1.getMyOrders);
router.get('/:id', auth_1.default, orderController_1.getOrderById);
router.put('/:id/status', auth_1.default, orderController_1.updateOrderStatus);
exports.default = router;
