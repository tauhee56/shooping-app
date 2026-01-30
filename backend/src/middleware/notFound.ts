import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}
