import type { Request, Response } from "express";
import { db } from "../../config/database.js";

export async function PostBuyerReviewController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const {
            shop_id, customer_id, order_id, rating, review_tag, comment
        } = req.body;

        console.log(shop_id, customer_id, order_id, rating, review_tag, comment);
        const pool = await db();
        await pool.query(
            `INSERT INTO reviews (
                id, shop_id, customer_id, order_id, rating, review_tag, comment, image_urls, created_at, updated_at
            ) VALUES (
                DEFAULT, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
            )`,
            [
                shop_id, customer_id, order_id, String(rating), review_tag, comment, JSON.stringify({})
            ]
        )
        
        res.status(200).json({
            success: true,
            message: "Review created successfully"
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({
            success: false,
            error: err instanceof Error ? err.message : String(err)
        });
    }
}
