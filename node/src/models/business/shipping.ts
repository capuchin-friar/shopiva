/**
 * SHIPPING MODEL
 *
 * Handles all database operations related to shipping configurations:
 * - Shipping fee models (multi_item_discount)
 * - Shipping zones
 * - Multi-item discount configurations
 *
 * @see services/business/shipping.ts for business logic
 * @see types/business.ts for type definitions
 */

import { db } from "../../config/database.js";
import type { QueryResult } from "pg";

/**
 * Type definitions for shipping
 */
export interface ShippingFeeModel {
  id: number;
  shop_id: number;
  model: "multi_item_discount";
  base_fee: number;
  discount_percent: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: number;
  shop_id: number;
  zone_id: string;
  name: string;
  locations: string[];
  base_fee: number;
  discount_percent: number;
  pin_color: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingMultiItemDiscount {
  id: number;
  shop_id: number;
  base_fee: number;
  discount_percent: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create or update shipping fee model for a shop
 */
export async function upsertShippingFeeModel(
  shopId: number,
  model: "multi_item_discount",
  baseFee: number,
  discountPercent: number
): Promise<ShippingFeeModel> {
  const query = `
    INSERT INTO shipping_fee_models (shop_id, model, base_fee, discount_percent)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (shop_id) 
    DO UPDATE SET model = $2, base_fee = $3, discount_percent = $4, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const pool = await db();
  const result: QueryResult<ShippingFeeModel> = await pool.query(query, [
    shopId,
    model,
    baseFee,
    discountPercent,
  ]);

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert shipping fee model");
  }

  return row;
}

/**
 * Get shipping fee model for a shop
 */
export async function getShippingFeeModel(
  shopId: number
): Promise<ShippingFeeModel | null> {
  const query = `
    SELECT * FROM shipping_fee_models
    WHERE shop_id = $1;
  `;

  const pool = await db();
  const result: QueryResult<ShippingFeeModel> = await pool.query(query, [
    shopId,
  ]);

  return result.rows[0] ?? null;
}

/**
 * Create or update shipping zone
 */
export async function upsertShippingZone(
  shopId: number,
  zoneId: string,
  name: string,
  locations: string[],
  baseFee: number,
  discountPercent: number,
  pinColor: string
): Promise<ShippingZone> {
  const query = `
    INSERT INTO shipping_zones (shop_id, zone_id, name, locations, base_fee, discount_percent, pin_color)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (shop_id, zone_id)
    DO UPDATE SET name = $3, locations = $4, base_fee = $5, discount_percent = $6, pin_color = $7, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const pool = await db();
  const result: QueryResult<ShippingZone> = await pool.query(query, [
    shopId,
    zoneId,
    name,
    locations,
    baseFee,
    discountPercent,
    pinColor,
  ]);

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert shipping zone");
  }

  return row;
}

/**
 * Get all shipping zones for a shop
 */
export async function getShippingZonesByShop(
  shopId: number
): Promise<ShippingZone[]> {
  const query = `
    SELECT * FROM shipping_zones
    WHERE shop_id = $1
    ORDER BY created_at ASC;
  `;

  const pool = await db();
  const result: QueryResult<ShippingZone> = await pool.query(query, [
    shopId,
  ]);

  return result.rows;
}

/**
 * Get a single shipping zone by ID
 */
export async function getShippingZoneById(zoneId: number): Promise<ShippingZone | null> {
  const query = `
    SELECT * FROM shipping_zones
    WHERE id = $1;
  `;

  const pool = await db();
  const result: QueryResult<ShippingZone> = await pool.query(query, [
    zoneId,
  ]);

  return result.rows[0] ?? null;
}

/**
 * Delete a shipping zone
 */
export async function deleteShippingZone(
  shopId: number,
  zoneId: string
): Promise<number> {
  const query = `
    DELETE FROM shipping_zones
    WHERE shop_id = $1 AND zone_id = $2;
  `;

  const pool = await db();
  const result: QueryResult = await pool.query(query, [shopId, zoneId]);

  return result.rowCount || 0;
}

/**
 * Create or update multi-item discount configuration
 */
export async function upsertShippingMultiItemDiscount(
  shopId: number,
  baseFee: number,
  discountPercent: number
): Promise<ShippingMultiItemDiscount> {
  const query = `
    INSERT INTO shipping_multi_item_discounts (shop_id, base_fee, discount_percent)
    VALUES ($1, $2, $3)
    ON CONFLICT (shop_id)
    DO UPDATE SET base_fee = $2, discount_percent = $3, updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;

  const pool = await db();
  const result: QueryResult<ShippingMultiItemDiscount> = await pool.query(
    query,
    [shopId, baseFee, discountPercent]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to upsert multi-item discount");
  }

  return row;
}

/**
 * Get multi-item discount configuration for a shop
 */
export async function getShippingMultiItemDiscount(
  shopId: number
): Promise<ShippingMultiItemDiscount | null> {
  const query = `
    SELECT * FROM shipping_multi_item_discounts
    WHERE shop_id = $1;
  `;

  const pool = await db();
  const result: QueryResult<ShippingMultiItemDiscount> = await pool.query(
    query,
    [shopId]
  );

  return result.rows[0] ?? null;
}

/**
 * Check if shipping configuration is set for a shop
 */
export async function isShippingConfigSet(shopId: number): Promise<{
  hasFeeModel: boolean;
  hasZones: boolean;
}> {
  const feeModelQuery = `
    SELECT COUNT(*) as count FROM shipping_fee_models WHERE shop_id = $1;
  `;

  const discountQuery = `
    SELECT COUNT(*) as count FROM shipping_multi_item_discounts WHERE shop_id = $1;
  `;

  const zonesQuery = `
    SELECT COUNT(*) as count FROM shipping_zones WHERE shop_id = $1;
  `;

  const pool = await db();
  const [feeModelResult, discountResult, zonesResult] = await Promise.all([
    pool.query<{ count: string }>(feeModelQuery, [shopId]),
    pool.query<{ count: string }>(discountQuery, [shopId]),
    pool.query<{ count: string }>(zonesQuery, [shopId]),
  ]);

  return {
    hasFeeModel:
      parseInt(feeModelResult.rows[0]?.count || "0", 10) > 0 ||
      parseInt(discountResult.rows[0]?.count || "0", 10) > 0,
    hasZones:
      parseInt(zonesResult.rows[0]?.count || "0", 10) > 0,
  };
}

export const shipping = {
  upsertShippingFeeModel,
  getShippingFeeModel,
  upsertShippingZone,
  getShippingZonesByShop,
  getShippingZoneById,
  deleteShippingZone,
  upsertShippingMultiItemDiscount,
  getShippingMultiItemDiscount,
  isShippingConfigSet,
};
