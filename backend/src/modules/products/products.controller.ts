import { Request, Response } from 'express';
import { ApiError } from '../../common/http/ApiError';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as productService from './products.service';

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAllProducts({
    category: req.query.category as any,
    search: req.query.search as any,
    page: req.query.page as any,
    limit: req.query.limit as any,
  });
  res.json(result);
});

export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts();
  res.json(products);
});

export const getProductsByStore = asyncHandler(async (req: Request, res: Response) => {
  const storeIdParam = (req.params as any).storeId as string | string[] | undefined;
  const storeId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
  if (!storeId) throw new ApiError(400, 'storeId is required');

  const products = await productService.getProductsByStore(storeId);
  res.json(products);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const idParam = (req.params as any).id as string | string[] | undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) throw new ApiError(400, 'Product id is required');

  const product = await productService.getProductById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

export const getLikedProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.getLikedProducts(req.user.userId);
  res.json(products);
});

export const likeProduct = asyncHandler(async (req: Request, res: Response) => {
  const idParam = (req.params as any).id as string | string[] | undefined;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) throw new ApiError(400, 'Product id is required');

  const result = await productService.toggleLikeProduct(id, req.user.userId);
  if (!result) throw new ApiError(404, 'Product not found');

  res.json(result);
});
