import pool from '../config/db.js';

// Helper: safely parse JSON fields that might already be objects (MySQL JSON type)
function safeJsonParse(val, fallback = []) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// GET /api/products — Fetch all products with optional filters
export async function getAllProducts(req, res) {
  try {
    const { category, maxPrice, minRating, search, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (minRating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(minRating));
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR brand LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const limitVal = parseInt(limit) || 50;
    query += ` ORDER BY rating DESC, review_count DESC LIMIT ${limitVal}`;

    const [rows] = await pool.execute(query, params);

    // Parse JSON fields
    const products = rows.map(row => ({
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
      colorPalette: safeJsonParse(row.color_palette, []),
      shippingDays: row.shipping_days,
      inStock: Boolean(row.in_stock),
      tags: safeJsonParse(row.tags, []),
      description: row.description,
      textEmbedding: safeJsonParse(row.text_embedding, []),
      visualEmbedding: safeJsonParse(row.visual_embedding, []),
      frequentlyBoughtTogether: safeJsonParse(row.frequently_bought_together, []),
      completeTheLook: safeJsonParse(row.complete_the_look, []),
      xaiWeights: safeJsonParse(row.xai_weights, {}),
      explanation: row.explanation
    }));

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/products/:id — Fetch single product
export async function getProductById(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const row = rows[0];
    const product = {
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
      colorPalette: safeJsonParse(row.color_palette, []),
      shippingDays: row.shipping_days,
      inStock: Boolean(row.in_stock),
      tags: safeJsonParse(row.tags, []),
      description: row.description,
      textEmbedding: safeJsonParse(row.text_embedding, []),
      visualEmbedding: safeJsonParse(row.visual_embedding, []),
      frequentlyBoughtTogether: safeJsonParse(row.frequently_bought_together, []),
      completeTheLook: safeJsonParse(row.complete_the_look, []),
      xaiWeights: safeJsonParse(row.xai_weights, {}),
      explanation: row.explanation
    };

    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/products — Create a new product
export async function createProduct(req, res) {
  try {
    const p = req.body;
    const query = `INSERT INTO products 
      (id, title, category, sub_category, brand, price, original_price, rating, review_count, 
       image_url, color_palette, shipping_days, in_stock, tags, description, 
       text_embedding, visual_embedding, frequently_bought_together, complete_the_look, 
       xai_weights, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      p.id, p.title, p.category, p.subCategory || null, p.brand || null,
      p.price, p.originalPrice || null, p.rating || null, p.reviewCount || 0,
      p.imageUrl || null, JSON.stringify(p.colorPalette || []),
      p.shippingDays || 2, p.inStock !== false,
      JSON.stringify(p.tags || []), p.description || null,
      JSON.stringify(p.textEmbedding || []), JSON.stringify(p.visualEmbedding || []),
      JSON.stringify(p.frequentlyBoughtTogether || []), JSON.stringify(p.completeTheLook || []),
      JSON.stringify(p.xaiWeights || {}), p.explanation || null
    ];

    await pool.execute(query, params);
    res.status(201).json({ success: true, message: 'Product created', id: p.id });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/products/:id — Update a product
export async function updateProduct(req, res) {
  try {
    const p = req.body;
    const query = `UPDATE products SET 
      title = ?, category = ?, sub_category = ?, brand = ?, price = ?, 
      original_price = ?, rating = ?, review_count = ?, image_url = ?, 
      color_palette = ?, shipping_days = ?, in_stock = ?, tags = ?, 
      description = ?, text_embedding = ?, visual_embedding = ?,
      frequently_bought_together = ?, complete_the_look = ?, 
      xai_weights = ?, explanation = ?
      WHERE id = ?`;

    const params = [
      p.title, p.category, p.subCategory || null, p.brand || null,
      p.price, p.originalPrice || null, p.rating || null, p.reviewCount || 0,
      p.imageUrl || null, JSON.stringify(p.colorPalette || []),
      p.shippingDays || 2, p.inStock !== false,
      JSON.stringify(p.tags || []), p.description || null,
      JSON.stringify(p.textEmbedding || []), JSON.stringify(p.visualEmbedding || []),
      JSON.stringify(p.frequentlyBoughtTogether || []), JSON.stringify(p.completeTheLook || []),
      JSON.stringify(p.xaiWeights || {}), p.explanation || null,
      req.params.id
    ];

    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

// DELETE /api/products/:id — Delete a product
export async function deleteProduct(req, res) {
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
