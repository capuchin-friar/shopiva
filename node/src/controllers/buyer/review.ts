import type { Response } from "express";
import { db } from "../../config/database.js";
import type { AuthRequest } from "../../middleware/auth.js";

function normalizeNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

export async function GetBuyerPendingReviewsController(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const pool = await db();
        const { rows } = await pool.query(
            `SELECT
                oi.id AS "orderItemId",
                o.id AS "orderId",
                p.id AS "productId",
                p.name AS "productName",
                p.thumbnail_url AS "productImage",
                oi.units AS quantity,
                oi.unit_price AS "unitPrice",
                oi.total_price AS "totalPrice",
                s.id AS "shopId",
                s.name AS "shopName",
                o.updated_at AS "completedAt"
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             LEFT JOIN products p ON p.id = CAST(oi.item_id AS INTEGER)
             LEFT JOIN shops s ON s.id = CAST(o.shop_id AS INTEGER)
             LEFT JOIN product_reviews pr ON pr.order_item_id = oi.id
             WHERE o.customer_id = $1
               AND LOWER(COALESCE(o.fulfillment_status, '')) IN ('order_delivered', 'delivered', 'completed', 'order_confirmed', 'confirmed')
               AND pr.id IS NULL
             ORDER BY o.updated_at DESC, oi.id DESC`,
            [String(userId)]
        );

        res.status(200).json(rows);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

export async function PostBuyerReviewController(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const payload = req.body ?? {};
        const productId = normalizeNumber(payload.product_id ?? payload.productId);
        const orderId = normalizeNumber(payload.order_id ?? payload.orderId);
        const orderItemId = normalizeNumber(payload.order_item_id ?? payload.orderItemId);
        const rating = normalizeNumber(payload.rating);
        const reviewTag = typeof payload.review_tag === "string" ? payload.review_tag : typeof payload.reviewTag === "string" ? payload.reviewTag : "good";
        const comment = typeof payload.comment === "string" ? payload.comment : "";

        if (!orderItemId || !orderId || !productId || !rating) {
            res.status(400).json({
                success: false,
                error: "order_item_id, order_id, product_id and rating are required",
            });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({
                success: false,
                error: "rating must be between 1 and 5",
            });
            return;
        }

        const pool = await db();
        const { rows: existingRows } = await pool.query(
            `SELECT id FROM product_reviews WHERE order_item_id = $1 LIMIT 1`,
            [orderItemId]
        );

        if (existingRows.length > 0) {
            res.status(409).json({
                success: false,
                error: "A review already exists for this order item",
            });
            return;
        }

        const { rows: orderRows } = await pool.query(
            `SELECT oi.id AS order_item_id, oi.item_id, o.customer_id, o.id AS order_id, p.id AS product_id
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             LEFT JOIN products p ON p.id = CAST(oi.item_id AS INTEGER)
             WHERE oi.id = $1
             LIMIT 1`,
            [orderItemId]
        );

        const orderRow = orderRows[0];
        if (!orderRow) {
            res.status(404).json({
                success: false,
                error: "Order item not found",
            });
            return;
        }

        if (String(orderRow.customer_id) !== String(userId)) {
            res.status(403).json({
                success: false,
                error: "Forbidden",
            });
            return;
        }

        const actualProductId = normalizeNumber(orderRow.product_id ?? orderRow.item_id);
        if (actualProductId && Number(actualProductId) !== Number(productId)) {
            res.status(400).json({
                success: false,
                error: "Product mismatch for order item",
            });
            return;
        }

        if (Number(orderRow.order_id) !== Number(orderId)) {
            res.status(400).json({
                success: false,
                error: "Order mismatch for order item",
            });
            return;
        }

        await pool.query(
            `INSERT INTO product_reviews (
                product_id, user_id, order_id, order_item_id, rating, review_tag, comment, image_urls, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
            )`,
            [
                actualProductId ?? productId,
                userId,
                orderId,
                orderItemId,
                rating,
                reviewTag,
                comment,
                JSON.stringify([]),
            ]
        );

        res.status(201).json({
            success: true,
            message: "Review created successfully",
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
