const db = require('../config/db');

/**
 * Updates the journal_entries table timestamp
 * @param {number} entryId - The ID of the journal entry
 * @param {string} timestamp - GMT+3 formatted string
 */
const logEntryActivities = (entryId, timestamp) => {
  const sql = `UPDATE journal_entries SET updated_at = ? WHERE id = ?`;

  db.query(sql, [timestamp, entryId], (err, result) => {
    if (err) {
      console.error('❌ Failed to log journal activity:', err.message);
    } else {
      console.log(`✅ Journal entry ${entryId} updated_at synced.`);
    }
  });
};

module.exports = { logEntryActivities };