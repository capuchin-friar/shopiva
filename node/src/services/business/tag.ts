/**
 * TAG SERVICE
 *
 * Business logic for tags (e.g. fetching tags by category for vendor product form).
 */

import { tag } from "../../models/business/tag.js";

/**
 * Get tags for a given category, optionally filtered by subcategory and product type.
 */
export async function GetTagsByCategoryService(
  category: string,
  subCategory?: string | null,
  productType?: string | null
) {
  const trimmed = (category || "").trim();
  if (!trimmed) return [];
  return tag.getByType(trimmed, subCategory?.trim() || null, productType?.trim() || null);
}
