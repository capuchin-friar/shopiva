/**
 * Aside (Sidebar) Component
 * 
 * Main navigation sidebar for the entrepreneur dashboard.
 * Contains all navigation links with expandable accordion menus.
 * 
 * @module components/entrepreneur/aside/Aside
 */

"use client";

import React, { useState } from "react";

// Styles
import "./assets/xxl.css";
import "./assets/xl.css";
import "./assets/l.css";
import "./assets/s.css";
import "./assets/m.css";

// Navigation Icons
import home_svg from "../../../svgs/home-1-svgrepo-com (2).svg";
import product_svg from "../../../svgs/product-service-campaign-svgrepo-com.svg";
import discount_svg from "../../../svgs/discount-svgrepo-com.svg";
import order_svg from "../../../svgs/order-completed-svgrepo-com (1).svg";
import customer_svg from "../../../svgs/customer-qudaoliebiao-line-svgrepo-com.svg";
import report_svg from "../../../svgs/report-flag-1420-svgrepo-com.svg";
import inventory_svg from "../../../svgs/store-inventory-inventory-stock-supply-svgrepo-com (1).svg";
import settings_svg from "../../../svgs/settings-svgrepo-com (7).svg";
import transaction_svg from "../../../svgs/transaction-minus-svgrepo-com.svg";
import referral_svg from "../../../svgs/transaction-minus-svgrepo-com.svg";
import arrow_svg from "../../../svgs/back-svgrepo-com (3).svg";
import marketing_svg from "../../../svgs/marketing-svgrepo-com.svg";
import team_svg from "../../../svgs/team-svgrepo-com.svg";
import add_on_svg from "../../../svgs/application-x-addon-svgrepo-com.svg";
import integration_svg from "../../../svgs/data-mapping-svgrepo-com.svg";
import support_svg from "../../../svgs/support-help-headset-svgrepo-com.svg";
import tutorials_svg from "../../../svgs/transaction-minus-svgrepo-com.svg";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Main navigation items configuration
 */
const NAV_ITEMS = {
  overview: { icon: home_svg, label: "Overview", hasSubmenu: false },
  orders: {
    icon: order_svg,
    label: "Orders",
    hasSubmenu: true,
    submenu: [
      { link: "orders/manage-orders", label: "Manage Orders" },
      { link: "orders/create-order", label: "Create Order" },
    ],
  },
  products: {
    icon: product_svg,
    label: "Products",
    hasSubmenu: true,
    submenu: [
      { link: "product/manage-product", label: "Manage Products" },
      { link: "product/create-product", label: "Create Products" },
      { link: "product/product-reviews", label: "Products Reviews" },
    ],
  },
  customers: { icon: customer_svg, label: "Customers", hasSubmenu: false },
  inventory: { icon: inventory_svg, label: "Inventory", hasSubmenu: false },
  team: { icon: team_svg, label: "Team", hasSubmenu: false },
  integration: { icon: integration_svg, label: "Integration", hasSubmenu: false },
  addOn: { icon: add_on_svg, label: "Add On Store", hasSubmenu: false },
  discount: {
    icon: discount_svg,
    label: "Discount",
    hasSubmenu: true,
    submenu: [
      { link: "discount/manage-discount", label: "Manage Discount" },
      { link: "discount/create-discount", label: "Bump & Drop" },
    ],
  },
  transaction: {
    icon: transaction_svg,
    label: "Transaction",
    hasSubmenu: true,
    submenu: [
      { link: "transaction/balance", label: "Balance" },
      { link: "transaction/wallet", label: "Wallet" },
    ],
  },
  reports: {
    icon: report_svg,
    label: "Reports",
    hasSubmenu: true,
    submenu: [
      { link: "report/analytics", label: "Analytics" },
      { link: "report/sales", label: "Sales" },
    ],
  },
  settings: {
    icon: settings_svg,
    label: "Settings",
    hasSubmenu: true,
    submenu: [
      { link: "settings/shop-details", label: "Shop Details" },
      { link: "settings/locations", label: "Locations" },
      { link: "settings/inventory", label: "Inventory" },
      { link: "settings/orders", label: "Orders" },
      { link: "settings/social-accounts", label: "Social Accounts" },
      { link: "settings/currencies", label: "Currencies" },
      { link: "settings/bank-account", label: "Bank Account" },
      { link: "settings/policies", label: "Policies" },
      { link: "settings/shipping-rates", label: "Shipping Rates" },
      { link: "settings/pickup-points", label: "Pickup Points" },
      { link: "settings/subscription-billing", label: "Subscription/Billing" },
      { link: "settings/my-domain", label: "My Domain" },
      { link: "settings/API-keys", label: "API Keys" },
    ],
  },
  marketing: {
    icon: marketing_svg,
    label: "Marketing",
    hasSubmenu: true,
    submenu: [
      { link: "marketing/manage-campaign", label: "Manage Campaigns" },
      { link: "marketing/create-campaign", label: "Create Campaigns" },
    ],
  },
  referral: { icon: referral_svg, label: "Referral & Earn", hasSubmenu: false },
};

