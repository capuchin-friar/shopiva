/**
 * SHOP DISPUTES CONTROLLER
 *
 * Vendor-side endpoints to list disputes raised against the shop's orders.
 *
 * @see services/business/disputes.ts for business logic
 * @see routes/business/shop.ts for route definitions
 */

import type { Request, Response } from "express";
import {
  GetShopDisputeByIdService,
  GetShopDisputesService,
} from "../../services/business/disputes.js";
import { disputesTransformer } from "../../transformers/business/disputes.js";

/**
 * GET /shop/:shopId/disputes/:id
 * Lists disputes for a vendor's shop. `:id` is the requesting user's id (must own the shop).
 */
export async function GetShopDisputesController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.params?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const ownerId = req.params.id;
    const shopId = parseInt(req.params.shopId ?? "", 10);
    if (isNaN(shopId)) {
      res.status(400).json({ error: "Invalid shop ID" });
      return;
    }

    // const includeClosed = String(req.query.includeClosed ?? "").toLowerCase() === "true";
    // const disputes = await GetShopDisputesService(shopId, ownerId, { includeClosed });
    const disputes = await disputesTransformer(shopId, ownerId);

    res.status(200).json({ disputes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/^Error:\s*Forbidden$/.test(msg) || msg === "Forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (/Shop not found/i.test(msg)) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.status(400).json({ error: msg });
  }
}

/**
 * GET /shop/:shopId/dispute/:disputeId/:id
 * Fetches one dispute for a vendor's shop. Accepts either dispute_ref or numeric id.
 */
export async function GetShopDisputeByIdController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.params?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const ownerId = req.params.id;
    const shopId = parseInt(req.params.shopId ?? "", 10);
    const disputeId = String(req.params.disputeId ?? "").trim();
    if (isNaN(shopId)) {
      res.status(400).json({ error: "Invalid shop ID" });
      return;
    }
    if (!disputeId) {
      res.status(400).json({ error: "Invalid dispute id" });
      return;
    }

    const dispute = await GetShopDisputeByIdService(shopId, ownerId, disputeId);
    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }
    res.status(200).json({ dispute });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/^Error:\s*Forbidden$/.test(msg) || msg === "Forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (/Shop not found/i.test(msg)) {
      res.status(404).json({ error: "Shop not found" });
      return;
    }
    res.status(400).json({ error: msg });
  }
}
