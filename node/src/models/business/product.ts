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
      `SELECT * FROM inventory WHERE product_id = ANY($1) ORDER BY product_id, id`,
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
    const { rows } = await (await db()).query<OrderListRow>(
      `SELECT
        o.id AS order_id,
        NULL AS product_id,
        o.customer_id,
        '' AS product,
        'Anonymous buyer' AS customer,
        '' AS customer_email,
        '' AS customer_phone,
        (SELECT SUM(units) FROM order_items oi WHERE oi.order_id = o.order_id) AS qty,
        o.amount_paid AS amount,
        o.payment_status AS payment,
        o.fulfillment_status AS status,
        o.shipping_method AS delivery,
        o.created_at AS date,
        o.shipping_address,
        NULL AS customer_lat,
        NULL AS customer_lng
      FROM orders o
      WHERE o.shop_id = $1
      ORDER BY o.created_at DESC`,
      [String(shopId)]
    );
    return rows;
  });

  /** Buyer order history. */
  static getByCustomerId = withErrorHandling(async (customerId: number): Promise<OrderListRow[]> => {
    const { rows } = await (await db()).query<OrderListRow>(
      `SELECT
        o.id AS order_id,
        NULL AS product_id,
        o.customer_id,
        '' AS product,
        CONCAT(u.fname, ' ', u.lname) AS customer,
        u.email AS customer_email,
        u.phone AS customer_phone,
        (SELECT SUM(units) FROM order_items oi WHERE oi.order_id = o.order_id) AS qty,
        o.amount_paid AS amount,
        o.payment_status AS payment,
        o.fulfillment_status AS status,
        o.shipping_method AS delivery,
        o.created_at AS date,
        o.shipping_address,
        NULL AS customer_lat,
        NULL AS customer_lng
      FROM orders o
      LEFT JOIN users u ON u.id = o.customer_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC`,
      [String(customerId)]
    );
    return rows;
  });

  static updateStatusForShop = withErrorHandling(
    async (shopId: number, orderId: number, status: string): Promise<number> => {
      const { rowCount } = await (await db()).query(
        `UPDATE orders SET fulfillment_status = $1
         WHERE id = $2 AND shop_id = $3`,
        [status, orderId, String(shopId)]
      );
      return rowCount ?? 0;
    }
  );
}
