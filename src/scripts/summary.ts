import { allQuery, initDb } from '../db';

// 48. Create Daily Traffic and Outcome Summary Script
const generateSummary = async () => {
  try {
    await initDb();
    
    console.log('--- Daily Traffic Summary ---');
    
    // Total clicks today
    const totalClicks = await allQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM tracking_events WHERE date(created_at) = date('now')`
    );
    
    // Outcomes
    const outcomes = await allQuery<{ outcome: string; count: number }>(
      `SELECT outcome, COUNT(*) as count FROM tracking_events WHERE date(created_at) = date('now') GROUP BY outcome`
    );
    
    console.log(`Total Clicks Today: ${totalClicks[0]?.count || 0}`);
    
    console.log('Outcomes:');
    outcomes.forEach(o => {
      console.log(`- ${o.outcome}: ${o.count}`);
    });
    
    // Average Latency
    const latency = await allQuery<{ avg: number }>(
      `SELECT AVG(latency_ms) as avg FROM tracking_events WHERE date(created_at) = date('now')`
    );
    
    console.log(`Average Latency: ${latency[0]?.avg?.toFixed(2) || 0}ms`);
    
    console.log('-----------------------------');
  } catch (error) {
    console.error('Summary Error:', error);
  }
};

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSummary();
}
