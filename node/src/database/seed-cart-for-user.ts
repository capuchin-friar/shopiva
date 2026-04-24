/**
 * Replace cart_items for a customer with N lines from existing inventory.
 *
 * Usage (from `node/`):
 *   npx dotenv-cli -e .env -- npx tsx src/database/seed-cart-for-user.ts
 *
 * Optional env:
 *   SEED_CART_EMAIL — default achifa.io.llc@gmail.com
 *   SEED_CART_COUNT — default 5
 */
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const DEFAULT_EMAIL = "achifa.io.llc@gmail.com";

async function main() {
  const email = (process.env.SEED_CART_EMAIL || DEFAULT_EMAIL).trim();
  const count = Math.max(
    1,
    Math.min(50, parseInt(process.env.SEED_CART_COUNT || "5", 10) || 5)
  );

  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "postgres",
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const u = await client.query(
      `SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
      [email]
    );
    if (!u.rows.length) {
      throw new Error(`No user with email: ${email}`);
    }
    const userId = u.rows[0].id as number;

    const inv = await client.query(
      `SELECT i.id
       FROM inventory i
       INNER JOIN products p ON p.id = i.product_id
       ORDER BY i.id
       LIMIT $1`,
      [count]
    );
    if (!inv.rows.length) {
      throw new Error("No inventory rows found (need products + inventory).");
    }

    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

    for (const row of inv.rows) {
      const inventoryId = row.id as number;
      await client.query(
        `INSERT INTO cart_items (user_id, inventory_id, quantity)
         VALUES ($1, $2, 1)`,
        [userId, inventoryId]
      );
    }

    await client.query("COMMIT");
    console.log(
      `Cart seeded: user_id=${userId} (${email}), ${inv.rows.length} line(s).`
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
