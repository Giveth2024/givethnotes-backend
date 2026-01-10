const db = require('../config/db');
const { runDailyJournalJobIfNeeded } = require('../functions/runDailyJournalJob');

const logger = async (req, res, next) => {

  try {
    await runDailyJournalJobIfNeeded();
  } catch (err) {
    console.error('Daily job failed:', err.message);
  }

  const now = new Date();

  // GMT+3 time
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const formattedTime = gmtPlus3
    .toISOString()
    .replace('T', ' ')
    .split('.')[0];

  // Get real IP address
  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.ip ||
    req.socket.remoteAddress;

  console.log(
    `[${formattedTime} GMT+3] ${req.method} ${req.originalUrl} | IP: ${ipAddress}`
  );

  // Save to DB
  const sql = `
    INSERT INTO logs (method, endpoint, ip_address, created_at)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [req.method, req.originalUrl, ipAddress, formattedTime],
    (err) => {
      if (err) console.error('❌ Log DB error:', err.message);
    }
  );

  next();
};

module.exports = logger;
