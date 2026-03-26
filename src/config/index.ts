import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: 3000,
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'asr.sqlite'),
  cookieSecret: process.env.COOKIE_SECRET || 'asr_super_secret_cookie_key',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  isProduction: process.env.NODE_ENV === 'production',
};
