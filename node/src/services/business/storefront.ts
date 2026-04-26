import { shop as shopModel } from "../../models/business/shop.js";
import {
  product as productModel,
  inventory as inventoryModel,
  type ProductRow,
  type InventoryRow,
} from "../../models/business/product.js";
import { GetProductWithInventoryService } from "./product.js";
import { buildStorefrontListingProducts, buildStorefrontProductDetail } from "./storefrontProductDto.js";

export async function GetStorefrontShopBySlugService(slug: string) {
  const row = await shopModel.getStorefrontBySlug(slug);
  if (!row) return null;
  const shopId = (row as { id: number }).id;
  let shopPolicies: {
    deliverypolicy: unknown;
    refundpolicy: unknown;
    custompolicies: unknown;
  } | null = null;
  if (shopId != null && Number.isFinite(Number(shopId))) {
    const policyRows = await shopModel.getShopPoliciesByShopId(Number(shopId));
    const pr = policyRows?.[0];
    if (pr) {
      shopPolicies = {
        deliverypolicy: parseJsonbPolicyField(pr.deliverypolicy),
        refundpolicy: parseJsonbPolicyField(pr.refundpolicy),
        custompolicies: parseJsonbPolicyField(pr.custompolicies),
      };
    }
  }
  return { shop: row, shopPolicies };
}

export async function GetStorefrontProductsByShopIdService(shopId: number) {
  const products = await productModel.listPublishedByShopId(shopId);
  const ids = products.map((p: { id: number }) => p.id);
  const inventoryRows = ids.length ? await inventoryModel.getByProductIds(ids) : [];
  return buildStorefrontListingProducts(products as ProductRow[], inventoryRows as InventoryRow[]);
}

/** JSONB columns are usually objects; normalize string payloads for consistent clients. */
function parseJsonbPolicyField(v: unknown): unknown {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as unknown;
    } catch {
      return v;
    }
  }
  return v;
}

export async function GetStorefrontProductService(productId: number) {
  const data = await GetProductWithInventoryService(productId);
  const productRow = data.product as ProductRow;
  const inventoryRows = data.inventory as InventoryRow[];
  const productDto = buildStorefrontProductDetail(productRow, inventoryRows);
  const shopId = productRow.shop_id;
  let shopPolicies: {
    deliverypolicy: unknown;
    refundpolicy: unknown;
    custompolicies: unknown;
  } | null = null;
  let productReviews: Awaited<ReturnType<typeof shopModel.getStorefrontReviewsByShopId>> = [];
  let reviewMetrics: Record<string, unknown> | null = null;
  if (shopId != null && Number.isFinite(Number(shopId))) {
    const sid = Number(shopId);
    const policyRows = await shopModel.getShopPoliciesByShopId(sid);
    const pr = policyRows?.[0];
    if (pr) {
      shopPolicies = {
        deliverypolicy: parseJsonbPolicyField(pr.deliverypolicy),
        refundpolicy: parseJsonbPolicyField(pr.refundpolicy),
        custompolicies: parseJsonbPolicyField(pr.custompolicies),
      };
    }
    productReviews = await shopModel.getStorefrontReviewsByShopId(sid);
    const metricRows = await shopModel.getShopMetricsById(sid);
    reviewMetrics = (metricRows?.[0] as Record<string, unknown> | undefined) ?? null;
  }
  return { product: productDto, shopPolicies, productReviews, reviewMetrics };
}
