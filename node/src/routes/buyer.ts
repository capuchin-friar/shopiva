import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { GetBuyerOrdersController, GetBuyerOrderByIdController } from "../controllers/buyer/orders.js";
import {
  BackfillBuyerDisputesFromOrdersController,
  GetBuyerDisputesController,
  GetBuyerDisputeByIdController,
  CreateBuyerDisputeController,
} from "../controllers/buyer/disputes.js";
import {
  DeleteBuyerCartLineController,
  GetBuyerCartController,
  PatchBuyerCartLineController,
  PostBuyerCartController,
} from "../controllers/buyer/cart.js";

const BuyerRouter = express.Router();

BuyerRouter.get("/buyer/cart", verifyToken, GetBuyerCartController);
BuyerRouter.post("/buyer/cart", verifyToken, PostBuyerCartController);
BuyerRouter.patch("/buyer/cart/:cartItemId", verifyToken, PatchBuyerCartLineController);
BuyerRouter.delete("/buyer/cart/:cartItemId", verifyToken, DeleteBuyerCartLineController);

BuyerRouter.get("/buyer/orders", verifyToken, GetBuyerOrdersController);
BuyerRouter.get("/buyer/orders/:orderId", verifyToken, GetBuyerOrderByIdController);
BuyerRouter.get("/buyer/disputes", verifyToken, GetBuyerDisputesController);
BuyerRouter.get("/buyer/disputes/:disputeId", verifyToken, GetBuyerDisputeByIdController);
BuyerRouter.post("/buyer/disputes", verifyToken, CreateBuyerDisputeController);
BuyerRouter.post("/buyer/disputes/from-orders", verifyToken, BackfillBuyerDisputesFromOrdersController);

export default BuyerRouter;
