import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { GetBuyerOrdersController, GetBuyerOrderByIdController } from "../controllers/buyer/orders.js";
import { GetBuyerReturnsController, GetBuyerReturnByIdController } from "../controllers/buyer/returns.js";
import {
  BackfillBuyerDisputesFromOrdersController,
  GetBuyerDisputesController,
  GetBuyerDisputeByIdController,
  CreateBuyerDisputeController,
} from "../controllers/buyer/disputes.js";
import {
  DeleteBuyerCartLineController,
  GetBuyerCartController,
  GetBuyerCartProductShopId,
  PatchBuyerCartLineController,
  PostBuyerCartController,
} from "../controllers/buyer/cart.js";
import { PostBuyerCheckoutConfirmPaymentController } from "../controllers/buyer/checkout.js";
import { GetBuyerPendingReviewsController, PostBuyerReviewController } from "../controllers/buyer/review.js";
import {
  disputeEvidenceUploadMiddleware,
  UploadDisputeEvidenceController,
} from "../controllers/buyer/disputeEvidenceUpload.js";

const BuyerRouter = express.Router();
// /buyer/cart/${productId}/shopId
BuyerRouter.get("/buyer/cart", verifyToken, GetBuyerCartController);
BuyerRouter.get("/buyer/cart/:productId", verifyToken, GetBuyerCartProductShopId);
BuyerRouter.post("/buyer/cart", verifyToken, PostBuyerCartController);
BuyerRouter.patch("/buyer/cart/:cartItemId", verifyToken, PatchBuyerCartLineController);
BuyerRouter.delete("/buyer/cart/:cartItemId", verifyToken, DeleteBuyerCartLineController);

BuyerRouter.post("/buyer/checkout/confirm-payment", verifyToken, PostBuyerCheckoutConfirmPaymentController);

BuyerRouter.get("/buyer/orders", verifyToken, GetBuyerOrdersController);
BuyerRouter.get("/buyer/orders/:orderId", verifyToken, GetBuyerOrderByIdController);
BuyerRouter.get("/buyer/returns", verifyToken, GetBuyerReturnsController);
BuyerRouter.get("/buyer/returns/:returnId", verifyToken, GetBuyerReturnByIdController);
BuyerRouter.get("/buyer/disputes", verifyToken, GetBuyerDisputesController);
BuyerRouter.get("/buyer/disputes/:disputeId", verifyToken, GetBuyerDisputeByIdController);
BuyerRouter.post("/buyer/disputes", verifyToken, CreateBuyerDisputeController);
BuyerRouter.post("/buyer/disputes/from-orders", verifyToken, BackfillBuyerDisputesFromOrdersController);
BuyerRouter.post(
  "/buyer/disputes/evidence-upload",
  verifyToken,
  disputeEvidenceUploadMiddleware,
  UploadDisputeEvidenceController
);
BuyerRouter.get("/buyer/pending-reviews", verifyToken, GetBuyerPendingReviewsController);
BuyerRouter.post("/buyer/review", verifyToken, PostBuyerReviewController);

export default BuyerRouter;
