/**
 * TAG MODEL
 *
 * Handles database operations for tags (e.g. get by category/type for vendor product form).
 */

import { db } from "../../config/database.js";
import { withErrorHandling } from "../../utils/errHandler.js";

export type TagRow = {
  id: number;
  name: string;
  type: string;
  sub_category?: string | null;
  product_type?: string | null;
};

export class tag {
  /**
   * Get tags filtered by category and optionally subcategory and product type.
   */
  static getByType = withErrorHandling(
    async (
      category: string,
      subCategory?: string | null,
      productType?: string | null
    ): Promise<TagRow[]> => {
      const { rows } = await (await db()).query<TagRow>(
        `SELECT id, name, type, sub_category, product_type FROM tags
         WHERE type = $1
           AND (sub_category IS NULL OR sub_category = $2)
           AND (product_type IS NULL OR product_type = $3)
         ORDER BY name ASC`,
        [category, subCategory ?? null, productType ?? null]
      );
      return rows;
    }
  );
}
