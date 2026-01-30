type NodeEnv = 'development' | 'test' | 'production';

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return v;
}

function requireEnv(name: string): string {
  const v = getEnv(name);
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  NODE_ENV: (getEnv('NODE_ENV', 'development') as NodeEnv) || 'development',
  PORT: Number(getEnv('PORT', '5000')),
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
};
