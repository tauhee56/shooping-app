import mongoose from 'mongoose';

export async function connectMongo(mongoUri: string | undefined): Promise<boolean> {
  const uri = mongoUri || 'mongodb://localhost:27017/test';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 } as any);
    return true;
  } catch {
    return false;
  }
}
