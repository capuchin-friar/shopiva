import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { order as orderModel, type OrderListRow } from "../../models/business/product.js";

export async function GetBuyerOrdersController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const orders = await orderModel.getByCustomerId(userId);
    res.status(200).json({ orders });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

export async function GetBuyerOrderByIdController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const orderId = req.params.orderId;
    const orders = await orderModel.getByCustomerId(userId);
    const row = orders.find((o: OrderListRow) => String(o.order_id) === String(orderId));
    if (!row) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(200).json({ order: row });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
