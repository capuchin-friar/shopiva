import type { Namespace } from "socket.io";
import {
  CreateBuyerDisputeService,
  parseRaiseDisputePayload,
} from "../services/buyer/disputes.js";

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

function ackSuccess(ack: unknown, dispute: unknown) {
  if (typeof ack === "function") {
    ack({
      success: true,
      message: "Dispute created successfully",
      error: null,
      result: dispute,
      list: null,
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
    const dispute = await CreateBuyerDisputeService(parsed);
    ackSuccess(ack, dispute);
  } catch (error) {
    console.error("[raise_dispute] error:", error);
    ackError(
      ack,
      error instanceof Error ? error.message : "Failed to create dispute"
    );
  }
};
