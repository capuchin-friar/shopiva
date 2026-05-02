import { dispute as disputeModel, type BuyerDisputeRow } from "../../models/buyer/dispute.js";
import { shop as shopModel } from "../../models/business/shop.js";

/**
 * Resolve a shop's owner id and assert the supplied user owns it.
 * Mirrors the ownership check used by `UpdateOrderStatusForShopService`.
 */
async function assertShopOwnership(shopId: number, ownerId: number | string): Promise<void> {
  const shopRows = await shopModel.getShopById(shopId);
  const shopRow = shopRows?.[0] as Record<string, unknown> | undefined;
  if (!shopRow) throw new Error("Shop not found");
  const owner =
    shopRow.ownerid ??
    (shopRow as { ownerId?: unknown }).ownerId ??
    shopRow.owner_id;
  if (owner == null || String(owner) !== String(ownerId)) {
    throw new Error("Forbidden");
  }
}

/**
 * List disputes raised against any order belonging to the vendor's shop.
 * @param shopId — shop being viewed
 * @param ownerId — JWT/path-supplied user id; must match shop.ownerid
 */
export async function GetShopDisputesService(
  shopId: number,
  ownerId: number | string,
  options?: { includeClosed?: boolean }
): Promise<BuyerDisputeRow[]> {
  await assertShopOwnership(shopId, ownerId);
  return disputeModel.getByShopId(shopId, options);
}

/**
 * Fetch a single dispute scoped to the vendor's shop. Accepts dispute_ref or numeric id.
 */
export async function GetShopDisputeByIdService(
  shopId: number,
  ownerId: number | string,
  disputeId: string
): Promise<BuyerDisputeRow | null> {
  await assertShopOwnership(shopId, ownerId);
  return disputeModel.getByShopAndDisputeId(shopId, disputeId);
}
