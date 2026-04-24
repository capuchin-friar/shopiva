/**
 * JWT secret normalization.
 * Must match the Node backend's getJwtSecret() so tokens signed here verify there.
 */

export function getJwtSecret(): string {
  const raw = process.env.JWT_SECRET ?? "";
  const trimmed = raw.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
