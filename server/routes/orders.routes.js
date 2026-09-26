const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { verifyAndCalculateOrder } = require('../utils/orderCalculator');
const { computeSlotsWithStatus } = require('../utils/slotGenerator');

// POST /api/orders (Place an order with atomic capacity reservation)
router.post('/', verifyToken, async (req, res) => {
  const {
    pickup_time,
    payment_method = 'Card',
    customer_phone = '',
    items = []
  } = req.body;

  const userId = req.user.id;
  const customerName = req.user.name;
  const customerEmail = req.user.email;
  const phone = customer_phone || req.user.phone || '0812345678';

  // 1. Validation
  if (!pickup_time || !pickup_time.trim()) {
    return res.status(400).json({ error: 'Please select a valid pickup time window.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cannot place an empty order. Please add meals to your cart.' });
  }

  try {
    // 2. Authoritative backend recalculation of item prices and availability
    const calculation = await verifyAndCalculateOrder(items);

    // 3. Verify pickup slot exists, has capacity, and has not passed
    let selectedSlot = null;

    if (db.isConnected()) {
      const slotRows = await db.query(
        'SELECT * FROM time_slots WHERE slot_time = ? AND is_active = TRUE',
        [pickup_time.trim()]
      );
      if (!slotRows || slotRows.length === 0) {
        return res.status(400).json({ error: 'The selected pickup time slot is invalid or no longer active.' });
      }
      const [slotWithStatus] = computeSlotsWithStatus(slotRows);
      selectedSlot = slotWithStatus;
    } else {
      const rawSlot = db.memoryStore.timeSlots.find(s => s.slot_time === pickup_time.trim());
      if (!rawSlot) {
        return res.status(400).json({ error: 'The selected pickup time slot is invalid.' });
      }
      const [slotWithStatus] = computeSlotsWithStatus([rawSlot]);
      selectedSlot = slotWithStatus;
    }

    if (selectedSlot.is_past) {
      return res.status(400).json({ 
        error: `The ${pickup_time} pickup time slot has already passed for today. Please select a future time.` 
      });
    }

    if (selectedSlot.is_full) {
      return res.status(400).json({ 
        error: `The ${pickup_time} pickup window has reached its maximum order capacity (15/15). Please choose another time.` 
      });
    }

    // 4. Generate unique Order Number and 4-digit Collection PIN
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `UB-${randomNum}`;
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    const qrCodeData = `UB:${orderNumber}:${pickupPin}`;

    const paymentStatus = payment_method === 'Cash on Pickup' ? 'cash_on_pickup' : 'paid';

    // 5. Database Transaction / Reservation
    if (db.isConnected()) {
      const pool = await db.getPool();
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Atomic capacity reservation
        const [updateResult] = await connection.query(
          'UPDATE time_slots SET current_bookings = current_bookings + 1 WHERE id = ? AND current_bookings < max_capacity',
          [selectedSlot.id]
        );

        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ 
            error: 'This pickup slot just reached capacity a moment ago. Please select another slot.' 
          });
        }

        // Insert Order
        const [orderResult] = await connection.query(
          `INSERT INTO orders 
            (user_id, order_number, pickup_pin, customer_name, customer_email, customer_phone, 
             pickup_time, payment_method, payment_status, order_status, subtotal, service_fee, total_amount, qr_code_data)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            orderNumber,
            pickupPin,
            customerName,
            customerEmail,
            phone,
            pickup_time.trim(),
            payment_method,
            paymentStatus,
            'received',
            calculation.subtotal,
            calculation.serviceFee,
            calculation.totalAmount,
            qrCodeData
          ]
        );

        const orderId = orderResult.insertId;

        // Insert Order Items
        for (const it of calculation.verifiedItems) {
          await connection.query(
            `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, it.menu_item_id, it.item_name, it.quantity, it.unit_price, it.subtotal]
          );
        }

        await connection.commit();
        connection.release();

        const createdOrder = {
          id: orderId,
          order_number: orderNumber,
          pickup_pin: pickupPin,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: phone,
          pickup_time: pickup_time.trim(),
          payment_method,
          payment_status: paymentStatus,
          order_status: 'received',
          subtotal: calculation.subtotal,
          service_fee: calculation.serviceFee,
          total_amount: calculation.totalAmount,
          qr_code_data: qrCodeData,
          items: calculation.verifiedItems,
          created_at: new Date().toISOString()
        };

        console.log(`🛒 Order created! #${orderNumber} for ${customerName} [PIN: ${pickupPin}]`);

        return res.status(201).json({
          message: 'Order placed successfully!',
          order: createdOrder
        });

      } catch (txErr) {
        await connection.rollback();
        connection.release();
        throw txErr;
      }
    } else {
      // In-memory fallback
      const slot = db.memoryStore.timeSlots.find(s => s.id === selectedSlot.id);
      if (slot) slot.current_bookings += 1;

      const createdOrder = {
        id: db.memoryStore.orders.length + 1,
        user_id: userId,
        order_number: orderNumber,
        pickup_pin: pickupPin,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: phone,
        pickup_time: pickup_time.trim(),
        payment_method,
        payment_status: paymentStatus,
        order_status: 'received',
        subtotal: calculation.subtotal,
        service_fee: calculation.serviceFee,
        total_amount: calculation.totalAmount,
        qr_code_data: qrCodeData,
        items: calculation.verifiedItems,
        created_at: new Date().toISOString()
      };

      db.memoryStore.orders.unshift(createdOrder);

      return res.status(201).json({
        message: 'Order placed successfully!',
        order: createdOrder
      });
    }

  } catch (err) {
    console.error('Order placement error:', err);
    res.status(400).json({ error: err.message || 'Failed to place order.' });
  }
});

