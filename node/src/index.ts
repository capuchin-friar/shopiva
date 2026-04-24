import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { UserRouter } from "./routes/user.js";
import bodyParser from "body-parser";
import BusinessRouter from "./routes/business/shop.js";
import BuyerRouter from "./routes/buyer.js";
import StorefrontRouter from "./routes/storefront.js";
import { swaggerSpec } from "./config/swagger.js";
import { PaystackWebhookController } from "./controllers/webhooks/paystack.js";
import passport from "passport";
import { configurePassport } from "./config/passport.js";
import { OAuthRouter } from "./routes/oauth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from node project root so it matches Next (same secret regardless of cwd)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

configurePassport();

const { json, urlencoded } = bodyParser;
const app = express();

// Paystack webhooks require the raw body for HMAC verification (must be before express.json())
app.post("/webhooks/paystack", express.raw({ type: "application/json" }), PaystackWebhookController);

// Middleware (must come BEFORE routes)
// Allow frontend origin from env (e.g. CORS_ORIGIN=https://192.168.1.5:3000 or http://localhost:3000)
// const corsOrigins = process.env.CORS_ORIGIN
//   ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
//   : ["http://localhost:3000", "http://127.0.0.1:3000", "http://10.170.100.239:3456"];

// {
//     "type": "skirt", 
//     "gender": "female", 
//     "variants": [{"id": "variant-0", "stock": 10, "details": [{"label": "Color", "value": "Black"}, {"label": "Size", "value": "M"}]}], 
//     "delivery_methods": {"pickup": true, "delivery": true}
// }

// Mobile / RN has no browser Origin; reflect request origin when present. Set CORS_ORIGIN for a strict allowlist.
const corsAllowlist = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : null;
app.use(
    cors({
        origin: corsAllowlist && corsAllowlist.length > 0 ? corsAllowlist : true,
        credentials: true,
    })
);
app.use(morgan("dev"));
/** Disputes may include several image data URLs (up to ~5MB each client-side). */
app.use(json({ limit: "22mb" }));
app.use(express.urlencoded({ extended: true, limit: "22mb" }));
app.use(passport.initialize());

/** Quick check that the RN app can reach this host (same base URL as API + OAuth). */
app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "shopiva-api" });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Shopiva API Documentation"
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// Routes
app.use("/api/oauth", OAuthRouter);
app.use(UserRouter);
app.use(BusinessRouter);
app.use(BuyerRouter);
app.use(StorefrontRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening to port ${process.env.PORT}`);
    console.log(`Swagger docs at http://localhost:${process.env.PORT}/api-docs`);
    const secretLen = (process.env.JWT_SECRET ?? "").trim().replace(/^"|"$/g, "").length;
    console.log(`JWT_SECRET loaded: ${secretLen > 0 ? "yes" : "NO - fix .env"}`);
});


