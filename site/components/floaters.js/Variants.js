/**
 * Variant Floater Component
 *
 * Displays a searchable picker for product variants.
 * Sellers can choose whether they want to add a color or size option.
 *
 * @module components/floaters/Variant
 */

import React, { useState } from "react";
import "./style.css";
import colors from "../../json/color.json";
import bk from "../../svgs/backward-arrow-svgrepo-com.svg";

const VARIANT_OPTIONS = ["Color", "Size"];

const SIZE_TYPE_OPTIONS = [
  {
    key: "shoes",
    label: "Shoe sizes",
    options: Array.from({ length: 25 }, (_, index) => String(index + 36)),
  },
  {
    key: "clothing",
    label: "Clothing sizes",
    options: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  },
  {
    key: "food",
    label: "Food sizes",
    options: ["Small", "Medium", "Large"],
  },
  {
    key: "default",
    label: "General sizes",
    options: ["One Size", "Small", "Medium", "Large", "Extra Large"],
  },
];

const CLOTHING_SUBTYPE_OPTIONS = [
  {
    key: "trousers",
    label: "Trousers",
    options: Array.from({ length: 23 }, (_, index) => String(index + 28)),
  },
  {
    key: "shorts",
    label: "Shorts",
    options: Array.from({ length: 23 }, (_, index) => String(index + 28)),
  },
  {
    key: "shirt",
    label: "Shirt",
    options: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  },
  {
    key: "gown",
    label: "Gown",
    options: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  },
  {
    key: "skirt",
    label: "Skirt",
    options: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  },
];

const getSizeTypeConfig = (sizeTypeKey) =>
  SIZE_TYPE_OPTIONS.find((item) => item.key === sizeTypeKey) ??
  SIZE_TYPE_OPTIONS.find((item) => item.key === "default");

const getClothingSubtypeConfig = (subTypeKey) =>
  CLOTHING_SUBTYPE_OPTIONS.find((item) => item.key === subTypeKey) ?? null;

const resolveSizeOptions = ({ category = "", subCategory = "", type = "" }) => {
  const labels = [type, subCategory, category]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  const matches = (keywords) =>
    labels.some((label) => keywords.some((keyword) => label.includes(keyword)));

  if (
    matches([
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "boot",
      "boots",
      "sandal",
      "sandals",
      "slipper",
      "slippers",
      "foot wear",
      "footwear",
      "palms",
      "cotina",
    ])
  ) {
    return {
      key: "shoes",
      label: "Shoe sizes",
      options: getSizeTypeConfig("shoes").options,
    };
  }

  if (
    matches([
      "pizza",
      "shawarma",
      "sharwarma",
      "sharwama",
      "burger",
      "food",
      "meal",
      "snack",
      "snacks",
      "drink",
      "drinks",
      "beverage",
      "beverages",
    ])
  ) {
    return {
      key: "food",
      label: "Food sizes",
      options: getSizeTypeConfig("food").options,
    };
  }

  if (
    matches([
      "cloth",
      "clothing",
      "skirt",
      "gown",
      "dress",
      "top",
      "trouser",
      "trousees",
      "underwear",
      "sports-wear",
      "swim-suit",
      "shirt",
      "t-shirt",
      "jacket",
      "hoodie",
    ])
  ) {
    return {
      key: "clothing",
      label: "Clothing sizes",
      options: getSizeTypeConfig("clothing").options,
    };
  }

  return {
    key: "default",
    label: "General sizes",
    options: getSizeTypeConfig("default").options,
  };
};

const resolveClothingSubType = ({ category = "", subCategory = "", type = "" }) => {
  const labels = [type, subCategory, category]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  const matches = (keywords) =>
    labels.some((label) => keywords.some((keyword) => label.includes(keyword)));

  if (matches(["trouser", "trousees", "pants"])) {
    return "trousers";
  }

  if (matches(["short", "shorts", "nicker"])) {
    return "shorts";
  }

  if (matches(["shirt", "t-shirt", "top", "hoodie", "jacket"])) {
    return "shirt";
  }

  if (matches(["gown", "dress"])) {
    return "gown";
  }

  if (matches(["skirt"])) {
    return "skirt";
  }

  return "";
};

/**
 * Variant selection floater component.
 *
 * @param {Object} props - Component props
 * @param {Function} props.updateVariantFloater - Callback to close the floater
 * @param {string} props.color - Accent color used by the UI
 * @returns {JSX.Element} The variant selection interface
 */
