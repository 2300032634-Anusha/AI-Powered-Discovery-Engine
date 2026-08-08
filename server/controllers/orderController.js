import pool from '../config/db.js';

// POST /api/orders — Submit new order with shipping details & line items
export async function createOrder(req, res) {
  let connection;
  try {
    const {
      userId,
      personaId = 'techie',
      totalAmount,
      totalItems,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingPhone,
      paymentMethod = 'Credit Card',
      items = []
    } = req.body;

    if (!shippingName || !shippingAddress || !shippingCity || !shippingPhone) {
      return res.status(400).json({ success: false, error: 'Full shipping address and phone number are required.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one item.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert order master record
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (user_id, persona_id, total_amount, total_items, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone, payment_method, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')`,
      [
        userId || null,
        personaId,
        parseFloat(totalAmount),
        parseInt(totalItems),
        shippingName,
        shippingAddress,
        shippingCity,
        shippingPostalCode || '',
        shippingPhone,
        paymentMethod
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order line items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, product_title, price, quantity, image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productTitle,
          parseFloat(item.price),
          parseInt(item.quantity || 1),
          item.imageUrl || ''
        ]
      );
    }

    // Log user interaction
    try {
      await connection.execute(
        `INSERT INTO user_interactions (persona_id, product_id, interaction_type, metadata) 
         VALUES (?, ?, 'cart_add', ?)`,
        [personaId, items[0]?.productId || 'order', JSON.stringify({ orderId, totalAmount, itemCount: items.length })]
      );
    } catch (e) {
      console.warn('Could not log interaction for order:', e.message);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      totalAmount,
      totalItems,
      shippingName
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
}

// GET /api/orders/user/:userId — Fetch all past orders for a logged-in user
export async function getUserOrders(req, res) {
  try {
    const { userId } = req.params;

    const [orders] = await pool.execute(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.json({ success: true, count: 0, orders: [] });
    }

    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');

    const [items] = await pool.execute(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds
    );

    // Group items by order_id
    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        id: item.id,
        productId: item.product_id,
        productTitle: item.product_title,
        price: parseFloat(item.price),
        quantity: item.quantity,
        imageUrl: item.image_url
      });
    });

    const fullOrders = orders.map(o => ({
      id: o.id,
      userId: o.user_id,
      personaId: o.persona_id,
      totalAmount: parseFloat(o.total_amount),
      totalItems: o.total_items,
      shippingName: o.shipping_name,
      shippingAddress: o.shipping_address,
      shippingCity: o.shipping_city,
      shippingPostalCode: o.shipping_postal_code,
      shippingPhone: o.shipping_phone,
      paymentMethod: o.payment_method,
      status: o.status,
      createdAt: o.created_at,
      items: itemsByOrder[o.id] || []
    }));

    res.json({ success: true, count: fullOrders.length, orders: fullOrders });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/orders/stats/user/:userId — Calculate total spent and purchase analytics
export async function getUserOrderStats(req, res) {
  try {
    const { userId } = req.params;

    const [stats] = await pool.execute(
      `SELECT 
         COUNT(*) as totalOrders,
         COALESCE(SUM(total_amount), 0) as totalSpent,
         COALESCE(SUM(total_items), 0) as totalItemsPurchased
       FROM orders 
       WHERE user_id = ?`,
      [userId]
    );

    const data = stats[0];

    res.json({
      success: true,
      stats: {
        totalOrders: parseInt(data.totalOrders),
        totalSpent: parseFloat(data.totalSpent),
        totalItemsPurchased: parseInt(data.totalItemsPurchased)
      }
    });
  } catch (err) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
