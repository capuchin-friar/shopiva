import { db } from "../../config/database.js";
import { GetShopOwnerByShopIdService } from "../../services/business/shop.js";



export const disputesTransformer = async(
    userId: String | Number
) => {

    const pool = await db();
    const cid = String(userId);
    let vid;

    const { rows: disputes } = await pool.query(
        `SELECT * FROM disputes WHERE customer_id = $1 ORDER BY created_at DESC`,
        [cid]
    );



    let disputeList: any[] = [];
    await Promise.all(disputes.map(async(dispute) => {
       const {
            rows: [{ shop_id }]
        } = await pool.query(
            `SELECT shop_id FROM orders WHERE id = $1`,
            [dispute.order_id]
        );

        vid = await GetShopOwnerByShopIdService(Number(shop_id))

        const {rows: [order]} = await pool.query(
            `SELECT * FROM orders WHERE id = $1`,
            [dispute.order_id]
        );
        const {rows: [vendor]} = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [vid.id]
        );
        const {rows: order_items_raw} = await pool.query(
            `SELECT * FROM order_items WHERE order_id = $1`,
            [dispute.order_id]
        );
        const order_items = await Promise.all(order_items_raw.map(async(item) => {
            const {rows: [name]} = await pool.query(
                 `SELECT name FROM products WHERE id = $1`,
                 [item.item_id]
            );
            return {
                ...item, name
            }
        }))

        const {rows: [order_event]} = await pool.query(
            `SELECT * FROM order_events WHERE order_id = $1 AND stage = $2`,
            [dispute.order_id, "order_delivered"]
        );

        disputeList.push({
            ...dispute,
            order,
            vendor,
            order_event,
            order_items
        });
    }));

    return disputeList;
}
