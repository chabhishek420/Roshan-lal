import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include isBot
declare global {
  namespace Express {
    interface Request {
      isBot: boolean;
      botTrigger?: string;
    }
  }
}

// 35. Implement User-Agent Based Bot Filtering Middleware
// 36. Implement Headless Browser and Automation Detection
// 37. Add Empty Referrer and Direct Traffic Check
// 38. Implement Bot Flagging and Request Context Persistence
// 39. Implement Datacenter IP Range Check Stub
export const botFilterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const referer = req.headers['referer'] || '';
  const ip = req.ip || '';

  req.isBot = false;

  // 1. User-Agent Check
  const botPatterns = ['googlebot', 'bingbot', 'curl', 'wget', 'python', 'slurp', 'yandex', 'spider', 'crawler', 'node'];
  for (const pattern of botPatterns) {
    if (ua.includes(pattern)) {
      req.isBot = true;
      req.botTrigger = `UA_Match_${pattern}`;
      return next();
    }
  }

  // 2. Headless Browser Check
  const headlessPatterns = ['headlesschrome', 'puppeteer', 'selenium', 'phantomjs'];
  for (const pattern of headlessPatterns) {
    if (ua.includes(pattern)) {
      req.isBot = true;
      req.botTrigger = `Headless_Match_${pattern}`;
      return next();
    }
  }

  // 3. Empty Referrer Check (Configurable per campaign, but we'll flag it here)
  // For now, we'll just log it, but not strictly block unless configured
  // Let's say if it's completely empty and UA looks generic, we flag it.
  if (!referer && ua.includes('mozilla') && !ua.includes('chrome') && !ua.includes('safari')) {
    req.isBot = true;
    req.botTrigger = 'Empty_Referrer_Generic_UA';
    return next();
  }

  // 4. Datacenter IP Range Check Stub
  // In a real scenario, we'd check against a MaxMind DB or similar.
  // Here we use a basic prefix match for common cloud providers.
  const datacenterIps = [
    '1.1.1.1', '8.8.8.8', // Cloudflare, Google DNS
    '34.', '35.', '104.', // Common GCP/Cloudflare
    '52.', '54.', '3.',   // Common AWS
    '20.', '40.', '13.',  // Common Azure
    '167.', '138.', '159.'// DigitalOcean
  ];
  if (typeof ip === 'string' && datacenterIps.some(dc => ip.startsWith(dc))) {
    req.isBot = true;
    req.botTrigger = 'Datacenter_IP';
    return next();
  }

  next();
};
