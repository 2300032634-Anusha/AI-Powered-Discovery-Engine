import pool from '../config/db.js';

// POST /api/interactions — Log a user interaction
export async function logInteraction(req, res) {
  try {
    const { personaId, productId, interactionType, metadata } = req.body;

    if (!productId || !interactionType) {
      return res.status(400).json({ success: false, error: 'productId and interactionType are required' });
    }

    const validTypes = ['click', 'like', 'unlike', 'cart_add', 'cart_remove', 'view'];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({ success: false, error: `interactionType must be one of: ${validTypes.join(', ')}` });
    }

    await pool.execute(
      'INSERT INTO user_interactions (persona_id, product_id, interaction_type, metadata) VALUES (?, ?, ?, ?)',
      [personaId || null, productId, interactionType, JSON.stringify(metadata || {})]
    );

    res.status(201).json({ success: true, message: 'Interaction logged' });
  } catch (err) {
    console.error('Error logging interaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/interactions — Fetch recent interactions
export async function getInteractions(req, res) {
  try {
    const { personaId, type, limit = 50 } = req.query;

    let query = 'SELECT ui.*, p.title as product_title, p.category as product_category FROM user_interactions ui LEFT JOIN products p ON ui.product_id = p.id WHERE 1=1';
    const params = [];

    if (personaId) {
      query += ' AND ui.persona_id = ?';
      params.push(personaId);
    }

    if (type) {
      query += ' AND ui.interaction_type = ?';
      params.push(type);
    }

    query += ' ORDER BY ui.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.execute(query, params);

    const interactions = rows.map(row => ({
      id: row.id,
      personaId: row.persona_id,
      productId: row.product_id,
      productTitle: row.product_title,
      productCategory: row.product_category,
      interactionType: row.interaction_type,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at
    }));

    res.json({ success: true, count: interactions.length, data: interactions });
  } catch (err) {
    console.error('Error fetching interactions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/interactions/stats — Interaction statistics
export async function getInteractionStats(req, res) {
  try {
    const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM user_interactions');
    const [typeRows] = await pool.execute('SELECT interaction_type, COUNT(*) as count FROM user_interactions GROUP BY interaction_type');
    const [recentRows] = await pool.execute('SELECT COUNT(*) as count FROM user_interactions WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)');

    res.json({
      success: true,
      data: {
        totalInteractions: totalRows[0].total,
        byType: typeRows.reduce((acc, r) => { acc[r.interaction_type] = r.count; return acc; }, {}),
        lastHour: recentRows[0].count
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
