/**
 * Auth headers for Next.js → /api/backend → Node (customer JWT in cookie or Bearer).
 * @module reusables/shopBackendAuth
 */

/** @param {string} name */
export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
}

export const API_BACKEND = "/api/backend";

/** Headers for authenticated buyer requests (customer_secret cookie readable by JS). */
export function buyerAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getCookie("customer_secret");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}
