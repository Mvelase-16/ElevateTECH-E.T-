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
    image_url: 'https://media.istockphoto.com/id/1335893078/photo/russians-and-chips.jpg?s=170667a&w=0&k=20&c=Aka6FOSz0lmJ5lwfFnd6RDLTuyWrND0wxhp2JLn6aMc=',
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

  // 3. Chips & Fast Food
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
    image_url: 'https://s3.amazonaws.com/yomzansi.com/wp-content/uploads/2023/05/17132126/yomzansi-kfc-kota-menu-1024x793.jpg',
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
    image_url: 'https://assets.iceland.co.uk/i/iceland/highland_spring_still_spring_water_500ml_1735_T596.jpg',
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

  // 5. Campus Extras (Updated with live custom URLs)
  {
    id: 17,
    category_slug: 'extras',
    name: 'Bio-Plus Energy Booster Sachet',
    description: 'Liquid energy booster syrup with B-complex vitamins for focus and physical stamina.',
    price: 18.00,
    image_url: 'https://odo-cdn.imgix.net/catalog/product/166/817/1668172457.7208.jpeg',
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

// Fallback in-memory database store (used if XAMPP MySQL is temporarily offline)
const memoryStore = {
  users: [],
  categories: [...SEED_CATEGORIES],
  menuItems: [...SEED_MENU_ITEMS],
  timeSlots: [],
  orders: [],
  reviews: []
};

// Initialize connection pool
async function getPool() {
  if (pool) return pool;
  try {
    const initialConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await initialConnection.end();

    pool = mysql.createPool(dbConfig);
    isConnected = true;
    return pool;
  } catch (err) {
    isConnected = false;
    return null;
  }
}

// Execute query on MySQL with fallback
async function query(sql, params = []) {
  try {
    const activePool = await getPool();
    if (activePool && isConnected) {
      const [results] = await activePool.query(sql, params);
      return results;
    }
  } catch (err) {
    console.error('MySQL query error:', err.message);
  }
  return null;
}

// Execute operations in a database transaction with rollback support
async function withTransaction(callback) {
  const activePool = await getPool();
  if (!activePool || !isConnected) {
    return callback(null);
  }
  const connection = await activePool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getPool,
  query,
  withTransaction,
  isConnected: () => isConnected,
  memoryStore,
  SEED_CATEGORIES,
  SEED_MENU_ITEMS
};
