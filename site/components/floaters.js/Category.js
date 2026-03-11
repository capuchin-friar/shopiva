/**
 * Category Floater Component
 * 
 * Displays a category selection panel for product categorization.
 * Shows main categories and their sub-categories.
 * 
 * For Fashion male is first, female is second and unisex is last
 * @module components/floaters/Category
 */

import React, { useEffect, useState, useRef } from "react";
import "./style.css";
import items from "../../reusables/items.json";
import categories_json from "../../json/mvp_category.json";
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
  
  const [type, setType] = useState("");
  const [gender, setGender] = useState("");

  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const isMountedRef = useRef(true);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Load main categories on mount
  useEffect(() => {
    const loadedCategories = [];
    for(let x in categories_json){
      loadedCategories.push(x.split("_").join(" & "));
    }
    setCategories(loadedCategories);
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    isMountedRef.current = true;
    
    // Reset sub-categories and type when category changes
    setSubCategories([]);
    setTypeList([]);
    
    if (category !== "" && category !== "fashion") {
      let result;
     
      for(let x in categories_json){
        if(x === category.split(" & ").join("_")){
          result = categories_json[x];
          break;
        }
      }
      
      if (result && result.length > 0) {
        const loadedSubCategories = result.map(sub_category => 
          sub_category.split("_").join(" & ")
        );
        if (isMountedRef.current) {
          setSubCategories(loadedSubCategories);
        }
      }
    } else if(category === "fashion" && gender !== ""){
      let x = category.split(" & ").join("_");
      let index;
      if(gender.toLowerCase() === 'male'){
        index = 0;
      }else if(gender.toLowerCase() === 'female'){
        index = 1;
      }else{
        index = 2;
      }
      if(categories_json[x] && categories_json[x][index]){
        const loadedType = Object.entries(categories_json[x][index]).map(([key, value]) => key);
        if (isMountedRef.current) {
          setTypeList(loadedType);
        }
      }
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [category, gender]);

  useEffect(() => {
    if (category === "fashion" && gender !== "" && type !== "") {
      let x = category.split(" & ").join("_");
      let index;
      if(gender.toLowerCase() === 'male'){
        index = 0;
      }else if(gender.toLowerCase() === 'female'){
        index = 1;
      }else{
        index = 2;
      }
      if(categories_json[x] && categories_json[x][index] && categories_json[x][index][type]){
        const subCategory = Object.entries(categories_json[x][index][type]).map(([key, value]) => key);
        setSubCategories(subCategory);
      }
    }
  }, [category, gender, type])
  


  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
   /**
   * Handles gender selection
   * @param {string} selectedGender - The selected gender name
   */
  const handleGenderClick = (selectedGender) => {
    setGender(selectedGender);
  };

   /**
   * Handles type selection
   * @param {string} selectedType - The selected type name
   */
  const handleTypeClick = (selectedType) => {
    setType(selectedType);
  };

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
  const handleSubCategoryClick = (item) => {
    setSubCategory(item);
    if (close_floater && typeof close_floater === 'function') {
      close_floater();
    }
  };

  /**
   * Handles going back to previous level
   */
  const handleBack = () => {
    if (subCategory !== "") {
      setSubCategory("");
      setSubCategories([]);
      setSearchQuery("");
    } else if (category === "fashion" && type !== "") {
      setType("");
      setTypeList([]);
      setSubCategories([]);
      setSearchQuery("");
    } else if (category === "fashion" && gender !== "") {
      setGender("");
      setType("");
      setTypeList([]);
      setSubCategories([]);
      setSearchQuery("");
    } else if (category !== "") {
      setCategory("");
      setGender("");
      setType("");
      setSubCategory("");
      setSubCategories([]);
      setTypeList([]);
      setSearchQuery("");
    }
  };

  /**
   * Handles clicking on breadcrumb items to navigate back
   */
  const handleBreadcrumbClick = (level) => {
    if (level === "category") {
      setCategory("");
      setGender("");
      setType("");
      setSubCategory("");
      setSubCategories([]);
      setTypeList([]);
      setSearchQuery("");
    } else if (level === "gender") {
      setGender("");
      setType("");
      setSubCategory("");
      setSubCategories([]);
      setTypeList([]);
      setSearchQuery("");
    } else if (level === "type") {
      setType("");
      setSubCategory("");
      setSubCategories([]);
      setSearchQuery("");
    }
  };

  /**
   * Handles search input change
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  /**
   * Filters items based on search query
   */
  const filterItems = (items, query) => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase().trim();
    return items.filter(item => 
      item.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Renders the main category list
   * @returns {JSX.Element} Category list
   */
  const renderCategoryList = () => {
    const filteredCategories = filterItems(categories, searchQuery);
    return (
      <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((item, index) => (
            <li
              key={index}
              onClick={() => handleCategoryClick(item)}
              style={{
                padding: "10px",
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "flex-start",
                textTransform: "capitalize",
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
          ))
        ) : (
          <li style={{ padding: "10px", textAlign: "center", color: "#727272" }}>
            No categories found
          </li>
        )}
      </ul>
    );
  };

  /**
   * Renders the sub-category list
   * @returns {JSX.Element} Sub-category list
   */
  const renderSubCategoryList = () => {
    const filteredSubCategories = filterItems(subCategories, searchQuery);
    return (
      <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
        {filteredSubCategories.length > 0 ? (
          filteredSubCategories.map((item, index) => (
            <li
              key={index}
              onClick={e => handleSubCategoryClick(item)}
              style={{
                padding: "10px",
                justifyContent: "space-between",
                flexDirection: "row",
                textTransform: "capitalize",
                alignItems: "flex-start",
                textAlign: "left",
                color: "#000",
                fontWeight: "400",
              }}
            >
              <span>{item}</span>
              <span></span>
            </li>
          ))
        ) : (
          <li style={{ padding: "10px", textAlign: "center", color: "#727272" }}>
            No subcategories found
          </li>
        )}
      </ul>
    );
  };

  /**
   * Renders the gender list
   * @returns {JSX.Element} Gender list
   */
  const renderGenderList = () => {
    const genders = ["Male", "Female", "Unisex"];
    const filteredGenders = filterItems(genders, searchQuery);
    return (
      <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
        {filteredGenders.length > 0 ? (
          filteredGenders.map((item, index) => (
            <li
              key={index}
              onClick={e => handleGenderClick(item)}
              style={{
                padding: "10px",
                justifyContent: "space-between",
                flexDirection: "row",
                textTransform: "capitalize",
                alignItems: "flex-start",
                textAlign: "left",
                color: "#000",
                fontWeight: "400",
              }}
            >
              <span>{item}</span>
              <span></span>
            </li>
          ))
        ) : (
          <li style={{ padding: "10px", textAlign: "center", color: "#727272" }}>
            No genders found
          </li>
        )}
      </ul>
    );
  };

    /**
   * Renders the type list
   * @returns {JSX.Element} Type list
   */
  const renderTypeList = () => {
    const filteredTypes = filterItems(typeList, searchQuery);
    return (
      <ul style={{ padding: "0", height: "100%", margin: "0", overflow: "auto" }}>
        {filteredTypes.length > 0 ? (
          filteredTypes.map((item, index) => (
            <li
              key={index}
              onClick={e => handleTypeClick(item)}
              style={{
                padding: "10px",
                justifyContent: "space-between",
                flexDirection: "row",
                textTransform: "capitalize",
                alignItems: "flex-start",
                textAlign: "left",
                color: "#000",
                fontWeight: "400",
              }}
            >
              <span>{item}</span>
              <span></span>
            </li>
          ))
        ) : (
          <li style={{ padding: "10px", textAlign: "center", color: "#727272" }}>
            No types found
          </li>
        )}
      </ul>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="category-floater shadow-sm" onClick={e => {
      if(e.target === e.currentTarget){
        // document.querySelector(".category-body").innerHTML = "";
        if (close_floater && typeof close_floater === 'function') {
          close_floater();
        }
      }
    }}>
      <div className="category-floater-cnt">
        {/* Header */}
        <div className="category-head">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
            <p style={{textTransform: "capitalize", fontSize: "small", margin: 0, flex: 1}}>
              {category !== "" && (
                <>Category: <small 
                  style={{textDecoration: "underline", color: "blue", cursor: "pointer"}}
                  onClick={() => handleBreadcrumbClick("category")}
                >{category}</small></>
              )}
              {category === "fashion" && gender !== "" && (
                <> Gender: <small 
                  style={{textDecoration: "underline", color: "blue", cursor: "pointer"}}
                  onClick={() => handleBreadcrumbClick("gender")}
                >{gender}</small></>
              )}
              {category === "fashion" && gender !== "" && type !== "" && (
                <> Type: <small 
                  style={{textDecoration: "underline", color: "blue", cursor: "pointer"}}
                  onClick={() => handleBreadcrumbClick("type")}
                >{type}</small></>
              )}
              {subCategory !== "" && (
                <> Subcategory: <small style={{textDecoration: "underline", color: "blue"}}>{subCategory}</small></>
              )}
            </p>
            {(category !== "" || gender !== "" || type !== "" || subCategory !== "") && (
              <button
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "1px solid #727272",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <img
                  src={bk.src}
                  style={{ height: "15px", width: "15px" }}
                  alt="Go back"
                />
                <span>Back</span>
              </button>
            )}
          </div>
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
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Category Body */}
        <div className="category-body">
          {
            category === ""
              ? renderCategoryList()
              : category === "fashion"
                ? gender === ""
                  ? renderGenderList()
                  : type === ""
                    ? renderTypeList()
                    : renderSubCategoryList()
              : renderSubCategoryList()
          }
        </div>
      </div>
    </div>
  );
}
