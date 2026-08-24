/**
 * User Signin API Route
 * 
 * Handles user authentication for both local and OAuth providers.
 * 
 * @module app/api/user/signin/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";
import { getJwtSecret } from "../../lib/jwt";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      console.error("Signin: JWT_SECRET is not set");
      return NextResponse.json(
        { bool: false, data: "Server configuration error (JWT)." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email: rawEmail, password, provider = "local" } = body;
    const email =
      typeof rawEmail === "string" ? rawEmail.trim() : "";
    if (provider === "local" && (!email || typeof password !== "string")) {
      return NextResponse.json(
        { bool: false, data: "invalid credentials" },
        { status: 401 }
      );
    }

    // Find user by email (normalized match for local + OAuth email lookup)
    const users =
      email.length > 0
        ? await UserModel.findUserByEmailNormalized(email)
        : [];

    console.log("passed!", email)
    console.log("passed!", users)
    
    if (users.length === 0) {
      return NextResponse.json(
        { bool: false, data: "invalid credentials" },
        { status: 401 }
      );
    }
   
    const user = users[0];
    


    // Check if account is deleted
    if (user.accountStatus === "deleted") {
      return NextResponse.json(
        { bool: false, data: "account deleted" },
        { status: 401 }
      );
    }

    // Handle OAuth providers (Google, Apple, Facebook)
    if (provider !== "local") {
      // For OAuth, we just verify the email exists
      // The actual OAuth verification is done by NextAuth
      
      // Update last login
      await UserModel.updateLastLogin(user.id);
      await UserModel.resetLoginAttempts(user.id);

      const displayName = [user.fname, user.lname].filter(Boolean).join(" ").trim();

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          ...(displayName ? { name: displayName } : {}),
        },
        secret,
        { expiresIn: "7d" }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        bool: true,
        message: "Login successful",
        cookie: token,
        user: userWithoutPassword,
      });
    }

    // Local authentication - verify password
    if(user.password === "oauth_google" || user.password === "oauth_apple" || user.password === "oauth_facebook") {
      return NextResponse.json({
        bool: false,
        data: `Please use the OAuth-${user.password.replace("oauth_", "")} login button to continue`,
      }, { status: 401 });
    }

    // Local authentication — bcrypt, or legacy plain-text (upgrade to hash on success)
    const stored = user.password as string;
    let passwordMatch = false;
    if (stored && typeof stored === "string" && stored.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, stored);
    } else if (stored === password) {
      passwordMatch = true;
      try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await UserModel.updatePassword({ id: user.id, password: hashedPassword });
      } catch (migrateErr) {
        console.error("Password migration hash failed:", migrateErr);
      }
    }

    if (!passwordMatch) {
      await UserModel.recordFailedLoginAttempt(user.id);

      return NextResponse.json(
        { bool: false, data: "invalid credentials" },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    await UserModel.resetLoginAttempts(user.id);

    // Update last login
    await UserModel.updateLastLogin(user.id);

    const displayName = [user.fname, user.lname].filter(Boolean).join(" ").trim();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        ...(displayName ? { name: displayName } : {}),
      },
      secret,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      bool: true,
      message: "Login successful",
      cookie: token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Signin error:", err);
    return NextResponse.json(
      { bool: false, data: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}

