/**
 * TAG CONTROLLER
 *
 * HTTP handlers for tag endpoints (e.g. get tags by category for vendor product form).
 */

import type { Request, Response } from "express";
import { GetTagsByCategoryService } from "../../services/business/tag.js";

/**
 * Get tags by category, optionally by subCategory and type.
 * GET /shop/tags?category=electronics&subCategory=headphones&type=...
 */
export async function GetTagsByCategoryController(req: Request, res: Response) {
  try {
    const category = (req.query.category as string) ?? "";
    const subCategory = (req.query.subCategory as string) ?? null;
    const type = (req.query.type as string) ?? null;

    const tags = await GetTagsByCategoryService(category, subCategory, type);

    res.status(200).json({
      message: "Tags retrieved successfully",
      tags,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
