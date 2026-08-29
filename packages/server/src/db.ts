import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DATA_DIR = process.env.POLICYCTL_DATA_DIR ?? join(homedir(), ".policyctl-server");
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(join(DATA_DIR, "policyctl.db"));

db.exec(
  `CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY,
     email TEXT UNIQUE,
     token TEXT,
     created_at INTEGER
   );`,
);
db.exec(
  `CREATE TABLE IF NOT EXISTS policies (
     user_id INTEGER PRIMARY KEY,
     yaml TEXT,
     updated_at INTEGER
   );`,
);
db.exec(
  `CREATE TABLE IF NOT EXISTS violations (
     id INTEGER PRIMARY KEY,
     user_id INTEGER,
     repo TEXT,
     rule_id TEXT,
     enforce TEXT,
     message TEXT,
     agent TEXT,
     created_at INTEGER
   );`,
);
