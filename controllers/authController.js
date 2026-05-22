const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc    Register
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run(name, email.toLowerCase(), hashed);

    const user = db
      .prepare('SELECT id, name, email, role, createdAt FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      token: signToken(user.id, user.role),
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { password: _pw, ...safeUser } = user;

    res.status(200).json({
      success: true,
      token: signToken(user.id, user.role),
      user: safeUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

// @desc    Logout (stateless — just confirms on server side)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully. Delete the token on the client.' });
};
