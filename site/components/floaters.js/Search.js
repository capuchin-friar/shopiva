/**
 * Search Floater Component
 * 
 * Global search interface for the entrepreneur dashboard.
 * Allows searching across customers, orders, products, etc.
 * 
 * @module components/floaters/Search
 */

import React from "react";
import "./style.css";
import filter_svg from "../../svgs/filter-svgrepo-com (1).svg";
import search_svg from "../../svgs/search-alt-svgrepo-com (1).svg";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Search filter categories
 */
const SEARCH_CATEGORIES = [
  "Customers",
  "Orders",
  "Products",
  "Sales channels",
  "Apps",
];

// ============================================================================
// SEARCH FLOATER COMPONENT
// ============================================================================

/**
 * Search floater component for global search functionality
 * 
 * @returns {JSX.Element} The search floater interface
 */
export default function SearchFloater() {
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="search-floater" style={{ zIndex: "100000" }}>
      {/* Search Input Section */}
      <section style={{ zIndex: "100000" }}>
        {/* Search Icon */}
        <span>
          <img
            src={search_svg.src}
            style={{ height: "18px", width: "20px" }}
            alt="Search"
          />
        </span>

        {/* Search Input */}
        <span>
          <input
            autoFocus
            type="search"
            name="search"
            id="global-search"
            placeholder="Search..."
          />
        </span>

        {/* Filter Icon */}
        <span>
          <img
            src={filter_svg.src}
            style={{ height: "18px", width: "20px" }}
            alt="Filter"
          />
        </span>
      </section>

      {/* Category Filters */}
      <section style={{ zIndex: "100000" }}>
        {SEARCH_CATEGORIES.map((category, index) => (
          <span key={index}>{category}</span>
        ))}
      </section>

      {/* Empty State */}
      <section style={{ zIndex: "100000" }}>
        <div style={{ width: "auto" }}>
          <img
            src={search_svg.src}
            style={{ height: "40px", width: "40px" }}
            alt="Search illustration"
          />
        </div>
        <p>Find Anything In Nova Shop</p>
      </section>
    </div>
  );
}
