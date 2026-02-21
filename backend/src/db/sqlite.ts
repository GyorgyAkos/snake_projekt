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

const SCHEMA_VERSION = 2
const SCORES_TABLE_DDL = `
  CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL,
    tick INTEGER NOT NULL,
    length INTEGER NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('player', 'ai')),
    ai_strategy TEXT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
  CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);
`

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);
    INSERT OR IGNORE INTO schema_version (version) VALUES (1);
  `)

  const versionRow = database.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined
  let version = versionRow?.version ?? 1
  const scoresExists = database.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='scores'").get()

  if (version < 2) {
    if (scoresExists) {
      database.exec(`
        CREATE TABLE scores_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id),
          score INTEGER NOT NULL,
          tick INTEGER NOT NULL,
          length INTEGER NOT NULL,
          mode TEXT NOT NULL CHECK (mode IN ('player', 'ai')),
          ai_strategy TEXT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT INTO scores_new (id, user_id, score, tick, length, mode, ai_strategy, created_at)
        SELECT id, user_id, score, tick, length, mode, ai_strategy, created_at FROM scores;
        DROP TABLE scores;
        ALTER TABLE scores_new RENAME TO scores;
        CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
        CREATE INDEX IF NOT EXISTS idx_scores_created ON scores(created_at DESC);
      `)
    } else {
      database.exec(SCORES_TABLE_DDL)
    }
    database.prepare('UPDATE schema_version SET version = ?').run(SCHEMA_VERSION)
  } else if (!scoresExists) {
    database.exec(SCORES_TABLE_DDL)
  }
}

export function getDatabase(): Database.Database {
  return getDb()
}

export { getDb }
