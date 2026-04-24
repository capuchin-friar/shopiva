/**
 * One-off: set shops that are not in Lagos (wrong state or lat/lng outside Lagos)
 * to a real Lagos neighborhood (cycles through fixed points).
 *
 * Run from node/: npm run update:shops-lagos
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

const LAGOS_POINTS: { lat: number; lng: number; area: string }[] = [
  { lat: 6.6018, lng: 3.3515, area: "Ikeja" },
  { lat: 6.4281, lng: 3.4219, area: "Victoria Island" },
  { lat: 6.4474, lng: 3.4734, area: "Lekki Phase 1" },
  { lat: 6.5086, lng: 3.3714, area: "Yaba" },
  { lat: 6.5006, lng: 3.351, area: "Surulere" },
  { lat: 6.4488, lng: 3.359, area: "Apapa" },
  { lat: 6.5244, lng: 3.35, area: "Mushin" },
  { lat: 6.6156, lng: 3.3252, area: "Agege" },
  { lat: 6.6194, lng: 3.5105, area: "Ikorodu" },
  { lat: 6.4682, lng: 3.6015, area: "Ajah" },
  { lat: 6.5535, lng: 3.3342, area: "Oshodi" },
  { lat: 6.47, lng: 3.2, area: "Festac Town" },
  { lat: 6.4541, lng: 3.3947, area: "Lagos Island" },
  { lat: 6.5444, lng: 3.3847, area: "Gbagada" },
  { lat: 6.4698, lng: 3.5852, area: "Sangotedo" },
];

/** Rough bounding box for Lagos State (incl. Badagry west, Epe east). */
const LAGOS_LAT_MIN = 6.35;
const LAGOS_LAT_MAX = 6.78;
const LAGOS_LNG_MIN = 2.65;
const LAGOS_LNG_MAX = 3.85;

function coordsInLagos(lat: number, lng: number): boolean {
  return (
    lat >= LAGOS_LAT_MIN &&
    lat <= LAGOS_LAT_MAX &&
    lng >= LAGOS_LNG_MIN &&
    lng <= LAGOS_LNG_MAX
  );
}

/** Returns true if this shop should be moved to Lagos. */
function needsLagosUpdate(loc: unknown): boolean {
  if (loc == null || typeof loc !== "object") return true;

  const o = loc as Record<string, unknown>;
  const stateRaw =
    typeof o.state === "string" ? o.state.trim().toLowerCase() : "";

  const coords = o.coordinates;
  let lat: number | null = null;
  let lng: number | null = null;
  if (coords != null && typeof coords === "object") {
    const c = coords as Record<string, unknown>;
    lat = Number(c.lat);
    lng = Number(c.lng);
    if (!Number.isFinite(lat)) lat = null;
    if (!Number.isFinite(lng)) lng = null;
  }

  if (stateRaw && stateRaw !== "lagos") return true;
  if (lat == null || lng == null) return true;
  if (!coordsInLagos(lat, lng)) return true;
  return false;
}

function buildLocation(pt: { lat: number; lng: number; area: string }) {
  return {
    address: `${pt.area}, Lagos State, Nigeria`,
    city: "Lagos",
    state: "Lagos",
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
    const { rows } = await client.query<{
      id: number;
      name: string;
      location: unknown;
    }>(`SELECT id, name, location FROM shops ORDER BY id`);

    let updated = 0;
    for (const row of rows) {
      if (!needsLagosUpdate(row.location)) continue;

      const pt = LAGOS_POINTS[row.id % LAGOS_POINTS.length]!;
      const loc = buildLocation(pt);
      await client.query(
        `UPDATE shops SET location = $1::jsonb, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
        [JSON.stringify(loc), row.id]
      );
      console.log(
        `Updated shop ${row.id} (${row.name}) → ${pt.area} (${pt.lat}, ${pt.lng})`
      );
      updated++;
    }

    if (updated === 0) {
      console.log("No shops needed updates (all already look like Lagos).");
    } else {
      console.log(`\nUpdated ${updated} shop(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
