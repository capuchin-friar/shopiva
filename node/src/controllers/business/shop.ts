/**
 * SHOP CONTROLLER
 * 
 * Handles all HTTP request/response operations for shop endpoints:
 * - Shop CRUD operations
 * - Shop policy management
 * - Shop data retrieval
 * 
 * @see services/business/shop.ts for business logic
 * @see routes/business/shop.ts for route definitions
 */

import type { Request, Response } from "express";
import {
    CreateShopService,
    UpdateShopService,
    DeleteShopService,
    CreateShopPolicyService,
    UpdateShopPolicyService,
    GetShopService,
    GetShopReviewsService,
    GetShopMetricsService,
    CreatePayoutAccountService,
    UpdatePayoutAccountService
} from "../../services/business/shop.js";

/**
 * Create a new shop
 * POST /shop/create/:id
 */
export async function CreateShopController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { name, slug, vendortype, description, logo, category } = req.body;
        const ownerId = req.params.id;

        const result = await CreateShopService({
            ownerId,
            name,
            slug,
            vendortype,
            description,
            logo,
            category,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            message: "Shop created successfully",
            result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Update an existing shop
 * POST /shop/update/:id
 */
export async function UpdateShopController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const {
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
            location,
            socialLinks,
            isActive,
            isVerified,
            status,
            verificationDocuments
        } = req.body;

        const result = await UpdateShopService({
            ownerId: req.params.id as unknown as number,
            shopId: req.params.shopId as unknown as number,
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
            location,
            socialLinks,
            isActive,
            isVerified,
            status,
            verificationDocuments,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
      
        res.status(200).json({
            message: "Shop updated successfully",
            result
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Delete a shop
 * POST /shop/delete/:id
 */
export async function DeleteShopController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await DeleteShopService(req.params.shopId as unknown as number);

        res.status(200).json({
            message: "Shop deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Create shop policy
 * POST /shop/policy/create/:id
 */
export async function CreateShopPolicyController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { deliveryPolicy, refundPolicy, customPolicies } = req.body;
        const shopId = req.params.shopId as unknown as number;

        const result = await CreateShopPolicyService({
            shopId,
            deliveryPolicy,
            refundPolicy,
            customPolicies,
        });

        res.status(201).json({
            message: "Shop policy created successfully",
            result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Update shop policy
 * POST /shop/policy/update/:id
 */
export async function UpdateShopPolicyController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { deliveryPolicy, refundPolicy, customPolicies } = req.body;
        const policyId = req.params.policyId as unknown as number;

        const result = await UpdateShopPolicyService({
            // id: policyId,
            policyId,
            deliveryPolicy,
            refundPolicy,
            customPolicies
        });

        res.status(200).json({
            message: "Shop policy updated successfully",
            result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Create shop payout account
 * POST /shop/payment/:shopId/:id
 */
export async function CreateShopPaymentController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const shopId = req.params.shopId;
        
        if (!shopId) {
            res.status(400).json({ error: "Shop ID required" });
            return;
        }

        const {
            bank_name,
            bank_code,
            account_name,
            account_number,
            verification_method,
            status
        } = req.body;

        const result = await CreatePayoutAccountService({
            shopId,
            bank_name,
            bank_code,
            account_name,
            account_number,
            
            verification_method,
            status
        });

        res.status(201).json({
            message: "Payout account created successfully",
            result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Update shop payout account
 * PUT /shop/payment/:shopId/:id
 */
export async function UpdateShopPaymentController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const shopId = req.params.shopId;
        
        if (!shopId) {
            res.status(400).json({ error: "Shop ID required" });
            return;
        }

        const {
            bank_name,
            bank_code,
            account_name,
            account_number,
            provider_recipient_id,
            provider_account_id,
            verification_method,
            status
        } = req.body;

        const result = await UpdatePayoutAccountService({
            shopId,
            bank_name,
            bank_code,
            account_name,
            account_number,
            provider_recipient_id,
            provider_account_id,
            verification_method,
            status
        });

        res.status(200).json({
            message: "Payout account updated successfully",
            result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Get shop details
 * GET /shop/:id
 */
export async function GetShopController(req: Request, res: Response) {
    try {
        if (!req.params?.shopId) {
            res.status(400).json({ error: "Shop ID required" });
            return;
        }

        const shopId = parseInt(req.params.shopId, 10);
        
        if (isNaN(shopId)) {
            res.status(400).json({ error: "Invalid Shop ID" });
            return;
        }

        const shop = await GetShopService(shopId);

        res.status(200).json({
            message: "Shop retrieved successfully",
            shop
        });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Get shop reviews
 * GET /shop/reviews/:id
 */
export async function GetShopReviewsController(req: Request, res: Response) {
    try {
        if (!req.params?.shopId) {
            res.status(400).json({ error: "Shop ID required" });
            return;
        }

        const shopId = parseInt(req.params.shopId, 10);
        
        if (isNaN(shopId)) {
            res.status(400).json({ error: "Invalid Shop ID" });
            return;
        }

        const reviews = await GetShopReviewsService(shopId);

        res.status(200).json({
            message: "Shop reviews retrieved successfully",
            reviews
        });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

/**
 * Get shop metrics
 * GET /shop/metrics/:id
 */
export async function GetShopMetricsController(req: Request, res: Response) {
    try {
        if (!req.params?.shopId) {
            res.status(400).json({ error: "Shop ID required" });
            return;
        }

        const shopId = parseInt(req.params.shopId, 10);
        
        if (isNaN(shopId)) {
            res.status(400).json({ error: "Invalid Shop ID" });
            return;
        }

        const metrics = await GetShopMetricsService(shopId);

        res.status(200).json({
            message: "Shop metrics retrieved successfully",
            metrics
        });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

