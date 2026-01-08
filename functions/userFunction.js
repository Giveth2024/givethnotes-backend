const db = require('../config/db');

async function findOrCreateUser({ clerkUserId, email }) {
  const [existing] = await db.query(
    'SELECT * FROM users WHERE clerk_user_id = ?',
    [clerkUserId]
  );

  if (existing.length > 0) {
    return {
      status: 'exists',
      user: existing[0],
    };
  }

  const createdAt = new Date(
    Date.now() 
  );

  const [result] = await db.query(
    `INSERT INTO users (clerk_user_id, email, created_at)
     VALUES (?, ?, ?)`,
    [clerkUserId, email, createdAt]
  );

  return {
    status: 'created',
    user: {
      id: result.insertId,
      clerk_user_id: clerkUserId,
      email,
      created_at: createdAt,
    },
  };
}

module.exports = { findOrCreateUser };
