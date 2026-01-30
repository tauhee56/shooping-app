import { Request } from 'express';
import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
    }
    interface Request {
      user: UserPayload;
      log?: Logger;
    }
  }
}

export {};
