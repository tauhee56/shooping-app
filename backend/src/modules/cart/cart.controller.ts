import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as cartService from './cart.service';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.user.userId);
  res.json(cart);
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.addItem(req.user.userId, req.body);
  res.json(cart);
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.updateItem(req.user.userId, req.params.productId as any, req.body.quantity);
  res.json(cart);
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.removeItem(req.user.userId, req.params.productId as any);
  res.json(cart);
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const order = await cartService.checkout(req.user.userId, req.body);
  res.status(201).json(order);
});
