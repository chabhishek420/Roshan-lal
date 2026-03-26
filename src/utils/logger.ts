import { Request, Response, NextFunction } from 'express';

// 31. Add Request Context Logger for Debugging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.ip || 'unknown';
    // Mask IP for privacy
    const maskedIp = typeof ip === 'string' ? ip.replace(/\.\d+$/, '.xxx') : 'unknown';
    
    console.log(`[${new Date().toISOString()}] [${req.click_id || 'NO_ID'}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - IP: ${maskedIp}`);
  });
  
  next();
};

// 32. Standardize Internal Error Codes and Messages
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] [${req.click_id || 'NO_ID'}] Error:`, err);
  
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).send(err.message);
  }
  
  // Default to 200 OK with empty response for TDS stealth
  res.status(200).send('');
};
