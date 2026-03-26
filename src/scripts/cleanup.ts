import { runQuery, initDb } from '../db';

// 46. Implement Logging Rotation and Clean-up Policy
const cleanupLogs = async () => {
  try {
    await initDb();
    
    console.log('Starting Log Cleanup...');
    
    // Delete tracking events older than 30 days
    await runQuery(`
      DELETE FROM tracking_events
      WHERE created_at < date('now', '-30 days')
    `);
    
    console.log('Log Cleanup Completed Successfully.');
  } catch (error) {
    console.error('Cleanup Error:', error);
  }
};

import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cleanupLogs();
}
