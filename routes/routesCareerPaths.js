const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getUserIdFromRequest } = require('../functions/authUser');

router.post('/career-paths', async (req, res) => {
  try {
    const user_id = await getUserIdFromRequest(req);
    
    const { title, description, image_url } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }


    // Use UTC +3 safely
    const created_at = new Date(Date.now() + 3 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const sql = `
      INSERT INTO career_paths
        (user_id, title, description, image_url, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      user_id,
      title.trim(),
      description || null,
      image_url || null,
      created_at,
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        user_id,
        title,
        description,
        image_url,
        created_at,
      },
    });
  } catch (err) {
    console.error('❌ Create career path error:', err.message);

    if (err.message === 'Unauthenticated') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(500).json({
      message: 'Failed to create career path',
    });
  }
});


// GET all career paths
router.get('/career-paths', async (req, res) => {
  try
  {
    const user_id = await getUserIdFromRequest(req); // authenticated user
  
    const sql = `
      SELECT 
        id,
        title,
        description,
        image_url,
        created_at,
        updated_at
      FROM career_paths
      WHERE user_id = ?
      ORDER BY id DESC
    `;
  
    const [results] = await db.query(sql, [user_id]);

    res.json(results);
  }
  catch(err)
  {
    console.error('❌ Auth error:', err.message);
    res.status(401).json({ message: err.message });
  }
});

// GET single career path by id
router.get('/career-paths/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;

  const sql = `
    SELECT id, title, description, image_url, created_at, updated_at
    FROM career_paths
    WHERE user_id = ? AND id = ?
    LIMIT 1
  `;

  db.query(sql, [user_id, id], (err, results) => {
    if (err) {
      console.error('❌ Fetch career path error:', err.message);
      return res.status(500).json({ message: 'Failed to fetch career path' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Career path not found' });
    }

    res.json(results[0]);
  });
});

// PUT update career path
router.put('/career-paths/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;
  const { title, description, image_url } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  // GMT+3 timestamp for updated_at
  const now = new Date();
  const gmtPlus3 = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const updated_at = gmtPlus3.toISOString().replace('T', ' ').split('.')[0];

  const sql = `
    UPDATE career_paths
    SET title = ?, description = ?, image_url = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [title, description || null, image_url || null, updated_at, id, user_id], (err, result) => {
    if (err) {
      console.error('❌ Update career path error:', err.message);
      return res.status(500).json({ message: 'Failed to update career path' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Career path not found' });
    }

    res.json({
      id: parseInt(id),
      title,
      description,
      image_url,
      updated_at
    });
  });
});

// DELETE career path
router.delete('/career-paths/:id', (req, res) => {
  const user_id = 1; // TEMP: no auth
  const { id } = req.params;

  const sql = `
    DELETE FROM career_paths
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [id, user_id], (err, result) => {
    if (err) {
      console.error('❌ Delete career path error:', err.message);
      return res.status(500).json({ message: 'Failed to delete career path' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Career path not found' });
    }

    res.json({ message: 'Career path deleted successfully' });
  });
});


module.exports = router;
