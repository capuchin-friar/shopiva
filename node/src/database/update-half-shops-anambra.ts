/**
 * Sets half of all shops (first half when ordered by id) to Anambra State
 * with real lat/lng; other shops are left unchanged.
 *
 * Run from node/: npm run update:shops-half-anambra
 */

import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(): void {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
    override: false,
  });
}

/** Representative points in Anambra State, Nigeria */
const ANAMBRA_POINTS: { lat: number; lng: number; area: string }[] = [
  { lat: 6.2104, lng: 7.0744, area: "Awka" },
  { lat: 6.1459, lng: 6.7855, area: "Onitsha" },
  { lat: 6.0186, lng: 6.9098, area: "Nnewi" },
  { lat: 6.0244, lng: 7.0804, area: "Ekwulobia" },
  { lat: 6.3012, lng: 6.9106, area: "Aguleri" },
  { lat: 5.904, lng: 6.996, area: "Ihiala" },
  { lat: 6.083, lng: 7.1, area: "Oko" },
  { lat: 6.214, lng: 6.923, area: "Ukpo" },
  { lat: 6.047, lng: 7.003, area: "Adazi-Nnukwu" },
  { lat: 5.94, lng: 6.85, area: "Ozubulu" },
  { lat: 6.1667, lng: 6.9333, area: "Ogbunike" },
  { lat: 6.132, lng: 6.789, area: "Obosi" },
];

function buildAnambraLocation(pt: { lat: number; lng: number; area: string }) {
  return {
    address: `${pt.area}, Anambra State, Nigeria`,
    city: pt.area,
    state: "Anambra",
    country: "Nigeria",
    zipcode: null,
    coordinates: { lat: pt.lat, lng: pt.lng },
  };
}

async function main() {
  loadEnv();
  const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: (process.env.DB_NAME || "postgres").trim(),
  });

  const client = await pool.connect();
  try {
    const { rows } = await client.query<{ id: number; name: string }>(
      `SELECT id, name FROM shops ORDER BY id`
    );

    if (rows.length === 0) {
      console.log("No shops found.");
      return;
    }

    const halfCount = Math.ceil(rows.length / 2);
    const toUpdate = rows.slice(0, halfCount);

    let n = 0;
    for (const row of toUpdate) {
      const pt = ANAMBRA_POINTS[row.id % ANAMBRA_POINTS.length]!;
      const loc = buildAnambraLocation(pt);
      await client.query(
        `UPDATE shops SET location = $1::jsonb, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
        [JSON.stringify(loc), row.id]
      );
      console.log(
        `Shop ${row.id} (${row.name}) → Anambra / ${pt.area} (${pt.lat}, ${pt.lng})`
      );
      n++;
    }

    console.log(`\nUpdated ${n} of ${rows.length} shop(s) to Anambra (${halfCount} = half, rounded up).`);
    console.log(`Left unchanged: ${rows.length - n} shop(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
