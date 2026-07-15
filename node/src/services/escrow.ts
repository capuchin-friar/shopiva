import { db } from "../config/database.js";

export class escrow{

    static async update(payload: any){
        const {
            status, id
        } = payload;
        const pool = await db();
        await pool.query(
            `UPDATE shop_payouts set status = $1 WHERE order_id = $2`, [status, id]
        );
    }

    static async finalize(payload: any){
        const {
            status, id, transfer_reference
        } = payload;
        const pool = await db();
        await pool.query(
            `UPDATE shop_payouts set status = $1, transfer_reference = $2 WHERE order_id = $3`, [status, transfer_reference, id]
        );
    }

    static async complete(payload: any){
        const {
            status, transfer_reference
        } = payload;
        const pool = await db();
        await pool.query(
            `UPDATE shop_payouts set status = $1, paid_at = NOW() WHERE transfer_reference = $2`, [status, transfer_reference]
        );
    }
    

}