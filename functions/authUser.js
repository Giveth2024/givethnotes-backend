
const db = require('../config/db');

async function getUserIdFromRequest(req) {
  // requireAuth already guaranteed auth
  const clerkUserId = req.auth().userId;

  if (!clerkUserId) {
    throw new Error('Unauthenticated');
  }

  const [rows] = await db.query(
    'SELECT id FROM users WHERE clerk_user_id = ?',
    [clerkUserId]
  );

  console.log('Fetched user from DB:', rows);
  console.log('Row Id', rows[0].id);

  if (rows.length === 0) {
    throw new Error('User not found in database');
  }

  return rows[0].id;
}



module.exports = { getUserIdFromRequest };
