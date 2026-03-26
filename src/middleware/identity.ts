import { Request, Response, NextFunction } from 'express';
import { generateClickId } from '../utils/identity';
import { config } from '../config';

// Extend Express Request to include visitor_id and click_id
declare global {
  namespace Express {
    interface Request {
      visitor_id: string;
      click_id: string;
    }
  }
}

// 10. Implement Visitor Identity Service and Logic
// 11. Implement Cookie Management for asr_vid Persistence
export const identityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for existing visitor ID in cookies
  let visitorId = req.cookies['asr_vid'];

  if (!visitorId) {
    // Generate new visitor ID (using the same format as click ID for consistency)
    visitorId = generateClickId();
    
    // Set cookie for persistence
    res.cookie('asr_vid', visitorId, {
      maxAge: config.cookieMaxAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction, // Only send over HTTPS in production
    });
  }

  // Generate a unique click ID for this specific request
  const clickId = generateClickId();

  // Attach to request context
  req.visitor_id = visitorId;
  req.click_id = clickId;

  next();
};
