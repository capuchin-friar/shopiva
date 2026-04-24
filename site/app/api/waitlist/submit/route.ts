/**
 * Waitlist submit API – saves signup to Neon PostgreSQL.
 * Requires WAITLIST_DATABASE_URL in env (Neon connection string).
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.WAITLIST_DATABASE_URL;
    if (!url) throw new Error("WAITLIST_DATABASE_URL is not set");
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: true },
    });
  }
  return pool;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const whatsAppNumber = typeof body?.whatsAppNumber === "string" ? body.whatsAppNumber.trim() : "";

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "First name and last name are required" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }
    if (!whatsAppNumber) {
      return NextResponse.json(
        { success: false, error: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    const name = `${firstName} ${lastName}`.slice(0, 150);
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid name" },
        { status: 400 }
      );
    }
    if (whatsAppNumber.length > 20) {
      return NextResponse.json(
        { success: false, error: "WhatsApp number is too long" },
        { status: 400 }
      );
    }
    if (email.length > 255) {
      return NextResponse.json(
        { success: false, error: "Email is too long" },
        { status: 400 }
      );
    }

    const pool = getPool();

    const existing = await pool.query(
      `SELECT 1 FROM waitlist WHERE email = $1 OR whatsapp_number = $2 LIMIT 1`,
      [email, whatsAppNumber]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { success: false, error: "This email or number is already on the waitlist" },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO waitlist (name, whatsapp_number, email) VALUES ($1, $2, $3)`,
      [name, whatsAppNumber, email]
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save to waitlist";
    const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
    console.error("Waitlist submit error:", err);
    if (message.includes("WAITLIST_DATABASE_URL")) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 503 }
      );
    }
    if (code === "23505" || message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) {
      return NextResponse.json(
        { success: false, error: "This email or number is already on the waitlist" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Could not join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
