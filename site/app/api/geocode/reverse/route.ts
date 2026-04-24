/**
 * Reverse Geocoding API Route
 *
 * Converts latitude/longitude to address using Google Geocoding API.
 * Keeps the API key server-side. Requires GOOGLE_MAPS_API_KEY in env.
 *
 * @module app/api/geocode/reverse
 */

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function getComponent(components: { long_name: string; types: string[] }[], type: string): string | null {
  const c = components.find((x) => x.types.includes(type));
  return c ? c.long_name : null;
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Geocoding not configured" },
      { status: 503 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    const lat = body?.lat != null ? Number(body.lat) : NaN;
    const lng = body?.lng != null ? Number(body.lng) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "lat and lng are required" },
        { status: 400 }
      );
    }
    const latlng = `${lat},${lng}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(latlng)}&key=${encodeURIComponent(API_KEY)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
      return NextResponse.json(
        { error: "Geocoding request failed" },
        { status: 400 }
      );
    }
    if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
      return NextResponse.json(
        { address: null, city: null, state: null, country: null, zipcode: null }
      );
    }
    const first = data.results[0];
    const components = first.address_components || [];
    const city =
      getComponent(components, "locality") ||
      getComponent(components, "sublocality") ||
      getComponent(components, "administrative_area_level_2");
    const state = getComponent(components, "administrative_area_level_1");
    const country = getComponent(components, "country");
    const zipcode = getComponent(components, "postal_code");
    return NextResponse.json({
      address: first.formatted_address || null,
      city,
      state,
      country,
      zipcode,
    });
  } catch (err) {
    console.error("Geocode reverse error:", err);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}
