/**
 * Reset password – verify token and update user password.
 *
 * @module app/api/user/reset-password/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";
import { getJwtSecret } from "../../lib/jwt";

const SALT_ROUNDS = 10;

type ResetPayload = {
  userId: number;
  email: string;
  purpose: string;
};

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
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    let decoded: ResetPayload;
    try {
      decoded = jwt.verify(token, secret) as ResetPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    if (decoded.purpose !== "password_reset" || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid reset link." },
        { status: 400 }
      );
    }

    const users = await UserModel.findUserById(decoded.userId);
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User no longer exists." },
        { status: 400 }
      );
    }

    const user = users[0];
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
          error: `This account uses ${providerName} sign-in and does not use a password. Use the ${providerName} button to log in.`,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await UserModel.updatePassword({ id: decoded.userId, password: hashedPassword });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
