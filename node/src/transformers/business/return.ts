import { db } from "../../config/database.js";

export const returnTransformer = async (
    returnId: any,
) => {

    const pool = await db();
    let customerId;
    let shopId;
    let orderRef;

    const { rows: [returnRow] } = await pool.query(
        `SELECT * FROM returns WHERE id = $1`,
        [returnId]
    );
    
    customerId = returnRow.customer_id;
    shopId = returnRow.shop_id;
    orderRef = returnRow.order_id

    const { rows:[customer] } = await pool.query(
        `SELECT id, fname, lname, location 
         FROM users 
         WHERE id = $1`,
        [customerId]
    );


    const { rows:[shop] } = await pool.query(
        `SELECT * FROM shops WHERE id = $1`,
        [shopId]
    );

    const { rows:[shopOwner] } = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [shop.owner]
    );

    let { rows: return_items } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [orderRef]
    );

    const productIds = return_items.map(
        (item: any) => item.item_id
    );

    const { rows: products } = await pool.query(
        `SELECT * FROM products WHERE id = ANY($1)`,
        [productIds]
    );

     const { rows:[dispute] } = await pool.query(
        `SELECT * FROM disputes WHERE order_id = $1`,
        [orderRef]
    );

    const formattedReturnItems = dispute.metadata.selected_items.map((return_item: any) => {
        return ({
            ...return_item,
            units: return_item.qty,
            product: products.find(
                (p: any) => parseInt(p.id) === parseInt(return_item.item_id)
            )
        })
    });

    const { rows: return_events } = await pool.query(
        `SELECT * FROM return_events WHERE return_id = $1`,
        [returnId]
    );

    const { rows:[payment_info] } = await pool.query(
        `SELECT * FROM paystack_transactions WHERE reference = $1`,
        [orderRef]
    );

    const { rows: [room] } = await pool.query(
        `SELECT * 
         FROM chat_rooms
         WHERE order_id = $1`,
        [return_items[0].order_id]
    );
    console.log(return_items[0])
    console.log(room)
    return {
        customer,
        shop: {
            ...shop,
            owner: shopOwner
        },
        dispute,
        room,
        return: returnRow,
        return_items: formattedReturnItems,
        return_events,
        payment_info
    };
};
