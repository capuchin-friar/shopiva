/**
 * Entrepreneur ID Slice
 * 
 * Redux slice for managing the entrepreneur's unique identifier.
 * Used for authentication and API calls.
 * 
 * @module redux/entrepreneur/entrepreneur_id
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for entrepreneur ID
 * @type {Object}
 * @property {string|null} entrepreneur_id - The entrepreneur's unique identifier
 */
const initialState = {
  entrepreneur_id: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Entrepreneur ID slice with reducers for ID management
 */
export const entrepreneurIdSlice = createSlice({
  name: "entrepreneur_id",
  initialState,
  reducers: {
    /**
     * Sets the entrepreneur ID value
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with ID payload
     */
    set_entrepreneur_id_to: (state, action) => {
      state.entrepreneur_id = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_entrepreneur_id_to } = entrepreneurIdSlice.actions;

// Export reducer as default
export default entrepreneurIdSlice.reducer;
