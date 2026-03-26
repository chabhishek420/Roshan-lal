import { Router, Request, Response } from 'express';
import { getQuery, runQuery } from '../db';
import { identityMiddleware } from '../middleware/identity';
import { serveSafePage } from '../core/shield';
import { routeTraffic } from '../core/router';
import { requestLogger } from '../utils/logger';
import { botFilterMiddleware } from '../middleware/botFilter';

const router = Router();

// Add impression and pixel endpoints (no identity middleware needed)
router.get('/impression', (req: Request, res: Response) => {
  res.status(200).type('text/plain').send('IMP_TRACKING_DISABLED');
});

router.get('/pixel', (req: Request, res: Response) => {
  res.status(200).type('text/plain').send('bad_request');
});

// Add postback endpoint
router.all('/postback', async (req: Request, res: Response) => {
  try {
    const clickid = req.query.clickid || req.body.clickid;
    const status = req.query.status || req.body.status || 'approved';
    const payout = parseFloat((req.query.payout || req.body.payout || '0') as string);

    if (!clickid) {
      return res.status(411).send('');
    }

    // Update tracking event with conversion
    await runQuery(
      'UPDATE tracking_events SET outcome = ?, payout = ? WHERE click_id = ?',
      [`Conversion_${status}`, payout, clickid]
    );

    res.status(200).send('');
  } catch (error) {
    console.error('Postback Error:', error);
    res.status(200).send(''); // Fail silently
  }
});

// Apply identity middleware to all tracking routes
router.use(identityMiddleware);
router.use(requestLogger);
router.use(botFilterMiddleware);

// Controller for tracking logic
const handleTracking = async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const campaign_id = String(req.query.campaign_id || req.query.c || '');
    const pub_id = String(req.query.pub_id || req.query.p || '');
    const { debug, test } = req.query;

    // 21. Enable Debug and Test Parameter Bypasses
    if (debug === '1' || test === '1') {
      const lang = req.acceptsLanguages('zh-CN') ? 'zh-CN' : 'en';
      return serveSafePage(res, lang);
    }

    // 12. Implement /click.php Tracking Route Handler
    // If required parameters are missing, return 200 OK empty response
    if (!campaign_id || !pub_id) {
      return res.status(200).send('');
    }

    // 14. Implement Campaign Status Verification Logic
    const campaign = await getQuery<{ id: number; status: string; offer_url: string; safe_page_type: string; redirect_type: string }>(
      'SELECT id, status, offer_url, safe_page_type, redirect_type FROM campaigns WHERE campaign_id = ?',
      [campaign_id]
    );

    // 16. Add ADV_INACTIVE Error Response Handling
    if (!campaign || campaign.status !== 'active') {
      return res.status(200).send('ADV_INACTIVE');
    }

    // 15. Implement Publisher Authorization and Status Check
    const publisher = await getQuery<{ id: number; is_active: number }>(
      'SELECT id, is_active FROM publishers WHERE pub_id = ?',
      [pub_id]
    );

    if (!publisher || publisher.is_active === 0) {
      // Log failed authorization (to be implemented in Phase 8)
      return res.status(200).send('ADV_INACTIVE');
    }

    // 24. Implement Core Tracking Router Decision Engine
    return routeTraffic(req, res, req.isBot, campaign, startTime);
  } catch (error) {
    console.error('Tracking Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

// 13. Add /click and /go Route Aliases
router.get('/click.php', handleTracking);
router.get('/click', handleTracking);
router.get('/go', handleTracking);

export default router;
