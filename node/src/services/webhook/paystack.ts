import { error } from "node:console";
import { db } from "../../config/database.js";
import type { NewOrder } from "../../types/paystack.js";


async function createOrder(payload: any){

}


async function upsertNewOrder(payload: NewOrder){
    const pool = await db();
    const {
        order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference, 
    } = payload
    
    try{
        if(pool){
            const {
                rows
            } = await pool.query(
                `INSERT INTO orders
                (
                    order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference, created_at, updated_at
                ) VALUES(
                    DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,  $16, $17, $18, NOW(), NOW()
                )`,
                [
                    order_id, customer_id, shop_id, amount_paid, shipping_fee, tax, charges, total_paid, currency, fulfillment_status, escrow_status, payment_status, shipping_address, payment_reference, 
                ]
            );
            return rows;
        }
    }catch(err){
        throw error("Creating order error");
    }
    
}