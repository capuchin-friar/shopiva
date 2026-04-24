import { shop as shopModel } from "../../models/business/shop.js";
import { product as productModel, inventory as inventoryModel } from "../../models/business/product.js";
import { GetProductWithInventoryService } from "./product.js";

export async function GetStorefrontShopBySlugService(slug: string) {
  const row = await shopModel.getStorefrontBySlug(slug);
  return row;
}

export async function GetStorefrontProductsByShopIdService(shopId: number) {
  const products = await productModel.listPublishedByShopId(shopId);
  console.log("products: ", products, shopId);
  const out = [];
  for (const p of products) {
    const inv = await inventoryModel.getByProductId(p.id);
    const prices = inv.map((i: { price: unknown }) => Number(i.price)).filter((x: number) => !isNaN(x));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const currency = inv[0]?.currency || "NGN";
    const images = Array.isArray(p.images) ? p.images : [];
    out.push({
      id: String(p.id),
      title: p.name,
      slug: p.slug,
      thumbnail: images[0] || "",
      price: minPrice,
      currency,
      raw: p,
    });
  }
  return out;
}

export async function GetStorefrontProductService(productId: number) {
  return GetProductWithInventoryService(productId);
}
