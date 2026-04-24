import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";

/** Passport attaches `Express.User` to `req.user`. Declared here so ts-node sees it whenever this module loads. */
declare global {
  namespace Express {
    interface User {
      id: number;
      /** Present after JWT verification or DB load; OAuth session may serialize `{ id }` only. */
      email?: string;
      fname?: string;
      lname?: string;
      phone?: string | null;
      gender?: string | null;
      role?: string | null;
      location?: Record<string, unknown> | null;
      preferredLanguage?: string;
      timezone?: string;
      isEmailVerified?: boolean;
      isPhoneVerified?: boolean;
      lastLogin?: string | null;
    }
  }
}

/** Same as Express `Request`; middleware populates `req.user`. */
interface AuthRequest extends Request {}

/** Row shape returned from `authenticateUser` (not `Express.User` — avoid reusing the name `User` in this file). */
interface AuthenticatedUserProfile {
  id: number;
  fname: string;
  lname: string;
  email: string;
  phone: string | null;
  gender: string | null;
  role: string | null;
  location: Record<string, unknown> | null;
  preferredLanguage: string;
  timezone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin: string | null;
}

/** Normalize secret so it matches Next.js / other loaders (trim, strip optional quotes). */
export function getJwtSecret(): string {
  const raw = process.env.JWT_SECRET ?? "";
  const trimmed = raw.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

// Authenticate user and return user data
const authenticateUser = async (id: number): Promise<AuthenticatedUserProfile | null> => {
  try {
    const result = await (await db()).query(
      `SELECT id, fname, lname, email, phone, gender, role, location,
              preferredlanguage, timezone, isemailverified, isphoneverified, lastlogin
       FROM users WHERE id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    let locationParsed: Record<string, unknown> | null = null;
    const lr = row.location as unknown;
    if (lr != null) {
      if (typeof lr === "object" && !Array.isArray(lr)) {
        locationParsed = lr as Record<string, unknown>;
      } else if (typeof lr === "string") {
        try {
          const parsed = JSON.parse(lr) as unknown;
          if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
            locationParsed = parsed as Record<string, unknown>;
          }
        } catch {
          locationParsed = null;
        }
      }
    }
    return {
      id: row.id,
      fname: row.fname,
      lname: row.lname,
      email: row.email,
      phone: row.phone ?? null,
      gender: row.gender ?? null,
      role: row.role != null ? String(row.role) : null,
      location: locationParsed,
      preferredLanguage: row.preferredlanguage ?? "en",
      timezone: row.timezone ?? "UTC",
      isEmailVerified: Boolean(row.isemailverified),
      isPhoneVerified: Boolean(row.isphoneverified),
      lastLogin: row.lastlogin != null ? String(row.lastlogin) : null,
    };
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
};

// Middleware to verify JWT token
const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const secret = getJwtSecret();
  if (!secret) {
    res.status(500).json({ message: "Server auth misconfiguration" });
    return;
  }
  try {
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invalid or expired token";
    if (process.env.NODE_ENV !== "production") {
      console.warn("JWT verify failed:", reason);
    }
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to authenticate and attach user to request
const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    verifyToken(req, res, async () => {
      console.log(req.params)

      if (req.params) {
        const user = await authenticateUser(req.params.id as unknown as number);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        req.user = user;
        next();
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication error" });
  }
};

export { authenticate, verifyToken, authenticateUser };
export type { AuthRequest };