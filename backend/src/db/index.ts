import Database from 'better-sqlite3';
import type * as BetterSqlite3 from 'better-sqlite3';
import path from 'path';

// Store the database file in the root of the backend folder
const dbPath = path.join(process.cwd(), 'expenses.db');
const db: BetterSqlite3.Database = new Database(dbPath);

// Enable foreign keys and write-ahead logging for better performance/reliability
db.pragma('journal_mode = WAL');

// Initialize our strict schema
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL, -- STRICT RULE: Must be integer (paise/cents)
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL, -- ISO 8601 string (YYYY-MM-DD)
    idempotency_key TEXT UNIQUE NOT NULL, -- Enforces idempotency at the DB level
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;