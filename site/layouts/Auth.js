/**
 * Auth Layout Component
 * 
 * Wrapper layout for authentication pages (login, signup, password recovery).
 * Provides a clean, minimal layout for auth-related pages.
 * 
 * @module layouts/Auth
 */

"use client";

// ============================================================================
// IMPORTS
// ============================================================================

import { usePathname } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";

// ============================================================================
// AUTH LAYOUT COMPONENT
// ============================================================================

/**
 * Authentication layout wrapper
 * Currently renders children directly but can be extended
 * for auth-specific styling or functionality
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The auth layout wrapper
 */
export default function AuthLayout({ children }) {
  // Hooks for potential future use
  const pathname = usePathname();
  const dispatch = useDispatch();

  return <>{children}</>;
}
