/**
 * Entrepreneur Data Slice
 * 
 * Redux slice for managing entrepreneur profile and business data.
 * Stores the complete entrepreneur data object from the API.
 * 
 * @module redux/entrepreneur/entrepreneur_data
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for entrepreneur data
 * @type {Object}
 * @property {Object|null} entrepreneur_data - The entrepreneur's profile data
 */
const initialState = {
  entrepreneur_data: null,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Entrepreneur data slice with reducers for data management
 */
export const entrepreneurDataSlice = createSlice({
  name: "entrepreneur_data",
  initialState,
  reducers: {
    /**
     * Sets the entrepreneur data object
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with data payload
     */
    set_entrepreneur_data_to: (state, action) => {
      state.entrepreneur_data = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_entrepreneur_data_to } = entrepreneurDataSlice.actions;

// Export reducer as default
export default entrepreneurDataSlice.reducer;
