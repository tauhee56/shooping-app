import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/http/ApiError';
import { logger } from '../common/logging/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const apiError = err instanceof ApiError ? err : undefined;
  const statusCode = apiError?.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const log = (req as any).log || logger;
  log.error(
    {
      statusCode,
      details: apiError?.details,
      err,
    },
    apiError?.message || err?.message || 'Server Error'
  );

  res.status(statusCode).json({
    message: apiError?.message || err?.message || 'Server Error',
    ...(process.env.NODE_ENV !== 'production' && apiError?.details !== undefined
      ? { details: apiError.details }
      : {}),
  });
}
