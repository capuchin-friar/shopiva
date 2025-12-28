/**
 * SHOP MODEL
 * 
 * Handles all database operations related to shop:
 * - Shop creation and authentication
 * - Shop information updates (name, title, description, location)
 * - Shop data retrieval and validation
 * 
 * @see types/user.ts for type definitions
 * @see middleware/auth.ts for authentication middleware
 */

import { db } from "../../config/database.js"
import type { NewPayoutAccount, NewShopDocument, ShopDocument, ShopPolicies } from "../../types/business.js";
import { withErrorHandling } from "../../utils/errHandler.js"

export class shop{

    static createShop = withErrorHandling( async (payload: NewShopDocument) => {
        const {
            ownerId, name, description, logo, category, slug, vendortype
        } = payload;
        const {
            rowCount
        } = await (await db()).query(
            `
                INSERT INTO shops(ownerId, name, slug, description, logo, category, vendortype, createdAt, updatedAt)
                VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            `,
            [ownerId, name, slug, description, logo, category, vendortype]
        );

        return rowCount;
    });

    static deleteShop = withErrorHandling( async (shopId: number) => {
        const id = shopId;
        const {
            rowCount
        } = await (await db()).query(
            `
               DELETE FROM shops WHERE id = ${id}
            `,
        );

        return rowCount;
    });

    static updateShop = withErrorHandling( async (payload: ShopDocument) => {
        const {
            ownerId,
            shopId,
            name,
            slug,
            description,
            logo,
            banner,
            category,
            tags,
            contactEmail,
            contactPhone,
          
            // Vendor Type
            vendorType,
          
            // Location & Social
            location,
            socialLinks,
          
            // Status & Verification
            isActive,
            isVerified,
            status,
            verificationDocuments,
          
        } = payload;

        const {
            rows
        } = await (await db()).query(
            `
               UPDATE shops SET 
                name = $1,
                slug = $2,
                description = $3,
                logo = $4,
                banner = $5,
                category = $6,
                tags = $7,
                contactEmail = $8,
                contactPhone = $9,
                vendorType = $10,
                location = $11,
                socialLinks = $12,
                isActive = $13,
                isVerified = $14,
                status = $15,
                verificationDocuments = $16,
                updatedAt = NOW()
               WHERE id = $17
               RETURNING *
            `,
            [
                name,
                slug,
                description,
                logo,
                banner,
                category,
                tags,
                contactEmail,
                contactPhone,
                vendorType,
                JSON.stringify(location),
                JSON.stringify(socialLinks),
                isActive,
                isVerified,
                status,
                JSON.stringify(verificationDocuments),
                shopId
            ]
        );

        return rows;
    });

    static  createPolicy = withErrorHandling( async (payload: ShopPolicies) => {
        const {
            shopId, deliveryPolicy, refundPolicy, customPolicies
        } = payload;
        console.log(shopId)
        const { rowCount } = await (await db()).query(
            `
            INSERT INTO shop_policies (
              shopid,
              deliverypolicy,
              refundpolicy,
              custompolicies,
              createdAt,
              updatedAt
            )
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            `,
            [
              shopId,
              JSON.stringify(deliveryPolicy),
              JSON.stringify(refundPolicy),
              JSON.stringify(customPolicies)
            ]
        );
          

        return rowCount;
    })

    static  updatePolicy = withErrorHandling( async (payload: ShopPolicies) => {
        const {
            policyId, deliveryPolicy, refundPolicy, customPolicies
        } = payload;

        const { rows } = await (await db()).query(
            `
              UPDATE shop_policies
              SET
                deliveryPolicy = $1,
                refundPolicy   = $2,
                customPolicies = $3,
                updatedAt      = NOW()
              WHERE id = $4
              RETURNING *
            `,
            [
              JSON.stringify(deliveryPolicy),
              JSON.stringify(refundPolicy),
              JSON.stringify(customPolicies),
              policyId
            ]
        );
          

        return rows;
    })

    static getShopById = withErrorHandling(async (shopId: number) => {

        const {
            rows
        } =  await (await db()).query(
            `
                SELECT * FROM shops WHERE id = $1
            `, [shopId]
        );

        return rows;
    })

    static getShopReviewsById = withErrorHandling(async (shopId: number) => {

        const {
            rows
        } =  await (await db()).query(
            `
                SELECT * FROM shop_reviews WHERE id = $1
            `, [shopId]
        );

        return rows;
    })

    static getShopMetricsById = withErrorHandling(async (shopId: number) => {

        const {
            rows
        } =  await (await db()).query(
            `
                SELECT * FROM shop_review_metrics WHERE id = $1
            `, [shopId]
        );

        return rows;
    })

    static createPayoutAccount = withErrorHandling(async (payload: NewPayoutAccount) => {
        const {
            shopId,
            bank_name,
            bank_code,
            account_name,
            account_number,
            provider_recipient_id,
            provider_account_id,
            verification_method,
            status
        } = payload;
        const {
            rowCount
        } = await (await db()).query(
            `
                INSERT INTO shop_payout_accounts(shop_id, provider, country_code, currency, bank_name, bank_code, account_name, account_number_last4, provider_recipient_id, provider_account_id, status, verification_method, createdAt, updatedAt)

                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            `,
            [
                shopId,
                'paystack',
                'NG',
                'NGN',
                bank_name,
                bank_code,
                account_name,
                account_number,
                provider_recipient_id,
                provider_account_id,
                verification_method,
                status,
                verification_method
            ]
        );

        return rowCount;
    })

    static updatePayoutAccount = withErrorHandling(async (payload: NewPayoutAccount) => {
        
        const {
            shopId,
            bank_name,
            bank_code,
            account_name,
            account_number,
            provider_recipient_id,
            provider_account_id,
            verification_method,
            status
        } = payload;
    
        const { rows } = await (await db()).query(
            `
            UPDATE shop_payout_accounts
            SET
                bank_name = $1,
                bank_code = $2,
                account_name = $3,
                account_number_last4 = $4,
                provider_recipient_id = $5,
                provider_account_id = $6,
                status = $7,
                verification_method = $8,
                updatedAt = NOW()
            WHERE shop_id = $9
            RETURNING *
            `,
            [
                bank_name,
                bank_code,
                account_name,
                account_number,
                provider_recipient_id,
                provider_account_id,
                status,
                verification_method,
                shopId
            ]
        );
    
        return rows;
    });
        

}