import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";
import dotenv from "dotenv"
dotenv.config();

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  phone: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "";

// Authenticate user and return user data
const authenticateUser = async (id: number): Promise<User | null> => {
  try {
    const result = await (await db()).query(
      `SELECT id, fname, lname, password, email, phone FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
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