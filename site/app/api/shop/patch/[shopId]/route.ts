import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/jwt";
import {
  readUpstreamJson,
  upstreamData,
  upstreamJsonError,
} from "../../../lib/upstreamJson";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

function parseJsonField(v: unknown): unknown {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return null;
}

function rowProp(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return row[k];
  }
  return undefined;
}

function mergeLocation(existing: unknown, patchLoc: unknown): unknown {
  const base =
    (parseJsonField(existing) as Record<string, unknown> | null) || {};
  if (patchLoc == null || typeof patchLoc !== "object") {
    return Object.keys(base).length ? base : existing;
  }
  return { ...base, ...(patchLoc as Record<string, unknown>) };
}

function coerceTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Merge PATCH body with current shop row for Node POST /shop/update/:shopId/:ownerId */
function buildUpdatePayload(
  row: Record<string, unknown>,
  patch: Record<string, unknown>
): Record<string, unknown> {
  const pick = (patchKey: string, ...rowKeys: string[]) =>
    patch[patchKey] !== undefined
      ? patch[patchKey]
      : rowProp(row, ...rowKeys);

  const location =
    patch.location !== undefined
      ? mergeLocation(rowProp(row, "location", "Location"), patch.location)
      : parseJsonField(rowProp(row, "location", "Location"));

  const verificationDocuments =
    patch.verificationDocuments !== undefined
      ? patch.verificationDocuments
      : parseJsonField(
          rowProp(row, "verificationDocuments", "verificationdocuments")
        );

  const socialLinks =
    patch.socialLinks !== undefined
      ? patch.socialLinks
      : parseJsonField(rowProp(row, "socialLinks", "sociallinks"));

  return {
    name: pick("name", "name", "Name"),
    slug: pick("slug", "slug", "Slug"),
    description: pick("description", "description", "Description"),
    logo: pick("logo", "logo", "Logo"),
    banner: pick("banner", "banner", "Banner"),
    category: pick("category", "category", "Category"),
    tags:
      patch.tags !== undefined
        ? patch.tags
        : coerceTags(rowProp(row, "tags", "Tags")),
    contactEmail: pick("contactEmail", "contactemail", "contactEmail"),
    contactPhone: pick("contactPhone", "contactphone", "contactPhone"),
    vendorType: pick("vendorType", "vendorType", "vendortype"),
    location,
    socialLinks,
    isActive: pick("isActive", "isactive", "isActive"),
    isVerified: pick("isVerified", "isverified", "isVerified"),
    status: pick("status", "status", "Status"),
    verificationDocuments,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const token = request.cookies.get("entrepreneur_secret")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "You must be signed in." },
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
    const decoded = jwt.verify(token, secret) as { id?: number };
    const ownerId = decoded?.id;
    if (ownerId == null) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const shopId = params.shopId;
    if (!shopId || Number.isNaN(Number(shopId))) {
      return NextResponse.json({ error: "Invalid shop ID." }, { status: 400 });
    }

    let patch: Record<string, unknown>;
    try {
      patch = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const shopRes = await fetch(
      `${BACKEND_URL}/shop/${shopId}/${ownerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const shopParsed = await readUpstreamJson(shopRes);
    const shopParseErr = upstreamJsonError(shopParsed);
    if (shopParseErr) {
      return NextResponse.json({ error: shopParseErr }, { status: 502 });
    }
    const shopBody = upstreamData(shopParsed);
    if (!shopRes.ok) {
      return NextResponse.json(
        {
          error:
            (shopBody.error as string | undefined) ||
            (shopBody.message as string | undefined) ||
            "Could not load shop",
        },
        { status: shopRes.status === 404 ? 404 : 502 }
      );
    }

    const rawShop = shopBody.shop;
    if (rawShop == null || typeof rawShop !== "object") {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }

    const payload = buildUpdatePayload(
      rawShop as Record<string, unknown>,
      patch
    );

    const updateRes = await fetch(
      `${BACKEND_URL}/shop/update/${shopId}/${ownerId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const parsed = await readUpstreamJson(updateRes);
    const parseErr = upstreamJsonError(parsed);
    if (parseErr) {
      return NextResponse.json({ error: parseErr }, { status: 502 });
    }
    const data = upstreamData(parsed);
    if (!updateRes.ok) {
      return NextResponse.json(
        {
          error:
            (data.error as string | undefined) ||
            (data.message as string | undefined) ||
            "Update failed",
        },
        {
          status:
            updateRes.status >= 400 && updateRes.status < 600
              ? updateRes.status
              : 502,
        }
      );
    }
    return NextResponse.json(parsed.kind === "json" ? parsed.data : {});
  } catch (err) {
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }
    console.error("Shop patch API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 }
    );
  }
}
