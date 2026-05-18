import { returnsTransformer } from "../../transformers/business/returns.js";
import { returnTransformer } from "../../transformers/business/return.js";

export async function GetReturnsByShopIdService(shopId: number) {
  return returnsTransformer(shopId);
}

export async function GetReturnDetailByIdService(returnId: number) {
  return returnTransformer(returnId);
}
