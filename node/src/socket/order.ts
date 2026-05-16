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
            
            await updateFulfillmentStatus(stage, order_id);
            const metaObj = (meta && typeof meta === 'object') ? (meta as Record<string, any>) : null;
            const fulfillment_duration = metaObj?.fulfillment_duration ?? null;
            if (fulfillment_duration != null) {
                await updateShipping(fulfillment_duration, order_id);
            }
            nsp.to(`user:${recipient}`).emit("order_acceptance", {
                result: await orderTransformer(order_id),
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

export const handleOrderProcessing = async(
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
            
            await updateFulfillmentStatus(stage, order_id);
            const metaObj = (meta && typeof meta === 'object') ? (meta as Record<string, any>) : null;
            const fulfillment_duration = metaObj?.fulfillment_duration ?? null;
            console.log("meta: ", meta);
            if (fulfillment_duration != null) {
                await updateShipping(fulfillment_duration, order_id);
            }
            nsp.to(`user:${recipient}`).emit("order_processing", {
                result: await orderTransformer(order_id),
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

export const handleOrderShipping = async(
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
            
            await updateFulfillmentStatus(stage, order_id);
            const metaObj = (meta && typeof meta === 'object') ? (meta as Record<string, any>) : null;
            const estimated_delivery = metaObj?.estimated_delivery ?? null;
            if (estimated_delivery != null) {
                await updateShipping(estimated_delivery, order_id);
            }
            const shipping_method = metaObj?.shipping_method ?? null;
            const tracking_id = metaObj?.tracking_id ?? null
            if (shipping_method !== null) {
                await updateShippingMethod(shipping_method, tracking_id, order_id);
            }
            nsp.to(`user:${recipient}`).emit("order_shipping", {
                result: await orderTransformer(order_id)
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

export const handleOrderOutForDelivery = async(
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
            
            await updateFulfillmentStatus(stage, order_id);
            const metaObj = (meta && typeof meta === 'object') ? (meta as Record<string, any>) : null;
            const expected_delivery = metaObj?.expected_delivery ?? null;
            if (expected_delivery !== null) {
                await updateShipping(expected_delivery, order_id)
            }
            nsp.to(`user:${recipient}`).emit("order_out_for_delivery", {
                result: await orderTransformer(order_id),
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

export const handleOrderDelivered = async(
       userId: number,
        nsp: Namespace,
        payload: Record<string, unknown>,
        ack: unknown
    ) => {
        console.log(payload)
    try {
        const p = await db();

        const {
            order_id, event_type, stage, actor_type, actor_id, outcome, notes, meta, recipient, reason
        } = payload;

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
            
            await updateFulfillmentStatus(stage, order_id);

            nsp.to(`user:${recipient}`).emit("order_delivered", {
                result: await orderTransformer(order_id),
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

export const handleOrderCancellation = async(
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
            
            await updateFulfillmentStatus(stage, order_id);

            nsp.to(`user:${recipient}`).emit("order_cancelled", {
                result: await orderTransformer(order_id),
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


async function updateFulfillmentStatus(fulfillment_status: unknown, order_id: unknown){
    console.log(order_id)
    const pool = await db();
    return(
        await pool.query(
            `UPDATE orders SET fulfillment_status = $1 WHERE id = $2`,
            [fulfillment_status, order_id]
        )
    )
}

async function updateShipping(delivery_duration: unknown, order_id: unknown){
    console.log(order_id)
    const pool = await db();
    return (
        await pool.query(
            `UPDATE orders SET estimated_delivery_date = $1 WHERE id = $2`,
            [delivery_duration, order_id]
        )
    )
}

async function updateShippingMethod(shipping_method: unknown, tracking_number: unknown, order_id: unknown){
    console.log(order_id)
    const pool = await db();
    return (
        await pool.query(
            `UPDATE orders SET shipping_method = $1, tracking_number = $2  WHERE id = $3`,
            [shipping_method, tracking_number, order_id]
        )
    )
}


// export const handleOrderEscrow = async(payload: any) => {
    
// }

// export const handleOrderRefund = async(payload: any) => {
    
// }

// export const handleOrderDispute = async(payload: any) => {
    
// }

// export const handleOrderCancellation = async(payload: any) => {
    
// }

type AckFn = (response: Record<string, unknown>) => void;

function respond(ack: unknown, payload: Record<string, unknown>): void {
  if (typeof ack === "function") {
    (ack as AckFn)(payload);
  }
}

