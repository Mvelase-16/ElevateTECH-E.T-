const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unibites_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// Pre-seeded campus cafeteria items matching Walter Sisulu University student requirements
const SEED_CATEGORIES = [
  { id: 1, name: 'Breakfast', slug: 'breakfast', icon: '🍳' },
  { id: 2, name: 'Plate Meals', slug: 'plate-meals', icon: '🍲' },
  { id: 3, name: 'Chips & Fast Food', slug: 'chips', icon: '🍟' },
  { id: 4, name: 'Drinks', slug: 'drinks', icon: '🥤' },
  { id: 5, name: 'Campus Extras', slug: 'extras', icon: '💊' }
];

const SEED_MENU_ITEMS = [
  // 1. Breakfast
  {
    id: 1,
    category_slug: 'breakfast',
    name: 'Traditional Campus Breakfast',
    description: 'Two fried eggs, 2 slices of golden toast, grilled tomato, and baked beans in rich tomato sauce.',
    price: 38.00,
    image_url: 'https://thumbs.dreamstime.com/b/satisfying-breakfast-featuring-sunny-side-up-eggs-crispy-bacon-sausages-baked-beans-mushrooms-grilled-tomatoes-toast-ai-374737985.jpg',
    is_available: true
  },
  {
    id: 2,
    category_slug: 'breakfast',
    name: 'Russian & Chips Breakfast Combo',
    description: 'Grilled smoked Russian sausage served with hot seasoned chips and barbecue dipping sauce.',
    price: 45.00,
    image_url: 'https://tse1.mm.bing.net/th/id/OIP.zlj1vn1u2RR72Sgr9aQ5UgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    is_available: true
  },
  {
    id: 3,
    category_slug: 'breakfast',
    name: 'Toasted Egg & Cheese',
    description: 'Crispy toasted white or brown bread with melted mature cheddar cheese and fried egg.',
    price: 28.00,
    image_url: 'https://www.recipessweets.com/wp-content/uploads/2026/03/egg-and-cheese-toasts-crispy-cheesy-and-amazing-2026-03-17-031507-819x1024-1.webp',
    is_available: true
  },

  // 2. Plate Meals
  {
    id: 4,
    category_slug: 'plate-meals',
    name: 'Hearty Beef Stew & Pap',
    description: 'Tender slow-cooked beef stew in savory herb gravy, served with fluffy maize meal pap and spicy chakalaka.',
    price: 58.00,
    image_url: 'https://i.ytimg.com/vi/vjiA5MIdgPg/maxresdefault.jpg',
    is_available: true
  },
  {
    id: 5,
    category_slug: 'plate-meals',
    name: 'Roast Chicken & Savory Rice',
    description: 'Succulent spiced roast chicken quarter served with yellow turmeric rice, gravy, and sweet butternut.',
    price: 52.00,
    image_url: 'https://fabiloustaste.com/wp-content/uploads/2025/12/one-pot-chicken-and-rice-finished-plated-crispy-fluffy.webp',
    is_available: true
  },
  {
    id: 6,
    category_slug: 'plate-meals',
    name: 'Traditional Samp & Beans (Umngqusho)',
    description: 'Slow-simmered stamped corn and sugar beans cooked with beef marrow broth, onions, and curry herbs.',
    price: 50.00,
    image_url: 'https://cdn.africanvibes.com/wp-content/uploads/2024/03/10003904/Samp__Umngqushu-and-Pork-Portjies-9-22-screenshot-1.png',
    is_available: true
  },
  {
    id: 7,
    category_slug: 'plate-meals',
    name: 'Cape Malay Mutton Curry',
    description: 'Fragrant aromatic lamb curry with soft potatoes, served with basmati rice and tomato-onion sambal.',
    price: 65.00,
    image_url: 'https://tse1.mm.bing.net/th/id/OIP.rQgtG3CscXRWZa8ZlyvQpgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    is_available: true
  },

  // 3. Chips & Fast Food (From Wireframe)
  {
    id: 8,
    category_slug: 'chips',
    name: 'Classic UniBites Beef Burger',
    description: 'Juicy 150g pure beef patty with crisp lettuce, sliced tomato, pickles, and our signature burger relish.',
    price: 59.90,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    is_available: true
  },
  {
    id: 9,
    category_slug: 'chips',
    name: 'Crispy Chicken Breast Burger',
    description: 'Crumbed crispy chicken breast fillet with fresh shredded lettuce and creamy herb mayonnaise.',
    price: 59.90,
    image_url: 'https://tse3.mm.bing.net/th/id/OIP.VWExLyJMV-hjlpylUtjO5AHaHa?r=0&w=800&h=800&rs=1&pid=ImgDetMain&o=7&rm=3',
    is_available: true
  },
  {
    id: 10,
    category_slug: 'chips',
    name: 'Fried Slap Chips (Large)',
    description: 'Fresh hand-cut potato chips fried to golden perfection, seasoned with vinegar and chip salt.',
    price: 29.90,
    image_url: 'https://www.recipetineats.com/uploads/2022/09/Crispy-Fries_8.jpg',
    is_available: true
  },
  {
    id: 11,
    category_slug: 'chips',
    name: 'Campus Special Kota / Dagwood',
    description: 'Quarter loaf hollowed and stacked with slap chips, fried egg, Russian, polony slice, cheese, and spicy atchar.',
    price: 42.00,
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
    is_available: true
  },

  // 4. Drinks
  {
    id: 12,
    category_slug: 'drinks',
    name: 'Coca-Cola 440ml Can',
    description: 'Chilled and refreshing sparkling original taste Coca-Cola.',
    price: 22.90,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    is_available: true
  },
  {
    id: 13,
    category_slug: 'drinks',
    name: 'Stoney Ginger Beer 440ml',
    description: 'Ice-cold extra strong ginger brew for an authentic kick.',
    price: 22.90,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    is_available: true
  },
  {
    id: 14,
    category_slug: 'drinks',
    name: '100% Pure Orange Juice 500ml',
    description: 'Pure squeezed sweet orange juice packed with vitamin C.',
    price: 20.00,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=80',
    is_available: true
  },
  {
    id: 15,
    category_slug: 'drinks',
    name: 'Still Spring Water 500ml',
    description: 'Natural still mineral spring water, chilled.',
    price: 14.00,
    image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80',
    is_available: true
  },
  {
    id: 16,
    category_slug: 'drinks',
    name: 'Monster Energy Drink 500ml',
    description: 'High energy boost formulated for studying and exam prep.',
    price: 26.00,
    image_url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&q=80',
    is_available: true
  },

  // 5. Campus Extras
  {
    id: 17,
    category_slug: 'extras',
    name: 'Bio-Plus Energy Booster Sachet',
    description: 'Liquid energy booster syrup with B-complex vitamins for focus and physical stamina.',
    price: 18.00,
    image_url: 'https://images.unsplash.com/photo-1617196038820-1f3e5c8b6d9e?w=600&q=80',
    is_available: true
  },
  {
    id: 18,
    category_slug: 'extras',
    name: 'Grand-Pa Headache Powders (Pack of 2)',
    description: 'Fast acting pain and headache relief powders for busy lecture days.',
    price: 12.00,
    image_url: 'https://i-cf65.ch-static.com/content/dam/cf-consumer-healthcare/panadol-reskin/en_ZA_grandpa/Grand-Pa-Carton-38s-No-New.png?auto=format',
    is_available: true
  },
  {
    id: 19,
    category_slug: 'extras',
    name: 'Cadbury Lunch Bar 48g',
    description: 'Milk chocolate with wafer, caramel, peanuts, and crisped rice.',
    price: 15.00,
    image_url: 'https://cdn-prd-02.pnp.co.za/sys-master/images/hf4/h87/12491038752798/silo-product-image-v2-12Jun2025-180105-7622202299568-Straight_on-329932-48_400Wx400H',
    is_available: true
  },
  {
    id: 20,
    category_slug: 'extras',
    name: 'Fresh Banana & Red Apple Duo',
    description: 'One fresh ripe banana and one crisp red apple.',
    price: 10.00,
    image_url: 'https://static.vecteezy.com/system/resources/previews/065/444/757/non_2x/fresh-red-apple-and-yellow-bananas-healthy-fruit-selection-png.png',
    is_available: true
  }
];

