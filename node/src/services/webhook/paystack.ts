import { db } from "../../config/database.js";
import type { NewOrder, OrderEvents, OrderItem } from "../../types/paystack.js";


export class OrderHandler{

    static async newOrder(new_order_payload: NewOrder){
        await upsertNewOrder(new_order_payload);
        // return orderResult;
    }

    static async orderEvent(order_events_payload: OrderEvents){
        await createOrderEvent(order_events_payload);
        // return eventResult;
    }

    static async orderedTtem(order_items_payload: OrderItem){
        await addOrderItem(order_items_payload);
        // return itemResult;
    }
    static async removeItemFromCart(cart_id: String | Number){
        const pool = await db();
        await pool.query(
            `
                DELETE FROM cart_items WHERE id=$1
            `, [
                cart_id
            ]
        );
    }
    // async function createOrder(payload: any){
    
    //     const {
    //         new_order_payload,
    //         order_events_payload,
    //         order_items_payload
    //     } = payload;
    
    //     try{
            
            
            
            
    //         return {
    //             order: orderResult,
    //             event: eventResult,
    //             item: itemResult
    //         };
    //     }catch(err){
    //         console.error("Error creating order:", err);
    //         throw err;
    //     }
    // }
}


async function upsertNewOrder(payload: NewOrder){
    const pool = await db();
    const {
        order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference, 
    } = payload
    
    try{
        if(!pool){
            throw new Error("Database pool not available");
        }
        
        const { rows } = await pool.query(
            `INSERT INTO orders
            (
                order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference, created_at, updated_at
            ) VALUES(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
            )`,
            [
                order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference
            ]
        );
        return rows;
    }catch(err){
        throw new Error("Creating order error");
    }
}

async function createOrderEvent(payload: OrderEvents){
    const {
        order_id, stage, actor_type, actor_id, outcome, notes, meta
    } = payload;
    const pool = await db();

    try{
        if(!pool){
            throw new Error("Database pool not available");
        }
        
        const { rows } = await pool.query(
            `
                INSERT INTO order_events
                (
                    order_id, event_type, stage, actor_type, actor_id, outcome, notes, meta, created_at
                )
                VALUES(
                    $1, $2, $3, $4, $5, $6, $7, $8, NOW()
                )
            `, [
                order_id, "order_paid", stage, actor_type, actor_id, outcome, notes, meta
            ]
        );
        return rows;
    }catch(err){
        console.log(err)
        throw new Error("Creating order event error");
    }
}

async function addOrderItem(payload: OrderItem){
    const {
        order_id, item_id, units, unit_price, total_price
    } = payload;
    const pool = await db();

    try{
        if(!pool){
            throw new Error("Database pool not available");
        }
        
        const { rows } = await pool.query(
            `
                INSERT INTO order_items
                (
                    order_id, item_id, units, unit_price, total_price, created_at
                )
                VALUES(
                    $1, $2, $3, $4, $5, NOW()
                )
            `, [
                order_id, item_id, units, unit_price, total_price
            ]
        );
        return rows;
    }catch(err){
        console.log(err)
        throw new Error("Adding order item error");
    }
}


