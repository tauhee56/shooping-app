import Order from '../../../models/Order';
import { ApiError } from '../../common/http/ApiError';

const orderPopulate = [
  {
    path: 'items.product',
    populate: {
      path: 'store',
      select: 'name logo banner',
    },
  },
];

function normalizeDeliveryAddress(input: any): any {
  if (!input) return input;
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

function normalizePaymentMethod(input: any): any {
  if (!input) return { type: 'card' };
  if (typeof input === 'string') return { type: input };
  if (typeof input === 'object' && input.type) return input;
  return { type: 'card' };
}

export async function createOrder(userId: string, input: any) {
  const order: any = new Order({
    user: userId,
    items: input.items,
    totalAmount: input.totalAmount,
    deliveryAddress: normalizeDeliveryAddress(input.deliveryAddress),
    paymentMethod: normalizePaymentMethod(input.paymentMethod),
    paymentIntentId: typeof input.paymentIntentId === 'string' ? input.paymentIntentId : '',
    paymentStatus:
      typeof input.paymentStatus === 'string' && ['pending', 'completed', 'failed'].includes(input.paymentStatus)
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

export async function getMyOrders(userId: string) {
  return await Order.find({ user: userId }).populate(orderPopulate).sort({ createdAt: -1 });
}

export async function getOrderById(userId: string, orderId: string) {
  const order: any = await Order.findById(orderId)
    .populate(orderPopulate)
    .populate('user', 'name email phone');
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.user._id.toString() !== userId) throw new ApiError(403, 'Not authorized');

  return order;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const order: any = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

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
