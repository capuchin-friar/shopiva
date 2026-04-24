/**
 * Entrepreneur shop: has-shop flag and loaded shop details (e.g. after login).
 * @module redux/entrepreneur/entrepreneur_shop
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  clearStoredEntrepreneurShopId,
  setStoredEntrepreneurShopId,
} from "../../lib/entrepreneurDefaultShop";

const initialState = {
  /** null = unknown, true/false after login or session check */
  hasShop: null,
  /** Full shop document from Node / GET /api/shop/details, or null */
  shop: null,
};

export const entrepreneurShopSlice = createSlice({
  name: "entrepreneur_shop",
  initialState,
  reducers: {
    set_entrepreneur_has_shop: (state, action) => {
      state.hasShop = action.payload;
    },
    set_entrepreneur_shop_details: (state, action) => {
      state.shop = action.payload ?? null;
      if (state.shop) {
        const id = state.shop.id ?? state.shop.shop_id ?? state.shop.shopId;
        if (id != null) setStoredEntrepreneurShopId(id);
      } else {
        clearStoredEntrepreneurShopId();
      }
    },
    reset_entrepreneur_shop: () => {
      clearStoredEntrepreneurShopId();
      return { ...initialState };
    },
  },
});

export const {
  set_entrepreneur_has_shop,
  set_entrepreneur_shop_details,
  reset_entrepreneur_shop,
} = entrepreneurShopSlice.actions;

export default entrepreneurShopSlice.reducer;
