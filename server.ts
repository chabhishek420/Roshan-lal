import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { config } from './src/config';
import { initDb } from './src/db';
import trackingRouter from './src/api/tracking';
import healthRouter from './src/api/health';
import { requestLogger, errorHandler } from './src/utils/logger';

const app = express();

// Trust proxy to correctly parse client IP from x-forwarded-for headers
app.set('trust proxy', true);

// 47. Implement Security Header Hardening (HSTS, CSP)
// Core Middleware
app.use(helmet({ 
  contentSecurityPolicy: config.isProduction ? undefined : false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
})); 
app.use(cors());
app.use(cookieParser(config.cookieSecret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 44. Implement Request Rate Limiting for Tracking Routes
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after a minute',
});

// API Routes
app.use('/', healthRouter);
app.use('/', trackingLimiter, trackingRouter);

// 23. Implement Default 200 OK Empty Response Masking
app.use('*', (req, res) => {
  res.status(200).send('');
});

app.use(errorHandler);

// Initialize DB and start server
const startServer = async () => {
  await initDb();

  // Vite middleware for development
  if (!config.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`
    =================================
       ASR TDS Server Running
       Port: ${config.port}
    =================================
    `);
  });
};

startServer();

export default app;
