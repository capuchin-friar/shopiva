/**
 * Forgot password – check email and issue reset token.
 * If email exists (and account not deleted), returns a short-lived token
 * so the client can redirect to the reset-password page.
 *
 * @module app/api/user/forgot-password/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";
import { getJwtSecret } from "../../lib/jwt";

const RESET_EXPIRY = "1h"; // token valid for 1 hour

export async function POST(request: NextRequest) {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const users = await UserModel.findUserByEmail(email);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No account found for this email." },
        { status: 404 }
      );
    }

    const user = users[0];

    if (user.accountStatus === "deleted") {
      return NextResponse.json(
        { success: false, error: "No account found for this email." },
        { status: 404 }
      );
    }

    // OAuth-only accounts don't have a password to reset
    const oauthProvider = user.password;
    if (
      oauthProvider === "oauth_google" ||
      oauthProvider === "oauth_apple" ||
      oauthProvider === "oauth_facebook"
    ) {
      const providerName = oauthProvider.replace("oauth_", "").replace(/\b\w/g, (c) => c.toUpperCase());
      return NextResponse.json(
        {
          success: false,
          error: `This account uses ${providerName} sign-in. Use the ${providerName} button to log in instead of resetting a password.`,
        },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: "password_reset",
      },
      secret,
      { expiresIn: RESET_EXPIRY }
    );

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
