import Database from 'better-sqlite3';
import { config } from '../config';

// Initialize Database Connection
export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
console.log('Database Connected to', config.dbPath);

// Statement cache for better performance
const statementCache = new Map<string, any>();

const getStatement = (sql: string) => {
  let stmt = statementCache.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    statementCache.set(sql, stmt);
  }
  return stmt;
};

// Utility to run queries with promises
export const runQuery = async (sql: string, params: any[] = []): Promise<void> => {
  getStatement(sql).run(...params);
};

export const getQuery = async <T>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return getStatement(sql).get(...params) as T | undefined;
};

export const allQuery = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return getStatement(sql).all(...params) as T[];
};

// Initialize Schema
export const initDb = async () => {
  try {
    // 3. Create Campaign Database Model and Schema
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id TEXT UNIQUE NOT NULL,
        offer_url TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        safe_page_type TEXT DEFAULT 'google_404',
        redirect_type TEXT DEFAULT '302',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add redirect_type to existing campaigns table if it doesn't exist
    try {
      await runQuery('ALTER TABLE campaigns ADD COLUMN redirect_type TEXT DEFAULT "302"');
    } catch (e) {
      // Column already exists
    }

    // 4. Create Publisher Database Model and Schema
    await runQuery(`
      CREATE TABLE IF NOT EXISTS publishers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pub_id TEXT UNIQUE NOT NULL,
        api_key TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Create Tracking Events Database Model and Schema
    await runQuery(`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        click_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        campaign_id TEXT,
        pub_id TEXT,
        ip TEXT,
        user_agent TEXT,
        outcome TEXT,
        trigger_reason TEXT,
        latency_ms INTEGER,
        payout REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add payout to existing tracking_events table if it doesn't exist
    try {
      await runQuery('ALTER TABLE tracking_events ADD COLUMN payout REAL DEFAULT 0');
    } catch (e) {
      // Column already exists
    }

    // Create indexes for performance
    await runQuery('CREATE INDEX IF NOT EXISTS idx_campaign_id ON campaigns(campaign_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_pub_id ON publishers(pub_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_click_id ON tracking_events(click_id)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_visitor_id ON tracking_events(visitor_id)');

    console.log('Database Schema Initialized');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }
};
