import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../lib/jwt";
import {
  readUpstreamJson,
  upstreamData,
  upstreamJsonError,
} from "../../lib/upstreamJson";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

/**
 * Create shop (token auth). Proxies to Node POST /shop/create so the browser
 * does not call the backend origin directly (avoids CORS / wrong LAN IP in .env).
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("entrepreneur_secret")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in to create a shop." },
        { status: 401 }
      );
    }
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "Backend URL is not configured." },
        { status: 500 }
      );
    }
    const secret = getJwtSecret();
    if (!secret) {
      return NextResponse.json(
        { error: "Server auth misconfiguration." },
        { status: 500 }
      );
    }
    jwt.verify(token, secret);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const createRes = await fetch(`${BACKEND_URL}/shop/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    const parsed = await readUpstreamJson(createRes);
    const parseErr = upstreamJsonError(parsed);
    if (parseErr) {
      return NextResponse.json({ error: parseErr }, { status: 502 });
    }
    const data = upstreamData(parsed);

    if (!createRes.ok) {
      return NextResponse.json(
        {
          error:
            (data.error as string | undefined) ||
            (data.message as string | undefined) ||
            "Could not create shop.",
        },
        {
          status:
            createRes.status >= 400 && createRes.status < 600
              ? createRes.status
              : 502,
        }
      );
    }

    return NextResponse.json(parsed.kind === "json" ? parsed.data : data);
  } catch (err) {
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }
    console.error("Shop create API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create shop.",
      },
      { status: 500 }
    );
  }
}