const SEED_TIME_SLOTS = [
  { id: 1, slot_time: '11:45 - 12:00', max_capacity: 15, current_bookings: 3 },
  { id: 2, slot_time: '12:00 - 12:15', max_capacity: 15, current_bookings: 8 },
  { id: 3, slot_time: '12:15 - 12:30', max_capacity: 15, current_bookings: 11 },
  { id: 4, slot_time: '12:30 - 12:45', max_capacity: 15, current_bookings: 6 },
  { id: 5, slot_time: '12:45 - 13:00', max_capacity: 15, current_bookings: 4 },
  { id: 6, slot_time: '13:00 - 13:15', max_capacity: 15, current_bookings: 2 },
  { id: 7, slot_time: '13:15 - 13:30', max_capacity: 15, current_bookings: 1 },
  { id: 8, slot_time: '13:30 - 13:45', max_capacity: 15, current_bookings: 0 }
];

// Fallback in-memory database store (used whenever XAMPP MySQL is not yet active)
const memoryStore = {
  categories: [...SEED_CATEGORIES],
  menuItems: [...SEED_MENU_ITEMS],
  timeSlots: [...SEED_TIME_SLOTS],
  users: [
    { id: 1, name: 'Nikelwa Sophazi', email: 'student@wsu.ac.za', role: 'student', phone: '0812345678' },
    { id: 2, name: 'Campus Main Cafeteria', email: 'cafeteria@wsu.ac.za', role: 'vendor', phone: '0475022844' },
    { id: 3, name: 'System Admin', email: 'admin@wsu.ac.za', role: 'admin', phone: '0475022000' }
  ],
  orders: [
    {
      id: 1,
      order_number: 'UB-1001',
      pickup_pin: '4821',
      customer_name: 'Ayanda Mthembu',
      customer_email: 'ayanda@wsu.ac.za',
      customer_phone: '0823456789',
      pickup_time: '12:15 - 12:30',
      payment_method: 'Card',
      payment_status: 'paid',
      order_status: 'in_progress',
      total_amount: 89.80,
      qr_code_data: 'UB:UB-1001:4821',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      items: [
        { id: 1, name: 'Classic UniBites Beef Burger', quantity: 1, price: 59.90 },
        { id: 2, name: 'Fried Slap Chips (Large)', quantity: 1, price: 29.90 }
      ]
    },
    {
      id: 2,
      order_number: 'UB-1002',
      pickup_pin: '7394',
      customer_name: 'Liyabona Miya',
      customer_email: 'liyabona@wsu.ac.za',
      customer_phone: '0834567890',
      pickup_time: '12:30 - 12:45',
      payment_method: 'Cash on Pickup',
      payment_status: 'cash_on_pickup',
      order_status: 'received',
      total_amount: 80.90,
      qr_code_data: 'UB:UB-1002:7394',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      items: [
        { id: 3, name: 'Hearty Beef Stew & Pap', quantity: 1, price: 58.00 },
        { id: 4, name: 'Coca-Cola 440ml Can', quantity: 1, price: 22.90 }
      ]
    }
  ],
  reviews: [
    {
      id: 1,
      order_id: 1,
      customer_name: 'David Maleka',
      rating: 5,
      comment: 'The beef stew & pap was super fresh and ready right on time at 12:15! Saved me so much time.',
      created_at: new Date().toISOString()
    }
  ]
};

