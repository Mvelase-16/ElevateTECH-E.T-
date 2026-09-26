const bcrypt = require('bcryptjs');
const db = require('./db');

// Helper to check if column exists in table
async function columnExists(pool, tableName, columnName) {
  try {
    const [rows] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, columnName]
    );
    return rows && rows.length > 0;
  } catch (e) {
    return false;
  }
}

// 23 Time Slots from 8:00 AM to 7:00 PM at 30-minute intervals
function generateDefaultSlots() {
  const slots = [];
  const startHour = 8;
  const endHour = 19; // 7:00 PM
  let id = 1;

  for (let h = startHour; h < endHour; h++) {
    for (let m of [0, 30]) {
      const nextM = m === 0 ? 30 : 0;
      const nextH = m === 0 ? h : h + 1;

      const formatTime = (hour, min) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayH = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const displayM = min === 0 ? '00' : min;
        return `${displayH}:${displayM} ${period}`;
      };

      const startFormatted = formatTime(h, m);
      const endFormatted = formatTime(nextH, nextM);
      const slotTime = `${startFormatted} - ${endFormatted}`;
      const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
      const endTimeStr = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}:00`;

      slots.push({
        id: id++,
        slot_time: slotTime,
        start_time: startTimeStr,
        end_time: endTimeStr,
        max_capacity: 15,
        current_bookings: 0
      });
    }
  }
  return slots;
}

async function runMigrations() {
  console.log('🚀 Running database schema migrations...');
  const pool = await db.getPool();

  if (!pool || !db.isConnected()) {
    console.log('⚠️ Running in mock in-memory mode (XAMPP MySQL is offline)');
    await seedMemoryStore();
    return;
  }

  try {
    // 1. Ensure categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(20)
      )
    `);

    // 2. Ensure menu_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_slug VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Ensure users table with full authentication columns
    if (!(await columnExists(pool, 'users', 'email'))) {
      // Legacy POC table had only (id, name). Upgrade to production schema:
      await pool.query(`DROP TABLE IF EXISTS users`);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'staff', 'vendor', 'admin') DEFAULT 'student',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Ensure time_slots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slot_time VARCHAR(50) NOT NULL,
        start_time TIME NULL,
        end_time TIME NULL,
        max_capacity INT DEFAULT 15,
        current_bookings INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        slot_date DATE NULL
      )
    `);

    if (!(await columnExists(pool, 'time_slots', 'start_time'))) {
      await pool.query(`ALTER TABLE time_slots ADD COLUMN start_time TIME NULL AFTER slot_time`);
    }
    if (!(await columnExists(pool, 'time_slots', 'end_time'))) {
      await pool.query(`ALTER TABLE time_slots ADD COLUMN end_time TIME NULL AFTER start_time`);
    }
    if (!(await columnExists(pool, 'time_slots', 'slot_date'))) {
      await pool.query(`ALTER TABLE time_slots ADD COLUMN slot_date DATE NULL AFTER is_active`);
    }

    // 5. Ensure orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        pickup_pin VARCHAR(6) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(120) NOT NULL,
        customer_phone VARCHAR(20),
        pickup_time VARCHAR(50) NOT NULL,
        pickup_date DATE DEFAULT (CURRENT_DATE),
        payment_method VARCHAR(50) DEFAULT 'Card',
        payment_status ENUM('pending', 'paid', 'cash_on_pickup') DEFAULT 'paid',
        order_status ENUM('received', 'in_progress', 'ready', 'completed', 'cancelled') DEFAULT 'received',
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        service_fee DECIMAL(10,2) DEFAULT 5.00,
        total_amount DECIMAL(10,2) NOT NULL,
        qr_code_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    if (!(await columnExists(pool, 'orders', 'user_id'))) {
      await pool.query(`ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER id`);
    }
    if (!(await columnExists(pool, 'orders', 'subtotal'))) {
      await pool.query(`ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER order_status`);
    }
    if (!(await columnExists(pool, 'orders', 'service_fee'))) {
      await pool.query(`ALTER TABLE orders ADD COLUMN service_fee DECIMAL(10,2) DEFAULT 5.00 AFTER subtotal`);
    }
    if (!(await columnExists(pool, 'orders', 'pickup_date'))) {
      await pool.query(`ALTER TABLE orders ADD COLUMN pickup_date DATE DEFAULT (CURRENT_DATE) AFTER pickup_time`);
    }

    // 6. Ensure order_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NULL,
        item_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
      )
    `);

    // 7. Ensure reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        customer_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      )
    `);

    // 8. Seed/Update Categories
    for (const cat of db.SEED_CATEGORIES) {
      await pool.query(
        `INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon)`,
        [cat.id, cat.name, cat.slug, cat.icon]
      );
    }

    // 9. Seed/Update Menu Items with latest prices and image URLs
    for (const item of db.SEED_MENU_ITEMS) {
      await pool.query(
        `INSERT INTO menu_items (id, category_slug, name, description, price, image_url, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           image_url = VALUES(image_url),
           name = VALUES(name),
           price = VALUES(price),
           description = VALUES(description)`,
        [item.id, item.category_slug, item.name, item.description, item.price, item.image_url, item.is_available]
      );
    }

    // 10. Seed 23 Time Slots (8:00 AM - 7:00 PM)
    const [slotsCount] = await pool.query('SELECT COUNT(*) as count FROM time_slots');
    if (slotsCount[0].count < 20) {
      await pool.query('TRUNCATE TABLE time_slots');
      const defaultSlots = generateDefaultSlots();
      for (const slot of defaultSlots) {
        await pool.query(
          `INSERT INTO time_slots (id, slot_time, start_time, end_time, max_capacity, current_bookings, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [slot.id, slot.slot_time, slot.start_time, slot.end_time, slot.max_capacity, slot.current_bookings, true]
        );
      }
      console.log('⏰ Seeded 23 time slots (8:00 AM to 7:00 PM at 30-min intervals) into MySQL!');
    }

    // 11. Seed default demo accounts with secure bcrypt hashing
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Password123!', salt);

    const demoUsers = [
      { first_name: 'Nikelwa', last_name: 'Sophazi', email: 'student@wsu.ac.za', role: 'student', phone: '0812345678' },
      { first_name: 'David', last_name: 'Maleka', email: 'staff@wsu.ac.za', role: 'staff', phone: '0823456789' },
      { first_name: 'Main', last_name: 'Cafeteria', email: 'kitchen@wsu.ac.za', role: 'vendor', phone: '0475022844' },
      { first_name: 'System', last_name: 'Admin', email: 'admin@wsu.ac.za', role: 'admin', phone: '0475022000' }
    ];

    for (const u of demoUsers) {
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           role = VALUES(role),
           phone = VALUES(phone)`,
        [u.first_name, u.last_name, u.email, demoPasswordHash, u.role, u.phone]
      );
    }

    console.log('✅ MySQL Database Schema and Seed Data are 100% Up-to-Date!');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

// In-memory fallback seeder
async function seedMemoryStore() {
  const salt = await bcrypt.genSalt(10);
  const demoPasswordHash = await bcrypt.hash('Password123!', salt);

  db.memoryStore.users = [
    { id: 1, first_name: 'Nikelwa', last_name: 'Sophazi', email: 'student@wsu.ac.za', password_hash: demoPasswordHash, role: 'student', phone: '0812345678' },
    { id: 2, first_name: 'David', last_name: 'Maleka', email: 'staff@wsu.ac.za', password_hash: demoPasswordHash, role: 'staff', phone: '0823456789' },
    { id: 3, first_name: 'Main', last_name: 'Cafeteria', email: 'kitchen@wsu.ac.za', password_hash: demoPasswordHash, role: 'vendor', phone: '0475022844' },
    { id: 4, first_name: 'System', last_name: 'Admin', email: 'admin@wsu.ac.za', password_hash: demoPasswordHash, role: 'admin', phone: '0475022000' }
  ];
  db.memoryStore.timeSlots = generateDefaultSlots();
}

module.exports = {
  runMigrations,
  generateDefaultSlots
};
