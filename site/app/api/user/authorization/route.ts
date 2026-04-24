import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../lib/jwt";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

type JwtPayload = { id: number; email?: string; name?: string };

function sessionProfileFromJwt(decoded: JwtPayload) {
  const email = typeof decoded.email === "string" ? decoded.email.trim() : "";
  let name = typeof decoded.name === "string" ? decoded.name.trim() : "";
  if (!name && email) {
    const local = email.split("@")[0]?.trim();
    if (local) name = local;
  }
  return { id: decoded.id, email, name };
}

export async function POST(request: NextRequest) {
  try {
    let body: { role?: string; checkShop?: boolean } = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text) as { role?: string; checkShop?: boolean };
    } catch {
      /* optional JSON body */
    }

    let token: string | null = null;
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
    // HttpOnly cookies are not readable in the browser — client sends credentials only
    if (!token) {
      const cookieName =
        body.role === "customer" ? "customer_secret" : "entrepreneur_secret";
      token = request.cookies.get(cookieName)?.value ?? null;
    }
    if (!token) {
      return NextResponse.json(
        { bool: false, data: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded?.id) {
      return NextResponse.json(
        { bool: false, data: "Unauthorized" },
        { status: 401 }
      );
    }

    /** Only when vendor explicitly requests it (after login/signup), not on every session check */
    let hasShop: boolean | undefined;
    if (
      body.role === "entrepreneur" &&
      body.checkShop === true &&
      BACKEND_URL
    ) {
      try {
        const res = await fetch(`${BACKEND_URL}/shop/has-shop`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.ok ? await res.json() : {};
        hasShop = Boolean(data.hasShop);
      } catch {
        hasShop = false;
      }
    }

    return NextResponse.json({
      bool: true,
      data: sessionProfileFromJwt(decoded),
      id: decoded.id,
      ...(typeof hasShop === "boolean" ? { hasShop } : {}),
    });
  } catch (err) {
    console.error("Auth error:", err);
    const message = err instanceof Error ? err.message : "An error occurred";
    const isJwt =
      err instanceof Error &&
      (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError");
    return NextResponse.json(
      { bool: false, data: message },
      { status: isJwt ? 401 : 500 }
    );
  }
}
