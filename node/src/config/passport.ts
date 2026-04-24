/**
 * Passport OAuth strategies. Enable each provider via env vars (see server `.env`).
 *
 * - Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, optional GOOGLE_CALLBACK_URL
 * - Facebook: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, optional FACEBOOK_CALLBACK_URL
 * - PUBLIC_API_URL — base URL OAuth consoles must whitelist (e.g. http://192.168.x.x:3456)
 */

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import type { OAuthProfileInput } from "../services/oauthUser.js";
import { findOrCreateOAuthUser } from "../services/oauthUser.js";

function publicApiBase(): string {
    const raw = process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? "3456"}`;
    return raw.replace(/\/$/, "");
}

export function configurePassport(): void {
    const base = publicApiBase();

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL:
                        process.env.GOOGLE_CALLBACK_URL ?? `${base}/api/oauth/google/callback`,
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const id = await findOrCreateOAuthUser(
                            "google",
                            profile as unknown as OAuthProfileInput
                        );
                        done(null, { id });
                    } catch (err) {
                        done(err as Error);
                    }
                }
            )
        );
    }

    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_APP_ID,
                    clientSecret: process.env.FACEBOOK_APP_SECRET,
                    callbackURL:
                        process.env.FACEBOOK_CALLBACK_URL ?? `${base}/api/oauth/facebook/callback`,
                    profileFields: ["id", "displayName", "photos", "email"],
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const id = await findOrCreateOAuthUser(
                            "facebook",
                            profile as unknown as OAuthProfileInput
                        );
                        done(null, { id });
                    } catch (err) {
                        done(err as Error);
                    }
                }
            )
        );
    }
}
