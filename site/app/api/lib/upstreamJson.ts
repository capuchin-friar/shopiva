/**
 * Parse a fetch Response from the Node backend. Avoids throwing when the
 * upstream returns HTML (wrong URL, gateway page, 404 document) or junk.
 */

export type UpstreamParsed =
  | { kind: "json"; data: unknown }
  | { kind: "empty" }
  | { kind: "html" }
  | { kind: "invalid" };

export async function readUpstreamJson(res: Response): Promise<UpstreamParsed> {
  const text = await res.text();
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return { kind: "empty" };
  if (trimmed.startsWith("<")) return { kind: "html" };
  try {
    return { kind: "json", data: JSON.parse(trimmed) };
  } catch {
    return { kind: "invalid" };
  }
}

export function upstreamJsonError(
  parsed: UpstreamParsed
): string | null {
  if (parsed.kind === "html") {
    return "Backend returned HTML instead of JSON. Check NEXT_PUBLIC_BACKEND_URL and that the shop API is reachable.";
  }
  if (parsed.kind === "invalid") {
    return "Backend returned a non-JSON response.";
  }
  return null;
}

/** Body object for non-JSON upstream; use with !res.ok to read message fields. */
export function upstreamData(
  parsed: UpstreamParsed
): Record<string, unknown> {
  if (parsed.kind !== "json" || parsed.data == null || typeof parsed.data !== "object") {
    return {};
  }
  return parsed.data as Record<string, unknown>;
}
