import { allQuery, initDb } from '../db';

const checkDb = async () => {
  await initDb();
  const events = await allQuery('SELECT * FROM tracking_events ORDER BY id DESC LIMIT 1');
  console.log(events);
};

checkDb();
