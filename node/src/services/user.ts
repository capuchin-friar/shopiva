import { model } from "../models/user.js";
import type { NewUserDocument, AuthData } from "../types/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

export async function SignupService(payload: NewUserDocument & { src: string; deviceId: string; deviceToken: string }) {
    const userDoc = await model.findUserByEmail(payload.email);
    
    // Check if user exists and has deleted account
    if (userDoc.length > 0 && userDoc[0].accountstatus === "deleted") {
        const userId = userDoc[0].id;
        
        // Update profile with new data and reactivate account
        await model.updateProfile({ ...payload, id: userId });
        await model.recreateProfile({ id: userId });
        
        // Fetch updated user data
        const updatedUser = await model.findUserById(userId);
        const { password, ...userWithoutPassword } = updatedUser[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: userId, email: updatedUser[0].email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return {
            token,
            user: userWithoutPassword
        };
    }
    // Check if email already exists
    const emailExists = await model.countEmail(payload.email);
    if (emailExists > 0) {
        throw new Error("Email already registered");
    }

    // Check if phone already exists (skip when absent — OAuth / partial profiles)
    const phoneVal = payload.phone;
    if (phoneVal !== undefined && phoneVal !== null && String(phoneVal).trim() !== "") {
        const phoneExists = await model.countPhone(phoneVal as number);
        if (phoneExists > 0) {
            throw new Error("Phone number already registered");
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    // Create user
    const result = await model.createUserDoc({
        ...payload,
        password: hashedPassword
    });

    if (result === 0) {
        throw new Error("Failed to create user");
    }

    const users = await model.findUserByEmail(payload.email);
    if (users.length === 0) {
        throw new Error("Failed to load created user");
    }
    const created = users[0];
    const { password, ...userWithoutPassword } = created;

    const token = jwt.sign(
        { id: created.id, email: created.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: userWithoutPassword
    };

}

/** After OAuth verifies identity — same token + user shape as email/password sign-in. */
export async function finalizeOAuthSession(userId: number): Promise<{ token: string; user: Record<string, unknown> }> {
    await model.resetLoginAttempts(userId);
    await model.updateLastLogin(userId);
    const users = await model.findUserById(userId);
    if (users.length === 0) {
        throw new Error("User not found");
    }
    const user = users[0];
    const { password, ...userWithoutPassword } = user;
    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
    return {
        token,
        user: userWithoutPassword as Record<string, unknown>
    };
}

export async function SigninService(payload: AuthData) {
    // Find user by email
    const users = await model.findUserByEmail(payload.email);
    
    if (users.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(payload.password, user.password);
    
    if (!passwordMatch) {
        // Record failed login attempt
        await model.recordFailedLoginAttempt(user.id);
        throw new Error("Invalid email or password");
    }

    // Reset login attempts on successful login
    await model.resetLoginAttempts(user.id);

    // Update last login
    await model.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    return {
        token,
        user: userWithoutPassword
    };
}

export async function UpdateProfileService(
    id: number,
    payload: Partial<NewUserDocument> & {
        preferredLanguage?: string | null;
        timezone?: string | null;
        location?: Record<string, unknown> | null;
    }
) {
    const result = await model.updateProfile({ ...payload, id });
    
    if (result.length === 0) {
        throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
}

export async function UpdateRoleService(id: number, role: string) {
    // Check if user already exists
    const user = await model.findUserById(id);
    if (!user) {
        throw new Error("User not registered");
    }

    const result = await model.updateUserRoleById(id, role);
    
    if (result.length === 0) {
        throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
}

export async function UpdateEmailService(id: number, email: string) {
    const existing = await model.findUserById(id);
    if (!existing || existing.length === 0) {
        throw new Error("User not found");
    }
    const previousEmail =
        existing[0].email != null && String(existing[0].email).trim() !== ""
            ? String(existing[0].email).trim()
            : "";

    // Check if email already exists
    const emailExists = await model.countEmail(email);
    if (emailExists > 0) {
        throw new Error("Email already in use");
    }

    const result = await model.updateUserEmailById(id, email);

    if (result.length === 0) {
        throw new Error("User not found");
    }

    await model.syncOwnedShopsAfterUserEmailChange(id, previousEmail || null, email);

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
}

export async function UpdatePhoneService(id: number, phone: string | number) {
    const phoneNorm = typeof phone === "number" ? String(phone) : String(phone ?? "").trim();

    const existing = await model.findUserById(id);
    if (!existing || existing.length === 0) {
        throw new Error("User not found");
    }
    const previousPhone =
        existing[0].phone != null && String(existing[0].phone).trim() !== ""
            ? String(existing[0].phone).trim()
            : "";

    // Check if phone already exists
    const phoneExists = await model.countPhone(phoneNorm);
    if (phoneExists > 0) {
        throw new Error("Phone number already in use");
    }

    const result = await model.updateUserPhoneById(id, phoneNorm);

    if (result.length === 0) {
        throw new Error("User not found");
    }

    await model.syncOwnedShopsAfterUserPhoneChange(id, previousPhone || null, phoneNorm);

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
}

export async function UpdatePhotoService(id: number, photo: string) {
    const result = await model.updatePhoto({ photo, id });
    
    if (result.length === 0) {
        throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
}

export async function UpdatePasswordService(id: number, password: string) {
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await model.updatePassword({ id, password: hashedPassword });
    
    if (result.length === 0) {
        throw new Error("User not found");
    }

    return true;
}

export async function DeleteUserService(id: number) {
    // Soft delete - mark user as deleted
    const result = await model.deleteProfile({
        id,
        accountStatus: 'deleted'
    });
    
    if (result.length === 0) {
        throw new Error("User not found");
    }

    return true;
}