// Initialize connection and tables
async function initDatabase() {
  try {
    // 1. Try to connect to MySQL server root (XAMPP)
    const initialConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('🟢 Successfully connected to Local XAMPP MySQL Server!');

    // 2. Create the unibites_db database if missing
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await initialConnection.end();

    // 3. Create a connection pool targeting unibites_db
    pool = mysql.createPool(dbConfig);

    // 4. Create all 7 relational tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'vendor', 'admin') DEFAULT 'student',
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        icon VARCHAR(20)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_slug VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slot_time VARCHAR(50) NOT NULL,
        max_capacity INT DEFAULT 15,
        current_bookings INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        pickup_pin VARCHAR(6) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(120) NOT NULL,
        customer_phone VARCHAR(20),
        pickup_time VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Card',
        payment_status ENUM('pending', 'paid', 'cash_on_pickup') DEFAULT 'paid',
        order_status ENUM('received', 'in_progress', 'ready', 'completed', 'cancelled') DEFAULT 'received',
        total_amount DECIMAL(10,2) NOT NULL,
        qr_code_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT,
        item_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        customer_name VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Seed categories if table is empty
    const [existingCategories] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count === 0) {
      for (const cat of SEED_CATEGORIES) {
        await pool.query(
          'INSERT INTO categories (id, name, slug, icon) VALUES (?, ?, ?, ?)',
          [cat.id, cat.name, cat.slug, cat.icon]
        );
      }
      console.log('🌱 Seeded cafeteria categories into MySQL!');
    }

    // 6. Seed and auto-sync menu items into MySQL (updates image_url if changed in code)
    for (const item of SEED_MENU_ITEMS) {
      await pool.query(`
        INSERT INTO menu_items (id, category_slug, name, description, price, image_url, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          image_url = VALUES(image_url),
          name = VALUES(name),
          price = VALUES(price),
          description = VALUES(description)
      `, [item.id, item.category_slug, item.name, item.description, item.price, item.image_url, item.is_available]);
    }
    console.log('🌱 Seeded & auto-synced menu items into MySQL!');

    // 7. Seed time slots if table is empty
    const [existingSlots] = await pool.query('SELECT COUNT(*) as count FROM time_slots');
    if (existingSlots[0].count === 0) {
      for (const slot of SEED_TIME_SLOTS) {
        await pool.query(
          'INSERT INTO time_slots (id, slot_time, max_capacity, current_bookings) VALUES (?, ?, ?, ?)',
          [slot.id, slot.slot_time, slot.max_capacity, slot.current_bookings]
        );
      }
      console.log('🌱 Seeded pickup time slots into MySQL!');
    }

    isConnected = true;
    console.log('🚀 UniBites Database and all tables are 100% READY in MySQL!\n');

  } catch (err) {
    isConnected = false;
    console.log('\n============================================================');
    console.log('⚠️  NOTE: Could not connect to XAMPP MySQL at localhost:3306.');
    console.log('👉 If you want to use live MySQL storage:');
    console.log('   1. Open the XAMPP Control Panel.');
    console.log('   2. Click "Start" next to MySQL (and Apache).');
    console.log('🚀 Fallback Active: Server is serving seamless in-memory seed data so you can test right now!');
    console.log('============================================================\n');
  }
}

// Unified helper function to query either MySQL or fallback memory store
async function query(sql, params = []) {
  if (isConnected && pool) {
    const [results] = await pool.query(sql, params);
    return results;
  }
  return null;
}

module.exports = {
  initDatabase,
  query,
  isConnected: () => isConnected,
  memoryStore,
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
  SEED_TIME_SLOTS
};
