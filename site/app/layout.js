"use server";

/**
 * Root Layout Component
 * 
 * This is the main layout component for the Shopiva application.
 * It handles:
 * - Global styles and metadata
 * - Cookie management for authentication
 * - External script and stylesheet loading
 * 
 * @module app/layout
 */

// ============================================================================
// IMPORTS
// ============================================================================

import App from "./App";
import "./globals.css";
import { cookies } from "next/headers";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum age for cookies in seconds (90 days) */
const MAX_COOKIE_AGE = 90 * 24 * 60 * 60;

/** Cookie expiration time in milliseconds (30 days) */
const COOKIE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

/**
 * Sets a new authentication cookie for the user
 * 
 * @param {string} data - The cookie value to store
 * @param {number} role - User role (0 = customer, 1 = entrepreneur)
 * @returns {string} JSON stringified result of the cookie operation
 */
export async function setNewCookie(data, role) {
  const cookieStore = cookies();
  const expires = new Date();
  
  // Determine cookie name based on user role
  const cookieName = role === 0 ? "customer_secret" : "entrepreneur_secret";
  
  // Set cookie with expiration  
  const result = cookieStore.set(cookieName, data, {
    expires: expires.setTime(expires.getTime() + COOKIE_EXPIRATION_MS),
  });
  
  return JSON.stringify(result);
}

// ============================================================================
// METADATA
// ============================================================================

/**
 * Application metadata for SEO and browser display
 */
export const metadata = async () => ({
  title: "Shopiva",
  description: "Enjoy Seamless Shopping From The Comfort Of Your Home",
});

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

/**
 * Root layout component that wraps all pages
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The root HTML structure
 */
export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fff" />

        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
          integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
          crossOrigin="anonymous"
        />

        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />

        {/* Bootstrap JS Bundle */}
        <script
          async
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
          crossOrigin="anonymous"
        />

        {/* Pusher for Real-time Features */}
        <script
          async
          src="https://js.pusher.com/7.2/pusher.min.js"
        />
      </head>

      <body style={{ overflow: "auto", background: "#fff" }}>
        <App>{children}</App>
      </body>
    </html>
  );
}
