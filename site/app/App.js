"use client";

/**
 * App Component
 * 
 * Main application wrapper that handles:
 * - User role detection (customer vs entrepreneur)
 * - Layout selection based on route
 * - Redux and session provider setup
 * 
 * @module app/App
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "../redux/store";
import AuthLayout from "../layouts/Auth";

// Entrepreneur Layout Imports
import EntrepreneurRestrictedLayout from "../layouts/Entrepreneur/Restricted";
import EntrepreneurFreeLayout from "../layouts/Entrepreneur/Free";

// Customer Layout Imports
import CustomerRestrictedLayout from "../layouts/Customer/Restricted";
import CustomerFreeLayout from "../layouts/Customer/Free";

// ============================================================================
// CONSTANTS
// ============================================================================

/** User role identifiers */
const USER_ROLES = {
  CUSTOMER: 0,
  ENTREPRENEUR: 1,
};

/** Auth page identifiers */
const AUTH_PAGES = ["signup", "login"];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if the current path is an authentication page
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if on auth page
 */
const isAuthPage = (pathname) => {
  const pathSegment = pathname.split("/").splice(1, 2)[1];
  return AUTH_PAGES.includes(pathSegment);
};

/**
 * Checks if the current path requires a free (public) layout
 * @param {string} pathname - Current route pathname
 * @returns {boolean} True if free layout should be used
 */
const isFreeLayout = (pathname) => {
  const pathParts = pathname.split("/");
  return pathParts.length > 2 && pathParts.splice(0, 3)[2]?.length === 2;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

/**
 * Main App component that wraps the entire application
 * 
 * @param {Object} props - Component props
 * @param {Object} props.session - NextAuth session object
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} The wrapped application
 */
export default function App({ session, children }) {
  const pathname = usePathname();
  const [role, setRole] = useState(USER_ROLES.CUSTOMER);

  // Detect user role based on URL path
  useEffect(() => {
    const isEntrepreneur = pathname.split("/")[1] === "entrepreneur";
    setRole(isEntrepreneur ? USER_ROLES.ENTREPRENEUR : USER_ROLES.CUSTOMER);
  }, [pathname]);

  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        {role === USER_ROLES.CUSTOMER ? (
          <Customer>{children}</Customer>
        ) : (
          <Entrepreneur>{children}</Entrepreneur>
        )}
      </Provider>
    </SessionProvider>
  );
}

// ============================================================================
// ENTREPRENEUR LAYOUT WRAPPER
// ============================================================================

/**
 * Entrepreneur layout wrapper component
 * Determines which layout to use based on current route
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Appropriate entrepreneur layout
 */
function Entrepreneur({ children }) {
  const pathname = usePathname();

  // Auth pages use AuthLayout
  if (isAuthPage(pathname)) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // Determine if restricted or free layout
  if (pathname.split("/").length > 2) {
    if (isFreeLayout(pathname)) {
      return <EntrepreneurFreeLayout>{children}</EntrepreneurFreeLayout>;
    }
    return <EntrepreneurRestrictedLayout>{children}</EntrepreneurRestrictedLayout>;
  }

  // Default to restricted layout
  return <EntrepreneurRestrictedLayout>{children}</EntrepreneurRestrictedLayout>;
}

// ============================================================================
// CUSTOMER LAYOUT WRAPPER
// ============================================================================

/**
 * Customer layout wrapper component
 * Determines which layout to use based on current route
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Appropriate customer layout
 */
function Customer({ children }) {
  const pathname = usePathname();

  // Auth pages use AuthLayout
  if (isAuthPage(pathname)) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  // Determine if restricted or free layout
  if (pathname.split("/").length > 2) {
    if (isFreeLayout(pathname)) {
      return <CustomerFreeLayout>{children}</CustomerFreeLayout>;
    }
    return <CustomerRestrictedLayout>{children}</CustomerRestrictedLayout>;
  }

  // Default to restricted layout
  return <CustomerRestrictedLayout>{children}</CustomerRestrictedLayout>;
}
