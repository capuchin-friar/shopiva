/**
 * Animation Utilities
 * 
 * Helper functions for handling UI animations and transitions.
 * Manages sidebar and floater panel visibility states.
 * 
 * @module reusables/animation
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Animation delay in milliseconds */
const ANIMATION_DELAY = 450;

/** CSS selectors for DOM elements */
const SELECTORS = {
  sidebar: ".entrepreneur-aside",
  sidebarOverlay: ".aside-overlay",
  floater: ".entrepreneur-floater-cnt",
  searchFloater: ".entrepreneur-floater-cnt-xtra",
};

/** ID attributes for visibility states */
const IDS = {
  sidebarOverlay: "aside-overlay",
  sidebar: "entrepreneur-aside",
  floater: "entrepreneur-floater-cnt",
};

/** Desktop breakpoint for search floater positioning */
const DESKTOP_BREAKPOINT = 600;

// ============================================================================
// ASIDE (SIDEBAR) ANIMATIONS
// ============================================================================

/**
 * Toggles the sidebar visibility with animation
 * Handles both the sidebar element and its overlay
 * 
 * @returns {boolean} Returns false if elements not found, true otherwise
 */
export function handleAside() {
  const sidebarElement = document.querySelector(SELECTORS.sidebar);
  const overlayElement = document.querySelector(SELECTORS.sidebarOverlay);

  // Guard clause - ensure elements exist
  if (!sidebarElement || !overlayElement) {
    console.warn("Sidebar or overlay element not found in DOM");
    return false;
  }

  // Check if sidebar is currently visible
  const isVisible = sidebarElement.hasAttribute("id");

  if (isVisible) {
    // Hide sidebar - remove ID first, then overlay after animation
    sidebarElement.removeAttribute("id");
    
    setTimeout(() => {
      if (overlayElement) {
        overlayElement.removeAttribute("id");
      }
    }, ANIMATION_DELAY);
  } else {
    // Show sidebar - show overlay first, then sidebar after animation
    overlayElement.setAttribute("id", IDS.sidebarOverlay);
    
    setTimeout(() => {
      if (sidebarElement) {
        sidebarElement.setAttribute("id", IDS.sidebar);
      }
    }, ANIMATION_DELAY);
  }

  return true;
}

// ============================================================================
// FLOATER (MODAL/PANEL) ANIMATIONS
// ============================================================================

/**
 * Toggles floater panel visibility based on type
 * Supports profile, notification, and search floaters
 * 
 * @param {string} type - The type of floater ('profile' | 'notification' | 'search')
 * @param {Object} [position={}] - Optional position coordinates for search floater
 * @param {number} [position.left] - Left position in pixels
 * @param {number} [position.top] - Top position in pixels
 * @returns {boolean} Returns false if invalid type or element not found
 */
export function handleFloater(type, position = {}) {
  // Validate type parameter
  if (!type || typeof type !== "string") {
    console.warn("handleFloater: Invalid type parameter");
    return false;
  }

  switch (type) {
    case "profile":
    case "notification": {
      const floaterElement = document.querySelector(SELECTORS.floater);
      if (!floaterElement) {
        console.warn(`Floater element not found for type: ${type}`);
        return false;
      }
      return toggleFloaterVisibility(floaterElement);
    }

    case "search":
      return handleSearchFloater(position);

    default:
      console.warn(`Unknown floater type: ${type}`);
      return false;
  }
}

/**
 * Toggles the visibility of a floater element
 * 
 * @param {HTMLElement} element - The floater element to toggle
 * @returns {boolean} True if operation successful
 */
function toggleFloaterVisibility(element) {
  if (!element) {
    console.warn("toggleFloaterVisibility: Element is null");
    return false;
  }

  if (element.hasAttribute("id")) {
    element.removeAttribute("id");
  } else {
    element.setAttribute("id", IDS.floater);
  }

  return true;
}

/**
 * Handles the search floater specifically
 * Positions the floater based on screen width
 * 
 * @param {Object} [position={}] - Optional position coordinates
 * @returns {boolean} True if operation successful
 */
function handleSearchFloater(position = {}) {
  const searchFloater = document.querySelector(SELECTORS.searchFloater);

  if (!searchFloater) {
    console.warn("Search floater element not found");
    return false;
  }

  if (searchFloater.hasAttribute("id")) {
    searchFloater.removeAttribute("id");
  } else {
    searchFloater.setAttribute("id", IDS.floater);
    
    // Position based on screen width
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    searchFloater.style.left = isDesktop ? "calc(50% - 150px)" : "0px";
    
    // Apply custom position if provided
    if (position.left !== undefined) {
      searchFloater.style.left = `${position.left}px`;
    }
    if (position.top !== undefined) {
      searchFloater.style.top = `${position.top}px`;
    }
  }

  return true;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Closes all open floaters
 * Useful for cleanup or when navigating away
 * 
 * @returns {void}
 */
export function closeAllFloaters() {
  const floater = document.querySelector(SELECTORS.floater);
  const searchFloater = document.querySelector(SELECTORS.searchFloater);

  if (floater?.hasAttribute("id")) {
    floater.removeAttribute("id");
  }

  if (searchFloater?.hasAttribute("id")) {
    searchFloater.removeAttribute("id");
  }
}

/**
 * Closes the sidebar if open
 * 
 * @returns {void}
 */
export function closeSidebar() {
  const sidebarElement = document.querySelector(SELECTORS.sidebar);
  const overlayElement = document.querySelector(SELECTORS.sidebarOverlay);

  if (sidebarElement?.hasAttribute("id")) {
    sidebarElement.removeAttribute("id");
  }

  if (overlayElement?.hasAttribute("id")) {
    setTimeout(() => {
      overlayElement?.removeAttribute("id");
    }, ANIMATION_DELAY);
  }
}

/**
 * Checks if sidebar is currently visible
 * 
 * @returns {boolean} True if sidebar is visible
 */
export function isSidebarOpen() {
  const sidebarElement = document.querySelector(SELECTORS.sidebar);
  return sidebarElement?.hasAttribute("id") ?? false;
}

/**
 * Checks if any floater is currently visible
 * 
 * @returns {boolean} True if any floater is visible
 */
export function isFloaterOpen() {
  const floater = document.querySelector(SELECTORS.floater);
  const searchFloater = document.querySelector(SELECTORS.searchFloater);
  
  return (floater?.hasAttribute("id") ?? false) || 
         (searchFloater?.hasAttribute("id") ?? false);
}
