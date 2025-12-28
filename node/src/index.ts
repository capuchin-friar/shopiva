import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { UserRouter } from "./routes/user.js";
import bodyParser from "body-parser";
import BusinessRouter from "./routes/business/shop.js";
import { swaggerSpec } from "./config/swagger.js";

const { json, urlencoded } = bodyParser;

dotenv.config();
const app = express();

// Middleware (must come BEFORE routes)
app.use(json());
app.use(express.urlencoded({ extended: true }));

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
app.use(UserRouter);
app.use(BusinessRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening to port ${process.env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${process.env.PORT}/api-docs`);
});