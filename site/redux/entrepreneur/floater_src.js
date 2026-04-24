/**
 * Floater Source Slice
 * 
 * Redux slice for managing the active floater/modal type.
 * Controls which floating panel (profile, notification, search) is displayed.
 * 
 * @module redux/entrepreneur/floater_src
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createSlice } from "@reduxjs/toolkit";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Available floater types
 * @enum {string}
 */
export const FLOATER_TYPES = {
  PROFILE: "profile",
  NOTIFICATION: "notification",
  SEARCH: "search",
};

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for floater source
 * @type {Object}
 * @property {string} floater_src - The currently active floater type
 */
const initialState = {
  floater_src: FLOATER_TYPES.PROFILE,
};

// ============================================================================
// SLICE DEFINITION
// ============================================================================

/**
 * Floater source slice with reducers for floater management
 */
export const floaterSrcSlice = createSlice({
  name: "floater_src",
  initialState,
  reducers: {
    /**
     * Sets the active floater type
     * @param {Object} state - Current state
     * @param {Object} action - Redux action with floater type payload
     */
    set_floater_src: (state, action) => {
      state.floater_src = action.payload;
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

// Export action creators
export const { set_floater_src } = floaterSrcSlice.actions;

// Export reducer as default
export default floaterSrcSlice.reducer;
