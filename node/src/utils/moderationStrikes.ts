/**
 * In-memory moderation strike counts per (user, room) for context scoring.
 * Resets after TTL — extend to Redis/DB for multi-instance deployments.
 */

const TTL_MS = 3_600_000;

type StrikeEntry = { count: number; resetAt: number };

const strikes = new Map<string, StrikeEntry>();

function key(userId: number, roomId: string): string {
  return `${userId}::${roomId}`;
}

export function getSessionModerationStrikes(userId: number, roomId: string): number {
  const k = key(userId, roomId);
  const v = strikes.get(k);
  const now = Date.now();
  if (!v || now > v.resetAt) return 0;
  return v.count;
}

/** @returns updated strike count */
export function incrementSessionModerationStrikes(
  userId: number,
  roomId: string,
): number {
  const k = key(userId, roomId);
  const now = Date.now();
  const cur = strikes.get(k);
  let next = 1;
  if (cur && now < cur.resetAt) next = cur.count + 1;
  strikes.set(k, { count: next, resetAt: now + TTL_MS });
  return next;
}
