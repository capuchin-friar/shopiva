import { db } from "../../config/database.js";

export const disputeTransformer = async (
    disputeId: string | number
) => {

    const pool = await db();

    const { rows: [dispute] } = await pool.query(
        `SELECT * FROM disputes WHERE id = $1`,
        [String(disputeId)]
    );

    if (!dispute) {
        throw new Error("Dispute not found");
    }

    const { rows: [order] } = await pool.query(
        `SELECT * FROM orders WHERE id = $1`,
        [dispute.order_id]
    );

    const { rows: [customer] } = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [dispute.customer_id]
    );

    const { rows: orderItemsRaw } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [dispute.order_id]
    );

    const order_items = await Promise.all(
        orderItemsRaw.map(async (item) => {
            const { rows: [product] } = await pool.query(
                `SELECT name FROM products WHERE id = $1`,
                [item.item_id]
            );

            return {
                ...item,
                name: product?.name
            };
        })
    );

    const { rows: [order_event] } = await pool.query(
        `SELECT * FROM order_events
         WHERE order_id = $1
         AND stage = $2`,
        [dispute.order_id, "order_delivered"]
    );

    return {
        ...dispute,
        order,
        customer,
        order_event,
        order_items
    };
};