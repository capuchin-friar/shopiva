/**
 * WhatsApp number validation API route.
 * Calls WA Validator (or skips if no API key) to check if number is registered on WhatsApp.
 * Set WA_VALIDATOR_API_KEY in env to enable. Phone must be E.164 (e.g. +2348012345678).
 */

import { NextRequest, NextResponse } from "next/server";

const WA_VALIDATOR_API = "https://wavalidator.com/api/v1/validate/";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body?.phone;
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { valid: false, error: "Missing or invalid phone number" },
        { status: 400 }
      );
    }

    // E.164 to digits only (e.g. +2348012345678 -> 2348012345678)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { valid: false, error: "Phone number too short" },
        { status: 400 }
      );
    }

    const apiKey = process.env.WA_VALIDATOR_API_KEY;
    if (!apiKey) {
      // No API key: skip external validation, caller still does format validation
      return NextResponse.json({ valid: true, skipped: true });
    }

    const res = await fetch(WA_VALIDATOR_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone_number: phoneDigits }),
    });

    const data = (await res.json()) as {
      status?: string;
      credits_remaining?: number;
    };

    if (!res.ok) {
      const message =
        res.status === 401
          ? "Invalid WhatsApp validator API key"
          : res.status === 402
            ? "WhatsApp validator credits exhausted"
            : "WhatsApp validation failed";
      return NextResponse.json(
        { valid: false, error: message },
        { status: res.status >= 400 && res.status < 500 ? res.status : 500 }
      );
    }

    const valid = data.status === "valid";
    return NextResponse.json({
      valid,
      credits_remaining: data.credits_remaining,
    });
  } catch (e) {
    console.error("WhatsApp validation error:", e);
    return NextResponse.json(
      { valid: false, error: "Validation request failed" },
      { status: 500 }
    );
  }
}
