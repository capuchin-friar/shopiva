/**
 * NextAuth API Route Handler
 * 
 * Handles all authentication-related API requests.
 * Exports GET and POST handlers for NextAuth.
 * 
 * @module app/api/auth/[...nextauth]/route
 */

import NextAuth from "next-auth";
import { options } from "./options";

// ============================================================================
// ROUTE HANDLER
// ============================================================================

/**
 * NextAuth handler instance
 */
const handler = NextAuth(options);

// Export handlers for GET and POST requests
export { handler as GET, handler as POST };
