/**
 * Customer Restricted Layout Component
 * 
 * Layout for authenticated customer pages.
 * Includes header, sidebar, and floater components.
 * Handles authentication verification on mount.
 * 
 * @module layouts/Customer/Restricted
 */

"use client";

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";

// Components
import Aside from "../../components/entrepreneur/aside/Aside";
import Header from "../../components/entrepreneur/header/Header";
import ProfileFloater from "../../components/floaters.js/Profile";
import NotificationFloater from "../../components/floaters.js/Notification";
import SearchFloater from "../../components/floaters.js/Search";

// Utilities
import { handleAside, handleFloater, closeSidebar, closeAllFloaters } from "../../reusables/anitmation";

// Redux Actions
import { set_entrepreneur_id_to } from "../../redux/entrepreneur/entrepreneur_id";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Breakpoint for responsive sidebar behavior */
const SIDEBAR_BREAKPOINT = 760;

/** Debounce delay for resize events (ms) */
const RESIZE_DEBOUNCE_DELAY = 150;

/** Pages that don't require authentication */
const PUBLIC_PAGES = ["login", "signup", "password-recovery"];

/** API endpoint for authorization */
const AUTH_ENDPOINT = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/customer/authorization`
  : "http://localhost:3456/customer/authorization";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets a cookie value by name
 * 
 * @param {string} name - The cookie name to retrieve
 * @returns {string|null} The cookie value or null if not found
 */
function getCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieName = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  
  return null;
}

/**
 * Checks if the current page requires authentication
 * 
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if authentication is required
 */
function requiresAuth(pathname) {
  const pathParts = pathname.split("/").filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  return !PUBLIC_PAGES.includes(lastPart);
}

/**
 * Creates a debounced function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================================================================
// CUSTOMER RESTRICTED LAYOUT COMPONENT
// ============================================================================

/**
 * Restricted layout for authenticated customer pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The restricted customer layout
 */
export default function CustomerRestrictedLayout({ children }) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  
  const [screenWidth, setScreenWidth] = useState(0);
  const [activeFloater, setActiveFloater] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Redux state
  const { floater_src } = useSelector((state) => state.floater_src);
  const { entrepreneur_id } = useSelector((state) => state.entrepreneur_id);

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  /**
   * Handles window resize events
   */
  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    setScreenWidth(newWidth);
    
    // Close sidebar if transitioning from mobile to desktop
    if (newWidth > SIDEBAR_BREAKPOINT) {
      closeSidebar();
    }
  }, []);

  /**
   * Debounced resize handler
   */
  const debouncedResize = useCallback(
    debounce(handleResize, RESIZE_DEBOUNCE_DELAY),
    [handleResize]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Set initial screen width and add resize listener
  useEffect(() => {
    // Set initial width
    setScreenWidth(window.innerWidth);

    // Add resize listener
    window.addEventListener("resize", debouncedResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [debouncedResize]);

  // Update active floater based on Redux state
  useEffect(() => {
    switch (floater_src) {
      case "profile":
        setActiveFloater(<ProfileFloater />);
        break;
      case "notification":
        setActiveFloater(<NotificationFloater />);
        break;
      default:
        setActiveFloater(null);
    }
  }, [floater_src]);

  // Close floaters on route change
  useEffect(() => {
    closeAllFloaters();
    closeSidebar();
  }, [pathname]);

  // Verify authentication on mount and route change
  useEffect(() => {
    // Skip auth check for public pages
    if (!requiresAuth(pathname)) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    // Skip if already authenticated
    if (entrepreneur_id) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    const authCookie = getCookie("customer_secret");

    // No cookie, redirect to login
    if (!authCookie) {
      router.push("/customer/login");
      return;
    }

    // Verify cookie with server
    const controller = new AbortController();
    
    fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authCookie,
      },
      signal: controller.signal,
    })
      .then(async (result) => {
        if (!result.ok) {
          throw new Error("Authentication failed");
        }
        
        const response = await result.json();

        if (response.bool) {
          dispatch(set_entrepreneur_id_to(response.id));
          setIsAuthenticated(true);
        } else {
          router.push("/customer/login");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Authentication error:", error);
          router.push("/customer/login");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Cleanup - abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, [dispatch, pathname, router, entrepreneur_id]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles floater overlay click to close floater
   */
  const handleFloaterClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleFloater(floater_src);
    }
  }, [floater_src]);

  /**
   * Handles aside overlay click to close sidebar
   */
  const handleAsideClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleAside();
    }
  }, []);

  /**
   * Handles keyboard events for accessibility
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      closeAllFloaters();
      closeSidebar();
    }
  }, []);

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Check for user-profile page (special case)
  const pathParts = pathname.split("/").filter(Boolean);
  const isUserProfilePage = pathParts[1] === "user-profile";

  if (isUserProfilePage) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className="entrepreneur-layout"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f7f7f7",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div 
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #ededed",
              borderTopColor: "#00926e",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated && requiresAuth(pathname)) {
    return null;
  }

  return (
    <div className="entrepreneur-layout">
      {/* Header Section */}
      <div className="entrepreneur-header">
        {/* Search Floater */}
        <section
          className="entrepreneur-floater-cnt-xtra"
          onClick={handleFloaterClick}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <SearchFloater />
        </section>
        
        <Header />
      </div>

      {/* Profile/Notification Floater */}
      <section
        className="entrepreneur-floater-cnt"
        onClick={handleFloaterClick}
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
      >
        {activeFloater}
      </section>

      {/* Main Content Area */}
      <div className="entrepreneur-main">
        {/* Sidebar - Responsive */}
        {screenWidth > SIDEBAR_BREAKPOINT ? (
          <div className="entrepreneur-aside">
            <Aside />
          </div>
        ) : (
          <div 
            className="aside-overlay" 
            onClick={handleAsideClick}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="entrepreneur-aside">
              <Aside />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="entrepreneur-content">
          {children}
        </div>
      </div>
    </div>
  );
}
