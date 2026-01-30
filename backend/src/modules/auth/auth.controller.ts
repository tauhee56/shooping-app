import { Request, Response } from 'express';
import { asyncHandler } from '../../common/http/asyncHandler';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.json(result);
});

export const firebaseAuth = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.firebaseAuth(req.body);
  res.json(result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user.userId);
  res.json(user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user.userId, req.body);
  res.json(user);
});

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as { buffer?: Buffer; mimetype?: string; originalname?: string } | undefined;
  const url = await authService.uploadProfileImage(req.user.userId, file);
  res.json({ url });
});

export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.followUser(req.user.userId, req.params.userId as any);
  res.json(result);
});
