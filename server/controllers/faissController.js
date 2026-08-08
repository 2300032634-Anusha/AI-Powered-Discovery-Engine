import pool from '../config/db.js';

// GET /api/faiss-specs — Fetch FAISS index specs
export async function getFaissSpecs(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM faiss_index_specs');

    const specs = {};
    rows.forEach(row => {
      specs[row.id] = {
        name: row.name,
        description: row.description,
        buildTimeMs: parseFloat(row.build_time_ms),
        searchLatencyMs: parseFloat(row.search_latency_ms),
        qps: row.qps,
        recallAt10: parseFloat(row.recall_at_10),
        memoryOverheadMb: row.memory_overhead_mb,
        complexity: row.complexity,
        bestFor: row.best_for
      };
    });

    res.json({ success: true, data: specs });
  } catch (err) {
    console.error('Error fetching FAISS specs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
