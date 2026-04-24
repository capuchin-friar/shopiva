"use server";

import { cookies } from "next/headers";

const COOKIE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Sets auth JWT cookie (readable by JS for Bearer calls to Node).
 * @param {string} data - JWT value
 * @param {number} role - 0 = customer, 1 = entrepreneur
 */
export async function setNewCookie(data, role) {
  const cookieStore = cookies();
  const cookieName = role === 0 ? "customer_secret" : "entrepreneur_secret";
  const expiresAt = new Date(Date.now() + COOKIE_EXPIRATION_MS);
  const result = cookieStore.set(cookieName, data, {
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  return JSON.stringify(result);
}
