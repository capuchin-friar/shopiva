/**
 * Maps OAuth profiles to existing users or creates accounts (same JWT as password auth).
 */

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { model } from "../models/user.js";
import type { NewUserDocument } from "../types/user.js";

export type OAuthProvider = "google" | "facebook" | "apple";

export type OAuthProfileInput = {
    displayName?: string;
    emails?: Array<{ value?: string }>;
    name?: { givenName?: string; familyName?: string };
};

const SALT_ROUNDS = 10;

function extractEmail(profile: OAuthProfileInput): string | null {
    const raw = profile.emails?.[0]?.value?.trim().toLowerCase();
    return raw || null;
}

function extractFname(profile: OAuthProfileInput): string {
    if (profile.name?.givenName?.trim()) {
        return profile.name.givenName.trim();
    }
    const dn = profile.displayName?.trim();
    if (dn) {
        const first = dn.split(/\s+/)[0];
        return first || "User";
    }
    return "User";
}

function extractLname(profile: OAuthProfileInput): string {
    if (profile.name?.familyName?.trim()) {
        return profile.name.familyName.trim();
    }
    const dn = profile.displayName?.trim();
    if (dn) {
        const parts = dn.split(/\s+/).filter(Boolean);
        if (parts.length > 1) {
            return parts.slice(1).join(" ");
        }
    }
    return "";
}

/**
 * Returns local user id after OAuth identity is verified by the provider.
 * New rows use `provider` + random password hash; existing users keep their credentials.
 */
export async function findOrCreateOAuthUser(
    provider: OAuthProvider,
    profile: OAuthProfileInput
): Promise<number> {
    const email = extractEmail(profile);
    if (!email) {
        throw new Error(
            "Your account did not share an email. Allow email permission or sign in with email."
        );
    }

    const fname = extractFname(profile);
    const lname = extractLname(profile);

    const rows = await model.findUserByEmail(email);

    if (rows.length > 0) {
        const u = rows[0];
        const statusRaw = u.accountstatus ?? (u as { accountStatus?: string }).accountStatus;
        const status = String(statusRaw ?? "").toLowerCase();

        if (status === "deleted") {
            await model.updateProfile({ fname, lname, id: u.id });
            await model.recreateProfile({ id: u.id });
            return u.id;
        }

        return u.id;
    }

    const hashedPassword = await bcrypt.hash(randomUUID(), SALT_ROUNDS);

    const doc: NewUserDocument & { src: string; deviceId: string; deviceToken: string } = {
        role: "customer",
        fname,
        lname,
        email,
        provider,
        password: hashedPassword,
        src: "web",
        deviceId: "",
        deviceToken: "",
    };

    await model.createUserDoc(doc);

    const created = await model.findUserByEmail(email);
    if (created.length === 0) {
        throw new Error("Failed to create OAuth user");
    }

    return created[0].id;
}
