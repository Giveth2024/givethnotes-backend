
const db = require('../config/db');

async function getUserIdFromRequest(req) {
  // requireAuth already guaranteed auth
  const clerkUserId = req.auth?.userId;

  if (!clerkUserId) {
    throw new Error('Unauthenticated');
  }

  const [rows] = await db.query(
    'SELECT id FROM users WHERE clerk_user_id = ?',
    [clerkUserId]
  );

  if (rows.length === 0) {
    throw new Error('User not found in database');
  }

  return rows[0].id;
}



module.exports = { getUserIdFromRequest };
