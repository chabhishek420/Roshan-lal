import { runQuery, initDb } from './index';

// 33. Implement Database Schema Migration and Seeding Script
const seedDatabase = async () => {
  try {
    console.log('Starting Database Seeding...');
    await initDb();

    // Insert test campaign
    await runQuery(`
      INSERT OR IGNORE INTO campaigns (campaign_id, offer_url, status, safe_page_type, redirect_type)
      VALUES ('test_camp_1', 'https://example.com/offer', 'active', 'google_404', '302')
    `);

    // Insert typosquat campaign
    await runQuery(`
      INSERT OR IGNORE INTO campaigns (campaign_id, offer_url, status, safe_page_type, redirect_type)
      VALUES ('typosquat_camp', 'https://hostinger.com?REFERRALCODE=1REQUIREFOR51', 'active', 'google_404', 'js_refresh')
    `);

    // Insert test publisher
    await runQuery(`
      INSERT OR IGNORE INTO publishers (pub_id, api_key, is_active)
      VALUES ('test_pub_1', 'secret_key_123', 1)
    `);

    console.log('Database Seeding Completed Successfully.');
  } catch (error) {
    console.error('Database Seeding Error:', error);
  }
};

import { fileURLToPath } from 'url';

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
