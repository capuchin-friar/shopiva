/**
 * NextAuth Configuration Options
 * 
 * Configures authentication providers for the application.
 * Currently supports Google OAuth.
 * 
 * @module app/api/auth/[...nextauth]/options
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ============================================================================
// NEXTAUTH OPTIONS
// ============================================================================

/**
 * NextAuth configuration object
 * 
 * @type {NextAuthOptions}
 */
export const options: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_AUTH_GOOGLE_SECRET as string,
    }),
  ],
  
  // Additional options can be added here:
  // - callbacks: Custom callback functions
  // - pages: Custom authentication pages
  // - session: Session configuration
  // - jwt: JWT configuration
};
