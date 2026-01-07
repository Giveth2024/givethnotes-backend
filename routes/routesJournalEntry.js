const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
router.get('/journal-entries/', (req, res) => {
  const user_id = 1; // TEMP: no auth
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

  db.query(sql, [user_id, career_path_id], (err, results) => {
    if (err) {
      console.error('❌ Fetch journal entries error:', err.message);
      return res.status(500).json({ message: 'Failed to fetch journal entries' });
    }

    res.json(results);
  });
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

/* ======================================================
   PUT /api/journal-entries/:id
====================================================== */
router.put('/journal-entries/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;
  const { entry_date } = req.body;

  if (!entry_date) {
    return res.status(400).json({ message: 'entry_date is required' });
  }

  // GMT+3 timestamp
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const updated_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  const sql = `
    UPDATE journal_entries
    SET entry_date = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [entry_date, updated_at, id, user_id], (err, result) => {
    if (err) {
      console.error('❌ Update journal entry error:', err.message);
      return res.status(500).json({ message: 'Failed to update journal entry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({
      id: parseInt(id),
      entry_date,
      updated_at,
    });
  });
});

/* ======================================================
   DELETE /api/journal-entries/:id
====================================================== */
router.delete('/journal-entries/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;

  const sql = `
    DELETE FROM journal_entries
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [id, user_id], (err, result) => {
    if (err) {
      console.error('❌ Delete journal entry error:', err.message);
      return res.status(500).json({ message: 'Failed to delete journal entry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ message: 'Journal entry deleted successfully' });
  });
});

module.exports = router;
