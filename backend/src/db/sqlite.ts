import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'snake.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    db = new Database(DB_PATH)
    initSchema(db)
  }
  return db
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      score INTEGER NOT NULL,
      tick INTEGER NOT NULL,
      length INTEGER NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('player', 'ai')),
      ai_strategy TEXT NULL CHECK (ai_strategy IS NULL OR ai_strategy IN ('astar', 'hamilton')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);
  `)
}

export function getDatabase(): Database.Database {
  return getDb()
}

export { getDb }