export default function VariantFloater({
  updateVariantFloater,
  color = "#2563eb",
  category = "",
  subCategory = "",
  type = "",
}) {
  const [variant, setVariant] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSizeType, setSelectedSizeType] = useState("");
  const [selectedClothingSubType, setSelectedClothingSubType] = useState("");
  const [stock, setStock] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockError, setStockError] = useState("");
  const sizeConfig = resolveSizeOptions({ category, subCategory, type });
  const recommendedClothingSubType = resolveClothingSubType({
    category,
    subCategory,
    type,
  });
  const activeSizeConfig = selectedSizeType
    ? getSizeTypeConfig(selectedSizeType)
    : null;
  const activeClothingSubTypeConfig = selectedClothingSubType
    ? getClothingSubtypeConfig(selectedClothingSubType)
    : null;
  const displayedSizeOptions =
    selectedSizeType === "clothing" && activeClothingSubTypeConfig
      ? activeClothingSubTypeConfig.options
      : activeSizeConfig?.options ?? [];

  const closeFloater = (selection) => {
    if (typeof updateVariantFloater === "function") {
      const payload =
        typeof selection === "string"
          ? {
              type: variant,
              value: selection,
              ...(variant === "Size" && selectedSizeType
                ? {
                    sizeType: selectedSizeType,
                    sizeTypeLabel: activeSizeConfig.label,
                    ...(selectedClothingSubType
                      ? {
                          sizeSubType: selectedClothingSubType,
                          sizeSubTypeLabel: activeClothingSubTypeConfig?.label,
                        }
                      : {}),
                  }
                : {}),
            }
          : selection;

      updateVariantFloater(false, payload);
    }
  };

  const handleVariantClick = (selectedVariant) => {
    setVariant(selectedVariant);
    setSearchQuery("");
    setSelectedColor("");
    setSelectedSize("");
    setSelectedSizeType("");
    setSelectedClothingSubType("");
    setStock("");
    setStockError("");
    setShowStockModal(false);
  };

  const handleBack = () => {
    if (showStockModal) {
      setShowStockModal(false);
      setStock("");
      setStockError("");
      return;
    }

    if (variant === "Size" && selectedSizeType) {
      if (selectedSizeType === "clothing" && selectedClothingSubType) {
        setSelectedClothingSubType("");
        setSearchQuery("");
        return;
      }

      setSelectedSizeType("");
      setSearchQuery("");
      return;
    }

    if (variant !== "") {
      setVariant("");
      setSearchQuery("");
      setSelectedColor("");
      setSelectedSize("");
      setSelectedSizeType("");
      setSelectedClothingSubType("");
      setStock("");
      setStockError("");
    }
  };

  const handleColorClick = (selectedValue) => {
    setSelectedColor(selectedValue);
    setSelectedSize("");
    setStock("");
    setStockError("");
    setShowStockModal(true);
  };

  const handleSizeClick = (selectedValue) => {
    setSelectedSize(selectedValue);
    setSelectedColor("");
    setStock("");
    setStockError("");
    setShowStockModal(true);
  };

  const handleStockChange = (event) => {
    const nextValue = event.target.value;

    if (/^\d*$/.test(nextValue)) {
      setStock(nextValue);
      if (stockError) {
        setStockError("");
      }
    }
  };

  const handleSizeTypeClick = (sizeTypeKey) => {
    setSelectedSizeType(sizeTypeKey);
    setSelectedClothingSubType("");
    setSearchQuery("");
  };

  const handleClothingSubTypeClick = (subTypeKey) => {
    setSelectedClothingSubType(subTypeKey);
    setSearchQuery("");
  };

  const handleSaveStock = () => {
    if (!stock.trim()) {
      setStockError("Enter the available stock.");
      return;
    }

    const parsedStock = Number.parseInt(stock, 10);

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setStockError("Stock must be 0 or more.");
      return;
    }

    if (variant === "Color") {
      closeFloater({
        type: "Color",
        value: selectedColor,
        stock: parsedStock,
      });
      return;
    }

    if (variant === "Size") {
      closeFloater({
        type: "Size",
        value: selectedSize,
        stock: parsedStock,
        ...(selectedSizeType
          ? {
              sizeType: selectedSizeType,
              sizeTypeLabel: activeSizeConfig.label,
            }
          : {}),
        ...(selectedClothingSubType
          ? {
              sizeSubType: selectedClothingSubType,
              sizeSubTypeLabel: activeClothingSubTypeConfig?.label,
            }
          : {}),
      });
    }
  };

  const filterItems = (list, query, getLabel = (item) => item) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return list;
    }

    return list.filter((item) =>
      getLabel(item).toLowerCase().includes(normalizedQuery)
    );
  };

  const getSearchPlaceholder = () => {
    if (showStockModal) {
      return "";
    }

    if (variant === "Color") {
      return "Search colors...";
    }

    if (variant === "Size") {
      if (selectedSizeType === "clothing" && !selectedClothingSubType) {
        return "Search clothing types...";
      }

      return selectedSizeType
        ? `Search ${
            selectedSizeType === "clothing" && activeClothingSubTypeConfig
              ? activeClothingSubTypeConfig.label.toLowerCase()
              : activeSizeConfig.label.toLowerCase()
          }...`
        : "Search size types...";
    }

    return "Search variants...";
  };

  const baseListStyle = {
    padding: "0",
    height: "100%",
    margin: "0",
    overflow: "auto",
    listStyleType: "none",
  };

  const baseRowStyle = {
    width: "100%",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    color: "#000",
    fontWeight: "400",
    background: "#fff",
    border: "none",
    borderBottom: "1px solid #ededed",
    cursor: "pointer",
  };

  const renderEmptyState = (message) => (
    <li style={{ padding: "10px", textAlign: "center", color: "#727272" }}>
      {message}
    </li>
  );

  const renderVariantList = () => {
    const filteredVariants = filterItems(VARIANT_OPTIONS, searchQuery);

    return (
      <ul style={baseListStyle}>
        {filteredVariants.length > 0
          ? filteredVariants.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => handleVariantClick(item)}
                  style={{ ...baseRowStyle, textTransform: "capitalize" }}
                >
                  <span>{item}</span>
                  <img
                    src={bk.src}
                    style={{ height: "15px", width: "15px", transform: "rotate(180deg)" }}
                    alt={`Open ${item} options`}
                  />
                </button>
              </li>
            ))
          : renderEmptyState("No variants found")}
      </ul>
    );
  };

  const renderColorList = () => {
    const filteredColors = filterItems(colors, searchQuery, (item) => item.name);

    return (
      <ul style={baseListStyle}>
        {filteredColors.length > 0
          ? filteredColors.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => handleColorClick(item.name)}
                  style={{
                    ...baseRowStyle,
                    justifyContent: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: item.code,
                      height: "16px",
                      width: "16px",
                      borderRadius: "50%",
                      border: item.code === "#FFFFFF" ? "1px solid #d1d5db" : "none",
                      flexShrink: 0,
                    }}
                  />
                  <span>{item.name}</span>
                </button>
              </li>
            ))
          : renderEmptyState("No colors found")}
      </ul>
    );
  };

  const renderSizeList = () => {
    const filteredSizes = filterItems(displayedSizeOptions, searchQuery);

    return (
      <ul style={baseListStyle}>
        {filteredSizes.length > 0
          ? filteredSizes.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => handleSizeClick(item)}
                  style={{ ...baseRowStyle, textTransform: "uppercase" }}
                >
                  <span>{item}</span>
                </button>
              </li>
            ))
          : renderEmptyState("No sizes found")}
      </ul>
    );
  };

  const renderClothingSubTypeList = () => {
    const filteredSubTypes = filterItems(
      CLOTHING_SUBTYPE_OPTIONS,
      searchQuery,
      (item) => item.label
    );

    return (
      <ul style={baseListStyle}>
        {filteredSubTypes.length > 0
          ? filteredSubTypes.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => handleClothingSubTypeClick(item.key)}
                  style={{ ...baseRowStyle, textTransform: "none" }}
                >
                  <span>
                    {item.label}
                    {item.key === recommendedClothingSubType ? " (recommended)" : ""}
                  </span>
                  <img
                    src={bk.src}
                    style={{ height: "15px", width: "15px", transform: "rotate(180deg)" }}
                    alt={`Open ${item.label}`}
                  />
                </button>
              </li>
            ))
          : renderEmptyState("No clothing types found")}
      </ul>
    );
  };

  const renderSizeTypeList = () => {
    const filteredSizeTypes = filterItems(
      SIZE_TYPE_OPTIONS,
      searchQuery,
      (item) => item.label
    );

    return (
      <ul style={baseListStyle}>
        {filteredSizeTypes.length > 0
          ? filteredSizeTypes.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => handleSizeTypeClick(item.key)}
                  style={{ ...baseRowStyle, textTransform: "none" }}
                >
                  <span>
                    {item.label}
                    {item.key === sizeConfig.key ? " (recommended)" : ""}
                  </span>
                  <img
                    src={bk.src}
                    style={{ height: "15px", width: "15px", transform: "rotate(180deg)" }}
                    alt={`Open ${item.label}`}
                  />
                </button>
              </li>
            ))
          : renderEmptyState("No size types found")}
      </ul>
    );
  };

  const renderStockModal = () => {
    const selectedValue = variant === "Color" ? selectedColor : selectedSize;
    const variantLabel = variant === "Color" ? "color" : "size";

    return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "320px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
        }}
      >
        <p style={{ margin: "0 0 6px 0", fontWeight: "600", color: "#111827" }}>
          Add stock for {selectedValue}
        </p>
        <p style={{ margin: "0 0 16px 0", fontSize: "small", color: "#727272" }}>
          Enter how many items are available for this {variantLabel} variant.
        </p>

        <div
          className="input-cnt"
          style={{
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            marginBottom: "10px",
          }}
        >
          <label htmlFor="variant-stock" style={{ color: "#727272" }}>
            <small>Stock</small>
          </label>
          <input
            id="variant-stock"
            type="text"
            inputMode="numeric"
            placeholder="Enter stock"
            value={stock}
            onChange={handleStockChange}
            style={{ width: "100%", border: "1px solid #727272" }}
          />
        </div>

        {stockError && (
          <p style={{ margin: "0 0 12px 0", fontSize: "small", color: "#dc2626" }}>
            {stockError}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              height: "40px",
              borderRadius: "6px",
              color: "#000",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveStock}
            style={{
              backgroundColor: color,
              color: "#fff",
              border: "none",
              height: "40px",
              borderRadius: "6px",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div
      className="variant-floater shadow-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeFloater();
        }
      }}
    >
      <div className="variant-floater-cnt" style={{ position: "relative" }}>
        <div className="variant-head">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              gap: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "small", color: "#727272" }}>
                Add product variant
              </p>
              <p style={{ textTransform: "capitalize", fontSize: "small", margin: 0 }}>
                {variant ? (
                  <>
                    Variant:{" "}
                    <button
                      type="button"
                      onClick={handleBack}
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        textDecoration: "underline",
                        color,
                        cursor: "pointer",
                        fontSize: "inherit",
                      }}
                    >
                      {variant}
                    </button>
                    {showStockModal && selectedColor ? ` / ${selectedColor}` : ""}
                    {variant === "Size" && selectedSizeType ? ` / ${activeSizeConfig.label}` : ""}
                    {variant === "Size" && selectedClothingSubType
                      ? ` / ${activeClothingSubTypeConfig.label}`
                      : ""}
                  </>
                ) : (
                  "Choose the variant type you want to add."
                )}
              </p>
              {variant === "Size" && (
                <p style={{ margin: "4px 0 0 0", fontSize: "small", color: "#727272" }}>
                  {selectedSizeType === "clothing" && !selectedClothingSubType
                    ? `Select the clothing type first. Recommended: ${
                        getClothingSubtypeConfig(recommendedClothingSubType)?.label || "Clothing"
                      }.`
                    : selectedSizeType
                    ? `Showing ${
                        selectedSizeType === "clothing" && activeClothingSubTypeConfig
                          ? activeClothingSubTypeConfig.label.toLowerCase()
                          : activeSizeConfig.label.toLowerCase()
                      } sizes for ${type || subCategory || category || "this item"}.`
                    : `Select the size type first. Recommended: ${sizeConfig.label.toLowerCase()}.`}
                </p>
              )}
            </div>

            {variant && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "1px solid #727272",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  flexShrink: 0,
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

          {/* Search bar not used in this version
          {!showStockModal && (
            <div
              className="input-cnt"
              style={{
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              <label htmlFor="variant-search" style={{ color: "#727272" }}>
                <small>Search</small>
              </label>
              <input
                id="variant-search"
                style={{ width: "100%", border: "1px solid #727272" }}
                type="search"
                name="variant-search"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          )}
          */}
        </div>

        <div className="variant-body">
          {variant === ""
            ? renderVariantList()
            : variant === "Color"
              ? renderColorList()
              : selectedSizeType === "clothing" && !selectedClothingSubType
                ? renderClothingSubTypeList()
              : selectedSizeType
                ? renderSizeList()
                : renderSizeTypeList()}
        </div>

        {showStockModal && renderStockModal()}
      </div>
    </div>
  );
}
