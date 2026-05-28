import { db } from "../../config/database.js";
import type { OrderListRow } from "../../models/business/product.js";

/**
 * Buyer order list — same row shape as `order.getByCustomerId` in product.ts,
 * built with separate queries like `returnTransformer`.
 */
export const returnsTransformer = async (
    customerId: number | string
): Promise<any> => {
    const pool = await db();
    const cid = String(customerId);

    const { rows: returnRows } = await pool.query(
        `SELECT * FROM returns WHERE customer_id = $1 ORDER BY created_at DESC`,
        [cid]
    );

    if (!returnRows.length) {
        return [];
    }

    const orderPkIds = returnRows.map((o: { order_id: number }) => o.order_id);

    const { rows: qtyRows } = await pool.query(
        `SELECT order_id, COALESCE(SUM(units), 0)::int AS qty
         FROM order_items
         WHERE order_id = ANY($1::int[])
         GROUP BY order_id`,
        [orderPkIds]
    );

    const qtyByReturnPk = new Map<number, number>(
        qtyRows.map((r: { order_id: number; qty: number }) => [
            r.order_id,
            Number(r.qty),
        ])
    );
    const linkedOrderIds = returnRows.map(
        (o: { order_id: string }) => (o.order_id),
    );
    const { rows: amountRows } = await pool.query(
        `SELECT id, total_paid, amount_paid
         FROM orders
         WHERE id = ANY($1::int[])`,
        [linkedOrderIds]
    );
    const amountByOrderRef = new Map<string, number>(
        amountRows.map(
            (r: {
                id: string | number;
                total_paid: string | number;
                amount_paid: string | number;
            }) => {
                console.log(r);
                return [
                    String(r.id),
                    Number(r.amount_paid ?? 0),
                ]
            }
        )
    )

    const { rows: userRows } = await pool.query(
        `SELECT fname, lname, email, phone
         FROM users
         WHERE id::text = $1 OR LOWER(email) = LOWER($1)
         LIMIT 1`,
        [cid]
    );

    const u = userRows[0] as
        | { fname: string | null; lname: string | null; email: string | null; phone: string | null }
        | undefined;

    const customerName = u
        ? [u.fname, u.lname].filter(Boolean).join(" ").trim()
        : "";
    const customer_email = u?.email ?? "";
    const customer_phone = u?.phone ?? "";

    return await Promise.all(returnRows.map(async(o: Record<string, unknown>): Promise<OrderListRow> => {
        const id = Number(o.order_id);
        
        const {rows} = await pool.query(
            `SELECT metadata
            FROM disputes
            WHERE order_id = $1`,
            [o.order_id]
        );
        const {
            metadata
        } = rows[0];
        let qty = metadata.selected_items.reduce((acc: any, cur: any) => acc + cur.qty, 0);
        let amount = metadata.selected_items.reduce((acc: any, cur: any) => acc + cur.total_price, 0);
        return {
            return_id: Number(o.id),
            order_id: id,
            product_id: null,
            customer_id: o.customer_id as string,
            product: "",
            customer: customerName,
            customer_email,
            customer_phone,
            qty,
            amount,
            payment: String(o.return_shipping_paid_by ?? ""),
            status: String(o.status ?? ""),
            delivery: String(o.shipping_method ?? ""),
            date: o.created_at != null ? String(o.created_at) : null,
            shipping_address: String(o.shipping_address ?? ""),
            customer_lat: null,
            customer_lng: null,
        };

    }));

};
