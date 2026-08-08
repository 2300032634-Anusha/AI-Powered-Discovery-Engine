import pool from '../config/db.js';

// GET /api/rag — Fetch RAG knowledge base
export async function getKnowledgeBase(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM rag_knowledge_base ORDER BY id');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching RAG knowledge base:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/rag/chat — RAG chat endpoint
export async function ragChat(req, res) {
  try {
    const { query, personaId } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const qLower = query.toLowerCase();
    let botResponse = "";
    let retrievedPassages = [];
    let citations = [];

    // Fetch knowledge base and products
    const [ragRows] = await pool.execute('SELECT * FROM rag_knowledge_base');
    const [productRows] = await pool.execute('SELECT id, title, description, price, category FROM products LIMIT 20');

    const ragEntries = ragRows;
    const products = productRows;

    if (qLower.includes("return") || qLower.includes("policy") || qLower.includes("exchange")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('return'));
      if (entry) {
        retrievedPassages = [entry];
        botResponse = `According to our official Return & Exchange Policy: ${entry.content} [1]`;
        citations = [{ index: 1, title: entry.title }];
      }
    } else if (qLower.includes("shipping") || qLower.includes("delivery")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('shipping'));
      if (entry) {
        retrievedPassages = [entry];
        botResponse = `Here's our shipping information: ${entry.content} [1]`;
        citations = [{ index: 1, title: entry.title }];
      }
    } else if (qLower.includes("warranty") || qLower.includes("repair")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('warranty'));
      if (entry) {
        retrievedPassages = [entry];
        botResponse = `Regarding warranties: ${entry.content} [1]`;
        citations = [{ index: 1, title: entry.title }];
      }
    } else if (qLower.includes("headphone") || qLower.includes("battery") || qLower.includes("aurasound")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('headphone'));
      const prod = products.find(p => p.title.toLowerCase().includes('aurasound') || p.title.toLowerCase().includes('headphone'));
      retrievedPassages = [entry, prod].filter(Boolean);
      botResponse = `The AuraSound Pro Wireless ANC Headphones offer 35 hours of active battery life with 10-minute fast charging giving 5 hours of playback. They include a 2-year manufacturer warranty [1].`;
      citations = [{ index: 1, title: entry?.title || 'Headphone Info' }];
      if (prod) citations.push({ index: 2, title: prod.title });
    } else if (qLower.includes("denim") || qLower.includes("wash") || qLower.includes("size")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('denim'));
      retrievedPassages = [entry].filter(Boolean);
      botResponse = `KuroStudio Japanese selvedge denim is raw and unwashed 14oz cotton. We recommend washing inside out in cold water after 6 months of wear to preserve natural indigo fades [1].`;
      citations = [{ index: 1, title: entry?.title || 'Denim Care' }];
    } else if (qLower.includes("espresso") || qLower.includes("coffee") || qLower.includes("descale")) {
      const entry = ragEntries.find(r => r.title.toLowerCase().includes('espresso'));
      retrievedPassages = [entry].filter(Boolean);
      botResponse = `For espresso machine maintenance: ${entry?.content || 'Use filtered water and run clean cycle every 200 shots.'} [1]`;
      citations = [{ index: 1, title: entry?.title || 'Espresso Care' }];
    } else {
      const topProducts = products.slice(0, 3);
      retrievedPassages = topProducts;
      botResponse = `Based on our current catalog, here are some popular items: ${topProducts.map(p => `${p.title} ($${p.price})`).join(', ')}. All items feature fast delivery options.`;
      citations = [{ index: 1, title: "Catalog Search Index" }];
    }

    // Log the interaction
    try {
      await pool.execute(
        'INSERT INTO search_logs (persona_id, query, category_filter, primary_intent, results_count) VALUES (?, ?, ?, ?, ?)',
        [personaId || null, query, 'RAG', 'RAG Chat', retrievedPassages.length]
      );
    } catch (logErr) {
      console.warn('RAG log insert failed:', logErr.message);
    }

    res.json({
      success: true,
      data: {
        response: botResponse,
        citations,
        retrievedPassages: retrievedPassages.map(p => ({
          title: p.title,
          content: p.content || p.description || ''
        }))
      }
    });
  } catch (err) {
    console.error('Error in RAG chat:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
