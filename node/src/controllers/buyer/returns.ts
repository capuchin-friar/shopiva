import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { returnsTransformer } from "../../transformers/buyer/returns.js";
import { returnTransformer } from "../../transformers/buyer/return.js";

export async function GetBuyerReturnsController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const returns = await returnsTransformer(userId);
    res.status(200).json({ returns });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

export async function GetBuyerReturnByIdController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const returnId = req.params.returnId;
    const returnData = await returnTransformer(returnId);
    if (!returnData) {
      res.status(404).json({ error: "Return not found" });
      return;
    }
    res.status(200).json({ return: returnData });
  } catch (err) {
    console.log("err:", err)
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
