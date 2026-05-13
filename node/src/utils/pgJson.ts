/**
 * Safe JSON for PostgreSQL `jsonb` parameters (Paystack metadata, order line items, etc.).
 */

export function jsonReplacer(_key: string, v: unknown): unknown {
  if (v === undefined) return undefined;
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "function" || typeof v === "symbol") return undefined;
  if (v instanceof Date) return v.toISOString();
  if (Buffer.isBuffer(v)) return { _type: "Buffer", base64: v.toString("base64") };
  return v;
}

/** Plain JSON-compatible tree (strip non-JSON types). */
export function toPlainJsonForPg(value: unknown): unknown {
  if (value === undefined || value === null) return {};
  try {
    const raw = JSON.stringify(value, jsonReplacer);
    if (raw === undefined) return {};
    return JSON.parse(raw) as unknown;
  } catch {
    return { _note: "serialization_fallback", at: new Date().toISOString() };
  }
}

/**
 * Valid JSON **text** bound as `$n::jsonb` so Postgres parses a single document.
 * Avoids node-pg stringifying objects without a replacer (BigInt / bad `toJSON`).
 */
export function toJsonbTextParam(value: unknown): string {
  try {
    const plain = toPlainJsonForPg(value);
    const text = JSON.stringify(plain, jsonReplacer);
    JSON.parse(text);
    return text;
  } catch {
    return JSON.stringify({
      _note: "json_param_fallback",
      at: new Date().toISOString(),
    });
  }
}
