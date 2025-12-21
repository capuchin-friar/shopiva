/**
 * Header Component
 * 
 * Main header for the entrepreneur dashboard.
 * Contains logo, search bar, notifications, and profile menu.
 * 
 * @module components/entrepreneur/header/Header
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./style.css";

// Assets
import bell_svg from "../../../svgs/notification-svgrepo-com (3).svg";
import menu_svg from "../../../svgs/menu-svgrepo-com.svg";

// Utilities
import { handleAside, handleFloater } from "../../../reusables/anitmation";

// Redux Actions
import { set_floater_src } from "../../../redux/entrepreneur/floater_src";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Breakpoint for showing sidebar toggle */
const SIDEBAR_BREAKPOINT = 760;

// ============================================================================
// HEADER COMPONENT
// ============================================================================

/**
 * Dashboard header component
 * 
 * @returns {JSX.Element} The header interface
 */
export default function Header() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const dispatch = useDispatch();
  const [screenWidth, setScreenWidth] = useState(0);
  
  // Redux state
  const { floater_src } = useSelector((state) => state.floater_src);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Set screen width and header height on mount
  useEffect(() => {
    setScreenWidth(window.innerWidth);
    
    const headerElement = document.body.querySelector("header");
    if (headerElement) {
      headerElement.style.height = "100%";
    }
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles sidebar toggle for mobile
   */
  const handleMenuClick = () => {
    handleAside();
  };

  /**
   * Handles search input focus
   * Opens the search floater
   */
  const handleSearchFocus = (e) => {
    dispatch(set_floater_src("search"));
    
    const position = e.currentTarget.parentElement.getBoundingClientRect();
    const { left, top } = position;
    
    handleFloater("search", { left, top });
  };

  /**
   * Handles notification button click
   */
  const handleNotificationClick = () => {
    dispatch(set_floater_src("notification"));
    handleFloater("notification");
  };

  /**
   * Handles profile button click
   */
  const handleProfileClick = () => {
    dispatch(set_floater_src("profile"));
    handleFloater("profile");
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  /**
   * Renders the logo or menu button based on screen width
   */
  const renderLogoOrMenu = () => {
    if (screenWidth > SIDEBAR_BREAKPOINT) {
      return (
        <section>
          <h4>Shopiva</h4>
        </section>
      );
    }

    return (
      <button onClick={handleMenuClick}>
        <img
          src={menu_svg.src}
          style={{ height: "18px", width: "20px" }}
          alt="Menu"
        />
      </button>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0px 10px",
      }}
    >
      {/* Logo / Menu Button */}
      {renderLogoOrMenu()}

      {/* Search Section */}
      <section className="header-section">
        <input
          type="search"
          name="search"
          placeholder="Search"
          onFocus={handleSearchFocus}
          id="header-search"
        />
      </section>

      {/* Actions Section */}
      <section className="header-section">
        {/* Notification Button */}
        <button onClick={handleNotificationClick}>
          <img
            src={bell_svg.src}
            style={{ height: "20px", width: "20px" }}
            alt="Notifications"
          />
        </button>

        &nbsp;&nbsp;

        {/* Profile Button */}
        <button onClick={handleProfileClick}>
          <div
            style={{
              background: "#07d300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "auto",
              width: "auto",
              padding: "5px",
              borderRadius: "5px",
              fontSize: "x-small",
            }}
          >
            NM
          </div>
          &nbsp;
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "auto",
              width: "auto",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            Nova Mall
          </div>
        </button>
      </section>
    </header>
  );
}
