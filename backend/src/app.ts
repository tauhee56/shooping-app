import express, { Express, Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/products.routes';
import storeRoutes from './modules/stores/stores.routes';
import orderRoutes from './modules/orders/orders.routes';
import messageRoutes from './modules/messages/messages.routes';
import cartRoutes from './modules/cart/cart.routes';
import addressRoutes from './modules/addresses/addresses.routes';
import paymentsRoutes from './modules/payments/payments.routes';

import { httpLogger } from './common/logging/logger';

import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp(options: { mongoConnected: boolean }): Express {
  const app = express();

  app.use(cors());
  app.use(httpLogger);
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        if (req.originalUrl === '/api/payments/webhook') {
          req.rawBody = buf;
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/addresses', addressRoutes);
  app.use('/api/payments', paymentsRoutes);

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'Backend is running',
      db: options.mongoConnected ? 'MongoDB' : 'In-Memory Mock DB',
    });
  });

  app.get('/api/db-status', (req: Request, res: Response) => {
    const mockDB = require('../db/mockDB');
    if (options.mongoConnected) {
      res.json({
        database: 'MongoDB',
        status: 'connected',
        mockData: mockDB.stats(),
      });
      return;
    }

    res.json({
      database: 'In-Memory Mock DB',
      status: 'active',
      data: mockDB.stats(),
      note: 'MongoDB not available - using in-memory storage',
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
