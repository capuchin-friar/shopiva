/**
 * PRODUCT MODEL
 *
 * Handles database operations for products and inventory tables.
 * @see migrations/012_create_products.sql
 * @see migrations/013_create_inventory.sql
 */

import { db } from "../../config/database.js";
import { withErrorHandling } from "../../utils/errHandler.js";

export type ProductStatus = "draft" | "active" | "archived";

export type ProductDimensions = {
  unit?: string;
  width?: number | null;
  height?: number | null;
  length?: number | null;
};

export type ProductRow = {
  id: number;
  shop_id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  images: string[];
  videos: string[];
  tags: string[];
  weight: number | null;
  dimensions: ProductDimensions | null;
  specifications: Record<string, unknown>;
  status: ProductStatus;
  is_published: boolean;
  published_at: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryRow = {
  id: number;
  product_id: number;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  currency: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorder: boolean;
  taxable: boolean;
  tax_rate: number;
  created_at: string;
  updated_at: string;
};

export type InventoryListRow = {
  id: number;
  product_id: number;
  product_name: string;
  sku: string | null;
  price: number;
  currency: string;
  quantity_available: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  location_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderListRow = {
  order_id: number | string;
  product_id: number | null;
  customer_id: number | string | null;
  product: string;
  customer: string;
  customer_email: string;
  customer_phone: string;
  qty: number;
  amount: number;
  payment: string;
  status: string;
  delivery: string;
  date: string | null;
  shipping_address?: string;
  customer_lat?: number | null;
  customer_lng?: number | null;
};

function orderShippingAndCoordsSelectSql(cols: Set<string>): {
  shippingAddressSql: string;
  customerLatSql: string;
  customerLngSql: string;
} {
  const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;
  const a = "o";

  const addressParts: string[] = [];
  const shippingAddressCol = pick(
    "shipping_address",
    "delivery_address",
    "shippingaddress",
    "customer_address",
    "address"
  );
  if (shippingAddressCol) {
    addressParts.push(`NULLIF(TRIM(${a}.${shippingAddressCol}::text), '')`);
  }
  const itemsCol = pick("items");
  if (itemsCol) {
    addressParts.push(`NULLIF(TRIM(${a}.${itemsCol}->>'shipping_address'), '')`);
    addressParts.push(`NULLIF(TRIM(${a}.${itemsCol}->>'shippingAddress'), '')`);
    addressParts.push(`NULLIF(TRIM(${a}.${itemsCol}->'shipping'->>'address'), '')`);
    addressParts.push(`NULLIF(TRIM(${a}.${itemsCol}->>'delivery_address'), '')`);
  }
  const metadataCol = pick("metadata", "meta", "shipping_info", "checkout");
  if (metadataCol) {
    addressParts.push(`NULLIF(TRIM(${a}.${metadataCol}->>'shipping_address'), '')`);
    addressParts.push(`NULLIF(TRIM(${a}.${metadataCol}->>'delivery_address'), '')`);
    addressParts.push(`NULLIF(TRIM(${a}.${metadataCol}->>'address'), '')`);
  }

  const shippingAddressSql =
    addressParts.length > 0 ? `COALESCE(${addressParts.join(", ")}, '—')` : `'—'`;

  const latExprs: string[] = [];
  const lngExprs: string[] = [];
  const latCol = pick("latitude", "lat", "shipping_lat", "delivery_latitude", "customer_latitude");
  const lngCol = pick("longitude", "lng", "lon", "shipping_lng", "delivery_longitude", "customer_longitude");
  if (latCol) latExprs.push(`${a}.${latCol}::double precision`);
  if (lngCol) lngExprs.push(`${a}.${lngCol}::double precision`);

  if (itemsCol) {
    latExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->>'lat'), ''))::double precision`);
    latExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->>'latitude'), ''))::double precision`);
    latExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->'shipping'->>'lat'), ''))::double precision`);
    latExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->'shipping'->>'latitude'), ''))::double precision`);

    lngExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->>'lng'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->>'lon'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->>'longitude'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->'shipping'->>'lng'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${itemsCol}->'shipping'->>'longitude'), ''))::double precision`);
  }

  if (metadataCol) {
    latExprs.push(`(NULLIF(TRIM(${a}.${metadataCol}->>'lat'), ''))::double precision`);
    latExprs.push(`(NULLIF(TRIM(${a}.${metadataCol}->>'latitude'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${metadataCol}->>'lng'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${metadataCol}->>'lon'), ''))::double precision`);
    lngExprs.push(`(NULLIF(TRIM(${a}.${metadataCol}->>'longitude'), ''))::double precision`);
  }

  const customerLatSql =
    latExprs.length > 0 ? `COALESCE(${latExprs.join(", ")})` : `NULL::double precision`;
  const customerLngSql =
    lngExprs.length > 0 ? `COALESCE(${lngExprs.join(", ")})` : `NULL::double precision`;

  return { shippingAddressSql, customerLatSql, customerLngSql };
}

export type CreateProductPayload = {
  shop_id: number;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  images?: string[];
  videos?: string[];
  tags?: string[];
  weight?: number | null;
  dimensions?: ProductDimensions | null;
  specifications?: Record<string, unknown>;
  status?: ProductStatus;
  is_published?: boolean;
  published_at?: string | null;
  is_featured?: boolean;
};

export type UpdateProductPayload = CreateProductPayload & { id: number };

export type CreateInventoryPayload = {
  product_id: number;
  sku?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  currency?: string;
  quantity?: number;
  reserved_quantity?: number;
  low_stock_threshold?: number;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  taxable?: boolean;
  tax_rate?: number;
};

export type UpdateInventoryPayload = Omit<CreateInventoryPayload, "product_id"> & {
  id: number;
};

export class product {
  static create = withErrorHandling(async (payload: CreateProductPayload): Promise<ProductRow> => {
    const {
      shop_id,
      name,
      slug,
      description = null,
      short_description = null,
      category = null,
      subcategory = null,
      brand = null,
      images = [],
      videos = [],
      tags = [],
      weight = null,
      dimensions = null,
      specifications = {},
      status = "draft",
      is_published = false,
      published_at = null,
      is_featured = false,
    } = payload;

    const { rows } = await (
      await db()
    ).query<ProductRow>(
      `INSERT INTO products (
        shop_id, name, slug, description, short_description,
        category, subcategory, brand, images, videos, tags,
        weight, dimensions, specifications, status,
        is_published, published_at, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        shop_id,
        name,
        slug,
        description,
        short_description,
        category,
        subcategory,
        brand,
        images,
        videos,
        tags,
        weight,
        dimensions ? JSON.stringify(dimensions) : null,
        JSON.stringify(specifications),
        status,
        is_published,
        published_at,
        is_featured,
      ]
    );
    const row = rows[0];
    if (!row) throw new Error("Failed to create product");
    return row;
  });

  static update = withErrorHandling(async (payload: UpdateProductPayload): Promise<ProductRow | null> => {
    const {
      id,
      shop_id,
      name,
      slug,
      description = null,
      short_description = null,
      category = null,
      subcategory = null,
      brand = null,
      images = [],
      videos = [],
      tags = [],
      weight = null,
      dimensions = null,
      specifications = {},
      status = "draft",
      is_published = false,
      published_at = null,
      is_featured = false,
    } = payload;

    const { rows } = await (
      await db()
    ).query<ProductRow>(
      `UPDATE products SET
        shop_id = $1, name = $2, slug = $3, description = $4, short_description = $5,
        category = $6, subcategory = $7, brand = $8, images = $9, videos = $10, tags = $11,
        weight = $12, dimensions = $13, specifications = $14, status = $15,
        is_published = $16, published_at = $17, is_featured = $18, updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *`,
      [
        shop_id,
        name,
        slug,
        description,
        short_description,
        category,
        subcategory,
        brand,
        images,
        videos,
        tags,
        weight,
        dimensions ? JSON.stringify(dimensions) : null,
        JSON.stringify(specifications),
        status,
        is_published,
        published_at,
        is_featured,
        id,
      ]
    );
    return rows[0] ?? null;
  });

  static delete = withErrorHandling(async (id: number): Promise<number> => {
    const { rowCount } = await (await db()).query(
      `DELETE FROM products WHERE id = $1`,
      [id]
    );
    return rowCount ?? 0;
  });

  static getById = withErrorHandling(async (id: number): Promise<ProductRow | null> => {
    const { rows } = await (await db()).query<ProductRow>(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  });

  static getByShopId = withErrorHandling(async (shopId: number): Promise<ProductRow[]> => {
    const { rows } = await (await db()).query<ProductRow>(
      `SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC`,
      [shopId]
    );
    return rows;
  });

  static listPublishedByShopId = withErrorHandling(async (shopId: number): Promise<ProductRow[]> => {
    const { rows } = await (await db()).query<ProductRow>(
      `SELECT * FROM products WHERE shop_id = $1 AND is_published = true ORDER BY created_at DESC`,
      [shopId]
    );
    return rows;
  });
}

