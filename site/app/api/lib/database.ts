/**
 * Database Configuration
 * 
 * PostgreSQL connection pool for the application.
 * 
 * @module app/api/lib/database
 */

import { Pool, PoolClient } from "pg";

let pool: Pool | null = null;

/**
 * Get or create a database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Execute a database query
 */
export async function db(): Promise<PoolClient> {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

/**
 * Execute a query and automatically release the connection
 */
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}

export { getPool };

