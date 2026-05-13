/**
 * Paystack webhook transaction persistence (see migrations/017_create_paystack_transactions.sql).
 */

import type { Pool, PoolClient } from "pg";
import { db } from "../config/database.js";
import { withErrorHandling } from "../utils/errHandler.js";
import { toJsonbTextParam } from "../utils/pgJson.js";

type SqlExecutor = Pool | PoolClient;

export type PaystackTransactionRow = {
  id: number;
  paystack_charge_id: number | null;
  reference: string;
  event: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  channel: string | null;
  customer_email: string | null;
  metadata: Record<string, unknown>;
  paid_at: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type UpsertPaystackTransactionPayload = {
  paystack_charge_id?: number | null;
  reference: string;
  event: string;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  channel?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, unknown>;
  paid_at?: string | null;
  raw_payload: Record<string, unknown>;
};

export class paystack_transaction {
  /**
   * @param executor Optional pool or transaction client; pass a client when calling inside BEGIN/COMMIT.
   */
  static upsert = withErrorHandling(
    async (payload: UpsertPaystackTransactionPayload, executor?: SqlExecutor): Promise<PaystackTransactionRow> => {
    const {
      paystack_charge_id = null,
      reference,
      event,
      amount = null,
      currency = null,
      status = null,
      channel = null,
      customer_email = null,
      metadata = {},
      paid_at = null,
      raw_payload,
    } = payload;

    const runner: SqlExecutor = executor ?? (await db());

    const metadataText = toJsonbTextParam(metadata ?? {});
    const rawPayloadText = toJsonbTextParam(raw_payload);

    const { rows } = await runner.query<PaystackTransactionRow>(
      `INSERT INTO paystack_transactions (
        paystack_charge_id, reference, event, amount, currency, status, channel,
        customer_email, metadata, paid_at, raw_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb)
      ON CONFLICT (reference) DO UPDATE SET
        paystack_charge_id = COALESCE(EXCLUDED.paystack_charge_id, paystack_transactions.paystack_charge_id),
        event = EXCLUDED.event,
        amount = COALESCE(EXCLUDED.amount, paystack_transactions.amount),
        currency = COALESCE(EXCLUDED.currency, paystack_transactions.currency),
        status = COALESCE(EXCLUDED.status, paystack_transactions.status),
        channel = COALESCE(EXCLUDED.channel, paystack_transactions.channel),
        customer_email = COALESCE(EXCLUDED.customer_email, paystack_transactions.customer_email),
        metadata = EXCLUDED.metadata,
        paid_at = COALESCE(EXCLUDED.paid_at, paystack_transactions.paid_at),
        raw_payload = EXCLUDED.raw_payload,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        paystack_charge_id,
        reference,
        event,
        amount,
        currency,
        status,
        channel,
        customer_email,
        metadataText,
        paid_at,
        rawPayloadText,
      ]
    );
    const row = rows[0];
    if (!row) throw new Error("Failed to upsert paystack transaction");
    return row;
  }
  );
}
