import type { Namespace } from "socket.io";
import { db } from "../config/database.js";
import { dispute as disputeModel } from "../models/buyer/dispute.js";
import { notifyUser } from "../services/socketBroadcast.js";
import {
  CreateBuyerDisputeService,
  parseRaiseDisputePayload,
} from "../services/buyer/disputes.js";
import { disputeTransformer as vendorDisputeTransformer } from "../transformers/business/dispute.js";
import { disputesTransformer as vendorDisputesTransformer } from "../transformers/business/disputes.js";

import { disputeTransformer as customerDisputeTransFormer } from "../transformers/buyer/dispute.js";
import { disputesTransformer as customerDisputesTransformer } from "../transformers/buyer/disputes.js";
import { OrderHandler } from "../services/webhook/paystack.js";
import { orderTransformer as vendorOrderTransFormer } from "../transformers/business/order.js";
import { ordersTransformer as vendorOrdersTransformer } from "../transformers/business/orders.js";

import { orderTransformer as customerOrderTransFormer } from "../transformers/buyer/order.js";
import { ordersTransformer as customerOrdersTransformer } from "../transformers/buyer/orders.js";

type DisputeSocketPayload = {
  // result: unknown;
  others: unknown;
  disputes: unknown;
};

async function resolveOrderParties(orderId: number | null): Promise<{
  shopId: number | null;
  shopOwnerId: number | null;
}> {
  if (orderId == null || !Number.isFinite(orderId)) {
    return { shopId: null, shopOwnerId: null };
  }
  const pool = await db();
  const { rows } = await pool.query<{ shop_id: string | null; ownerid: number | null }>(
    `SELECT o.shop_id, s.ownerid
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
  const ownerRaw = row.ownerid != null ? Number(row.ownerid) : NaN;
  const shopOwnerId =
    Number.isFinite(ownerRaw) && ownerRaw > 0 ? ownerRaw : null;
  return { shopId, shopOwnerId };
}

/**
 * Push dispute detail + role-appropriate list to buyer and shop owner (socket rooms).
 */
async function broadcastDisputeUpdate(
  event: string,
  shopId: number | string,
  recipient:  number,
  actorId: number,
  role: string,
  orderId: any,
  disputeId: any
): Promise<DisputeSocketPayload> {
  let result;
  let payloadForRecipient;
  let voi;
  let vol;
  let coi;
  let col;

  let cdl;
  let cdi;
  let vdl;
  let vdi;

  if(role === "vendor"){
    // for vendor get dispute transformer for both recipient(customer) and vendor
    // payloadForRecipient = await customerDisputeTransformer(recipient);
    // result = await vendorDisputeTransformer(shopId, actorId);

    // get order data for actor
    vdi = await vendorDisputeTransformer(disputeId);
    vdl = await vendorDisputesTransformer(shopId, actorId);

    // get order data for recipient(customer)
    cdi = await customerDisputeTransFormer(disputeId);
    cdl = await customerDisputesTransformer(recipient);
  }else{
    // for customer get dispute transformer for both recipient(vendor) and customer
    vdl = await vendorDisputesTransformer(shopId, recipient);
    vdi = await vendorDisputeTransformer(disputeId);

    cdl = await customerDisputesTransformer(actorId);
    cdi = await customerDisputeTransFormer(disputeId);

    // payloadForRecipient = await vendorDisputeTransformer(shopId, recipient);
    // result = await customerDisputeTransformer(actorId);

    // get order data for actor 
    coi = await customerOrderTransFormer(orderId);
    col = await customerOrdersTransformer(actorId);

    // get order data for recipient(vendor)
    voi = await vendorOrderTransFormer(orderId);
    vol = await vendorOrdersTransformer(shopId);
  }
  const payload = { 
    // result: payloadForRecipient[0], 
    actor: role !== "vendor" ? {voi, vol, vdl, vdi} : {coi, col, cdl, cdi}, 
    // role
    // recipient: role !== "vendor" ? {voi, vol} : {coi, col}, 
  };
  notifyUser(recipient, event, payload);
  const others = role === "vendor" ? {voi, vol} : {coi, col};
  return { 
    // result: result[0],
    disputes: {
      vendor: {vdl, vdi}, 
      customer: {cdl, cdi}
    },
    others
  };
}

function ackError(ack: unknown, message: string) {
  if (typeof ack === "function") {
    ack({
      success: false,
      message,
      error: message,
      result: null,
      others: null,
    });
  }
}

function ackSuccess(ack: unknown, payload: DisputeSocketPayload) {
  if (typeof ack === "function") {
    ack({
      success: true,
      message: "Dispute created successfully",
      error: null,
      dispute: payload.disputes,
      others: payload.others
    });
  }
}

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
    const orderId = created.order_id != null ? Number(created.order_id) : null;
    const { shopId, shopOwnerId } = await resolveOrderParties(orderId);
    await finishNewDispute(
      orderId, 
      "dispute", 
      "order_disputed", 
      "customer", 
      userId, 
      "success", 
      "", 
      JSON.stringify({})
    )

    if (shopId) {
      const socketPayload = await broadcastDisputeUpdate(
        "raise_dispute",
        shopId,
        Number(shopOwnerId),
        userId,
        "customer",
        orderId,
        created.id
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
      shop.id,
      Number(dispute.customer_id),
      userId,
      "vendor",
      dispute.order_id,
      dispute.id
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


async function finishNewDispute(
  order_id: any, 
  event_type: any, 
  stage: any, 
  actor_type: any, 
  actor_id: any, 
  outcome: any, 
  notes: any, 
  meta: any
){
  // update order status & order_events
  const pool = await db();
  await pool.query(`UPDATE orders SET fulfillment_status = $1, escrow_status = $2 WHERE id = $3`, ["order_disputed", "locked", order_id]);
  const payload = {
    order_id, 
    event_type, 
    stage, 
    actor_type, 
    actor_id, 
    outcome, 
    notes, 
    meta
  }
  
  await OrderHandler.orderEvent(payload);


}