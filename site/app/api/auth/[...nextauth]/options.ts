/**
 * NextAuth Configuration Options
 * 
 * Configures authentication providers for the application.
 * Supports Google, Apple, and Facebook OAuth.
 * 
 * OAuth redirect/callback URLs use NEXTAUTH_URL (see next.config.js env).
 * Google does not allow private IPs in the redirect URI (RFC1918), e.g.
 * http://10.0.0.5:3000 — you get "device_id and device_name are required for
 * private IP". Use https://localhost:PORT, a tunnel URL (ngrok / Cloudflare
 * Tunnel), or your deployed origin. Add that exact URL in Google Cloud Console
 * → OAuth client → Authorized redirect URIs (…/api/auth/callback/google).
 *
 * @module app/api/auth/[...nextauth]/options
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";

// Do not assign NEXTAUTH_URL here (Next inlines env). next.config.js sets it:
// NEXTAUTH_URL env if set, else NEXT_PUBLIC_API_URL. For Google sign-in, both
// should be a URL Google accepts, not a bare LAN IP.

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

/** openid-client defaults to 3500ms; slow networks / VPNs often hit SIGNIN_OAUTH_ERROR on Issuer.discover */
const OAUTH_HTTP_OPTIONS = { timeout: 20_000 };

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
      httpOptions: OAUTH_HTTP_OPTIONS,
    }),
    // Apple OAuth Provider
    AppleProvider({
      clientId: process.env.APPLE_ID as string,
      clientSecret: process.env.APPLE_SECRET as string,
      httpOptions: OAUTH_HTTP_OPTIONS,
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
