import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'data.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Waves (survey waves for analysis filter processing)
    CREATE TABLE IF NOT EXISTS waves (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      study_id TEXT NOT NULL,
      study_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location_ids TEXT NOT NULL DEFAULT '[]',
      sample_size INTEGER NOT NULL DEFAULT 0
    );

    -- Survey response data (simulated per-wave per-datapoint metrics)
    CREATE TABLE IF NOT EXISTS survey_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wave_id TEXT NOT NULL REFERENCES waves(id),
      question_id TEXT NOT NULL,
      datapoint_id TEXT NOT NULL,
      category TEXT NOT NULL,
      question_name TEXT NOT NULL,
      datapoint_name TEXT NOT NULL,
      respondent_count INTEGER NOT NULL,
      percentage REAL NOT NULL,
      index_vs_avg REAL NOT NULL DEFAULT 100.0,
      sample_size INTEGER NOT NULL
    );

    -- Capabilities (agent inventory)
    CREATE TABLE IF NOT EXISTS capabilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'agent',
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      inputs TEXT NOT NULL DEFAULT '[]',
      outputs TEXT NOT NULL DEFAULT '[]',
      dependencies TEXT DEFAULT '[]',
      confidence TEXT
    );

    -- Flows (agent workflows)
    CREATE TABLE IF NOT EXISTS flows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      triggers TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]'
    );

    -- Platform linkages
    CREATE TABLE IF NOT EXISTS linkages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      endpoints TEXT NOT NULL DEFAULT '[]',
      auth TEXT NOT NULL DEFAULT 'token'
    );

    -- Runs (flow executions with analysis config)
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      flow_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      brief TEXT NOT NULL,
      analysis_config TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      outputs TEXT NOT NULL DEFAULT '[]'
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_survey_data_wave ON survey_data(wave_id);
    CREATE INDEX IF NOT EXISTS idx_survey_data_question ON survey_data(question_id);
    CREATE INDEX IF NOT EXISTS idx_survey_data_wave_question ON survey_data(wave_id, question_id);
    CREATE INDEX IF NOT EXISTS idx_runs_flow ON runs(flow_id);
    CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
  `)
}

export function closeDb() {
  if (db) {
    db.close()
  }
}
