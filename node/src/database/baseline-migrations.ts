/**
 * Record all migration filenames in `migrations` without running SQL.
 * Use once when the database schema already exists but the `migrations`
 * table is empty (e.g. DB was set up manually or the tracker was truncated).
 *
 * After this, `npm run migrate` will skip those files and only run new ones.
 */
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

async function main(): Promise<void> {
  const dbConfig = {
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "postgres",
  };

  const migrationsDir = path.join(projectRoot, "src", "database", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const pool = new Pool(dbConfig);
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    let inserted = 0;
    for (const file of files) {
      const name = file.replace(/\.sql$/i, "");
      const r = await client.query(
        `INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [name]
      );
      if ((r.rowCount ?? 0) > 0) {
        inserted += 1;
        console.log(`Recorded: ${file}`);
      } else {
        console.log(`Already recorded: ${file}`);
      }
    }

    console.log(`\nDone. Inserted ${inserted} row(s); ${files.length} migration name(s) total in folder.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
