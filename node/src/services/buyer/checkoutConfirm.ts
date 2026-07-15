import { db } from "../../config/database.js";
import { chatModel } from "../../models/chat.js";
import type { ChatRoomRecord } from "../../models/chat.js";
import { paystack } from "../paystack.js";
import { listCartLinesForUser } from "./cart.js";
import { notifyUser } from "../socketBroadcast.js";

function pickNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Distinct shop owner user ids for the current cart. */
async function cartVendorIdsForUser(userId: number): Promise<number[]> {
  const pool = await db();
  const { rows } = await pool.query<{ vid: number }>(
    `SELECT DISTINCT s.ownerid AS vid
     FROM cart_items c
     INNER JOIN inventory i ON i.id = c.inventory_id
     INNER JOIN products p ON p.id = i.product_id
     INNER JOIN shops s ON s.id = p.shop_id
     WHERE c.user_id = $1`,
    [userId]
  );
  const out = rows.map((r) => r.vid).filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(out)];
}

async function clearCartForUser(userId: number): Promise<void> {
  await (await db()).query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
}

export type CheckoutConfirmRoomEntry = {
  room: ChatRoomRecord;
  existing: boolean;
  vendor_user_id: number;
};

export type CheckoutConfirmResult = {
  rooms: CheckoutConfirmRoomEntry[];
  transaction_id: number;
};

async function roomsToEntriesForBuyer(
  buyerUserId: number,
  rooms: ChatRoomRecord[]
): Promise<CheckoutConfirmRoomEntry[]> {
  const out: CheckoutConfirmRoomEntry[] = [];
  for (const room of rooms) {
    const others = await chatModel.otherParticipantIds(room.id, buyerUserId);
    const vendor_user_id = others[0] ?? 0;
    out.push({ room, existing: true, vendor_user_id });
  }
  return out;
}

/**
 * After successful Paystack payment: verify charge, validate amount vs cart + shipping,
 * create one buyer↔vendor chat room per shop in the cart (same order_id = Paystack txn id),
 * clear cart once.
 * Idempotent: replay with empty cart returns existing rooms for this transaction.
 */
export async function confirmCartCheckoutAndCreateChatRoom(
  buyerUserId: number,
  reference: string,
  shippingNaira: number
): Promise<CheckoutConfirmResult> {
  const ref = String(reference ?? "").trim();
  if (!ref) throw new Error("reference is required");

  const verifyRaw = await paystack.verifyTransaction(ref);
  const ok = verifyRaw.status === true;
  if (!ok) {
    throw new Error(String(verifyRaw.message ?? "Paystack verification failed"));
  }
  const data = verifyRaw.data && typeof verifyRaw.data === "object" ? verifyRaw.data : {};
  const d = data as Record<string, unknown>;
  const status = String(d.status ?? "").toLowerCase();
  if (status !== "success") {
    throw new Error(`Payment not successful (status=${d.status ?? "unknown"})`);
  }

  const txnId = pickNumber(d.id);
  if (txnId === null || txnId <= 0) {
    throw new Error("Invalid Paystack transaction id");
  }

  const amountKobo = pickNumber(d.amount);
  if (amountKobo === null || amountKobo <= 0) {
    throw new Error("Invalid Paystack amount");
  }

  const lines = await listCartLinesForUser(buyerUserId);

  if (!lines.length) {
    const existing = await chatModel.listRoomsForUserByOrderId(buyerUserId, txnId);
    if (existing.length) {
      const rooms = await roomsToEntriesForBuyer(buyerUserId, existing);
      return { rooms, transaction_id: txnId };
    }
    throw new Error("Cart is empty; cannot finalize checkout");
  }

  let subtotalNaira = 0;
  for (const line of lines) {
    subtotalNaira += Number(line.quantity) * Number(line.unit_price);
  }
  const ship = Math.max(0, Number(shippingNaira) || 0);
  const expectedKobo = Math.round((subtotalNaira + ship) * 100);
  const tolerance = 150;
  if (Math.abs(amountKobo - expectedKobo) > tolerance) {
    throw new Error("Paid amount does not match cart total. Refresh and contact support.");
  }

  const vendorIds = await cartVendorIdsForUser(buyerUserId);
  if (!vendorIds.length) {
    throw new Error("Could not resolve seller for this cart");
  }

  const pool = await db();

  const { rows: order } = await pool.query(
    `SELECT * FROM orders WHERE ref = $1`,
    [reference]
  );
  console.log("order id", order);
  // const orderKey = txnId;
  const orderKey = 'order.id';
  const results: CheckoutConfirmRoomEntry[] = [];

  for (const recipientId of vendorIds) {
    if (recipientId === buyerUserId) {
      throw new Error("Invalid checkout: buyer and seller cannot be the same");
    }

    const existingId = await chatModel.findRoomForOrderAndUsers(orderKey, buyerUserId, recipientId);
    if (existingId) {
      const room = await chatModel.getRoomById(existingId);
      if (!room) throw new Error("Chat room not found");
      results.push({ room, existing: true, vendor_user_id: recipientId });
      const payload = { room, existing: true };
      notifyUser(buyerUserId, "room_created", payload);
      notifyUser(recipientId, "room_created", payload);
      continue;
    }

    const room = await chatModel.createRoom({
      order_id: orderKey,
      initiator: buyerUserId,
      participants: [
        { user_id: buyerUserId, role: "buyer" },
        { user_id: recipientId, role: "seller" },
      ],
    });
    results.push({ room, existing: false, vendor_user_id: recipientId });
    const payload = { room, existing: false };
    notifyUser(buyerUserId, "room_created", payload);
    notifyUser(recipientId, "room_created", payload);
  }

  await clearCartForUser(buyerUserId);

  return { rooms: results, transaction_id: txnId };
}
