import type { Namespace } from "socket.io";
import { db } from "../config/database.js"
import { orderTransformer } from "../transformers/business/order.js";



export const handleOrderAcceptance = async(
    userId: number,
    nsp: Namespace,
    payload: Record<string, unknown>,
    ack: unknown
) => {
    try {
        const p = await db();

        const {
            order_id, event_type, stage, actor_type, actor_id, outcome, notes, meta, recipient, reason
        } = payload;

        console.log('Order acceptance payload:', payload)

        const { rows } = await p.query(
            `
                INSERT INTO order_events
                (
                    order_id, event_type, stage, actor_type, actor_id, outcome, notes, meta, created_at
                )
                VALUES(
                    $1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW()
                )
                RETURNING *
            `, [
                order_id, 
                event_type, 
                stage, 
                actor_type, 
                actor_id, 
                outcome, 
                notes || '', 
                JSON.stringify(meta || { reason })
            ]
        );

        if(rows.length > 0){
            nsp.to(`user:${recipient}`).emit("order_acceptance", {
                order_id,
                status: outcome,
                reason: reason,
                timestamp: new Date()
            })
            
            if(typeof ack === 'function') {
                ack({
                    success: true,
                    message: "Order event recorded successfully",
                    error: null,
                    result: await orderTransformer(order_id),
                })
            }
        } else {
            if(typeof ack === 'function') {
                ack({
                    success: false,
                    message: "Failed to record order event",
                    error: "No rows inserted",
                    result: null,
                })
            }
        }
    } catch (error) {
        console.error("Error handling order acceptance:", error);
        if(typeof ack === 'function') {
            ack({
                success: false,
                message: "Error processing order event",
                error: error instanceof Error ? error.message : "Unknown error",
                result: null,
            })
        }
    }
}

export const handleOrderProcessing = async(payload: any) => {

}

export const handleOrderShipping = async(payload: any) => {
    
}

export const handleOrderDelivery = async(payload: any) => {
    
}

export const handleOrderEscrow = async(payload: any) => {
    
}

export const handleOrderRefund = async(payload: any) => {
    
}

export const handleOrderDispute = async(payload: any) => {
    
}

export const handleOrderCancellation = async(payload: any) => {
    
}

type AckFn = (response: Record<string, unknown>) => void;

function respond(ack: unknown, payload: Record<string, unknown>): void {
  if (typeof ack === "function") {
    (ack as AckFn)(payload);
  }
}