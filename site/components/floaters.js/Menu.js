/**
 * Menu Floater Component
 * 
 * Mobile navigation menu that appears on smaller screens.
 * Provides access to main navigation items.
 * 
 * @module components/floaters/Menu
 */

import React from "react";

// ============================================================================
// MENU FLOATER COMPONENT
// ============================================================================

/**
 * Mobile menu floater component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.updateClickOpt - Callback for menu option clicks
 * @param {boolean} props.logged_in - Whether user is logged in
 * @returns {JSX.Element} The mobile menu interface
 */
export default function MenuComp({ updateClickOpt, logged_in }) {
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles Resources menu click
   */
  const handleResourcesClick = () => {
    updateClickOpt("resources");
  };

  /**
   * Handles Solutions menu click
   */
  const handleSolutionsClick = () => {
    updateClickOpt("solutions");
  };

  /**
   * Handles Pricing navigation
   */
  const handlePricingClick = () => {
    window.open("/entrepreneur/ng/pricing");
  };

  /**
   * Handles Login navigation
   */
  const handleLoginClick = () => {
    window.open("/entrepreneur/login");
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="menu-floater">
      <div className="menu-floater-cnt">
        {/* Navigation Links */}
        <ul>
          <li onClick={handleResourcesClick}>Resources</li>
          <li onClick={handleSolutionsClick}>Solutions</li>
          <li onClick={handlePricingClick}>Pricing</li>
        </ul>

        {/* Login Button (shown only when logged in) */}
        <div>
          {logged_in && (
            <button onClick={handleLoginClick}>Log in</button>
          )}
        </div>
      </div>
    </div>
  );
}
