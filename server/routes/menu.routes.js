const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole, optionalToken } = require('../middleware/auth.middleware');

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM categories ORDER BY id ASC');
      return res.json(rows);
    }
    res.json(db.memoryStore.categories);
  } catch (err) {
    res.json(db.SEED_CATEGORIES);
  }
});

// GET /api/menu
router.get('/', async (req, res) => {
  const { category, search } = req.query;

  try {
    let items = [];

    if (db.isConnected()) {
      let sql = 'SELECT * FROM menu_items WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND category_slug = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      sql += ' ORDER BY id ASC';
      items = await db.query(sql, params);
    } else {
      items = db.memoryStore.menuItems;
      if (category && category !== 'all') {
        items = items.filter(item => item.category_slug === category);
      }
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        );
      }
    }

    res.json(items);
  } catch (err) {
    console.error('Menu error:', err);
    res.status(500).json({ error: 'Failed to retrieve cafeteria menu.' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  try {
    let item = null;
    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
      if (rows && rows.length > 0) item = rows[0];
    } else {
      item = db.memoryStore.menuItems.find(i => i.id === itemId);
    }

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve meal item.' });
  }
});

// PATCH /api/menu/:id/toggle (In Stock / Sold Out toggle)
router.patch('/:id/toggle', verifyToken, requireRole(['vendor', 'admin']), async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    if (db.isConnected()) {
      await db.query('UPDATE menu_items SET is_available = NOT is_available WHERE id = ?', [itemId]);
      const [updated] = await db.query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
      return res.json({ message: 'Stock status updated successfully.', item: updated });
    } else {
      const item = db.memoryStore.menuItems.find(i => i.id === itemId);
      if (item) {
        item.is_available = !item.is_available;
        return res.json({ message: 'Stock status updated successfully.', item });
      }
    }
    res.status(404).json({ error: 'Item not found.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock status.' });
  }
});

// POST /api/menu (Add a new dish)
router.post('/', verifyToken, requireRole(['vendor', 'admin']), async (req, res) => {
  const { category_slug, name, description, price, image_url } = req.body;

  if (!category_slug || !name || !price) {
    return res.status(400).json({ error: 'Category, meal name, and price are required.' });
  }

  const newItem = {
    category_slug,
    name: name.trim(),
    description: (description || '').trim(),
    price: parseFloat(price),
    image_url: image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    is_available: true
  };

  try {
    if (db.isConnected()) {
      const result = await db.query(
        `INSERT INTO menu_items (category_slug, name, description, price, image_url, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newItem.category_slug, newItem.name, newItem.description, newItem.price, newItem.image_url, true]
      );
      newItem.id = result.insertId;
    } else {
      newItem.id = db.memoryStore.menuItems.length + 1;
      db.memoryStore.menuItems.push(newItem);
    }

    res.status(201).json({ message: 'Dish added to cafeteria menu!', item: newItem });
  } catch (err) {
    console.error('Add menu error:', err);
    res.status(500).json({ error: 'Failed to add dish.' });
  }
});

module.exports = router;
