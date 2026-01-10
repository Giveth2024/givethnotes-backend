const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getUserIdFromRequest } = require('../functions/authUser');

/* ======================================================
   POST /api/journal-entries
====================================================== */
router.post('/journal-entries/', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { career_path_id, entry_date } = req.body;

  if (!career_path_id || !entry_date) {
    return res.status(400).json({
      message: 'career_path_id and entry_date are required',
    });
  }

  // GMT+3 timestamp
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const created_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  const sql = `
    INSERT INTO journal_entries
      (career_path_id, user_id, entry_date, created_at)
    VALUES (?, ?, ?, ?)
  `;

      db.query(
        sql,
        [career_path_id, user_id, entry_date, created_at],
        (err, result) => {
          if (err) {
            // Check if the error is a duplicate entry (MySQL error code 1062)
            if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ 
                message: 'Entry date already exists for this career path' 
              });
            }
            console.error('❌ Create journal entry error:', err.message);
            return res.status(500).json({ message: 'Failed to create journal entry' });
          }

          res.status(201).json({
            id: result.insertId,
            career_path_id,
            entry_date,
            created_at,
          });
        }
      );
});

/* ======================================================
   GET /api/journal-entries?career_path_id=1
====================================================== */
router.get('/journal-entries', async (req, res) => {
  try {
    const user_id = await getUserIdFromRequest(req);
    const { career_path_id } = req.query;

    if (!career_path_id) {
      return res.status(400).json({
        message: 'career_path_id query param is required',
      });
    }

    const sql = `
      SELECT id, career_path_id, entry_date, created_at, updated_at
      FROM journal_entries
      WHERE user_id = ? AND career_path_id = ?
      ORDER BY entry_date DESC
    `;

    const [rows] = await db.query(sql, [user_id, career_path_id]);

    return res.json(rows); // ✅ ONLY data
  } catch (err) {
    console.error('❌ Journal entries error:', err.message);
    return res.status(401).json({ message: err.message });
  }
});


/* ======================================================
   GET /api/journal-entries/:id
====================================================== */
router.get('/journal-entries/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;

  const sql = `
    SELECT id, career_path_id, entry_date, created_at, updated_at
    FROM journal_entries
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  db.query(sql, [id, user_id], (err, results) => {
    if (err) {
      console.error('❌ Fetch journal entry error:', err.message);
      return res.status(500).json({ message: 'Failed to fetch journal entry' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(results[0]);
  });
});


module.exports = router;
