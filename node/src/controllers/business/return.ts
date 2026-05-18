import type { Request, Response } from "express";
import {
  GetReturnsByShopIdService,
  GetReturnDetailByIdService,
} from "../../services/business/return.js";

/**
 * Get all returns for a shop.
 * GET /shop/:shopId/returns/:id
 */
export async function GetReturnsByShopController(req: Request, res: Response) {
  try {
    if (!req.params?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const shopId = parseInt(req.params.shopId ?? "", 10);
    if (isNaN(shopId)) {
      res.status(400).json({ error: "Invalid shop ID" });
      return;
    }

    const returns = await GetReturnsByShopIdService(shopId);
    res.status(200).json({ returns });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Get return detail for a shop.
 * GET /shop/:shopId/returns/:returnId/:id
 */
export async function GetReturnDetailByIdController(req: Request, res: Response) {
  try {
    if (!req.params?.returnId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const shopId = parseInt(req.params.shopId ?? "", 10);
    const returnId = parseInt(req.params.returnId ?? "", 10);
    if (isNaN(shopId)) {
      res.status(400).json({ error: "Invalid shop ID" });
      return;
    }

    const returnData = await GetReturnDetailByIdService(returnId);
    res.status(200).json({ return: returnData });
  } catch (err) {
    console.log(err)
    res.status(400).json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
