

export interface NewOrder{
    ref: string; 
    customer_id: string; 
    shop_id: string; 
    amount_paid: number; 
    shipping_fee: number; 
    tax: number; 
    charges: number; 
    total_paid: number; 
    currency: string; 
    fulfillment_status: string; 
    escrow_status: string; 
    payment_status: string; 
    shipping_address: string; 
    payment_reference: string; 
    shipping_method: string; 
    tracking_number: string; 
}

export interface OrderEvents{
    order_id: string,
    event_type: string,
    stage: string,
    actor_type: "customer" | "vendor",
    actor_id: string,
    outcome: "success" | "failure",
    notes: string,
    meta: string
}

export interface OrderItem{
    order_id: string,
    item_id: string,
    units: number,
    unit_price: number,
    total_price: number,
}