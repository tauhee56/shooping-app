import { Request } from 'express';

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
    }
    interface Request {
      user: UserPayload;
    }
  }
}

export {};