// GET /api/orders/my-orders (Authenticated user's orders)
router.get('/my-orders', verifyToken, async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user.id;

  try {
    if (db.isConnected()) {
      const orders = await db.query(
        `SELECT * FROM orders 
         WHERE user_id = ? OR customer_email = ? 
         ORDER BY id DESC LIMIT 50`,
        [userId, userEmail]
      );

      for (const ord of orders) {
        const items = await db.query(
          `SELECT oi.*, mi.image_url 
           FROM order_items oi 
           LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = ?`,
          [ord.id]
        );
        ord.items = items || [];
      }

      return res.json(orders);
    }

    const userOrders = db.memoryStore.orders.filter(
      o => o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail.toLowerCase())
    );
    res.json(userOrders);
  } catch (err) {
    console.error('Fetch my-orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve order history.' });
  }
});

// GET /api/orders/in-progress (Active orders: received, in_progress, ready)
router.get('/in-progress', verifyToken, async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user.id;

  try {
    if (db.isConnected()) {
      const orders = await db.query(
        `SELECT * FROM orders 
         WHERE (user_id = ? OR customer_email = ?) 
           AND order_status IN ('received', 'in_progress', 'ready')
         ORDER BY id DESC LIMIT 50`,
        [userId, userEmail]
      );

      for (const ord of orders) {
        const items = await db.query(
          `SELECT oi.*, mi.image_url 
           FROM order_items oi 
           LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = ?`,
          [ord.id]
        );
        ord.items = items || [];
      }

      return res.json(orders);
    }

    const userOrders = db.memoryStore.orders.filter(
      o => (o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail.toLowerCase())) &&
           ['received', 'in_progress', 'ready'].includes(o.order_status)
    );
    res.json(userOrders);
  } catch (err) {
    console.error('Fetch in-progress orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve in-progress orders.' });
  }
});

// GET /api/orders/collected (Past/completed orders: completed, cancelled)
router.get('/collected', verifyToken, async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user.id;

  try {
    if (db.isConnected()) {
      const orders = await db.query(
        `SELECT * FROM orders 
         WHERE (user_id = ? OR customer_email = ?) 
           AND order_status IN ('completed', 'cancelled')
         ORDER BY id DESC LIMIT 50`,
        [userId, userEmail]
      );

      for (const ord of orders) {
        const items = await db.query(
          `SELECT oi.*, mi.image_url 
           FROM order_items oi 
           LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = ?`,
          [ord.id]
        );
        ord.items = items || [];
      }

      return res.json(orders);
    }

    const userOrders = db.memoryStore.orders.filter(
      o => (o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail.toLowerCase())) &&
           ['completed', 'cancelled'].includes(o.order_status)
    );
    res.json(userOrders);
  } catch (err) {
    console.error('Fetch collected orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve collected orders.' });
  }
});

// GET /api/orders/vendor (Cafeteria Kitchen Portal Queue)
router.get('/vendor', verifyToken, requireRole(['vendor', 'admin', 'staff']), async (req, res) => {
  try {
    if (db.isConnected()) {
      const orders = await db.query('SELECT * FROM orders ORDER BY id DESC LIMIT 100');
      for (const ord of orders) {
        const items = await db.query(
          `SELECT oi.*, mi.image_url 
           FROM order_items oi 
           LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id 
           WHERE oi.order_id = ?`,
          [ord.id]
        );
        ord.items = items || [];
      }
      return res.json(orders);
    }
    res.json(db.memoryStore.orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve kitchen order queue.' });
  }
});

// PATCH /api/orders/:id/status (Vendor: Update order state)
router.patch('/:id/status', verifyToken, requireRole(['vendor', 'admin', 'staff']), async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  const validStatuses = ['received', 'in_progress', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  try {
    if (db.isConnected()) {
      const completedAt = (status === 'completed') ? new Date() : null;
      await db.query(
        'UPDATE orders SET order_status = ?, completed_at = ? WHERE id = ?',
        [status, completedAt, orderId]
      );
      return res.json({ message: `Order status updated to ${status.toUpperCase()}.` });
    } else {
      const order = db.memoryStore.orders.find(o => o.id === orderId);
      if (order) {
        order.order_status = status;
        if (status === 'completed') order.completed_at = new Date().toISOString();
        return res.json({ message: `Order status updated to ${status.toUpperCase()}.` });
      }
    }
    res.status(404).json({ error: 'Order not found.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// POST /api/orders/:id/verify-pickup (Counter 1 PIN Collection Verification)
router.post('/:id/verify-pickup', verifyToken, requireRole(['vendor', 'admin', 'staff']), async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { pickup_pin } = req.body;

  if (!pickup_pin) {
    return res.status(400).json({ error: 'Please enter the customer 4-digit Collection PIN.' });
  }

  try {
    let order = null;

    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (rows && rows.length > 0) order = rows[0];
    } else {
      order = db.memoryStore.orders.find(o => o.id === orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order ticket not found.' });
    }

    if (order.pickup_pin.trim() !== pickup_pin.trim()) {
      return res.status(400).json({ 
        error: `INVALID PIN: Code #${pickup_pin} does not match ticket #${order.order_number}. Double-check student screen.` 
      });
    }

    if (db.isConnected()) {
      await db.query(
        'UPDATE orders SET order_status = ?, completed_at = ? WHERE id = ?',
        ['completed', new Date(), orderId]
      );
    } else {
      order.order_status = 'completed';
      order.completed_at = new Date().toISOString();
    }

    res.json({
      message: 'Collection PIN verified successfully!',
      orderNumber: order.order_number,
      customerName: order.customer_name
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify pickup PIN.' });
  }
});

module.exports = router;
