import pool from '../config/db.js';

function safeJsonParse(val, fallback = []) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// GET /api/personas — Fetch all personas
export async function getAllPersonas(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM user_personas ORDER BY name');

    const personas = {};
    rows.forEach(row => {
      personas[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        preferredCategories: safeJsonParse(row.preferred_categories, []),
        avgSpend: row.avg_spend,
        vector: safeJsonParse(row.vector, []),
        color: row.color
      };
    });

    res.json({ success: true, count: rows.length, data: personas });
  } catch (err) {
    console.error('Error fetching personas:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/personas/:id — Fetch single persona
export async function getPersonaById(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM user_personas WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Persona not found' });
    }

    const row = rows[0];
    const persona = {
      id: row.id,
      name: row.name,
      description: row.description,
      preferredCategories: JSON.parse(row.preferred_categories || '[]'),
      avgSpend: row.avg_spend,
      vector: JSON.parse(row.vector || '[]'),
      color: row.color
    };

    res.json({ success: true, data: persona });
  } catch (err) {
    console.error('Error fetching persona:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