export class inventory {
  static create = withErrorHandling(async (payload: CreateInventoryPayload): Promise<InventoryRow> => {
    const {
      product_id,
      sku = null,
      price,
      compare_at_price = null,
      cost_price = null,
      currency = "USD",
      quantity = 0,
      reserved_quantity = 0,
      low_stock_threshold = 5,
      track_inventory = true,
      allow_backorder = false,
      taxable = true,
      tax_rate = 0,
    } = payload;

    const { rows } = await (
      await db()
    ).query<InventoryRow>(
      `INSERT INTO inventory (
        product_id, sku, price, compare_at_price, cost_price, currency,
        quantity, reserved_quantity, low_stock_threshold,
        track_inventory, allow_backorder, taxable, tax_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        product_id,
        sku,
        price,
        compare_at_price,
        cost_price,
        currency,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        track_inventory,
        allow_backorder,
        taxable,
        tax_rate,
      ]
    );
    const row = rows[0];
    if (!row) throw new Error("Failed to create inventory");
    return row;
  });

  static update = withErrorHandling(async (payload: UpdateInventoryPayload): Promise<InventoryRow | null> => {
    const {
      id,
      sku = null,
      price,
      compare_at_price = null,
      cost_price = null,
      currency = "USD",
      quantity = 0,
      reserved_quantity = 0,
      low_stock_threshold = 5,
      track_inventory = true,
      allow_backorder = false,
      taxable = true,
      tax_rate = 0,
    } = payload;

    const { rows } = await (
      await db()
    ).query<InventoryRow>(
      `UPDATE inventory SET
        sku = $1, price = $2, compare_at_price = $3, cost_price = $4, currency = $5,
        quantity = $6, reserved_quantity = $7, low_stock_threshold = $8,
        track_inventory = $9, allow_backorder = $10, taxable = $11, tax_rate = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        sku,
        price,
        compare_at_price,
        cost_price,
        currency,
        quantity,
        reserved_quantity,
        low_stock_threshold,
        track_inventory,
        allow_backorder,
        taxable,
        tax_rate,
        id,
      ]
    );
    return rows[0] ?? null;
  });

  static delete = withErrorHandling(async (id: number): Promise<number> => {
    const { rowCount } = await (await db()).query(
      `DELETE FROM inventory WHERE id = $1`,
      [id]
    );
    return rowCount ?? 0;
  });

  static getByProductId = withErrorHandling(async (productId: number): Promise<InventoryRow[]> => {
    const { rows } = await (await db()).query<InventoryRow>(
      `SELECT * FROM inventory WHERE product_id = $1 ORDER BY id`,
      [productId]
    );
    return rows;
  });

  /** Batch-load inventory for many products (single query; avoids N+1 on storefront listings). */
  static getByProductIds = withErrorHandling(async (productIds: number[]): Promise<InventoryRow[]> => {
    const ids = [...new Set(productIds.filter((x) => Number.isFinite(x) && x > 0))];
    if (!ids.length) return [];
    const { rows } = await (await db()).query<InventoryRow>(
      `SELECT * FROM inventory WHERE product_id = ANY($1::int[]) ORDER BY product_id, id`,
      [ids]
    );
    return rows;
  });

  static getById = withErrorHandling(async (id: number): Promise<InventoryRow | null> => {
    const { rows } = await (await db()).query<InventoryRow>(
      `SELECT * FROM inventory WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  });

  static getByShopId = withErrorHandling(async (shopId: number): Promise<InventoryListRow[]> => {
    const { rows } = await (await db()).query<InventoryListRow>(
      `SELECT
        i.id,
        i.product_id,
        p.name AS product_name,
        i.sku,
        i.price,
        i.currency,
        i.quantity AS quantity_available,
        i.reserved_quantity AS quantity_reserved,
        i.low_stock_threshold,
        NULL::INT AS location_id,
        i.track_inventory AS is_active,
        i.created_at,
        i.updated_at
      FROM inventory i
      INNER JOIN products p ON p.id = i.product_id
      WHERE p.shop_id = $1
      ORDER BY i.updated_at DESC, i.id DESC`,
      [shopId]
    );
    return rows;
  });
}

export class order {
  static getByShopId = withErrorHandling(async (shopId: number): Promise<OrderListRow[]> => {
    const dbConn = await db();
    const tableRes = await dbConn.query<{ reg: string | null }>(
      `SELECT to_regclass('public.orders')::text AS reg`
    );
    if (!tableRes.rows[0]?.reg) return [];

    const colRes = await dbConn.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'orders'`
    );
    const cols = new Set(colRes.rows.map((r) => r.column_name));
    const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;

    const idCol = pick("id", "order_id") ?? "id";
    const productIdCol = pick("product_id", "productid");
    const customerIdCol = pick("customer_id", "customerid");
    const productNameCol = pick("product_name");
    const qtyCol = pick("quantity", "qty");
    const amountCol = pick("amount", "total_amount", "total", "subtotal");
    const paymentCol = pick("payment", "payment_status", "payment_method");
    const statusCol = pick("status");
    const deliveryCol = pick("delivery", "delivery_status", "shippingmethod");
    const dateCol = pick("orderedat", "createdat", "created_at", "createdAt", "order_date");
    const shopCol = pick("shopid", "shop_id", "shopId");

    if (!shopCol && !productIdCol) return [];

    const joins = [productIdCol ? `LEFT JOIN products p ON p.id = o.${productIdCol}` : ""]
      .filter(Boolean)
      .join("\n");

    const whereClause = shopCol
      ? `o.${shopCol} = $1`
      : `p.shop_id = $1`;

    const { shippingAddressSql, customerLatSql, customerLngSql } = orderShippingAndCoordsSelectSql(cols);

    const sql = `
      SELECT
        o.${idCol} AS order_id,
        ${productIdCol ? `o.${productIdCol}` : `NULL`} AS product_id,
        ${customerIdCol ? `o.${customerIdCol}` : `NULL`} AS customer_id,
        ${
          productNameCol
            ? `COALESCE(o.${productNameCol}::text, '—')`
            : productIdCol
              ? `COALESCE(p.name, o.items -> 0 ->> 'name', '—')`
              : `COALESCE(o.items -> 0 ->> 'name', '—')`
        } AS product,
        'Anonymous buyer' AS customer,
        '—' AS customer_email,
        '—' AS customer_phone,
        ${
          qtyCol
            ? `COALESCE(o.${qtyCol}, 0)`
            : `COALESCE((SELECT SUM(COALESCE((item ->> 'quantity')::INT, 0)) FROM jsonb_array_elements(o.items) item), 0)`
        } AS qty,
        ${amountCol ? `COALESCE(o.${amountCol}, 0)` : `0`} AS amount,
        ${paymentCol ? `COALESCE(o.${paymentCol}::text, '—')` : `'—'`} AS payment,
        ${statusCol ? `COALESCE(o.${statusCol}::text, '—')` : `'—'`} AS status,
        ${deliveryCol ? `COALESCE(o.${deliveryCol}::text, '—')` : `'—'`} AS delivery,
        ${dateCol ? `o.${dateCol}` : `NULL`} AS date,
        ${shippingAddressSql} AS shipping_address,
        ${customerLatSql} AS customer_lat,
        ${customerLngSql} AS customer_lng
      FROM orders o
      ${joins}
      WHERE ${whereClause}
      ORDER BY ${dateCol ? `o.${dateCol}` : `o.${idCol}`} DESC NULLS LAST
    `;

    const { rows } = await dbConn.query<OrderListRow>(sql, [shopId]);
    return rows;
  });

  /** Buyer order history — filters by customer id column when present. */
  static getByCustomerId = withErrorHandling(async (customerId: number): Promise<OrderListRow[]> => {
    const dbConn = await db();
    const tableRes = await dbConn.query<{ reg: string | null }>(
      `SELECT to_regclass('public.orders')::text AS reg`
    );
    if (!tableRes.rows[0]?.reg) return [];

    const colRes = await dbConn.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'orders'`
    );
    const cols = new Set(colRes.rows.map((r) => r.column_name));
    const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;

    const idCol = pick("id", "order_id") ?? "id";
    const productIdCol = pick("product_id", "productid");
    const customerIdCol = pick("customer_id", "customerid");
    const customerNameCol = pick("customer_name");
    const customerEmailOrderCol = pick(
      "customer_email",
      "buyer_email",
      "contact_email",
      "recipient_email",
      "email"
    );
    const customerPhoneOrderCol = pick(
      "customer_phone",
      "buyer_phone",
      "contact_phone",
      "phone",
      "mobile"
    );
    const productNameCol = pick("product_name");
    const qtyCol = pick("quantity", "qty");
    const amountCol = pick("amount", "total_amount", "total", "subtotal");
    const paymentCol = pick("payment", "payment_status", "payment_method");
    const statusCol = pick("status");
    const deliveryCol = pick("delivery", "delivery_status", "shippingmethod");
    const dateCol = pick("orderedat", "createdat", "created_at", "createdAt", "order_date");

    if (!customerIdCol) return [];

    const joins = [
      productIdCol ? `LEFT JOIN products p ON p.id = o.${productIdCol}` : "",
      `LEFT JOIN users u ON u.id = o.${customerIdCol}`,
    ]
      .filter(Boolean)
      .join("\n");

    const coalesceContact = (orderCol: string | null, userField: "email" | "phone") => {
      const parts: string[] = [];
      if (orderCol) parts.push(`NULLIF(TRIM(o.${orderCol}::text), '')`);
      parts.push(`NULLIF(TRIM(u.${userField}::text), '')`);
      return `COALESCE(${parts.join(", ")}, '—')`;
    };

    const customerEmailSql = coalesceContact(customerEmailOrderCol, "email");
    const customerPhoneSql = coalesceContact(customerPhoneOrderCol, "phone");

    const { shippingAddressSql, customerLatSql, customerLngSql } = orderShippingAndCoordsSelectSql(cols);

    const sql = `
      SELECT
        o.${idCol} AS order_id,
        ${productIdCol ? `o.${productIdCol}` : `NULL`} AS product_id,
        o.${customerIdCol} AS customer_id,
        ${
          productNameCol
            ? `COALESCE(o.${productNameCol}::text, '—')`
            : productIdCol
              ? `COALESCE(p.name, o.items -> 0 ->> 'name', '—')`
              : `COALESCE(o.items -> 0 ->> 'name', '—')`
        } AS product,
        ${
          customerNameCol
            ? `COALESCE(o.${customerNameCol}::text, '—')`
            : `COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.fname, ''), ' ', COALESCE(u.lname, ''))), ''), '—')`
        } AS customer,
        ${customerEmailSql} AS customer_email,
        ${customerPhoneSql} AS customer_phone,
        ${
          qtyCol
            ? `COALESCE(o.${qtyCol}, 0)`
            : `COALESCE((SELECT SUM(COALESCE((item ->> 'quantity')::INT, 0)) FROM jsonb_array_elements(o.items) item), 0)`
        } AS qty,
        ${amountCol ? `COALESCE(o.${amountCol}, 0)` : `0`} AS amount,
        ${paymentCol ? `COALESCE(o.${paymentCol}::text, '—')` : `'—'`} AS payment,
        ${statusCol ? `COALESCE(o.${statusCol}::text, '—')` : `'—'`} AS status,
        ${deliveryCol ? `COALESCE(o.${deliveryCol}::text, '—')` : `'—'`} AS delivery,
        ${dateCol ? `o.${dateCol}` : `NULL`} AS date,
        ${shippingAddressSql} AS shipping_address,
        ${customerLatSql} AS customer_lat,
        ${customerLngSql} AS customer_lng
      FROM orders o
      ${joins}
      WHERE o.${customerIdCol} = $1
      ORDER BY ${dateCol ? `o.${dateCol}` : `o.${idCol}`} DESC NULLS LAST
    `;

    const { rows } = await dbConn.query<OrderListRow>(sql, [customerId]);
    return rows;
  });

  /**
   * Update order status for a row belonging to a shop (column names detected from DB).
   */
  static updateStatusForShop = withErrorHandling(
    async (shopId: number, orderId: number, status: string): Promise<number> => {
      const dbConn = await db();
      const tableRes = await dbConn.query<{ reg: string | null }>(
        `SELECT to_regclass('public.orders')::text AS reg`
      );
      if (!tableRes.rows[0]?.reg) throw new Error("Orders table not found");

      const colRes = await dbConn.query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'orders'`
      );
      const cols = new Set(colRes.rows.map((r) => r.column_name));
      const pick = (...names: string[]) => names.find((n) => cols.has(n)) ?? null;

      const idCol = pick("id", "order_id") ?? "id";
      const statusCol = pick("status", "order_status");
      const shopCol = pick("shopid", "shop_id", "shopId");
      if (!statusCol || !shopCol) throw new Error("Cannot update order: missing status or shop column");

      const safeIdent = (name: string) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) throw new Error("Invalid column name");
        return `"${name}"`;
      };

      const { rowCount } = await dbConn.query(
        `UPDATE orders SET ${safeIdent(statusCol)} = $1::text
         WHERE ${safeIdent(idCol)} = $2 AND ${safeIdent(shopCol)} = $3`,
        [status, orderId, shopId]
      );
      return rowCount ?? 0;
    }
  );
}
