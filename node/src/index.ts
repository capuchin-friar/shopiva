import express from "express";
import dotenv from "dotenv";
import { UserRouter } from "./routes/user.js";
import bodyParser from "body-parser";
const { json, urlencoded } = bodyParser;

dotenv.config();
const app = express();

// Middleware (must come BEFORE routes)
app.use(json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(UserRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening to port ${process.env.PORT}`)
});