/**
 * Resource links configuration
 */
const RESOURCE_ITEMS = [
  { icon: tutorials_svg, label: "Tutorials", link: "referral" },
  { icon: support_svg, label: "Contact Support", link: "profile" },
];

// ============================================================================
// ASIDE COMPONENT
// ============================================================================

/**
 * Sidebar navigation component
 * 
 * @returns {JSX.Element} The sidebar navigation
 */
export default function Aside() {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [accordionState, setAccordionState] = useState({
    orders: false,
    products: false,
    discount: false,
    transaction: false,
    reports: false,
    settings: false,
    marketing: false,
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles navigation to a page
   * @param {string} link - The route to navigate to
   */
  const handleNavigation = (link) => {
    window.location.href = `/entrepreneur/${link}`;
  };

  /**
   * Toggles accordion state for a menu
   * @param {string} menu - The menu key to toggle
   */
  const toggleAccordion = (menu) => {
    setAccordionState((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  /**
   * Renders a navigation item
   * @param {string} key - Item key
   * @param {Object} item - Item configuration
   * @returns {JSX.Element} Navigation item
   */
  const renderNavItem = (key, item) => {
    if (item.hasSubmenu) {
      return renderAccordionItem(key, item);
    }

    return (
      <li key={key}>
        <div
          onClick={() => handleNavigation(key)}
          data-link={key}
          id={key === "overview" ? "link" : undefined}
        >
          <span>
            <img
              src={item.icon.src}
              style={{ height: "20px", width: "20px" }}
              alt={item.label}
            />
          </span>
          &nbsp;&nbsp;
          <span>{item.label}</span>
        </div>
      </li>
    );
  };

  /**
   * Renders an accordion navigation item with submenu
   * @param {string} key - Item key
   * @param {Object} item - Item configuration
   * @returns {JSX.Element} Accordion navigation item
   */
  const renderAccordionItem = (key, item) => {
    const isOpen = accordionState[key];

    return (
      <li key={key}>
        <div
          onClick={() => toggleAccordion(key)}
          data-link={key}
          style={{ position: "relative" }}
        >
          <span>
            <img
              src={item.icon.src}
              style={{ height: "20px", width: "20px" }}
              alt={item.label}
            />
          </span>
          &nbsp;&nbsp;
          <span>{item.label}</span>
          <span style={{ position: "absolute", right: "5px", top: "5px" }}>
            <img
              src={arrow_svg.src}
              style={{ height: "20px", width: "20px", rotate: "-90deg" }}
              alt="Expand"
            />
          </span>
        </div>

        {isOpen && (
          <section
            style={{
              position: "relative",
              display: "block",
              background: "rgb(219, 219, 219)",
              width: "100%",
              padding: "0px 0px 0px 20px",
              marginLeft: "10px",
            }}
          >
            {/* Vertical Line Indicator */}
            <div
              style={{
                height: "90%",
                width: "auto",
                borderRight: "2px solid #000",
                background: "rgb(219, 219, 219)",
                position: "absolute",
                left: "0",
                top: "0",
              }}
            />

            {/* Submenu Items */}
            {item.submenu.map((subItem, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(subItem.link)}
                data-link={subItem.link.split("/").pop()}
                style={{ padding: "8px", width: "auto" }}
              >
                <span></span>
                <span>{subItem.label}</span>
              </div>
            ))}
          </section>
        )}
      </li>
    );
  };

  /**
   * Renders a resource link item
   * @param {Object} item - Resource item configuration
   * @param {number} index - Item index
   * @returns {JSX.Element} Resource link item
   */
  const renderResourceItem = (item, index) => (
    <li key={index}>
      <div onClick={() => handleNavigation(item.link)} data-link={item.link}>
        <span>
          <img
            src={item.icon.src}
            style={{ height: "20px", width: "20px" }}
            alt={item.label}
          />
        </span>
        &nbsp;&nbsp;
        <span>{item.label}</span>
      </div>
    </li>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="aside-cnt">
      <section className="links">
        {/* Main Navigation */}
        <ul className="top-links">
          {Object.entries(NAV_ITEMS).map(([key, item]) =>
            renderNavItem(key, item)
          )}
        </ul>

        {/* Resources Section */}
        <div className="btm-links">
          <br />
          <h6>Resources</h6>
          <ul style={{ overflow: "auto", padding: "0" }}>
            {RESOURCE_ITEMS.map(renderResourceItem)}
          </ul>
        </div>
      </section>
    </div>
  );
}
