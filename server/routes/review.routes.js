const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');

// GET /api/reviews
router.get('/', async (req, res) => {
  try {
    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM reviews ORDER BY id DESC LIMIT 20');
      return res.json(rows);
    }
    res.json(db.memoryStore.reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

// POST /api/reviews
router.post('/', verifyToken, async (req, res) => {
  const { order_id, rating = 5, comment = '' } = req.body;
  const customerName = req.user.name;

  if (!order_id) {
    return res.status(400).json({ error: 'Order ID is required to submit a review.' });
  }

  try {
    if (db.isConnected()) {
      await db.query(
        'INSERT INTO reviews (order_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)',
        [order_id, customerName, parseInt(rating), comment.trim()]
      );
    } else {
      db.memoryStore.reviews.unshift({
        id: db.memoryStore.reviews.length + 1,
        order_id,
        customer_name: customerName,
        rating: parseInt(rating),
        comment: comment.trim(),
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({ message: 'Thank you for your rating and feedback!' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

module.exports = router;
