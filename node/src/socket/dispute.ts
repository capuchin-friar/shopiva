import type { Namespace } from "socket.io";
import { db } from "../config/database.js";
import { dispute as disputeModel } from "../models/buyer/dispute.js";
import { notifyUser } from "../services/socketBroadcast.js";
import {
  CreateBuyerDisputeService,
  parseRaiseDisputePayload,
} from "../services/buyer/disputes.js";
import { disputesTransformer } from "../transformers/business/disputes.js";

type DisputeSocketPayload = {
  result: unknown;
  // list: unknown[];
};

async function resolveOrderParties(orderId: number | null): Promise<{
  shopId: number | null;
  shopOwnerId: number | null;
}> {
  if (orderId == null || !Number.isFinite(orderId)) {
    return { shopId: null, shopOwnerId: null };
  }
  const pool = await db();
  const { rows } = await pool.query<{ shop_id: string | null; owner: number | null }>(
    `SELECT o.shop_id, s.owner
     FROM orders o
     LEFT JOIN shops s ON s.id::text = trim(o.shop_id::text)
     WHERE o.id = $1
     LIMIT 1`,
    [orderId]
  );
  const row = rows[0];
  if (!row) return { shopId: null, shopOwnerId: null };
  const shopIdRaw = row.shop_id != null ? Number(row.shop_id) : NaN;
  const shopId = Number.isFinite(shopIdRaw) && shopIdRaw > 0 ? shopIdRaw : null;
  const ownerRaw = row.owner != null ? Number(row.owner) : NaN;
  const shopOwnerId =
    Number.isFinite(ownerRaw) && ownerRaw > 0 ? ownerRaw : null;
  return { shopId, shopOwnerId };
}

/**
 * Push dispute detail + role-appropriate list to buyer and shop owner (socket rooms).
 */
async function broadcastDisputeUpdate(
  event: string,
  disputeRef: string,
  customerId: number,
  shopId: number | string,
  shopOwnerId: number | null,
  actorId: number
): Promise<DisputeSocketPayload> {
  const result = await disputesTransformer(shopId, actorId);

  const [customerList, vendorList] = await Promise.all([
    disputeModel.getByCustomerId(customerId, { includeClosed: true }),
    shopId != null
      ? disputeModel.getByShopId(shopId, { includeClosed: true })
      : Promise.resolve([]),
  ]);

  const actorIsCustomer = actorId === customerId;
  const actorList = actorIsCustomer ? customerList : vendorList;
  const recipientId = actorIsCustomer ? shopOwnerId : customerId;
  const recipientList = actorIsCustomer ? vendorList : customerList;

  const payload = { result: result[0] };
  notifyUser(actorId, event, payload);
  if (recipientId != null && recipientId !== actorId) {
    notifyUser(recipientId, event, payload);
  }
  return { result: result[0] };
}

function ackError(ack: unknown, message: string) {
  if (typeof ack === "function") {
    ack({
      success: false,
      message,
      error: message,
      result: null,
      list: null,
    });
  }
}

function ackSuccess(ack: unknown, payload: DisputeSocketPayload) {
  if (typeof ack === "function") {
    ack({
      success: true,
      message: "Dispute created successfully",
      error: null,
      result: payload.result,
      // list: payload.list,
    });
  }
}

/**
 * Buyer opens a dispute via socket (`raise_dispute`).
 * Payload schema:
 *   dispute_ref, customer_id, order_id, status, reason, description, source, metadata
 */
export const handleNewDispute = async (
  userId: number,
  _nsp: Namespace,
  payload: Record<string, unknown>,
  ack: unknown
) => {
  try {
    const parsed = parseRaiseDisputePayload(payload, {
      requireCustomerMatch: userId,
    });
    const created = await CreateBuyerDisputeService(parsed);
    const disputeRef = String(created.dispute_id ?? "").trim();
    const customerId = Number(created.customer_id);
    const orderId =
      created.order_id != null ? Number(created.order_id) : null;

    const { shopId, shopOwnerId } = await resolveOrderParties(orderId);

    if (shopId) {
      const socketPayload = await broadcastDisputeUpdate(
        "raise_dispute",
        disputeRef,
        customerId,
        shopId,
        shopOwnerId,
        userId
      );
      ackSuccess(ack, socketPayload);
    }

  } catch (error) {
    console.error("[raise_dispute] error:", error);
    ackError(
      ack,
      error instanceof Error ? error.message : "Failed to create dispute"
    );
  }
};


export const handleDisputeResponse = async(
  userId: number,
  _nsp: Namespace,
  payload: Record<string, unknown>,
  ack: unknown
) => {
  try {
    const {
      dispute_id, response
    } = payload;

    const pool = await db();
    console.log(dispute_id)

    const {rows: [dispute]} = await pool.query(
      `UPDATE disputes 
      SET "response" = $1,
        "status" = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *`,
      [response, "responded", (dispute_id)]
    );

    const {rows: [shop]} = await pool.query(
      `SELECT id 
      FROM shops 
      WHERE ownerid = $1`,
      [userId]
    );

    if(
      response && ((response as any).will_return_item )
    ){
      const { rows: [id] } = await pool.query(
        `INSERT INTO returns
          (
            order_id, customer_id, shop_id, status, shipping_address, created_at, updated_at
          ) VALUES(
              $1, $2, $3, $4, $5, NOW(), NOW()
          ) RETURNING id`,
        [
          dispute.order_id, dispute.customer_id, shop.id, "initiated", JSON.stringify((response as any).return_address)
        ]
      );

      await pool.query(
        `
          INSERT INTO return_events
          (
              return_id, event_type, stage, actor_type, actor_id, outcome, notes, meta, created_at
          )
          VALUES(
              $1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW()
          )`, 
          [
            id.id, "initiation", "return_initiated", "vendor", userId, "success", "", "{}"
          ]
      );
    }

    const socketPayload = await broadcastDisputeUpdate(
      "dispute_acceptance",
      dispute.dispute_ref,
      dispute.customer_id,
      shop.id,
      userId,
      userId
    );

    ackSuccess(ack, socketPayload);
  } catch (error) {
    console.error("[raise_dispute] error:", error);
    ackError(
      ack,
      error instanceof Error ? error.message : "Failed to create dispute"
    );
  }
}
