/**
 * Relative dates via npm package `js-ago` (install: `npm i js-ago`).
 * The package default export is the `js_ago` implementation; it only supports past instants,
 * so future times use a small "in …" fallback.
 */

import js_ago from "js-ago";

const EM_DASH = "—";

function isPlaceholder(value) {
  if (value == null) return true;
  const s = String(value).trim();
  return s === "" || s === EM_DASH || s === "-" || s === "–";
}

function formatFutureRelative(d, format) {
  const sec = Math.floor((d.getTime() - Date.now()) / 1000);
  const short = format === "short";
  if (sec < 60) return short ? "<1m" : "in under a minute";
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return short ? `in ${min}m` : min === 1 ? "in 1 min" : `in ${min} mins`;
  }
  const hrs = Math.floor(min / 60);
  if (hrs < 48) {
    return short ? `in ${hrs}h` : hrs === 1 ? "in 1 hr" : `in ${hrs} hrs`;
  }
  const days = Math.floor(hrs / 24);
  if (days < 60) {
    return short ? `in ${days}d` : days === 1 ? "in 1 day" : `in ${days} days`;
  }
  return d.toLocaleDateString("en-NG", { dateStyle: "medium" });
}

/**
 * @param {string | number | Date | null | undefined} value
 * @param {{ format?: "short" | "medium" | "long" }} [options]
 * @returns {string}
 */
export function formatDisplayDate(value, options = {}) {
  const format = options.format ?? "medium";
  if (isPlaceholder(value)) return EM_DASH;

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    return typeof value === "string" ? value : EM_DASH;
  }

  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 0) {
    return formatFutureRelative(d, format);
  }

  try {
    return js_ago(d, { format });
  } catch {
    return d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
  }
}

/**
 * @param {string | number | Date | null | undefined} startIso
 * @param {string | number | Date | null | undefined} endIso
 */
export function formatDeliveryWindow(startIso, endIso) {
  if (isPlaceholder(startIso) || isPlaceholder(endIso)) return EM_DASH;
  return `Between ${formatDisplayDate(startIso)} and ${formatDisplayDate(endIso)}`;
}
