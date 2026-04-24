import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/jwt";
import {
  readUpstreamJson,
  upstreamData,
  upstreamJsonError,
} from "../../../../lib/upstreamJson";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

export async function POST(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const token = request.cookies.get("entrepreneur_secret")?.value;
    if (!token) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
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

    const body = await request.json();
    const res = await fetch(
      `${BACKEND_URL}/shop/patch/${params.shopId}/verify-bvn`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const parsed = await readUpstreamJson(res);
    const parseErr = upstreamJsonError(parsed);
    if (parseErr) {
      return NextResponse.json({ error: parseErr }, { status: 502 });
    }
    const data = upstreamData(parsed);
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            (data.error as string | undefined) ||
            (data.message as string | undefined) ||
            "BVN verification failed",
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      );
    }
    return NextResponse.json(parsed.kind === "json" ? parsed.data : {});
  } catch (err) {
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }
    console.error("Verify BVN API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed." },
      { status: 500 }
    );
  }
}
