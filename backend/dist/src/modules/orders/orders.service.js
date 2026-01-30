"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getMyOrders = getMyOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
const Order_1 = __importDefault(require("../../../models/Order"));
const ApiError_1 = require("../../common/http/ApiError");
const orderPopulate = [
    {
        path: 'items.product',
        populate: {
            path: 'store',
            select: 'name logo banner',
        },
    },
];
function normalizeDeliveryAddress(input) {
    if (!input)
        return input;
    if (typeof input === 'string') {
        return {
            fullName: '',
            phone: '',
            street: input,
            city: '',
            state: '',
            country: '',
            zip: '',
            isDefault: false,
        };
    }
    return input;
}
function normalizePaymentMethod(input) {
    if (!input)
        return { type: 'card' };
    if (typeof input === 'string')
        return { type: input };
    if (typeof input === 'object' && input.type)
        return input;
    return { type: 'card' };
}
async function createOrder(userId, input) {
    const order = new Order_1.default({
        user: userId,
        items: input.items,
        totalAmount: input.totalAmount,
        deliveryAddress: normalizeDeliveryAddress(input.deliveryAddress),
        paymentMethod: normalizePaymentMethod(input.paymentMethod),
        paymentIntentId: typeof input.paymentIntentId === 'string' ? input.paymentIntentId : '',
        paymentStatus: typeof input.paymentStatus === 'string' && ['pending', 'completed', 'failed'].includes(input.paymentStatus)
            ? input.paymentStatus
            : undefined,
    });
    if (!Array.isArray(order.statusHistory) || order.statusHistory.length === 0) {
        order.statusHistory = [{ status: order.status || 'pending', at: new Date() }];
    }
    await order.save();
    await order.populate(orderPopulate);
    return order;
}
async function getMyOrders(userId) {
    return await Order_1.default.find({ user: userId }).populate(orderPopulate).sort({ createdAt: -1 });
}
async function getOrderById(userId, orderId) {
    const order = await Order_1.default.findById(orderId)
        .populate(orderPopulate)
        .populate('user', 'name email phone');
    if (!order)
        throw new ApiError_1.ApiError(404, 'Order not found');
    if (order.user._id.toString() !== userId)
        throw new ApiError_1.ApiError(403, 'Not authorized');
    return order;
}
async function updateOrderStatus(orderId, status) {
    const order = await Order_1.default.findById(orderId);
    if (!order)
        throw new ApiError_1.ApiError(404, 'Order not found');
    const currentStatus = String(order.status || '').toLowerCase();
    const nextStatus = String(status || '').toLowerCase();
    if (!Array.isArray(order.statusHistory) || order.statusHistory.length === 0) {
        order.statusHistory = [{ status: currentStatus || 'pending', at: order.createdAt || new Date() }];
    }
    order.status = status;
    if (currentStatus !== nextStatus) {
        order.statusHistory.push({ status: nextStatus, at: new Date() });
    }
    order.updatedAt = new Date();
    await order.save();
    await order.populate(orderPopulate);
    return order;
}
