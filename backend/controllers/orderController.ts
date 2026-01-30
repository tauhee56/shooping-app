import { Request, Response } from 'express';
import Order from '../models/Order';

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

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    if (totalAmount === undefined || totalAmount === null) {
      return res.status(400).json({ message: 'Total amount is required' });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const normalizedDeliveryAddress = normalizeDeliveryAddress(deliveryAddress);
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

    const order = new Order({
      user: req.user.userId,
      items,
      totalAmount,
      deliveryAddress: normalizedDeliveryAddress,
      paymentMethod: normalizedPaymentMethod,
    });

    await order.save();
    await order.populate('items.product');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is owner or admin
    if (order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
