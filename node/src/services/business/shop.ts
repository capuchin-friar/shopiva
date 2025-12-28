/**
 * SHOP SERVICE
 * 
 * Handles all business logic related to shop operations:
 * - Shop creation, update, and deletion
 * - Shop policy management
 * - Shop payout account management
 * - Shop data retrieval
 * 
 * @see models/business/shop.ts for database operations
 * @see types/business.ts for type definitions
 */

import { shop } from "../../models/business/shop.js";
import type { NewPayoutAccount, NewShopDocument, ShopDocument, ShopPolicies, TransferRecipientResponse } from "../../types/business.js";
import { paystack } from "../paystack.js";

/**
 * Create a new shop
 */
export async function CreateShopService(payload: NewShopDocument) {
    const result = await shop.createShop(payload);
    
    if (result === 0) {
        throw new Error("Failed to create shop");
    }

    return result;
}

/**
 * Update an existing shop
 */
export async function UpdateShopService(payload: ShopDocument) {
    const result = await shop.updateShop(payload);
    
    if (result === 0) {
        throw new Error("Shop not found or failed to update");
    }

    return result;
}

/**
 * Delete a shop
 */
export async function DeleteShopService(shopId: number) {
    const result = await shop.deleteShop(shopId);
    
    if (result === 0) {
        throw new Error("Shop not found or failed to delete");
    }

    return result;
}

/**
 * Create shop policies
 */
export async function CreateShopPolicyService(payload: ShopPolicies) {
    const result = await shop.createPolicy(payload);
    
    if (result === 0) {
        throw new Error("Failed to create shop policy");
    }

    return result;
}

/**
 * Update shop policies
 */
export async function UpdateShopPolicyService(payload: ShopPolicies) {
    // Note: You may need to add an updatePolicy method in the shop model
    // For now, this is a placeholder that follows the pattern
    const result = await shop.updatePolicy(payload);
    
    if (result === 0) {
        throw new Error("Failed to update shop policy");
    }

    return result;
}

/**
 * Get shop by ID
 */
export async function GetShopService(shopId: number) {
    const result = await shop.getShopById(shopId);
    
    if (!result || result.length === 0) {
        throw new Error("Shop not found");
    }

    return result[0];
}

/**
 * Get shop reviews by shop ID
 */
export async function GetShopReviewsService(shopId: number) {
    const result = await shop.getShopReviewsById(shopId);
    
    return result || [];
}

/**
 * Get shop metrics by shop ID
 */
export async function GetShopMetricsService(shopId: number) {
    const result = await shop.getShopMetricsById(shopId);
    
    return result?.[0] || {};
}

/**
 * Create shop payout account
 */
export async function CreatePayoutAccountService(payload: Partial<NewPayoutAccount>) {

    const recipient_bank_data = {
        name: payload.account_name as unknown as string,
        account_number: payload.account_number as unknown as number,
        bank_code: payload.bank_code as unknown as string
    };

    const {
        data, status, message
    } = await paystack.createRecipient(recipient_bank_data) as unknown as TransferRecipientResponse;

    if(!status) {
        throw new Error(`Failed to create payout account while generating recipient code: ${message}`, );
    }
    const updatedPayoutAccountData = {
        ...payload, 
        provider_recipient_id: data.recipient_code,
        provider_account_id: data.id,
        account_number: typeof payload.account_number === 'string'
            ? Number(payload.account_number.slice(-4))
            : undefined,
        status: 'verified',
        verification_method: 'paystack'
    };

    const result = await shop.createPayoutAccount(updatedPayoutAccountData);
    
    if (result === 0) {
        throw new Error("Failed to create payout account");
    }

    return result;
}

/**
 * Update shop payout account
 */
export async function UpdatePayoutAccountService(payload: Partial<NewPayoutAccount>) {

    const recipient_bank_data = {
        name: payload.account_name as unknown as string,
        account_number: payload.account_number as unknown as number,
        bank_code: payload.bank_code as unknown as string
    };

    const {
        data, status, message
    } = await paystack.createRecipient(recipient_bank_data) as unknown as TransferRecipientResponse;

    if(!status) {
        throw new Error(`Failed to create payout account while generating recipient code: ${message}`, );
    }
    const updatedPayoutAccountData = {
        ...payload, 
        provider_recipient_id: data.recipient_code,
        provider_account_id: data.id,
        account_number: typeof payload.account_number === 'string'
            ? Number(payload.account_number.slice(-4))
            : undefined,
        status: 'verified',
        verification_method: 'paystack'
    };

    const result = await shop.updatePayoutAccount(updatedPayoutAccountData);
    
    if (result === 0) {
        throw new Error("Payout account not found or failed to update");
    } 

    return result;
}
