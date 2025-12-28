import express from "express";
import dotenv from "dotenv";
import { UserRouter } from "./routes/user.js";
import bodyParser from "body-parser";
import BusinessRouter from "./routes/business/shop.js";
const { json, urlencoded } = bodyParser;

dotenv.config();
const app = express();

// Middleware (must come BEFORE routes)
app.use(json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(UserRouter);
app.use(BusinessRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening to port ${process.env.PORT}`)
});