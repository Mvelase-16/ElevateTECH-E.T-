const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { computeSlotsWithStatus } = require('../utils/slotGenerator');

// GET /api/time-slots
router.get('/', async (req, res) => {
  try {
    let rawSlots = [];

    if (db.isConnected()) {
      rawSlots = await db.query(
        'SELECT id, slot_time, start_time, end_time, max_capacity, current_bookings, is_active FROM time_slots WHERE is_active = TRUE ORDER BY id ASC'
      );
    } else {
      rawSlots = db.memoryStore.timeSlots;
    }

    const slotsWithStatus = computeSlotsWithStatus(rawSlots || []);
    
    res.json(slotsWithStatus);
  } catch (err) {
    console.error('Time slots error:', err);
    res.status(500).json({ error: 'Failed to retrieve pickup time slots.' });
  }
});

module.exports = router;
