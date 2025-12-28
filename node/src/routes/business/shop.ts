import express from "express";
import { authenticate } from "../../middleware/auth.js";
import {
    CreateShopController,
    UpdateShopController,
    DeleteShopController,
    CreateShopPolicyController,
    UpdateShopPolicyController,
    CreateShopPaymentController,
    UpdateShopPaymentController,
    GetShopController,
    GetShopReviewsController,
    GetShopMetricsController,
} from "../../controllers/business/shop.js";


// Business Router
const BusinessRouter = express.Router();

/**
 * Shop routes
 * This routes handles all shop activities for a business or vendor
 */

// Shop CRUD
BusinessRouter.post("/shop/create/:id", authenticate, CreateShopController);
BusinessRouter.post("/shop/update/:shopId/:id", authenticate, UpdateShopController);
BusinessRouter.post("/shop/delete/:shopId/:id", authenticate, DeleteShopController);

// Shop Policies
BusinessRouter.post("/shop/policy/create/:shopId/:id", authenticate, CreateShopPolicyController);
BusinessRouter.post("/shop/policy/update/:policyId/:id", authenticate, UpdateShopPolicyController);

// Shop Payout Account
BusinessRouter.post("/shop/payment/:shopId/:id", authenticate, CreateShopPaymentController);
BusinessRouter.put("/shop/payment/:shopId/:id", authenticate, UpdateShopPaymentController);

// Shop Data Retrieval
BusinessRouter.get("/shop/:shopId/:id", authenticate, GetShopController);
BusinessRouter.get("/shop/reviews/:shopId/:id", authenticate, GetShopReviewsController);
BusinessRouter.get("/shop/metrics/:shopId/:id", authenticate, GetShopMetricsController);

export default BusinessRouter;
