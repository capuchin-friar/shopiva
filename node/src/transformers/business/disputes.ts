import { db } from "../../config/database.js";



export const disputesTransformer = async(
    shopId: String | Number,
    vendorId: String | Number
) => {

    const pool = await db();
    const sid = String(shopId);
    const vid = String(vendorId);


    const { rows: disputes } = await pool.query(
        `SELECT * FROM disputes WHERE metadata->>'shop_id' = $1 ORDER BY created_at DESC`,
        [sid]
    );

    let disputeList: any[] = [];
    await Promise.all(disputes.map(async(dispute) => {
        const {rows: [order]} = await pool.query(
            `SELECT * FROM orders WHERE id = $1`,
            [dispute.order_id]
        );
        const {rows: [customer]} = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [dispute.customer_id]
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
            customer,
            order_event,
            order_items
        });
    }));
    console.log(disputeList[0].order_items);
    return disputeList;
}
