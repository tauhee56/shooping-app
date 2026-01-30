import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ApiError } from './ApiError';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params && typeof req.params === 'object' ? { ...(req.params as any) } : {};
      const query = req.query && typeof req.query === 'object' && !Array.isArray(req.query) ? { ...(req.query as any) } : {};

      const parsed: any = schema.parse({
        body: req.body,
        params,
        query,
      });

      if (parsed.body !== undefined) req.body = parsed.body;

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ApiError(400, 'Validation error', err.flatten()));
        return;
      }
      next(new ApiError(400, 'Validation error', err));
    }
  };
}
