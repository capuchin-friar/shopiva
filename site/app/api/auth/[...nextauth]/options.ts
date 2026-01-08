/**
 * NextAuth Configuration Options
 * 
 * Configures authentication providers for the application.
 * Supports Google, Apple, and Facebook OAuth.
 * 
 * @module app/api/auth/[...nextauth]/options
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";

// Extend the Session type to include provider
declare module "next-auth" {
  interface Session {
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
  }
}

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
    // Apple OAuth Provider
    AppleProvider({
      clientId: process.env.APPLE_ID as string,
      clientSecret: process.env.APPLE_SECRET as string,
    }),
    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID as string,
      clientSecret: process.env.FACEBOOK_SECRET as string,
    }),
  ],
  
  callbacks: {
    // Add provider to JWT token
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    // Add provider to session from JWT token
    async session({ session, token }) {
      session.provider = token.provider as string;
      return session;
    },
  },
};
