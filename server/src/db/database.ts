import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure the data directory exists before opening the DB file
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'queries.db');

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// All tables are created here so controllers can call db.prepare() at module
// load time without racing against explicit initSchema() calls in index.ts.
db.exec(`
  CREATE TABLE IF NOT EXISTS queries (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    phone       TEXT,
    case_type   TEXT    NOT NULL
                        CHECK(case_type IN ('fir', 'court', 'general')),
    fir_number  TEXT,
    fir_city    TEXT,
    court_city  TEXT,
    case_number TEXT,
    description TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending', 'reviewed', 'resolved')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_questions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT    NOT NULL,
    order_index   INTEGER NOT NULL,
    type          TEXT    NOT NULL DEFAULT 'text'
                          CHECK(type IN ('text','dropdown','number','email','phone')),
    options       TEXT,
    required      INTEGER NOT NULL DEFAULT 1,
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id                     TEXT PRIMARY KEY,
    status                 TEXT NOT NULL DEFAULT 'in_progress'
                                 CHECK(status IN ('in_progress','completed')),
    current_question_order INTEGER NOT NULL DEFAULT 0,
    created_at             TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_responses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id    TEXT    NOT NULL REFERENCES chat_sessions(id),
    question_id   INTEGER NOT NULL REFERENCES chat_questions(id),
    response_text TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);
