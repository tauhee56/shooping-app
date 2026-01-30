import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as orderService from './orders.service';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user.userId, req.body);
  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getMyOrders(req.user.userId);
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.user.userId, req.params.id as any);
  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.id as any, req.body.status);
  res.json(order);
});
