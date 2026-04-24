/**
 * Entrepreneur Cookie Slice
 * 
 * Redux slice for managing entrepreneur authentication cookie state.
 * Used to track and update the entrepreneur's session cookie.
 * 
 * @module redux/entrepreneur/entrepreneur_cookie
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for entrepreneur cookie
 * @type {Object}
 * @property {string|null} entrepreneur_cookie - The authentication cookie value
 */
const initialState = {
  entrepreneur_cookie: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Entrepreneur cookie slice with reducers for cookie management
 */
export const entrepreneurCookieSlice = createSlice({
  name: "entrepreneur_cookie",
  initialState,
  reducers: {
    /**
     * Sets the entrepreneur cookie value
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with cookie payload
     */
    set_entrepreneur_cookie: (state, action) => {
      state.entrepreneur_cookie = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_entrepreneur_cookie } = entrepreneurCookieSlice.actions;

// Export reducer as default
export default entrepreneurCookieSlice.reducer;
