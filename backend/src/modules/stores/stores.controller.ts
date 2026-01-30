import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as storeService from './stores.service';

export const listStores = asyncHandler(async (_req: Request, res: Response) => {
  const stores = await storeService.listStores();
  res.json(stores);
});

export const createStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.createStore(req.user.userId, req.body);
  res.status(201).json(store);
});

export const getMyStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.getMyStore(req.user.userId);
  res.json(store);
});

export const listMyStores = asyncHandler(async (req: Request, res: Response) => {
  const stores = await storeService.listMyStores(req.user.userId);
  res.json(stores);
});

export const getFollowedStores = asyncHandler(async (req: Request, res: Response) => {
  const stores = await storeService.getFollowedStores(req.user.userId);
  res.json(stores);
});

export const getStoreById = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.getStoreById(req.params.id as any);
  res.json(store);
});

export const updateStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.updateStore(req.user.userId, req.params.id as any, req.body);
  res.json(store);
});

export const addProductToStore = asyncHandler(async (req: Request, res: Response) => {
  const product = await storeService.addProductToStore(req.user.userId, req.params.id as any, req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await storeService.updateProduct(
    req.user.userId,
    req.params.id as any,
    req.params.productId as any,
    req.body
  );
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await storeService.deleteProduct(req.user.userId, req.params.id as any, req.params.productId as any);
  res.json(result);
});

export const followStore = asyncHandler(async (req: Request, res: Response) => {
  const result = await storeService.followStore(req.params.id as any, req.user.userId);
  res.json(result);
});

export const uploadStoreLogo = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as { buffer?: Buffer; mimetype?: string; originalname?: string } | undefined;
  const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
  const url = await storeService.uploadStoreLogo(req.user.userId, file, storeId);
  res.json({ url });
});

export const uploadStoreBanner = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as { buffer?: Buffer; mimetype?: string; originalname?: string } | undefined;
  const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
  const url = await storeService.uploadStoreBanner(req.user.userId, file, storeId);
  res.json({ url });
});

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = ((req as any).files as Array<{ buffer?: Buffer; mimetype?: string; originalname?: string }> | undefined) || [];
  const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
  const urls = await storeService.uploadProductImages(req.user.userId, files, storeId);
  res.json({ urls });
});
