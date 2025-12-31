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

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, provider = "local" } = body;

    // Find user by email
    const users = await UserModel.findUserByEmail(email);

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

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
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
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Record failed login attempt
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

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
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
      { bool: false, data: err instanceof Error ? err.message : "An error occurred" },
      { status: 500 }
    );
  }
}

