import { Pool, type PoolConfig } from "pg";

let pool: Pool | undefined;

function poolConfigFromEnv(): PoolConfig {
  return {
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME ?? "postgres",
    /** Cap concurrent connections; each `db()` call used to leak a client. */
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };
}

/**
 * Shared connection pool. Callers should use `(await db()).query(...)` so each
 * query borrows a client briefly and returns it to the pool (do not hold the
 * pool across awaits without a transaction pattern).
 */
export const db = async (): Promise<Pool> => {
  if (!pool) {
    pool = new Pool(poolConfigFromEnv());
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
