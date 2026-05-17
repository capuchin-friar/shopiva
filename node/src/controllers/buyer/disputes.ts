import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import {
  BackfillBuyerDisputesFromOrdersService,
  CreateBuyerDisputeService,
  GetBuyerDisputeByIdService,
  GetBuyerDisputesService,
  parseRaiseDisputePayload,
} from "../../services/buyer/disputes.js";

export async function GetBuyerDisputesController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const shouldBackfill = String(req.query.backfill ?? "true").toLowerCase() !== "false";
    if (shouldBackfill) {
      await BackfillBuyerDisputesFromOrdersService(userId);
    }

    const includeClosed = String(req.query.includeClosed ?? "").toLowerCase() === "true";
    const disputes = await GetBuyerDisputesService(userId, { includeClosed });
    res.status(200).json({ disputes });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

export async function GetBuyerDisputeByIdController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const disputeId = String(req.params.disputeId ?? "").trim();
    if (!disputeId) {
      res.status(400).json({ error: "Invalid dispute id" });
      return;
    }
    const dispute = await GetBuyerDisputeByIdService(userId, disputeId);
    if (!dispute) {
      res.status(404).json({ error: "Dispute not found" });
      return;
    }
    res.status(200).json({ dispute });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

export async function CreateBuyerDisputeController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const body =
      req.body != null && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : {};
    const parsed = parseRaiseDisputePayload({
      ...body,
      customer_id: body.customer_id ?? userId,
    });
    const dispute = await CreateBuyerDisputeService(parsed);
    res.status(201).json({ message: "Dispute created successfully", dispute });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

export async function BackfillBuyerDisputesFromOrdersController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const result = await BackfillBuyerDisputesFromOrdersService(userId);
    res.status(200).json({
      message: "Disputes generated from existing orders",
      ...result,
    });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
