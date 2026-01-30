import { randomUUID } from 'crypto';
import pino from 'pino';
import pinoHttp from 'pino-http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const headerId = Array.isArray(existing) ? existing[0] : existing;
    const id = headerId || randomUUID();

    res.setHeader('x-request-id', id);
    return id;
  },
});
