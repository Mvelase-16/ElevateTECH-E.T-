const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const { runMigrations } = require('./config/migrate');
const errorHandler = require('./middleware/errorHandler');

// Modular Route Handlers
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const slotsRoutes = require('./routes/slots.routes');
const ordersRoutes = require('./routes/orders.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize and migrate database schema on startup
runMigrations().catch(err => {
  console.error('Migration failed on startup:', err.message);
});

// -------------------------------------------------------------
// 1. Health & Original POC Test Route (Backward Compatible)
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database_connected: db.isConnected(),
    mode: db.isConnected() ? 'MySQL (unibites_db)' : 'In-Memory Mock Mode',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/test', async (req, res) => {
  const receivedName = req.body.name;
  if (!receivedName) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    if (db.isConnected()) {
      await db.query(
        'INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)',
        [receivedName, '', `test_${Date.now()}@wsu.ac.za`, 'testpass']
      );
    }
    res.json({ message: `Successfully saved ${receivedName} to database!` });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ message: 'Failed to save to database.' });
  }
});

// -------------------------------------------------------------
// 2. Mount Modular Application Routes
// -------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/categories', (req, res, next) => {
  // Direct category alias
  req.url = '/categories' + req.url;
  menuRoutes(req, res, next);
});
app.use('/api/menu', menuRoutes);
app.use('/api/time-slots', slotsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`\n======================================================`);
  console.log(`🍔 UniBites Server is running on http://localhost:${port}`);
  console.log(`📡 Health Check: http://localhost:${port}/api/health`);
  console.log(`======================================================\n`);
});

module.exports = app;
