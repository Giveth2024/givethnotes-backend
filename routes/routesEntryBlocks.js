const express = require('express');
const router = express.Router();
const db = require('../config/db');

const ALLOWED_TYPES = [
  'heading',
  'notes',
  'points',
  'attachment',
  'reference',
];

/* ======================================================
   POST /api/entry-blocks
====================================================== */
router.post('/entry-blocks', (req, res) => {
  const { entry_id, type, position, content } = req.body;

  if (!entry_id || !type || !position || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid block type' });
  }

  // GMT+3 timestamp
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const created_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  const sql = `
    INSERT INTO entry_blocks
      (entry_id, type, position, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [entry_id, type, position, JSON.stringify(content), created_at],
    (err, result) => {
      if (err) {
        console.error('❌ Create entry block error:', err.message);
        return res.status(500).json({ message: 'Failed to create entry block' });
      }

      res.status(201).json({
        id: result.insertId,
        entry_id,
        type,
        position,
        content,
        created_at,
      });
    }
  );
});

/* ======================================================
   GET /api/entry-blocks?entry_id=1
====================================================== */
router.get('/entry-blocks', (req, res) => {
  const { entry_id } = req.query;

  if (!entry_id) {
    return res.status(400).json({ message: 'entry_id is required' });
  }

  const sql = `
    SELECT id, entry_id, type, position, content, created_at, updated_at
    FROM entry_blocks
    WHERE entry_id = ?
    ORDER BY position ASC
  `;

  db.query(sql, [entry_id], (err, results) => {
    if (err) {
      console.error('❌ Fetch entry blocks error:', err.message);
      return res.status(500).json({ message: 'Failed to fetch entry blocks' });
    }

    // Parse JSON content
    const blocks = results.map((row) => ({
      ...row,
      content: row.content,
    }));

    res.json(blocks);
  });
});

/* ======================================================
   PUT /api/entry-blocks/:id
====================================================== */
router.put('/entry-blocks', (req, res) => {
  const { entry_id, position, content } = req.body;

  if (!entry_id || !position || !content) {
    return res.status(400).json({ message: 'entry_id, position and content are required' });
  }

  // GMT+3 timestamp
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const updated_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  const sql = `
    UPDATE entry_blocks
    SET content = ?, updated_at = ?
    WHERE entry_id = ? AND position = ?
  `;

  db.query(
    sql,
    [JSON.stringify(content), updated_at, entry_id, position],
    (err, result) => {
      if (err) {
        console.error('❌ Update block error:', err.message);
        return res.status(500).json({ message: 'Failed to update block' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Block not found at that position' });
      }

      res.json({
        entry_id,
        position,
        content,
        updated_at,
      });
    }
  );
});


/* ======================================================
   DELETE /api/entry-blocks/:id
====================================================== */
router.delete('/entry-blocks', (req, res) => {
  const { entry_id, position } = req.body;

  if (!entry_id || !position) {
    return res.status(400).json({ message: 'entry_id and position are required' });
  }

  // 1️⃣ Delete the block
  const deleteSql = `
    DELETE FROM entry_blocks
    WHERE entry_id = ? AND position = ?
  `;

  db.query(deleteSql, [entry_id, position], (err, result) => {
    if (err) {
      console.error('❌ Delete block error:', err.message);
      return res.status(500).json({ message: 'Failed to delete block' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Block not found at that position' });
    }

    // 2️⃣ Shift remaining blocks UP
    const reorderSql = `
      UPDATE entry_blocks
      SET position = position - 1
      WHERE entry_id = ? AND position > ?
    `;

    db.query(reorderSql, [entry_id, position], (err) => {
      if (err) {
        console.error('❌ Reorder error:', err.message);
      }

      res.json({ message: 'Block deleted and positions updated' });
    });
  });
});


module.exports = router;
