import pool from '../config/db.js';

function safeJsonParse(val, fallback = []) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// Helper: cosine similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.5;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: parse multi-intent query
function parseMultiIntentQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { primaryIntent: "Catalog Search", categoryFilter: "All", maxPrice: null, extractedAttributes: [], logisticsIntent: "Standard", confidenceScore: 0.95, expandedQuery: "" };
  }

  const q = rawQuery.toLowerCase();

  let maxPrice = null;
  const priceMatch = q.match(/(?:under|less than|below|<\s*)\$?(\d+)/i);
  if (priceMatch && priceMatch[1]) maxPrice = parseFloat(priceMatch[1]);

  let categoryFilter = "All";
  if (/headphone|laptop|keyboard|mouse|audio|electronics|webcam|hub|dock/.test(q)) categoryFilter = "Electronics";
  else if (/denim|jacket|tee|shirt|chino|trousers|shoes|sneakers|backpack|fashion|overcoat|belt|tote/.test(q)) categoryFilter = "Fashion";
  else if (/espresso|coffee|grinder|glass|cups|kitchen|skillet|spice|french press/.test(q)) categoryFilter = "Home & Kitchen";
  else if (/running|marathon|watch|gps|water bottle|fitness|yoga|resistance/.test(q)) categoryFilter = "Fitness";

  let logisticsIntent = "Standard";
  if (/fast|quick|overnight|express|1 day|2 day/.test(q)) logisticsIntent = "Express Fast Delivery (<= 2 Days)";

  const keywords = ["wireless", "noise cancelling", "bluetooth", "denim", "organic", "leather", "carbon plate", "lightweight", "breathable", "barista", "hot-swappable", "ergonomic", "stainless steel"];
  const extractedAttributes = keywords.filter(kw => q.includes(kw));

  let primaryIntent = "Product Search";
  if (/how to|return|warranty|policy|care/.test(q)) primaryIntent = "Support & Policy RAG";
  else if (/bundle|outfit|look|pair with/.test(q)) primaryIntent = "Complete the Look & Bundles";
  else if (/deal|discount|cheap|sale/.test(q)) primaryIntent = "Bargain & Deals";

  let expandedQuery = rawQuery;
  if (extractedAttributes.includes("wireless")) expandedQuery += " bluetooth cord-free";
  if (q.includes("running")) expandedQuery += " marathon athletic footwear PEBA foam";
  if (q.includes("espresso")) expandedQuery += " barista Italian 19-bar extraction";

  return {
    primaryIntent, categoryFilter, maxPrice, extractedAttributes, logisticsIntent,
    confidenceScore: 0.94 + (extractedAttributes.length * 0.015),
    expandedQuery
  };
}

// POST /api/search — Hybrid search
export async function performSearch(req, res) {
  try {
    const { query, category = 'All', vectorWeight = 0.7, personaId = 'techie' } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const intentData = parseMultiIntentQuery(query);
    const searchCategory = category !== 'All' ? category : intentData.categoryFilter;
    const effectiveMaxPrice = intentData.maxPrice;

    // Fetch products from DB
    let dbQuery = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (searchCategory !== 'All') {
      dbQuery += ' AND category = ?';
      params.push(searchCategory);
    }

    if (effectiveMaxPrice) {
      dbQuery += ' AND price <= ?';
      params.push(effectiveMaxPrice);
    }

    const [rows] = await pool.execute(dbQuery, params);

    // Fetch persona
    const [personaRows] = await pool.execute('SELECT * FROM user_personas WHERE id = ?', [personaId]);
    const persona = personaRows.length > 0 ? {
      preferredCategories: safeJsonParse(personaRows[0].preferred_categories, []),
      vector: safeJsonParse(personaRows[0].vector, [])
    } : { preferredCategories: [], vector: [] };

    const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const dummyQueryVector = [0.80, 0.85, 0.20, 0.40, 0.75, 0.85, 0.30, 0.60];

    const results = rows.map(row => {
      const tags = safeJsonParse(row.tags, []);
      const textEmbedding = safeJsonParse(row.text_embedding, []);

      // BM25 approximation
      let titleMatches = 0, descMatches = 0, tagMatches = 0;
      queryTerms.forEach(term => {
        if (row.title.toLowerCase().includes(term)) titleMatches++;
        if (row.description && row.description.toLowerCase().includes(term)) descMatches++;
        if (tags.some(t => t.toLowerCase().includes(term))) tagMatches++;
      });

      const lexicalRaw = (titleMatches * 0.4) + (tagMatches * 0.35) + (descMatches * 0.25);
      const lexicalScore = Math.min(1.0, lexicalRaw / (queryTerms.length || 1));

      const vectorScore = cosineSimilarity(dummyQueryVector, textEmbedding);

      let hybridScore = (vectorScore * vectorWeight) + (lexicalScore * (1 - vectorWeight));
      if (persona.preferredCategories.includes(row.category)) hybridScore += 0.08;

      return {
        id: row.id,
        title: row.title,
        category: row.category,
        subCategory: row.sub_category,
        brand: row.brand,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : null,
        rating: parseFloat(row.rating),
        reviewCount: row.review_count,
        imageUrl: row.image_url,
        tags,
        description: row.description,
        lexicalScore: Number(lexicalScore.toFixed(3)),
        vectorScore: Number(vectorScore.toFixed(3)),
        hybridScore: Number(Math.min(0.99, Math.max(0.40, hybridScore)).toFixed(3)),
        explanation: row.explanation
      };
    });

    results.sort((a, b) => b.hybridScore - a.hybridScore);

    // Log search to database
    try {
      await pool.execute(
        `INSERT INTO search_logs (persona_id, query, category_filter, vector_weight, primary_intent, max_price, logistics_intent, results_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [personaId, query, searchCategory, vectorWeight, intentData.primaryIntent, effectiveMaxPrice, intentData.logisticsIntent, results.length]
      );
    } catch (logErr) {
      console.warn('Search log insert failed:', logErr.message);
    }

    res.json({ success: true, intentData, results });
  } catch (err) {
    console.error('Error performing search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
