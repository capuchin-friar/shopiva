import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { getJwtSecret } from "./jwt";

function bearerOrCustomerCookie(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return request.cookies.get("customer_secret")?.value ?? null;
}

/**
 * Verifies customer JWT from Authorization header or customer_secret cookie.
 * @returns numeric user id or null
 */
export function getCustomerUserId(request: NextRequest): number | null {
  const token = bearerOrCustomerCookie(request);
  const secret = getJwtSecret();
  if (!token || !secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as { id?: unknown };
    const raw = decoded?.id;
    const n = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(n) || n < 1) return null;
    return Math.floor(n);
  } catch {
    return null;
  }
}
