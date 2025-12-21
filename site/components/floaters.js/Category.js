/**
 * Category Floater Component
 * 
 * Displays a category selection panel for product categorization.
 * Shows main categories and their sub-categories.
 * 
 * @module components/floaters/Category
 */

import React, { useEffect, useState } from "react";
import "./style.css";
import items from "../../reusables/items.json";
import bk from "../../svgs/backward-arrow-svgrepo-com.svg";

// ============================================================================
// CATEGORY FLOATER COMPONENT
// ============================================================================

/**
 * Category selection floater component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.close_floater - Callback to close the floater
 * @returns {JSX.Element} The category selection interface
 */
export default function CategoryFloater({ close_floater }) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load main categories on mount
  useEffect(() => {
    const categoryNames = items.items.category.map(
      (item) => Object.keys(item)[0]
    );
    setCategories(categoryNames);
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (category !== "") {
      const result = items.items.category.filter(
        (item) => Object.keys(item)[0] === category
      );
      
      if (result.length > 0) {
        setSubCategories(result[0][category]);
      }
    }
  }, [category]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles category selection
   * @param {string} selectedCategory - The selected category name
   */
  const handleCategoryClick = (selectedCategory) => {
    setCategory(selectedCategory);
  };

  /**
   * Handles sub-category selection and closes floater
   */
  const handleSubCategoryClick = () => {
    close_floater();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  /**
   * Renders the main category list
   * @returns {JSX.Element} Category list
   */
  const renderCategoryList = () => (
    <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
      {categories.map((item, index) => (
        <li
          key={index}
          onClick={() => handleCategoryClick(item)}
          style={{
            padding: "10px",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "flex-start",
            textAlign: "left",
            color: "#000",
            fontWeight: "400",
          }}
        >
          <span>{item}</span>
          <span>
            <img
              src={bk.src}
              style={{ height: "15px", width: "15px", rotate: "180deg" }}
              alt="Navigate to subcategories"
            />
          </span>
        </li>
      ))}
    </ul>
  );

  /**
   * Renders the sub-category list
   * @returns {JSX.Element} Sub-category list
   */
  const renderSubCategoryList = () => (
    <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
      {subCategories.map((item, index) => (
        <li
          key={index}
          onClick={handleSubCategoryClick}
          style={{
            padding: "10px",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "flex-start",
            textAlign: "left",
            color: "#000",
            fontWeight: "400",
          }}
        >
          <span>{item}</span>
          <span></span>
        </li>
      ))}
    </ul>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="category-floater shadow-sm">
      <div className="category-floater-cnt">
        {/* Header */}
        <div className="category-head">
          <p>
            Category <small>: {category}</small>
          </p>
          <hr />
          
          {/* Search Input */}
          <div
            className="input-cnt"
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
            }}
          >
            <label htmlFor="category-search" style={{ color: "#727272" }}></label>
            <input
              id="category-search"
              style={{ width: "100%", border: "1px solid #727272" }}
              type="search"
              name="category-search"
              placeholder="Search categories..."
            />
          </div>
        </div>

        {/* Category Body */}
        <div className="category-body">
          {category === "" ? renderCategoryList() : renderSubCategoryList()}
        </div>
      </div>
    </div>
  );
}
