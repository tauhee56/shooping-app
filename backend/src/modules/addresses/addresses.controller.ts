import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as addressService from './addresses.service';

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const addresses = await addressService.listAddresses(req.user.userId);
  res.json(addresses);
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.createAddress(req.user.userId, req.body);
  res.status(201).json(address);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.updateAddress(req.user.userId, req.params.id as any, req.body);
  res.json(address);
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const result = await addressService.deleteAddress(req.user.userId, req.params.id as any);
  res.json(result);
});

export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  const address = await addressService.setDefaultAddress(req.user.userId, req.params.id as any);
  res.json(address);
});
