const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { logEntryActivities } = require('../functions/LogActivity');
const { getUserIdFromRequest } = require('../functions/authUser');


/* ======================================================
   POST /api/entry-blocks
====================================================== */
router.post('/entry-blocks', async (req, res) => {
  try {
    const user_id = await getUserIdFromRequest(req); // authenticated user
    const { career_path_id, content } = req.body;

    if (!career_path_id || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Creating entry block for career_path_id:', career_path_id);

    // GMT+3 timestamp
    const now = new Date();
    const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const created_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  // Assume you already have: career_path_id, user_id, content, created_at
  // Goal: get latest journal entry ID for career_path_id & user_id

  const [rows] = await db.query(
    `
    SELECT id
    FROM journal_entries
    WHERE career_path_id = ? AND user_id = ?
    ORDER BY entry_date DESC, created_at DESC
    LIMIT 1
    `,
    [career_path_id, user_id]
  );

  if (rows.length === 0) {
    throw new Error('No journal entry found for this career path and user.');
  }

  // Latest journal entry ID
  const journal_id = rows[0].id;

  // Now you can insert into entry_blocks
  const [result] = await db.query(
    `
    INSERT INTO entry_blocks (entry_id, career_path_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    [journal_id, career_path_id, user_id, JSON.stringify(content), created_at]
  );

  console.log('✅ Block inserted with journal_id:', journal_id);


    // Check if insert actually happened
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No journal entry found for this career path' });
    }

    // Send response immediately
    res.status(201).json({
      id: result.insertId,
      career_path_id,
      user_id,
      content,
      created_at,
    });

    // Log activities asynchronously (fire-and-forget)
    // Fire-and-forget logging
    try {
      console.log('Logging entry activity asynchronously', journal_id, created_at);
      logEntryActivities(journal_id, created_at);
    } catch (err) {
      console.error('❌ Log activity failed:', err.message);
    }


  } catch (err) {
    console.error('❌ Create entry block error:', err.message);
    res.status(500).json({ message: 'Failed to create entry block' });
  }
});

/* ======================================================
   GET /api/entry-blocks?entry_id=1
====================================================== */
router.get('/entry-blocks', (req, res) => {
  const { entry_id } = req.query;

  console.log('Fetching blocks for entry_id:', entry_id);
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

    console.log(`✅ Fetched ${blocks.length} blocks for entry_id ${entry_id}`);

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

      // PLACE HERE:
      logEntryActivities(entry_id, updated_at);

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

    // PLACE HERE:
    logEntryActivities(entry_id, created_at);

      res.json({ message: 'Block deleted and positions updated' });
    });
  });
});


module.exports = router;
