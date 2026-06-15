import { db } from "../../config/database.js";

export const returnTransformer = async (
    returnId: any,
) => {

    const pool = await db();
    let userId;
    let shopId;
    let orderRef;

    const { rows: [returnRow] } = await pool.query(
        `SELECT * FROM returns WHERE id = $1`,
        [returnId]
    );
    
    userId = returnRow.customer_id;
    shopId = returnRow.shop_id;
    orderRef = returnRow.order_id

    // console.log(shopId)

    const { rows:[user] } = await pool.query(
        `SELECT id, fname, lname, location 
         FROM users 
         WHERE id = $1`,
        [userId]
    );

    const { rows:[shop] } = await pool.query(
        `SELECT * FROM shops WHERE id = $1`,
        [shopId]
    );

    const { rows:[shopOwner] } = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [shop.owner]
    );

    let { rows: order_items } = await pool.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [orderRef]
    );

    const productIds = order_items.map(
        (item: any) => item.item_id
    );

    const { rows: products } = await pool.query(
        `SELECT * FROM products WHERE id = ANY($1)`,
        [productIds]
    );

    // console.log(products);
  
    const { rows:[dispute] } = await pool.query(
        `SELECT * FROM disputes WHERE order_id = $1`,
        [orderRef]
    );

    const formattedReturnItems = dispute.metadata.selected_items.map((return_item: any) => {
        // products.find(
        //     (p: any) => console.log(p.id, return_item.item_id)
        // )
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

    return {
        user,
        shop: {
            ...shop,
            owner: shopOwner
        },
        dispute,
        return: returnRow,
        return_items: formattedReturnItems,
        return_events
    };
};