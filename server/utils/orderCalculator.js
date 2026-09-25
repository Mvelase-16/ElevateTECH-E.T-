const db = require('../config/db');

async function verifyAndCalculateOrder(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Your cart is empty. Please select at least one meal to place an order.');
  }

  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const itemId = parseInt(item.id);
    const quantity = parseInt(item.quantity) || 1;

    if (quantity <= 0) continue;

    let menuItem = null;

    if (db.isConnected()) {
      const rows = await db.query('SELECT * FROM menu_items WHERE id = ?', [itemId]);
      if (rows && rows.length > 0) {
        menuItem = rows[0];
      }
    } else {
      menuItem = db.memoryStore.menuItems.find(m => m.id === itemId);
    }

    if (!menuItem) {
      throw new Error(`The item "${item.name || 'ID ' + itemId}" is no longer on the cafeteria menu.`);
    }

    if (!menuItem.is_available) {
      throw new Error(`We're sorry, "${menuItem.name}" is currently sold out in the kitchen.`);
    }

    const unitPrice = parseFloat(menuItem.price);
    const itemSubtotal = parseFloat((unitPrice * quantity).toFixed(2));
    subtotal += itemSubtotal;

    verifiedItems.push({
      menu_item_id: menuItem.id,
      item_name: menuItem.name,
      quantity,
      unit_price: unitPrice,
      subtotal: itemSubtotal,
      image_url: menuItem.image_url
    });
  }

  if (verifiedItems.length === 0) {
    throw new Error('Your cart contains no valid items.');
  }

  const serviceFee = 5.00; // Flat packaging & container fee
  const totalAmount = parseFloat((subtotal + serviceFee).toFixed(2));

  return {
    verifiedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    serviceFee,
    totalAmount
  };
}

module.exports = {
  verifyAndCalculateOrder
};
