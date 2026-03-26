import { Router, Request, Response } from 'express';
import { getQuery } from '../db';

const router = Router();

// 30. Implement Server Health Check and Status Endpoint
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Ping database
    await getQuery('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Health Check Error:', error);
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

export default router;
