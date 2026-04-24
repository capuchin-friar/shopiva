/**
 * Persists the vendor's last-selected shop id for default selection after login / refresh.
 */

export const LAST_ENTREPRENEUR_SHOP_ID_KEY = "entrepreneur_last_shop_id_v1";

export function getStoredEntrepreneurShopId() {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(LAST_ENTREPRENEUR_SHOP_ID_KEY);
    if (v == null || v === "") return null;
    return v;
  } catch {
    return null;
  }
}

export function setStoredEntrepreneurShopId(id) {
  if (typeof window === "undefined" || id == null || id === "") return;
  try {
    window.localStorage.setItem(LAST_ENTREPRENEUR_SHOP_ID_KEY, String(id));
  } catch {
    // ignore
  }
}

export function clearStoredEntrepreneurShopId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_ENTREPRENEUR_SHOP_ID_KEY);
  } catch {
    // ignore
  }
}

export function shopRowId(s) {
  return s?.id ?? s?.shop_id ?? s?.shopId;
}

/**
 * Prefer last-used shop if it still exists in the list; otherwise first shop.
 * @param {unknown[]} shops
 * @returns {unknown | null}
 */
export function pickDefaultShopFromList(shops) {
  if (!Array.isArray(shops) || shops.length === 0) return null;
  const lastId = getStoredEntrepreneurShopId();
  if (lastId != null) {
    const match = shops.find((s) => String(shopRowId(s)) === String(lastId));
    if (match) return match;
  }
  return shops[0];
}
