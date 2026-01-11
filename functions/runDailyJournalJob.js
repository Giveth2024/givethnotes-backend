// functions/runDailyJournalJob.js
const db = require('../config/db');

async function runDailyJournalJobIfNeeded() {
  const today = new Date().toISOString().slice(0, 10);

  const [rows] = await db.query(
    'SELECT last_run FROM system_jobs WHERE job_name = ?',
    ['daily_journal_entries']
  );

  const lastRun = rows[0]?.last_run;

  if (lastRun === today) return;

  console.log('🕛 Running daily journal job...');

  /* 1️⃣ Insert today’s journal entries if missing */
  await db.query(`
    INSERT INTO journal_entries (career_path_id, user_id, entry_date, created_at)
    SELECT 
      cp.id,
      cp.user_id,
      CURDATE(),
      NOW()
    FROM career_paths cp
    LEFT JOIN journal_entries je
      ON je.career_path_id = cp.id
     AND je.entry_date = CURDATE()
    WHERE je.id IS NULL
  `);

  /* 2️⃣ Get today’s entries with NULL updated_at */
  const [todayNulls] = await db.query(
    `
    SELECT id, career_path_id
    FROM journal_entries
    WHERE entry_date = CURDATE()
      AND updated_at IS NULL
    `
  );

  /* 3️⃣ For each, fetch previous updated_at and apply if exists */
  for (const row of todayNulls) {
    const { id, career_path_id } = row;

    const [prevRows] = await db.query(
      `
      SELECT updated_at
      FROM journal_entries
      WHERE career_path_id = ?
        AND updated_at IS NOT NULL
        AND entry_date < CURDATE()
      ORDER BY entry_date DESC
      LIMIT 1
      `,
      [career_path_id]
    );

    if (prevRows.length === 0) {
      // No previous activity → leave NULL
      continue;
    }

    const previousUpdatedAt = prevRows[0].updated_at;

    await db.query(
      `
      UPDATE journal_entries
      SET updated_at = ?
      WHERE id = ?
      `,
      [previousUpdatedAt, id]
    );
  }

  /* 4️⃣ Mark job as run */
  await db.query(
    'UPDATE system_jobs SET last_run = ? WHERE job_name = ?',
    [today, 'daily_journal_entries']
  );

  console.log('✅ Daily journal job completed');
}

module.exports = { runDailyJournalJobIfNeeded };
