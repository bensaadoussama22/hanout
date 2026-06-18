import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'hanout.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'travailleur',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    group_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    entree REAL NOT NULL DEFAULT 0,
    sortie REAL NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT '',
    has_photo INTEGER NOT NULL DEFAULT 0,
    photo TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'fini',
    notes TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1,
    urgent INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_articles_user ON articles(user_id);
`);

// Migrate databases created before role/urgent existed.
const userColumns = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!userColumns.includes('role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'travailleur'");
}
const articleColumns = db.prepare("PRAGMA table_info(articles)").all().map((c) => c.name);
if (!articleColumns.includes('urgent')) {
  db.exec('ALTER TABLE articles ADD COLUMN urgent INTEGER NOT NULL DEFAULT 0');
}

const hasAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
if (!hasAdmin) {
  db.prepare(
    'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run('Admin', 'admin@admin.admin', bcrypt.hashSync('admin', 10), 'admin', new Date().toISOString());
}

export default db;
