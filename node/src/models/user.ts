/**
 * USER MODEL
 * 
 * Handles all database operations related to users:
 * - User creation and authentication
 * - Profile information updates (email, phone, password, photo)
 * - User data retrieval and validation
 * 
 * @see types/user.ts for type definitions
 * @see middleware/auth.ts for authentication middleware
 */

import type { Url } from "url";
import { db } from "../config/database.js";
import type { AuthData, NewUserDocument, User } from "../types/user.js";
import { withErrorHandling } from "../utils/errHandler.js";

export class model{
    static createUserDoc = withErrorHandling(async (
    payload: NewUserDocument & { src: string; deviceId: string; deviceToken: string }
    ) => {
        const { role, fname, lname, email, phone, gender, password, src, deviceId, deviceToken } = payload;
       
        const columns = src === "web"
            ? ["role","fname","lname","email","phone","gender","password","createdAt"]
            : ["role","fname","lname","email","phone","gender","password","createdAt","deviceId","deviceToken"];

        const values = src === "web"
            ? [role,fname,lname,email,phone,gender,password,new Date()]
            : [role,fname,lname,email,phone,gender,password,new Date(),JSON.stringify([deviceId]),JSON.stringify([deviceToken])];

        const placeholders = values.map((_, i) => `$${i+1}`).join(",");

        const sql = `INSERT INTO users (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;

        const { rows } = await (await db()).query(sql, values);

        return rows[0]; // return the created user
    });



    static findUserByEmail = withErrorHandling(async (email: string): Promise <User[]> =>{

        const {
            rows
        } = await  (await db()).query(
            `
                SELECT * FROM users WHERE email = $1
            `,
            [email]
        )

        return rows;
    })

    static countEmail = withErrorHandling(async (email: string) => {
        const {
            rows
        } = await (await db()).query(
            `
                SELECT COUNT(*) as count
                FROM users
                WHERE email = '${email}'
            `
        )
        return rows[0].count;
    })

    static countPhone = withErrorHandling(async (phone: number) => {
        const {
            rows
        } = await (await db()).query(
            `
                SELECT COUNT(*) as count
                FROM users
                WHERE phone = '${phone}'
            `
        )
        return rows[0].count;
    })

    static findUserById = withErrorHandling(async (id: number)  => {
        const {
            rows
        } = await  (await db()).query(
            `
                SELECT * FROM users WHERE id = $1
            `,
            [id]
        )

        return rows;
    })

    static updateUserPhoneById = withErrorHandling(async (id: number, phone: number) => {
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set phone = $1 WHERE id = $2 RETURNING *
            `,
                [phone, id]

        )

        return rows;
    })

    static updateUserRoleById = withErrorHandling(async (id: number, role: string) => {
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set role = $1 WHERE id = $2 RETURNING *
            `,
                [role, id]

        )

        return rows;
    })

    static updateUserEmailById = withErrorHandling(async (id: number, email: string) => {
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set email = $1 WHERE id = $2 RETURNING *
            `,
                [email, id]

        )

        return rows;
    })

    static updateProfile = withErrorHandling(async (payload: Partial<NewUserDocument> & {id: number}) => {
        const {
            fname,lname,gender, id
        } = payload;

        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set fname=$1, lname=$2, gender=$3 WHERE id = $4 RETURNING *
            `,
            [fname, lname, gender, id]
        )

        return rows;
    })

    static deleteProfile = withErrorHandling(async (payload: Partial<NewUserDocument> & {id: number}) => {
        const {
            email, id
        } = payload;

        const { rows } = await (await db()).query(
            `
                UPDATE users
                SET 
                accountStatus = $1,
                status = jsonb_set(
                    jsonb_set(
                        status,
                        '{deleted,enabled}',
                        'true'::jsonb,
                        true
                    ),
                    '{deleted,history}',
                    COALESCE(status->'deleted'->'history', '[]'::jsonb) || to_jsonb(NOW()),
                    true
                )
                WHERE id = $2
                RETURNING *
            `,
            ["deleted", id]
        );


        return rows;
    })

    static recreateProfile = withErrorHandling(
    async (payload: { id: number }) => {
        const { id } = payload;

        const { rows } = await (await db()).query(
            `
                UPDATE users
                SET
                accountStatus = 'active',
                status = jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            status,
                            '{recreated,enabled}',
                            'true'::jsonb,
                            true
                        ),
                        '{recreated,history}',
                        COALESCE(status->'recreated'->'history', '[]'::jsonb) || to_jsonb(NOW()),
                        true
                    ),
                    '{deleted,enabled}',
                    'false'::jsonb,
                    true
                )
                WHERE id = $1
                RETURNING *
            `,
            [id]
        );

        return rows[0];
    }
    );

    static undeleteProfile = withErrorHandling(
        async (payload: { id: number }) => {
            const { id } = payload;

            const { rows } = await (await db()).query(
                `
                    UPDATE users
                    SET
                    accountStatus = 'active',
                    status = jsonb_set(
                        jsonb_set(
                            status,
                            '{deleted,enabled}',
                            'false'::jsonb,
                            true
                        ),
                        '{deleted,history}',
                        COALESCE(status->'deleted'->'history', '[]'::jsonb) || to_jsonb(NOW()),
                        true
                    )
                    WHERE id = $1
                    RETURNING *
                `,
                [id]
            );

            return rows[0];
        }
    );


    static updatePassword = withErrorHandling(async (payload: {id: number, password: string}) => {
         const {
            password, id
        } = payload;
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set password=$1 WHERE id = $2 RETURNING *
            `,
            [password, id]
        )

        return rows;
    })

    static updatePhoto = withErrorHandling(async (paylaod: {photo: Url, id: number}) => {
        const {
            photo,
            id
        } = paylaod;
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users set photo = $1 WHERE id = $2 RETURNING *
            `,
            [photo, id]
        )
        return rows;
    })

    static updateFcm = withErrorHandling(async (paylaod: {fcm: string, id: number}) => {
        const {
            fcm, id
        } = paylaod;
        const {
            rows
        } = await (await db()).query(
            `
                UPDATE users SET fcm = $1 WHERE id = $2 RETURNING *
            `,
            [fcm, id]
        )

        return rows;
    })

    static recordFailedLoginAttempt = withErrorHandling(async (id: number) => {
        const { rows } = await (await db()).query(
            `
                UPDATE users 
                SET loginAttempts = jsonb_set(
                    loginAttempts,
                    '{count}',
                    (COALESCE(loginAttempts->>'count', '0')::int + 1)::text::jsonb
                ),
                loginAttempts = jsonb_set(
                    loginAttempts,
                    '{lastAttempt}',
                    to_jsonb(NOW())
                ),
                updatedAt = NOW()
                WHERE id = $1 
                RETURNING *
            `,
            [id]
        )
        return rows;
    })

    static resetLoginAttempts = withErrorHandling(async (id: number) => {
        const { rows } = await (await db()).query(
            `
                UPDATE users 
                SET loginAttempts = jsonb_set(
                    loginAttempts,
                    '{count}',
                    '0'::jsonb
                ),
                updatedAt = NOW()
                WHERE id = $1 
                RETURNING *
            `,
            [id]
        )
        return rows;
    })

    static updateLastLogin = withErrorHandling(async (id: number) => {
        const { rows } = await (await db()).query(
            `
                UPDATE users 
                SET lastLogin = NOW(), 
                    lastseen = NOW(),
                    updatedAt = NOW()
                WHERE id = $1 
                RETURNING *
            `,
            [id]
        )
        return rows;
    })
}



