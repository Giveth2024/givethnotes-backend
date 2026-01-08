const { getAuth } = require('@clerk/express');
const db = require('../config/db');

async function getUserIdFromRequest(req) {
  const { userId: clerkUserId } = getAuth(req);

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

  return rows[0].id; // ✅ returns 1 in your case
}


module.exports = { getUserIdFromRequest };
