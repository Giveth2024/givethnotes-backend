// functions/runDailyJournalJob.js
const db = require('../config/db');

async function runDailyJournalJobIfNeeded() {
  const today = new Date().toISOString().slice(0, 10);

  const [rows] = await db.query(
    'SELECT last_run FROM system_jobs WHERE job_name = ?',
    ['daily_journal_entries']
  );

  const lastRun = rows[0]?.last_run;

  // Already ran today → do nothing
  if (lastRun === today) return;

  console.log('🕛 Running daily journal job...');

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

  await db.query(
    'UPDATE system_jobs SET last_run = ? WHERE job_name = ?',
    [today, 'daily_journal_entries']
  );

  console.log('✅ Daily journal job completed');
}

module.exports = { runDailyJournalJobIfNeeded };
