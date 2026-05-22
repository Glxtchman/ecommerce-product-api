const db = require('../config/db');

// @desc    Get all products — with search, filter, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, featured, page = 1, limit = 10 } = req.query;

    const conditions = [];
    const params = [];

    if (keyword) {
      conditions.push("(name LIKE ? OR description LIKE ? OR brand LIKE ?)");
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }
    if (category) { conditions.push("category = ?"); params.push(category); }
    if (brand)    { conditions.push("brand = ?");    params.push(brand); }
    if (minPrice) { conditions.push("price >= ?");   params.push(Number(minPrice)); }
    if (maxPrice) { conditions.push("price <= ?");   params.push(Number(maxPrice)); }
    if (featured === 'true') { conditions.push("isFeatured = 1"); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM products ${where}`).get(...params).count;

    const offset = (Number(page) - 1) * Number(limit);
    const products = db
      .prepare(`SELECT * FROM products ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
      .all(...params, Number(limit), offset);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      count: products.length,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = (req, res, next) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
exports.createProduct = (req, res, next) => {
  try {
    const { name, description, price, stock, category, brand, imageUrl, isFeatured } = req.body;

    const result = db
      .prepare(
        `INSERT INTO products (name, description, price, stock, category, brand, imageUrl, isFeatured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        description || null,
        price,
        stock ?? 0,
        category || null,
        brand || null,
        imageUrl || null,
        isFeatured ? 1 : 0
      );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const fields = ['name', 'description', 'price', 'stock', 'category', 'brand', 'imageUrl', 'isFeatured'];
    const updates = [];
    const values = [];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(field === 'isFeatured' ? (req.body[field] ? 1 : 0) : req.body[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    updates.push("updatedAt = datetime('now')");
    values.push(req.params.id);

    db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};
