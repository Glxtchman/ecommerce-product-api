const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../store.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    role      TEXT    NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
    createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    price       REAL    NOT NULL CHECK(price >= 0),
    stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    category    TEXT,
    brand       TEXT,
    imageUrl    TEXT,
    isFeatured  INTEGER NOT NULL DEFAULT 0,
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now')),
    updatedAt   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('SQLite database connected — store.db');

module.exports = db;
