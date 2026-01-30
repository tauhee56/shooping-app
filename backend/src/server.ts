import 'dotenv/config';

import { env } from './config/env';
import { connectMongo } from './config/db';
import { createApp } from './app';
import { attachSocketServer, createHttpServer } from './realtime/socket';

async function main(): Promise<void> {
  const mongoConnected = await connectMongo(env.MONGODB_URI);
  if (mongoConnected) {
    console.log('✅ MongoDB connected');
  } else {
    console.warn('⚠️  MongoDB connection failed - using in-memory database');
  }

  const app = createApp({ mongoConnected });

  const httpServer = createHttpServer(app);
  attachSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📍 Health: http://localhost:${env.PORT}/api/health`);
  });
}

main().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
