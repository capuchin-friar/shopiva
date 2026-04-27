import { Pool, type PoolConfig } from "pg";

let pool: Pool | undefined;

/** Shared by app + migration scripts. Prefer URL vars in hosted environments. */
export function pgPoolConfigFromEnv(): PoolConfig {
  const connectionString = process.env.DB?.trim() || process.env.DATABASE_URL?.trim();
  const max = Number(process.env.DB_POOL_MAX ?? 10);
  const idleTimeoutMillis = 30_000;
  const connectionTimeoutMillis = 10_000;

  if (connectionString) {
    return {
      connectionString,
      max,
      idleTimeoutMillis,
      connectionTimeoutMillis,
    };
  }

  return {
    user: process.env.DB_USER ?? process.env.PGUSER ?? "postgres",
    password: process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? "postgres",
    host: process.env.DB_HOST ?? process.env.PGHOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? process.env.PGPORT ?? "5432"),
    database: process.env.DB_NAME ?? process.env.PGDATABASE ?? "postgres",
    max,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  };
}

/**
 * Shared connection pool. Callers should use `(await db()).query(...)` so each
 * query borrows a client briefly and returns it to the pool (do not hold the
 * pool across awaits without a transaction pattern).
 */
export const db = async (): Promise<Pool> => {
  if (!pool) {
    pool = new Pool(pgPoolConfigFromEnv());
    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err);
    });
  }
  return pool;
};

/** Close the pool (e.g. graceful shutdown in tests). */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    const p = pool;
    pool = undefined;
    await p.end();
  }
}
